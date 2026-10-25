from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import db


class TagParserTest(unittest.TestCase):
    def test_tag_must_be_alone_on_its_line(self) -> None:
        self.assertEqual(db.parse_tags("#todo"), ["todo"])
        self.assertEqual(db.parse_tags("This is a #todo"), [])
        self.assertEqual(db.parse_tags("#todo is next"), [])
        self.assertEqual(db.parse_tags("#tagA #tagB"), [])

    def test_one_tag_per_line(self) -> None:
        self.assertEqual(db.parse_tags("#tagA\n#tagB\r\n#tagC"), ["taga", "tagb", "tagc"])

    def test_markdown_headings_are_not_tags(self) -> None:
        self.assertEqual(db.parse_tags("# tag\n# Heading\n### heading"), [])

    def test_duplicate_tags_keep_first_order(self) -> None:
        self.assertEqual(db.parse_tags("#Beta\n#alpha\n#beta\n#Alpha"), ["beta", "alpha"])

    def test_tag_positions_use_raw_token(self) -> None:
        self.assertEqual(
            db.parse_tag_positions("pre #inline\n  #tag-one  \n# tag\n#Two!"),
            [("tag-one", 14, 22), ("two", 31, 36)],
        )

    def test_url_fragments_are_not_tags(self) -> None:
        self.assertEqual(db.parse_tags("https://stripe.com/docs/testing#cards"), [])

    def test_word_fragments_are_not_tags(self) -> None:
        self.assertEqual(db.parse_tags("word#tag\n/path#section\n#tag#other"), [])

    def test_surrounding_whitespace_is_allowed(self) -> None:
        self.assertEqual(db.parse_tags("hello #inline\n\t#indented\n#trailing  "), ["indented", "trailing"])

    def test_tag_pill_style_normalization(self) -> None:
        self.assertEqual(db.normalize_tag_pill_style("outline"), "outline")
        self.assertEqual(db.normalize_tag_pill_style("unknown"), "soft")

    def test_code_font_size_normalization(self) -> None:
        self.assertEqual(db.normalize_code_font_size("18"), "18")
        self.assertEqual(db.normalize_code_font_size("10"), "14")
        self.assertEqual(db.normalize_code_font_size("23"), "14")
        self.assertEqual(db.normalize_code_font_size("nope"), "14")

    def test_font_normalization(self) -> None:
        self.assertEqual(db.normalize_font("courier-prime"), "courier-prime")
        self.assertEqual(db.normalize_font("unknown"), "system-mono")

    def test_bool_setting_normalization(self) -> None:
        self.assertEqual(db.normalize_bool_setting(True), "true")
        self.assertEqual(db.normalize_bool_setting(False), "false")
        self.assertEqual(db.normalize_bool_setting("true"), "true")
        self.assertEqual(db.normalize_bool_setting("nope"), "false")


class NoteTagStorageTest(unittest.TestCase):
    def test_code_font_size_setting_persists(self) -> None:
        with tempfile.TemporaryDirectory() as raw_dir:
            data_dir = Path(raw_dir)
            with (
                patch.object(db, "DATA_DIR", data_dir),
                patch.object(db, "DB_PATH", data_dir / "notes.sqlite3"),
            ):
                db.init_db()
                user = db.create_user("user@example.com", "hash")
                self.assertIsNotNone(user)
                user_id = int(user["id"])

                self.assertEqual(db.get_settings(user_id)["code_font_size"], "14")
                self.assertEqual(db.update_settings(user_id, {"code_font_size": "19"})["code_font_size"], "19")
                self.assertEqual(db.update_settings(user_id, {"code_font_size": "90"})["code_font_size"], "14")
                self.assertEqual(db.get_settings(user_id)["editor_line_numbers"], "true")
                self.assertEqual(db.update_settings(user_id, {"editor_line_numbers": False})["editor_line_numbers"], "false")
                # On app start: a blank note by default, or the last used note.
                self.assertEqual(db.get_settings(user_id)["start_note"], "new")
                self.assertEqual(db.update_settings(user_id, {"start_note": "last"})["start_note"], "last")
                self.assertEqual(db.update_settings(user_id, {"start_note": "random"})["start_note"], "new")
                self.assertEqual(db.get_settings(user_id)["last_note_id"], "")
                self.assertEqual(db.update_settings(user_id, {"last_note_id": 42})["last_note_id"], "42")
                self.assertEqual(db.update_settings(user_id, {"last_note_id": "abc"})["last_note_id"], "")

    def test_create_update_and_search_tags(self) -> None:
        with tempfile.TemporaryDirectory() as raw_dir:
            data_dir = Path(raw_dir)
            with (
                patch.object(db, "DATA_DIR", data_dir),
                patch.object(db, "DB_PATH", data_dir / "notes.sqlite3"),
            ):
                db.init_db()
                user = db.create_user("user@example.com", "hash")
                self.assertIsNotNone(user)
                user_id = int(user["id"])

                note = db.create_note(user_id, "Tagged", "#tagA\n#tagB\n# Heading\nsee #inline\nhttps://stripe.com/docs/testing#cards")
                self.assertEqual(note["tags"], ["taga", "tagb"])
                self.assertEqual([item["id"] for item in db.search_notes(user_id, "tag:taga,tagb")], [note["id"]])
                self.assertEqual(db.search_notes(user_id, "tag:heading"), [])

                updated = db.update_note(user_id, int(note["id"]), "Tagged", "#tag B\n### heading\n#tag")
                self.assertIsNotNone(updated)
                self.assertEqual(updated["tags"], ["tag"])
                self.assertEqual([item["id"] for item in db.search_notes(user_id, "tag:tag Tagged")], [note["id"]])


if __name__ == "__main__":
    unittest.main()
