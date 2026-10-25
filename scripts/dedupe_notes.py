"""Find and remove exact duplicate notes (same user, title and text).

Dry run by default: lists duplicate groups and changes nothing.
With --apply: writes a backup next to the database, then keeps the oldest
note of each group and deletes the rest (their tags are removed with them).

    uv run python scripts/dedupe_notes.py
    uv run python scripts/dedupe_notes.py --apply
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_DB = Path(__file__).resolve().parent.parent / "data" / "notes.sqlite3"


def duplicate_groups(conn: sqlite3.Connection) -> list[list[sqlite3.Row]]:
    rows = conn.execute(
        """
        SELECT id, user_id, title, body, created_at
        FROM notes
        WHERE (user_id, title, body) IN (
          SELECT user_id, title, body FROM notes GROUP BY user_id, title, body HAVING COUNT(*) > 1
        )
        ORDER BY user_id, title, body, id
        """
    ).fetchall()
    groups: dict[tuple, list[sqlite3.Row]] = {}
    for row in rows:
        groups.setdefault((row["user_id"], row["title"], row["body"]), []).append(row)
    return list(groups.values())


def backup(conn: sqlite3.Connection, db_path: Path) -> Path:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    target = db_path.with_name(f"{db_path.stem}.backup-{stamp}{db_path.suffix}")
    # The backup API includes changes still sitting in the WAL file, unlike a plain file copy.
    dest = sqlite3.connect(target)
    try:
        conn.backup(dest)
    finally:
        dest.close()
    return target


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB, help=f"database file (default: {DEFAULT_DB})")
    parser.add_argument("--apply", action="store_true", help="back up the database, then delete the extra copies")
    args = parser.parse_args(argv)

    if not args.db.exists():
        print(f"Database not found: {args.db}", file=sys.stderr)
        return 1

    conn = sqlite3.connect(args.db, timeout=15)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        groups = duplicate_groups(conn)
        if not groups:
            print("No duplicate notes found.")
            return 0

        extra = sum(len(group) - 1 for group in groups)
        print(f"{len(groups)} duplicate group(s), {extra} extra cop{'y' if extra == 1 else 'ies'}:")
        for group in groups:
            keep, *drop = group
            print(f"- user {keep['user_id']}: {keep['title'][:60]!r} ({len(keep['body'])} chars)")
            print(f"    keep   #{keep['id']} created {keep['created_at']}")
            for row in drop:
                print(f"    delete #{row['id']} created {row['created_at']}")

        if not args.apply:
            print("\nDry run, nothing changed. Re-run with --apply to delete the extra copies.")
            return 0

        target = backup(conn, args.db)
        print(f"\nBackup written to {target}")
        with conn:
            conn.executemany(
                "DELETE FROM notes WHERE id = ?",
                [(row["id"],) for group in groups for row in group[1:]],
            )
        print(f"Deleted {extra} extra cop{'y' if extra == 1 else 'ies'}.")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    sys.exit(main())
