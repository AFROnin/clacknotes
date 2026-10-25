from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi import HTTPException

import db
import main
from main import NoteInput, ShareInput


class SharingBase(unittest.TestCase):
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
        self.carol = db.create_user("carol@example.com", "hash")
        self.note = db.create_note(self.alice["id"], "Groceries", "#list\n\nMilk")

    def tearDown(self) -> None:
        for item in reversed(self._patches):
            item.stop()
        self._dir.cleanup()

    def share(self, email: str = "bob@example.com", permission: str = "view") -> list[dict]:
        return db.share_note(self.alice["id"], self.note["id"], email, permission)

    def bobs_notes(self) -> list[dict]:
        return db.list_notes(self.bob["id"])


class SharingTest(SharingBase):
    def test_note_is_private_until_shared(self) -> None:
        self.assertEqual(self.bobs_notes(), [])
        self.assertIsNone(db.get_note(self.bob["id"], self.note["id"]))

    def test_share_by_email_shows_note_to_recipient(self) -> None:
        shares = self.share("  BOB@Example.com ", "view")
        self.assertEqual([(s["email"], s["permission"]) for s in shares], [("bob@example.com", "view")])

        [summary] = self.bobs_notes()
        self.assertEqual((summary["id"], summary["access"], summary["owner_email"]), (self.note["id"], "view", "alice@example.com"))
        note = db.get_note(self.bob["id"], self.note["id"])
        self.assertEqual((note["body"], note["access"], note["tags"]), ("#list\n\nMilk", "view", ["list"]))

        # The owner sees how many people the note is shared with, and no owner email on their own note.
        [own] = db.list_notes(self.alice["id"])
        self.assertEqual((own["access"], own["owner_email"], own["share_count"]), ("owner", None, 1))

    def test_search_finds_shared_notes(self) -> None:
        self.share()
        self.assertEqual([n["id"] for n in db.search_notes(self.bob["id"], "milk")], [self.note["id"]])
        self.assertEqual([n["id"] for n in db.search_notes(self.bob["id"], "tag:list")], [self.note["id"]])
        self.assertEqual(db.search_notes(self.carol["id"], "milk"), [])

    def test_unknown_email_and_self_are_refused(self) -> None:
        with self.assertRaises(LookupError):
            self.share("nobody@example.com")
        with self.assertRaises(ValueError):
            self.share("alice@example.com")
        with self.assertRaises(ValueError):
            self.share(permission="admin")

    def test_view_cannot_edit_but_edit_can(self) -> None:
        self.share(permission="view")
        with self.assertRaises(PermissionError):
            db.update_note(self.bob["id"], self.note["id"], "Groceries", "Hacked")

        db.set_share_permission(self.alice["id"], self.note["id"], self.bob["id"], "edit")
        saved = db.update_note(self.bob["id"], self.note["id"], "Groceries", "#list\n\nMilk\nBread")
        self.assertEqual(saved["access"], "edit")
        # The owner sees the recipient's change, and the note still belongs to the owner.
        self.assertEqual(db.get_note(self.alice["id"], self.note["id"])["body"], "#list\n\nMilk\nBread")
        self.assertEqual(db.get_note(self.alice["id"], self.note["id"])["access"], "owner")

    def test_only_the_owner_manages_shares(self) -> None:
        self.share(permission="edit")
        with self.assertRaises(PermissionError):
            db.share_note(self.bob["id"], self.note["id"], "carol@example.com", "view")
        with self.assertRaises(PermissionError):
            db.list_shares(self.bob["id"], self.note["id"])
        with self.assertRaises(LookupError):
            db.list_shares(self.carol["id"], self.note["id"])

    def test_unsharing_removes_access(self) -> None:
        self.share()
        db.unshare_note(self.alice["id"], self.note["id"], self.bob["id"])
        self.assertEqual(self.bobs_notes(), [])
        self.assertIsNone(db.update_note(self.bob["id"], self.note["id"], "x", "y"))

    def test_recipient_delete_only_removes_it_from_their_notes(self) -> None:
        self.share()
        self.assertTrue(db.delete_note(self.bob["id"], self.note["id"]))
        self.assertEqual(self.bobs_notes(), [])
        self.assertIsNotNone(db.get_note(self.alice["id"], self.note["id"]))
        self.assertEqual(db.list_shares(self.alice["id"], self.note["id"]), [])

    def test_owner_delete_removes_note_for_everyone(self) -> None:
        self.share()
        self.assertTrue(db.delete_note(self.alice["id"], self.note["id"]))
        self.assertEqual(self.bobs_notes(), [])
        with db.connect() as conn:
            self.assertEqual(conn.execute("SELECT count(*) FROM note_shares").fetchone()[0], 0)

    def test_deleting_users_cleans_up_shares(self) -> None:
        admin = db.create_user("admin@example.com", "hash", role="admin")
        self.share()
        db.delete_user(self.bob["id"], admin["id"])
        self.assertEqual(db.list_shares(self.alice["id"], self.note["id"]), [])

        self.share("carol@example.com")
        db.delete_user(self.alice["id"], admin["id"])
        self.assertEqual(db.list_notes(self.carol["id"]), [])


class SharingApiTest(SharingBase):
    def test_view_only_save_is_forbidden(self) -> None:
        self.share(permission="view")
        with self.assertRaises(HTTPException) as caught:
            main.update_note(self.note["id"], NoteInput(title="Groceries", body="Hacked"), self.bob, None)
        self.assertEqual(caught.exception.status_code, 403)

    def test_share_endpoints_are_owner_only(self) -> None:
        self.share(permission="edit")
        with self.assertRaises(HTTPException) as caught:
            main.share_note(self.note["id"], ShareInput(email="carol@example.com"), self.bob, None)
        self.assertEqual(caught.exception.status_code, 403)
        with self.assertRaises(HTTPException) as caught:
            main.list_note_shares(self.note["id"], self.carol)
        self.assertEqual(caught.exception.status_code, 404)
        with self.assertRaises(HTTPException) as caught:
            main.share_note(self.note["id"], ShareInput(email="nobody@example.com"), self.alice, None)
        self.assertEqual(caught.exception.status_code, 404)


if __name__ == "__main__":
    unittest.main()
