from __future__ import annotations

import contextlib
import io
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import db
from scripts import dedupe_notes


class TempDbTest(unittest.TestCase):
    def setUp(self) -> None:
        self._dir = tempfile.TemporaryDirectory()
        self.data_dir = Path(self._dir.name)
        self.db_path = self.data_dir / "notes.sqlite3"
        self._patches = [
            patch.object(db, "DATA_DIR", self.data_dir),
            patch.object(db, "DB_PATH", self.db_path),
        ]
        for item in self._patches:
            item.start()
        db.init_db()
        user = db.create_user("user@example.com", "hash")
        self.user_id = int(user["id"])

    def tearDown(self) -> None:
        for item in reversed(self._patches):
            item.stop()
        self._dir.cleanup()

    def note_count(self) -> int:
        return len(db.list_notes(self.user_id))


class IdempotentCreateTest(TempDbTest):
    def test_same_client_id_reuses_one_note_with_latest_text(self) -> None:
        first = db.create_note(self.user_id, "Draft", "first words", client_id="client-abc-123")
        second = db.create_note(self.user_id, "Draft", "first words and more\n#todo", client_id="client-abc-123")
        self.assertEqual(first["id"], second["id"])
        self.assertEqual(second["body"], "first words and more\n#todo")
        self.assertEqual(second["tags"], ["todo"])
        self.assertEqual(self.note_count(), 1)

    def test_different_client_ids_create_separate_notes(self) -> None:
        db.create_note(self.user_id, "Same", "text", client_id="client-aaa-111")
        db.create_note(self.user_id, "Same", "text", client_id="client-bbb-222")
        self.assertEqual(self.note_count(), 2)

    def test_creates_without_client_id_are_independent(self) -> None:
        db.create_note(self.user_id, "Imported", "text")
        db.create_note(self.user_id, "Imported", "text")
        self.assertEqual(self.note_count(), 2)

    def test_client_id_is_scoped_per_user(self) -> None:
        other = db.create_user("other@example.com", "hash")
        db.create_note(self.user_id, "Mine", "text", client_id="client-shared-1")
        db.create_note(int(other["id"]), "Theirs", "text", client_id="client-shared-1")
        self.assertEqual(self.note_count(), 1)
        self.assertEqual(len(db.list_notes(int(other["id"]))), 1)

    def test_init_db_migrates_existing_database(self) -> None:
        with contextlib.closing(sqlite3.connect(self.db_path)) as conn, conn:
            conn.execute("DROP INDEX idx_notes_user_client")
            conn.execute("ALTER TABLE notes DROP COLUMN client_id")
        db.init_db()
        db.init_db()
        with contextlib.closing(sqlite3.connect(self.db_path)) as conn, conn:
            columns = {row[1] for row in conn.execute("PRAGMA table_info(notes)")}
            indexes = {row[1] for row in conn.execute("PRAGMA index_list(notes)")}
        self.assertIn("client_id", columns)
        self.assertIn("idx_notes_user_client", indexes)


class DedupeScriptTest(TempDbTest):
    def run_script(self, *args: str) -> tuple[int, str]:
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            code = dedupe_notes.main(["--db", str(self.db_path), *args])
        return code, output.getvalue()

    def make_duplicates(self) -> tuple[int, int, int]:
        keep = db.create_note(self.user_id, "Twin", "same text\n#todo")["id"]
        copy = db.create_note(self.user_id, "Twin", "same text\n#todo")["id"]
        unique = db.create_note(self.user_id, "Twin", "different text")["id"]
        return keep, copy, unique

    def test_dry_run_changes_nothing(self) -> None:
        keep, copy, _unique = self.make_duplicates()
        code, output = self.run_script()
        self.assertEqual(code, 0)
        self.assertIn(f"keep   #{keep}", output)
        self.assertIn(f"delete #{copy}", output)
        self.assertEqual(self.note_count(), 3)
        self.assertEqual(list(self.data_dir.glob("*.backup-*")), [])

    def test_apply_keeps_oldest_and_writes_backup(self) -> None:
        keep, copy, unique = self.make_duplicates()
        code, _output = self.run_script("--apply")
        self.assertEqual(code, 0)
        remaining = {note["id"] for note in db.list_notes(self.user_id)}
        self.assertEqual(remaining, {keep, unique})
        with contextlib.closing(sqlite3.connect(self.db_path)) as conn, conn:
            orphan_tags = conn.execute("SELECT COUNT(*) FROM note_tags WHERE note_id = ?", (copy,)).fetchone()[0]
        self.assertEqual(orphan_tags, 0)
        backups = list(self.data_dir.glob("notes.backup-*.sqlite3"))
        self.assertEqual(len(backups), 1)
        with contextlib.closing(sqlite3.connect(backups[0])) as conn, conn:
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM notes").fetchone()[0], 3)

    def test_no_duplicates(self) -> None:
        db.create_note(self.user_id, "Only", "one")
        code, output = self.run_script()
        self.assertEqual(code, 0)
        self.assertIn("No duplicate notes found.", output)


if __name__ == "__main__":
    unittest.main()
