from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import db
import main
from main import NoteInput

ROOT = Path(__file__).resolve().parent.parent


class SyncBase(unittest.TestCase):
    def setUp(self) -> None:
        self._dir = tempfile.TemporaryDirectory()
        data_dir = Path(self._dir.name)
        self._patches = [
            patch.object(db, "DATA_DIR", data_dir),
            patch.object(db, "DB_PATH", data_dir / "notes.sqlite3"),
        ]
        for item in self._patches:
            item.start()
        db.init_db()
        self.alice = db.create_user("alice@example.com", "hash")
        self.bob = db.create_user("bob@example.com", "hash")
        self.note = db.create_note(self.alice["id"], "Groceries", "#list\n\nMilk")

    def tearDown(self) -> None:
        for item in reversed(self._patches):
            item.stop()
        self._dir.cleanup()

    def stamp(self, user: dict) -> str:
        return db.sync_state(user["id"], None)["list"]


class VersionTest(SyncBase):
    def test_version_goes_up_on_every_save(self) -> None:
        self.assertEqual(self.note["version"], 1)
        saved = db.update_note(self.alice["id"], self.note["id"], "Groceries", "#list\n\nMilk\nBread")
        self.assertEqual(saved["version"], 2)
        self.assertEqual(db.list_notes(self.alice["id"])[0]["version"], 2)

    def test_stale_save_is_refused_and_changes_nothing(self) -> None:
        db.update_note(self.alice["id"], self.note["id"], "Groceries", "from the desktop", base_version=1)
        with self.assertRaises(db.VersionConflict) as caught:
            db.update_note(self.alice["id"], self.note["id"], "Groceries", "stale phone copy", base_version=1)
        self.assertEqual(caught.exception.note["body"], "from the desktop")
        self.assertEqual(caught.exception.note["version"], 2)
        self.assertEqual(db.get_note(self.alice["id"], self.note["id"])["body"], "from the desktop")

    def test_save_on_current_version_or_without_one_succeeds(self) -> None:
        saved = db.update_note(self.alice["id"], self.note["id"], "Groceries", "v2", base_version=1)
        self.assertEqual(saved["version"], 2)
        # Pages from before this change send no base_version and keep saving as before.
        saved = db.update_note(self.alice["id"], self.note["id"], "Groceries", "v3")
        self.assertEqual(saved["version"], 3)

    def test_retried_create_counts_as_a_save(self) -> None:
        first = db.create_note(self.alice["id"], "Draft", "a", client_id="client-sync-1")
        again = db.create_note(self.alice["id"], "Draft", "a b", client_id="client-sync-1")
        self.assertEqual((first["version"], again["version"]), (1, 2))


class SyncStateTest(SyncBase):
    def test_list_stamp_changes_on_create_edit_delete(self) -> None:
        start = self.stamp(self.alice)
        self.assertEqual(self.stamp(self.alice), start)
        created = db.create_note(self.alice["id"], "Second", "x")
        after_create = self.stamp(self.alice)
        self.assertNotEqual(after_create, start)
        db.update_note(self.alice["id"], created["id"], "Second", "y")
        after_edit = self.stamp(self.alice)
        self.assertNotEqual(after_edit, after_create)
        db.delete_note(self.alice["id"], created["id"])
        self.assertNotEqual(self.stamp(self.alice), after_edit)

    def test_list_stamp_changes_when_sharing_changes(self) -> None:
        before = self.stamp(self.bob)
        db.share_note(self.alice["id"], self.note["id"], "bob@example.com", "edit")
        shared = self.stamp(self.bob)
        self.assertNotEqual(shared, before)
        db.unshare_note(self.alice["id"], self.note["id"], self.bob["id"])
        self.assertEqual(self.stamp(self.bob), before)

    def test_note_version_and_access(self) -> None:
        self.assertEqual(db.sync_state(self.alice["id"], self.note["id"])["note"], {"id": self.note["id"], "version": 1})
        self.assertIsNone(db.sync_state(self.bob["id"], self.note["id"])["note"])
        db.share_note(self.alice["id"], self.note["id"], "bob@example.com", "view")
        self.assertEqual(db.sync_state(self.bob["id"], self.note["id"])["note"]["version"], 1)

    def test_put_route_answers_409_with_the_current_note(self) -> None:
        db.update_note(self.alice["id"], self.note["id"], "Groceries", "newer")
        response = main.update_note(
            self.note["id"], NoteInput(title="Groceries", body="older", base_version=1), self.alice, None
        )
        self.assertEqual(response.status_code, 409)
        payload = json.loads(response.body)
        self.assertEqual((payload["detail"], payload["note"]["body"], payload["note"]["version"]), ("note changed", "newer", 2))


@unittest.skipUnless(shutil.which("node"), "node is not installed")
class MergeScriptTest(unittest.TestCase):
    def test_merge3(self) -> None:
        result = subprocess.run(
            ["node", str(ROOT / "tests" / "merge_test.js")], capture_output=True, text=True, timeout=60
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)


if __name__ == "__main__":
    unittest.main()
