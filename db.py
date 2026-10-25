from __future__ import annotations

import logging
import re
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterator


logger = logging.getLogger(__name__)

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "notes.sqlite3"
# How long a request waits for another request's write lock before failing.
BUSY_TIMEOUT_SECONDS = 15
THEMES = {
    "plain",
    "gruvbox",
    "tokyonight",
    "catppuccin",
    "nord",
    "sepia",
    "lavender",
    "brutalism",
    "aurora",
    "mono",
    "gruvbox-dark",
    "tokyonight-dark",
    "catppuccin-dark",
    "nord-dark",
    "dracula",
    "lavender-dark",
    "brutalism-dark",
    "matrix-dark",
    "mono-dark",
}
THEME_ALIASES = {
    "pastel": "lavender",
    "pop": "brutalism",
    "pastel-dark": "lavender-dark",
    "pop-dark": "brutalism-dark",
}
FONTS = {
    "system-sans",
    "system-mono",
    "serif",
    "noto-sans",
    "dejavu-mono",
    "courier-prime",
    "custom",
}
FONT_ALIASES = {
    "monospace": "system-mono",
    "ui-monospace": "system-mono",
    "Cascadia Mono": "system-mono",
    "SFMono-Regular": "system-mono",
    "Menlo": "system-mono",
    "Consolas": "system-mono",
    "JetBrains Mono": "system-mono",
    "Fira Code": "system-mono",
    "Verdana": "system-sans",
    "Arial": "system-sans",
    "Times New Roman": "serif",
}
DEFAULT_FONT_SIZE = 15
MIN_FONT_SIZE = 12
MAX_FONT_SIZE = 24
DEFAULT_CODE_FONT_SIZE = 14
MIN_CODE_FONT_SIZE = 11
MAX_CODE_FONT_SIZE = 22
CURSOR_TYPES = {"bar", "block", "underline"}
TAG_PILL_STYLES = {"soft", "outline", "solid", "mono"}
ACTION_ICON_STYLES = {"key-01", "key-03", "key-07", "key-10"}
# What opens when the app starts: a blank new note, or the note used last (last_note_id).
START_NOTES = {"new", "last"}
TIME_RE = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d$")
TAG_SEARCH_RE = re.compile(r"^tag:([^\s]*)(?:\s+(.*))?$", re.IGNORECASE)
# A tag only counts when it is the sole content of its line, e.g. "#todo".
TAG_LINE_PATTERN = re.compile(r"^[^\S\n]*(#[A-Za-z0-9-][^\s#]*)[^\S\n]*$", re.MULTILINE)
ROLES = {"admin", "user"}
DEFAULT_SETTINGS = {
    "theme": "plain",
    "font": "system-mono",
    "custom_font": "",
    "font_size": str(DEFAULT_FONT_SIZE),
    "code_font_size": str(DEFAULT_CODE_FONT_SIZE),
    "cursor_type": "bar",
    "tag_pill_style": "soft",
    "action_icon_style": "key-01",
    "editor_line_numbers": "true",
    "focus_letter_effect": "false",
    "start_note": "new",
    "last_note_id": "",
    "sunrise_time": "",
    "sunrise_theme": "plain",
    "sunset_time": "",
    "sunset_theme": "nord-dark",
}


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def slugify(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug or "untitled"


def normalize_tag(tag: str) -> str:
    tag = tag.strip().lower()
    tag = re.sub(r"\s+", "-", tag)
    tag = re.sub(r"[^a-z0-9-]+", "", tag)
    tag = re.sub(r"-+", "-", tag).strip("-")
    return tag[:32].strip("-")


def parse_tag_positions(body: str) -> list[tuple[str, int, int]]:
    tags: list[tuple[str, int, int]] = []
    for match in TAG_LINE_PATTERN.finditer(body):
        tag = normalize_tag(match.group(1)[1:])
        if tag:
            tags.append((tag, match.start(1), match.end(1)))
    return tags


def parse_tags(body: str) -> list[str]:
    tags: list[str] = []
    seen: set[str] = set()
    for tag, _start, _end in parse_tag_positions(body):
        if tag not in seen:
            tags.append(tag)
            seen.add(tag)
    return tags


def clean_title(title: str) -> str:
    title = title.strip()
    return title or "Untitled"


def normalize_theme(theme: str) -> str:
    theme = THEME_ALIASES.get(theme, theme)
    return theme if theme in THEMES else "plain"


def normalize_font(font: str) -> str:
    font = font.strip()
    font = FONT_ALIASES.get(font, font)
    return font if font in FONTS else "system-mono"


def normalize_custom_font(font: str) -> str:
    font = " ".join(font.strip().split())
    if any(ord(char) < 32 or char in "\"'\\;" for char in font):
        return ""
    return font[:80]


def normalize_font_size(font_size: str | int) -> str:
    try:
        size = int(str(font_size).strip())
    except ValueError:
        return str(DEFAULT_FONT_SIZE)
    if MIN_FONT_SIZE <= size <= MAX_FONT_SIZE:
        return str(size)
    return str(DEFAULT_FONT_SIZE)


def normalize_code_font_size(font_size: str | int) -> str:
    try:
        size = int(str(font_size).strip())
        if MIN_CODE_FONT_SIZE <= size <= MAX_CODE_FONT_SIZE:
            return str(size)
    except ValueError:
        pass
    return str(DEFAULT_CODE_FONT_SIZE)


def normalize_cursor_type(cursor_type: str) -> str:
    cursor_type = cursor_type.strip()
    return cursor_type if cursor_type in CURSOR_TYPES else "bar"


def normalize_tag_pill_style(style: str) -> str:
    style = style.strip()
    return style if style in TAG_PILL_STYLES else "soft"


def normalize_action_icon_style(style: str) -> str:
    style = style.strip()
    return style if style in ACTION_ICON_STYLES else "key-01"



def normalize_start_note(value: str) -> str:
    value = str(value).strip()
    return value if value in START_NOTES else "new"


def normalize_note_id(value: str | int) -> str:
    value = str(value).strip()
    return value if value.isdigit() else ""


def normalize_bool_setting(value: str | int | bool) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        return "true" if value else "false"
    return "true" if value.strip().lower() == "true" else "false"


def normalize_time(value: str | int) -> str:
    time = str(value).strip()
    return time if TIME_RE.fullmatch(time) else ""


def inserted_id(cursor: sqlite3.Cursor, entity: str) -> int:
    if cursor.lastrowid is None:
        raise RuntimeError(f"{entity} insert failed")
    return int(cursor.lastrowid)


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=BUSY_TIMEOUT_SECONDS)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute(f"PRAGMA busy_timeout = {BUSY_TIMEOUT_SECONDS * 1000}")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def enable_wal(conn: sqlite3.Connection) -> None:
    # WAL lets reads run while a save is writing. Some network/FUSE filesystems refuse it; then keep the default.
    try:
        mode = conn.execute("PRAGMA journal_mode = WAL").fetchone()[0]
    except sqlite3.Error as error:
        logger.warning("SQLite WAL mode unavailable, keeping default journal: %s", error)
        return
    if str(mode).lower() != "wal":
        logger.warning("SQLite WAL mode unavailable, journal mode is %s", mode)


def init_db() -> None:
    with connect() as conn:
        enable_wal(conn)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS notes (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              slug TEXT NOT NULL,
              title TEXT NOT NULL,
              body TEXT NOT NULL DEFAULT '',
              date TEXT NOT NULL,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_notes_slug ON notes(slug)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at)")
        note_columns = {row["name"] for row in conn.execute("PRAGMA table_info(notes)").fetchall()}
        if "user_id" not in note_columns:
            conn.execute("ALTER TABLE notes ADD COLUMN user_id INTEGER REFERENCES users(id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON notes(user_id, updated_at)")
        if "client_id" not in note_columns:
            conn.execute("ALTER TABLE notes ADD COLUMN client_id TEXT")
        # Goes up by one on every save; a save based on an older version is refused (see update_note).
        if "version" not in note_columns:
            conn.execute("ALTER TABLE notes ADD COLUMN version INTEGER NOT NULL DEFAULT 1")
        # One row per browser-generated note id, so a retried create can never add a copy.
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_notes_user_client ON notes(user_id, client_id) WHERE client_id IS NOT NULL"
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS note_tags (
              note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
              tag TEXT NOT NULL,
              position INTEGER NOT NULL DEFAULT 0,
              PRIMARY KEY (note_id, tag)
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON note_tags(tag)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_note_tags_note_position ON note_tags(note_id, position)")
        sync_all_note_tags(conn)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS settings (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL
            )
            """
        )
        for key, value in DEFAULT_SETTINGS.items():
            conn.execute("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", (key, value))
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT NOT NULL UNIQUE,
              password_hash TEXT NOT NULL,
              role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
              enabled INTEGER NOT NULL DEFAULT 1,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              last_login_at TEXT,
              totp_secret TEXT,
              totp_enabled_at TEXT
            )
            """
        )
        user_columns = {row["name"] for row in conn.execute("PRAGMA table_info(users)").fetchall()}
        if "totp_secret" not in user_columns:
            conn.execute("ALTER TABLE users ADD COLUMN totp_secret TEXT")
        if "totp_enabled_at" not in user_columns:
            conn.execute("ALTER TABLE users ADD COLUMN totp_enabled_at TEXT")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              token_hash TEXT NOT NULL UNIQUE,
              csrf_token TEXT NOT NULL,
              created_at TEXT NOT NULL,
              expires_at TEXT NOT NULL
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS invites (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              token_hash TEXT NOT NULL UNIQUE,
              role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
              created_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              created_at TEXT NOT NULL,
              expires_at TEXT NOT NULL,
              used_at TEXT,
              used_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
            )
            """
        )
        invite_columns = {row["name"] for row in conn.execute("PRAGMA table_info(invites)").fetchall()}
        if "revoked_at" not in invite_columns:
            conn.execute("ALTER TABLE invites ADD COLUMN revoked_at TEXT")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token_hash)")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS app_settings (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL
            )
            """
        )
        conn.execute("INSERT OR IGNORE INTO app_settings (key, value) VALUES ('signup_enabled', '0')")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS user_settings (
              user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              key TEXT NOT NULL,
              value TEXT NOT NULL,
              PRIMARY KEY (user_id, key)
            )
            """
        )
        # A row per person a note is shared with; the owner stays notes.user_id.
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS note_shares (
              note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
              user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),
              created_at TEXT NOT NULL,
              PRIMARY KEY (note_id, user_id)
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_note_shares_user ON note_shares(user_id)")


def row_access(row: sqlite3.Row) -> dict[str, Any]:
    # Rows read through accessible_notes_query carry the viewer's access; plain rows are the owner's own.
    keys = row.keys()
    return {
        "access": row["access"] if "access" in keys else "owner",
        "owner_email": row["owner_email"] if "owner_email" in keys else None,
        "share_count": int(row["share_count"]) if "share_count" in keys else 0,
    }


def row_to_note(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "slug": row["slug"],
        "title": row["title"],
        "body": row["body"],
        "date": row["date"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "version": int(row["version"]) if "version" in row.keys() else 1,
        "tags": [],
        **row_access(row),
    }


def row_to_summary(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "slug": row["slug"],
        "title": row["title"],
        "date": row["date"],
        "updated_at": row["updated_at"],
        "version": int(row["version"]) if "version" in row.keys() else 1,
        "tags": [],
        **row_access(row),
    }


# Notes a user can see: their own plus the ones shared with them. The query adds three columns:
# access ("owner" / "edit" / "view"), owner_email (only on notes shared with you) and share_count
# (only on your own notes: how many people they are shared with).
ACCESS_COLUMNS = """
  CASE WHEN notes.user_id = ? THEN 'owner' ELSE shares.permission END AS access,
  CASE WHEN notes.user_id = ? THEN NULL ELSE owners.email END AS owner_email,
  CASE WHEN notes.user_id = ?
    THEN (SELECT count(*) FROM note_shares AS counted WHERE counted.note_id = notes.id)
    ELSE 0
  END AS share_count
"""


def accessible_notes_query(
    user_id: int, columns: str, where: str = "", where_params: list[Any] | None = None, order: str = ""
) -> tuple[str, list[Any]]:
    sql = f"""
        SELECT {columns}, {ACCESS_COLUMNS}
        FROM notes
        LEFT JOIN note_shares AS shares ON shares.note_id = notes.id AND shares.user_id = ?
        LEFT JOIN users AS owners ON owners.id = notes.user_id
        WHERE (notes.user_id = ? OR shares.user_id IS NOT NULL){f" AND ({where})" if where else ""}
        {order}
    """
    return sql, [user_id, user_id, user_id, user_id, user_id, *(where_params or [])]


def note_access(conn: sqlite3.Connection, user_id: int, note_id: int) -> str | None:
    row = conn.execute(
        """
        SELECT CASE WHEN notes.user_id = ? THEN 'owner' ELSE shares.permission END AS access
        FROM notes
        LEFT JOIN note_shares AS shares ON shares.note_id = notes.id AND shares.user_id = ?
        WHERE notes.id = ?
        """,
        (user_id, user_id, note_id),
    ).fetchone()
    return row["access"] if row else None


def attach_tags(conn: sqlite3.Connection, notes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not notes:
        return notes
    ids = [int(note["id"]) for note in notes]
    placeholders = ",".join("?" for _ in ids)
    rows = conn.execute(
        f"""
        SELECT note_id, tag
        FROM note_tags
        WHERE note_id IN ({placeholders})
        ORDER BY position ASC, tag ASC
        """,
        ids,
    ).fetchall()
    by_note: dict[int, list[str]] = {note_id: [] for note_id in ids}
    for row in rows:
        by_note[int(row["note_id"])].append(row["tag"])
    for note in notes:
        note["tags"] = by_note[int(note["id"])]
    return notes


def sync_note_tags(conn: sqlite3.Connection, note_id: int, body: str) -> None:
    conn.execute("DELETE FROM note_tags WHERE note_id = ?", (note_id,))
    conn.executemany(
        "INSERT INTO note_tags (note_id, tag, position) VALUES (?, ?, ?)",
        [(note_id, tag, position) for position, tag in enumerate(parse_tags(body))],
    )


def sync_all_note_tags(conn: sqlite3.Connection) -> None:
    rows = conn.execute("SELECT id, body FROM notes").fetchall()
    for row in rows:
        sync_note_tags(conn, int(row["id"]), row["body"])


def row_to_user(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "email": row["email"],
        "role": row["role"],
        "enabled": bool(row["enabled"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "last_login_at": row["last_login_at"],
        "totp_enabled": bool(row["totp_enabled_at"]),
    }


def normalize_email(email: str) -> str:
    return email.strip().lower()


def normalize_role(role: str) -> str:
    return role if role in ROLES else "user"


def expiry(days: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat(timespec="seconds").replace("+00:00", "Z")


def users_exist() -> bool:
    with connect() as conn:
        row = conn.execute("SELECT 1 FROM users LIMIT 1").fetchone()
    return row is not None


def create_first_admin(email: str, password_hash: str) -> dict[str, Any] | None:
    timestamp = now()
    email = normalize_email(email)
    with connect() as conn:
        if conn.execute("SELECT 1 FROM users LIMIT 1").fetchone():
            return None
        cursor = conn.execute(
            """
            INSERT INTO users (email, password_hash, role, enabled, created_at, updated_at)
            VALUES (?, ?, 'admin', 1, ?, ?)
            """,
            (email, password_hash, timestamp, timestamp),
        )
        user_id = inserted_id(cursor, "user")
        conn.execute("UPDATE notes SET user_id = ? WHERE user_id IS NULL", (user_id,))
        rows = conn.execute("SELECT key, value FROM settings").fetchall()
        migrated = {row["key"]: row["value"] for row in rows}
        for key, value in DEFAULT_SETTINGS.items():
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, ?, ?)",
                (user_id, key, migrated.get(key, value)),
            )
    return get_user(user_id)


def get_user(user_id: int) -> dict[str, Any] | None:
    with connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return row_to_user(row) if row else None


def get_user_with_password(email: str) -> dict[str, Any] | None:
    with connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (normalize_email(email),)).fetchone()
    if not row:
        return None
    user = row_to_user(row)
    user["password_hash"] = row["password_hash"]
    user["totp_secret"] = row["totp_secret"]
    user["totp_enabled_at"] = row["totp_enabled_at"]
    return user


def set_user_totp_secret(user_id: int, secret: str) -> None:
    with connect() as conn:
        conn.execute(
            "UPDATE users SET totp_secret = ?, totp_enabled_at = NULL, updated_at = ? WHERE id = ?",
            (secret, now(), user_id),
        )


def enable_user_totp(user_id: int) -> dict[str, Any] | None:
    timestamp = now()
    with connect() as conn:
        cursor = conn.execute(
            """
            UPDATE users
            SET totp_enabled_at = ?, updated_at = ?
            WHERE id = ? AND totp_secret IS NOT NULL
            """,
            (timestamp, timestamp, user_id),
        )
        if cursor.rowcount == 0:
            return None
    return get_user(user_id)


def disable_user_totp(user_id: int) -> dict[str, Any] | None:
    timestamp = now()
    with connect() as conn:
        conn.execute(
            "UPDATE users SET totp_secret = NULL, totp_enabled_at = NULL, updated_at = ? WHERE id = ?",
            (timestamp, user_id),
        )
    return get_user(user_id)


def create_user(email: str, password_hash: str, role: str = "user", enabled: bool = True) -> dict[str, Any] | None:
    timestamp = now()
    try:
        with connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO users (email, password_hash, role, enabled, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (normalize_email(email), password_hash, normalize_role(role), int(enabled), timestamp, timestamp),
            )
            user_id = inserted_id(cursor, "user")
            for key, value in DEFAULT_SETTINGS.items():
                conn.execute(
                    "INSERT OR IGNORE INTO user_settings (user_id, key, value) VALUES (?, ?, ?)",
                    (user_id, key, value),
                )
    except sqlite3.IntegrityError:
        return None
    return get_user(user_id)


def list_users() -> list[dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT id, email, role, enabled, created_at, updated_at, last_login_at, totp_enabled_at
            FROM users
            ORDER BY created_at DESC, id DESC
            """
        ).fetchall()
    return [row_to_user(row) for row in rows]


def admin_count() -> int:
    with connect() as conn:
        row = conn.execute("SELECT count(*) AS count FROM users WHERE role = 'admin' AND enabled = 1").fetchone()
    return int(row["count"])


def update_user(user_id: int, *, role: str | None = None, enabled: bool | None = None) -> dict[str, Any] | None:
    current = get_user(user_id)
    if not current:
        return None
    next_role = normalize_role(role) if role is not None else current["role"]
    next_enabled = bool(enabled) if enabled is not None else current["enabled"]
    if current["role"] == "admin" and current["enabled"] and (next_role != "admin" or not next_enabled) and admin_count() <= 1:
        raise ValueError("last admin cannot be disabled or demoted")
    with connect() as conn:
        conn.execute(
            "UPDATE users SET role = ?, enabled = ?, updated_at = ? WHERE id = ?",
            (next_role, int(next_enabled), now(), user_id),
        )
    return get_user(user_id)


def delete_user(user_id: int, actor_user_id: int) -> bool:
    current = get_user(user_id)
    if not current:
        return False
    if user_id == actor_user_id:
        raise ValueError("current user cannot be deleted")
    if current["role"] == "admin" and current["enabled"] and admin_count() <= 1:
        raise ValueError("last admin cannot be deleted")
    with connect() as conn:
        conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM notes WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM user_settings WHERE user_id = ?", (user_id,))
        conn.execute("UPDATE invites SET used_by_user_id = NULL WHERE used_by_user_id = ?", (user_id,))
        conn.execute("DELETE FROM invites WHERE created_by_user_id = ?", (user_id,))
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    return True


def mark_login(user_id: int) -> None:
    with connect() as conn:
        conn.execute("UPDATE users SET last_login_at = ? WHERE id = ?", (now(), user_id))


def create_session(user_id: int, token_hash: str, csrf_token: str, expires_at: str) -> None:
    timestamp = now()
    with connect() as conn:
        conn.execute("DELETE FROM sessions WHERE expires_at <= ?", (timestamp,))
        conn.execute(
            """
            INSERT INTO sessions (user_id, token_hash, csrf_token, created_at, expires_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, token_hash, csrf_token, timestamp, expires_at),
        )


def get_session(token_hash: str) -> dict[str, Any] | None:
    timestamp = now()
    with connect() as conn:
        row = conn.execute(
            """
            SELECT sessions.*, users.email, users.role, users.enabled, users.created_at AS user_created_at,
                   users.updated_at AS user_updated_at, users.last_login_at, users.totp_enabled_at
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token_hash = ? AND sessions.expires_at > ? AND users.enabled = 1
            """,
            (token_hash, timestamp),
        ).fetchone()
    if not row:
        return None
    return {
        "user": {
            "id": row["user_id"],
            "email": row["email"],
            "role": row["role"],
            "enabled": bool(row["enabled"]),
            "created_at": row["user_created_at"],
            "updated_at": row["user_updated_at"],
            "last_login_at": row["last_login_at"],
            "totp_enabled": bool(row["totp_enabled_at"]),
        },
        "csrf_token": row["csrf_token"],
        "expires_at": row["expires_at"],
    }


def delete_session(token_hash: str) -> None:
    with connect() as conn:
        conn.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))


def signup_enabled() -> bool:
    with connect() as conn:
        row = conn.execute("SELECT value FROM app_settings WHERE key = 'signup_enabled'").fetchone()
    return bool(row and row["value"] == "1")


def set_signup_enabled(enabled: bool) -> bool:
    with connect() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('signup_enabled', ?)",
            ("1" if enabled else "0",),
        )
    return signup_enabled()


def create_invite(token_hash: str, created_by_user_id: int, role: str = "user", days: int = 7) -> dict[str, Any]:
    timestamp = now()
    with connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO invites (token_hash, role, created_by_user_id, created_at, expires_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (token_hash, normalize_role(role), created_by_user_id, timestamp, expiry(days)),
        )
        invite_id = inserted_id(cursor, "invite")
    return get_invite(invite_id)  # type: ignore[return-value]


def get_invite(invite_id: int) -> dict[str, Any] | None:
    with connect() as conn:
        row = conn.execute("SELECT * FROM invites WHERE id = ?", (invite_id,)).fetchone()
    return row_to_invite(row) if row else None


def row_to_invite(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "role": row["role"],
        "created_by_user_id": row["created_by_user_id"],
        "created_at": row["created_at"],
        "expires_at": row["expires_at"],
        "revoked_at": row["revoked_at"],
        "used_at": row["used_at"],
        "used_by_user_id": row["used_by_user_id"],
    }


def list_invites() -> list[dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT * FROM invites
            WHERE revoked_at IS NULL
            ORDER BY created_at DESC, id DESC
            LIMIT 50
            """
        ).fetchall()
    return [row_to_invite(row) for row in rows]


def invite_role(token_hash: str) -> str | None:
    with connect() as conn:
        row = conn.execute(
            """
            SELECT role FROM invites
            WHERE token_hash = ? AND used_at IS NULL AND revoked_at IS NULL AND expires_at > ?
            """,
            (token_hash, now()),
        ).fetchone()
    return row["role"] if row else None


def revoke_invite(invite_id: int) -> bool:
    timestamp = now()
    with connect() as conn:
        cursor = conn.execute(
            """
            UPDATE invites
            SET revoked_at = ?
            WHERE id = ? AND used_at IS NULL AND revoked_at IS NULL AND expires_at > ?
            """,
            (timestamp, invite_id, timestamp),
        )
    return cursor.rowcount > 0


def delete_used_invite(invite_id: int) -> bool:
    with connect() as conn:
        cursor = conn.execute("DELETE FROM invites WHERE id = ? AND used_at IS NOT NULL", (invite_id,))
    return cursor.rowcount > 0


def consume_invite(token_hash: str, email: str, password_hash: str) -> dict[str, Any] | None:
    timestamp = now()
    with connect() as conn:
        invite = conn.execute(
            """
            SELECT * FROM invites
            WHERE token_hash = ? AND used_at IS NULL AND revoked_at IS NULL AND expires_at > ?
            """,
            (token_hash, timestamp),
        ).fetchone()
        if not invite:
            return None
        try:
            cursor = conn.execute(
                """
                INSERT INTO users (email, password_hash, role, enabled, created_at, updated_at)
                VALUES (?, ?, ?, 1, ?, ?)
                """,
                (normalize_email(email), password_hash, invite["role"], timestamp, timestamp),
            )
        except sqlite3.IntegrityError:
            return None
        user_id = inserted_id(cursor, "user")
        for key, value in DEFAULT_SETTINGS.items():
            conn.execute(
                "INSERT OR IGNORE INTO user_settings (user_id, key, value) VALUES (?, ?, ?)",
                (user_id, key, value),
            )
        conn.execute(
            "UPDATE invites SET used_at = ?, used_by_user_id = ? WHERE id = ?",
            (timestamp, user_id, invite["id"]),
        )
    return get_user(user_id)


def get_settings(user_id: int) -> dict[str, str]:
    with connect() as conn:
        rows = conn.execute("SELECT key, value FROM user_settings WHERE user_id = ?", (user_id,)).fetchall()
    settings = {row["key"]: row["value"] for row in rows}
    return {
        "theme": normalize_theme(settings.get("theme", "plain")),
        "font": normalize_font(settings.get("font", "system-mono")),
        "custom_font": normalize_custom_font(settings.get("custom_font", "")),
        "font_size": normalize_font_size(settings.get("font_size", DEFAULT_FONT_SIZE)),
        "code_font_size": normalize_code_font_size(settings.get("code_font_size", DEFAULT_CODE_FONT_SIZE)),
        "cursor_type": normalize_cursor_type(settings.get("cursor_type", "bar")),
        "tag_pill_style": normalize_tag_pill_style(settings.get("tag_pill_style", "soft")),
        "action_icon_style": normalize_action_icon_style(
            settings.get("action_icon_style", "key-01")
        ),
        "editor_line_numbers": normalize_bool_setting(settings.get("editor_line_numbers", "true")),
        "focus_letter_effect": normalize_bool_setting(
            settings.get("focus_letter_effect", "false")
        ),
        "start_note": normalize_start_note(settings.get("start_note", "new")),
        "last_note_id": normalize_note_id(settings.get("last_note_id", "")),
        "sunrise_time": normalize_time(settings.get("sunrise_time", "")),
        "sunrise_theme": normalize_theme(settings.get("sunrise_theme", "plain")),
        "sunset_time": normalize_time(settings.get("sunset_time", "")),
        "sunset_theme": normalize_theme(settings.get("sunset_theme", "nord-dark")),
    }


def update_settings(user_id: int, patch: dict[str, str | int | bool | None]) -> dict[str, str]:
    with connect() as conn:
        if "theme" in patch and patch["theme"] is not None:
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, 'theme', ?)",
                (user_id, normalize_theme(str(patch["theme"]))),
            )
        if "font" in patch and patch["font"] is not None:
            font = normalize_font(str(patch["font"]))
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, 'font', ?)",
                (user_id, font),
            )
        if "custom_font" in patch and patch["custom_font"] is not None:
            custom_font = normalize_custom_font(str(patch["custom_font"]))
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, 'custom_font', ?)",
                (user_id, custom_font),
            )
        if "font_size" in patch and patch["font_size"] is not None:
            font_size = normalize_font_size(patch["font_size"])
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, 'font_size', ?)",
                (user_id, font_size),
            )
        if "code_font_size" in patch and patch["code_font_size"] is not None:
            code_font_size = normalize_code_font_size(patch["code_font_size"])
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, 'code_font_size', ?)",
                (user_id, code_font_size),
            )
        if "cursor_type" in patch and patch["cursor_type"] is not None:
            cursor_type = normalize_cursor_type(str(patch["cursor_type"]))
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, 'cursor_type', ?)",
                (user_id, cursor_type),
            )
        if "tag_pill_style" in patch and patch["tag_pill_style"] is not None:
            tag_pill_style = normalize_tag_pill_style(str(patch["tag_pill_style"]))
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, 'tag_pill_style', ?)",
                (user_id, tag_pill_style),
            )
        if "action_icon_style" in patch and patch["action_icon_style"] is not None:
            action_icon_style = normalize_action_icon_style(str(patch["action_icon_style"]))
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, 'action_icon_style', ?)",
                (user_id, action_icon_style),
            )
        if "editor_line_numbers" in patch and patch["editor_line_numbers"] is not None:
            editor_line_numbers = normalize_bool_setting(patch["editor_line_numbers"])
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) "
                "VALUES (?, 'editor_line_numbers', ?)",
                (user_id, editor_line_numbers),
            )
        if "focus_letter_effect" in patch and patch["focus_letter_effect"] is not None:
            focus_letter_effect = normalize_bool_setting(patch["focus_letter_effect"])
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) "
                "VALUES (?, 'focus_letter_effect', ?)",
                (user_id, focus_letter_effect),
            )
        if "start_note" in patch and patch["start_note"] is not None:
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, 'start_note', ?)",
                (user_id, normalize_start_note(patch["start_note"])),
            )
        if "last_note_id" in patch and patch["last_note_id"] is not None:
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, 'last_note_id', ?)",
                (user_id, normalize_note_id(patch["last_note_id"])),
            )
        if "sunrise_time" in patch and patch["sunrise_time"] is not None:
            sunrise_time = normalize_time(patch["sunrise_time"])
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, 'sunrise_time', ?)",
                (user_id, sunrise_time),
            )
        if "sunrise_theme" in patch and patch["sunrise_theme"] is not None:
            sunrise_theme = normalize_theme(str(patch["sunrise_theme"]))
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, 'sunrise_theme', ?)",
                (user_id, sunrise_theme),
            )
        if "sunset_time" in patch and patch["sunset_time"] is not None:
            sunset_time = normalize_time(patch["sunset_time"])
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, 'sunset_time', ?)",
                (user_id, sunset_time),
            )
        if "sunset_theme" in patch and patch["sunset_theme"] is not None:
            sunset_theme = normalize_theme(str(patch["sunset_theme"]))
            conn.execute(
                "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, 'sunset_theme', ?)",
                (user_id, sunset_theme),
            )
    return get_settings(user_id)


SUMMARY_COLUMNS = "notes.id, notes.slug, notes.title, notes.date, notes.updated_at, notes.version"
NEWEST_FIRST = "ORDER BY notes.updated_at DESC, notes.id DESC"


def list_notes(user_id: int) -> list[dict[str, Any]]:
    with connect() as conn:
        sql, params = accessible_notes_query(user_id, SUMMARY_COLUMNS, order=NEWEST_FIRST)
        rows = conn.execute(sql, params).fetchall()
        return attach_tags(conn, [row_to_summary(row) for row in rows])


def parse_search_query(query: str) -> tuple[list[str], str]:
    query = query.strip()
    match = TAG_SEARCH_RE.match(query)
    if not match:
        return [], query
    tags = []
    seen = set()
    for tag in match.group(1).split(","):
        normalized = normalize_tag(tag)
        if normalized and normalized not in seen:
            tags.append(normalized)
            seen.add(normalized)
    return tags, (match.group(2) or "").strip()


def search_notes(user_id: int, query: str) -> list[dict[str, Any]]:
    tags, text_query = parse_search_query(query)
    term = f"%{text_query.lower()}%"
    clauses = ["1 = 1"]
    params: list[Any] = []
    if text_query:
        clauses.append("(lower(notes.title) LIKE ? OR lower(notes.body) LIKE ?)")
        params.extend([term, term])
    if tags:
        placeholders = ",".join("?" for _ in tags)
        clauses.append(
            f"""
            (
              SELECT count(DISTINCT note_tags.tag)
              FROM note_tags
              WHERE note_tags.note_id = notes.id
                AND note_tags.tag IN ({placeholders})
            ) = ?
            """
        )
        params.extend(tags)
        params.append(len(tags))
    with connect() as conn:
        sql, all_params = accessible_notes_query(
            user_id, SUMMARY_COLUMNS, where=" AND ".join(clauses), where_params=params, order=NEWEST_FIRST
        )
        rows = conn.execute(sql, all_params).fetchall()
        return attach_tags(conn, [row_to_summary(row) for row in rows])


def fetch_note(conn: sqlite3.Connection, user_id: int, note_id: int) -> dict[str, Any] | None:
    """The note as `user_id` sees it (own or shared with them), or None without access."""
    sql, params = accessible_notes_query(user_id, "notes.*", where="notes.id = ?", where_params=[note_id])
    row = conn.execute(sql, params).fetchone()
    if not row:
        return None
    return attach_tags(conn, [row_to_note(row)])[0]


def get_note(user_id: int, note_id: int) -> dict[str, Any] | None:
    with connect() as conn:
        return fetch_note(conn, user_id, note_id)


def get_note_by_id_or_slug(user_id: int, value: str) -> dict[str, Any] | None:
    value = value.strip()
    if value.isdigit():
        note = get_note(user_id, int(value))
        if note:
            return note
    # Opening by slug only looks at your own notes; shared notes open by id.
    with connect() as conn:
        rows = conn.execute(
            "SELECT * FROM notes WHERE user_id = ? AND slug = ? ORDER BY id DESC",
            (user_id, value),
        ).fetchall()
        if not rows:
            rows = conn.execute(
                "SELECT * FROM notes WHERE user_id = ? AND slug LIKE ? ORDER BY id DESC",
                (user_id, f"{value}%"),
            ).fetchall()
        if len(rows) == 1:
            return fetch_note(conn, user_id, int(rows[0]["id"]))
    return None


def create_note(user_id: int, title: str, body: str, client_id: str | None = None) -> dict[str, Any]:
    timestamp = now()
    note_date = today()
    title = clean_title(title)
    slug = slugify(title)
    with connect() as conn:
        if client_id:
            # A repeated create for the same client_id (lost response, retry) updates that note
            # with the newest text instead of inserting a copy.
            row = conn.execute(
                """
                INSERT INTO notes (user_id, client_id, slug, title, body, date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id, client_id) WHERE client_id IS NOT NULL DO UPDATE SET
                  slug = excluded.slug,
                  title = excluded.title,
                  body = excluded.body,
                  updated_at = excluded.updated_at,
                  version = notes.version + 1
                RETURNING id
                """,
                (user_id, client_id, slug, title, body, note_date, timestamp, timestamp),
            ).fetchone()
            note_id = int(row["id"])
        else:
            cursor = conn.execute(
                """
                INSERT INTO notes (user_id, slug, title, body, date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (user_id, slug, title, body, note_date, timestamp, timestamp),
            )
            note_id = inserted_id(cursor, "note")
        sync_note_tags(conn, note_id, body)
        # Read back inside the same transaction so a committed note always comes with a response.
        return fetch_note(conn, user_id, note_id)  # type: ignore[return-value]


class VersionConflict(Exception):
    """A save based on an older version of the note; carries the note as it is now."""

    def __init__(self, note: dict[str, Any]):
        super().__init__("note changed")
        self.note = note


def update_note(
    user_id: int, note_id: int, title: str, body: str, base_version: int | None = None
) -> dict[str, Any] | None:
    """Saves the owner's or an edit-share's change. None without access; PermissionError when view only;
    VersionConflict when `base_version` is given and someone saved a newer version in the meantime."""
    title = clean_title(title)
    timestamp = now()
    with connect() as conn:
        access = note_access(conn, user_id, note_id)
        if access is None:
            return None
        if access == "view":
            raise PermissionError("view only")
        if base_version is not None:
            current = conn.execute("SELECT version FROM notes WHERE id = ?", (note_id,)).fetchone()
            if int(current["version"]) != base_version:
                raise VersionConflict(fetch_note(conn, user_id, note_id))  # type: ignore[arg-type]
        conn.execute(
            "UPDATE notes SET title = ?, slug = ?, body = ?, updated_at = ?, version = version + 1 WHERE id = ?",
            (title, slugify(title), body, timestamp, note_id),
        )
        sync_note_tags(conn, note_id, body)
        return fetch_note(conn, user_id, note_id)


def sync_state(user_id: int, note_id: int | None) -> dict[str, Any]:
    """What a device needs to notice changes made elsewhere: a fingerprint of the visible note list
    (changes on any create, edit, delete or share change) and the open note's version (None without access)."""
    with connect() as conn:
        sql, params = accessible_notes_query(user_id, "notes.id, notes.version")
        rows = conn.execute(sql, params).fetchall()
        stamp = f"{len(rows)}-{max((row['id'] for row in rows), default=0)}-{sum(row['version'] for row in rows)}"
        note = None
        if note_id is not None and note_access(conn, user_id, note_id):
            version = conn.execute("SELECT version FROM notes WHERE id = ?", (note_id,)).fetchone()["version"]
            note = {"id": note_id, "version": int(version)}
    return {"list": stamp, "note": note}


def delete_note(user_id: int, note_id: int) -> bool:
    """The owner deletes the note for everyone; anyone it is shared with only removes it from their notes."""
    with connect() as conn:
        access = note_access(conn, user_id, note_id)
        if access is None:
            return False
        if access == "owner":
            conn.execute("DELETE FROM notes WHERE id = ?", (note_id,))
        else:
            conn.execute("DELETE FROM note_shares WHERE note_id = ? AND user_id = ?", (note_id, user_id))
    return True


SHARE_PERMISSIONS = {"view", "edit"}


def normalize_permission(permission: str) -> str:
    permission = str(permission).strip().lower()
    if permission not in SHARE_PERMISSIONS:
        raise ValueError("permission must be view or edit")
    return permission


def require_owner(conn: sqlite3.Connection, owner_id: int, note_id: int) -> None:
    """LookupError when the note doesn't exist for this user, PermissionError when it's only shared with them."""
    access = note_access(conn, owner_id, note_id)
    if access is None:
        raise LookupError("note not found")
    if access != "owner":
        raise PermissionError("only the owner can share this note")


def fetch_shares(conn: sqlite3.Connection, note_id: int) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT users.id AS user_id, users.email, note_shares.permission
        FROM note_shares
        JOIN users ON users.id = note_shares.user_id
        WHERE note_shares.note_id = ?
        ORDER BY users.email
        """,
        (note_id,),
    ).fetchall()
    return [{"user_id": row["user_id"], "email": row["email"], "permission": row["permission"]} for row in rows]


def list_shares(owner_id: int, note_id: int) -> list[dict[str, Any]]:
    with connect() as conn:
        require_owner(conn, owner_id, note_id)
        return fetch_shares(conn, note_id)


def share_note(owner_id: int, note_id: int, email: str, permission: str) -> list[dict[str, Any]]:
    """Shares with the user who has this email (or changes their permission). Returns the note's shares."""
    permission = normalize_permission(permission)
    with connect() as conn:
        require_owner(conn, owner_id, note_id)
        row = conn.execute(
            "SELECT id FROM users WHERE email = ? AND enabled = 1", (normalize_email(email),)
        ).fetchone()
        if not row:
            raise LookupError("No Clack Notes user with that email")
        if int(row["id"]) == owner_id:
            raise ValueError("You can't share with yourself")
        conn.execute(
            """
            INSERT INTO note_shares (note_id, user_id, permission, created_at) VALUES (?, ?, ?, ?)
            ON CONFLICT(note_id, user_id) DO UPDATE SET permission = excluded.permission
            """,
            (note_id, int(row["id"]), permission, now()),
        )
        return fetch_shares(conn, note_id)


def set_share_permission(owner_id: int, note_id: int, user_id: int, permission: str) -> list[dict[str, Any]]:
    permission = normalize_permission(permission)
    with connect() as conn:
        require_owner(conn, owner_id, note_id)
        cursor = conn.execute(
            "UPDATE note_shares SET permission = ? WHERE note_id = ? AND user_id = ?", (permission, note_id, user_id)
        )
        if cursor.rowcount == 0:
            raise LookupError("not shared with that user")
        return fetch_shares(conn, note_id)


def unshare_note(owner_id: int, note_id: int, user_id: int) -> list[dict[str, Any]]:
    with connect() as conn:
        require_owner(conn, owner_id, note_id)
        conn.execute("DELETE FROM note_shares WHERE note_id = ? AND user_id = ?", (note_id, user_id))
        return fetch_shares(conn, note_id)


def parse_markdown(raw: str) -> dict[str, str]:
    meta: dict[str, str] = {}
    body = raw
    if raw.startswith("---\n"):
        end = raw.find("\n---\n", 4)
        if end >= 0:
            for line in raw[4:end].splitlines():
                if ":" in line:
                    key, value = line.split(":", 1)
                    meta[key.strip()] = value.strip()
            body = raw[end + 5 :]
    title = clean_title(meta.get("title", "Imported Note"))
    return {"title": title, "body": body.lstrip("\n")}


def format_markdown(note: dict[str, Any]) -> str:
    return (
        "---\n"
        f"title: {note['title']}\n"
        f"date: {note['date']}\n"
        f"created_at: {note['created_at']}\n"
        f"updated_at: {note['updated_at']}\n"
        "---\n"
        f"{note['body'].lstrip()}"
    )
