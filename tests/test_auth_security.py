from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import db
import auth_security


class TotpTest(unittest.TestCase):
    def test_totp_rfc_vector(self) -> None:
        secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"
        self.assertEqual(auth_security.totp_code(secret, for_time=59), "287082")

    def test_verify_totp_accepts_current_code(self) -> None:
        secret = auth_security.generate_totp_secret()
        self.assertTrue(auth_security.verify_totp(secret, auth_security.totp_code(secret)))
        self.assertFalse(auth_security.verify_totp(secret, "000000"))

    def test_qr_svg_returns_svg_markup(self) -> None:
        svg = auth_security.qr_svg("otpauth://totp/Clack%20Notes:test@example.com?secret=ABC")
        self.assertIn("<svg", svg)
        self.assertIn("<path", svg)

    def test_totp_user_fields_persist(self) -> None:
        with tempfile.TemporaryDirectory() as raw_dir:
            data_dir = Path(raw_dir)
            with (
                patch.object(db, "DATA_DIR", data_dir),
                patch.object(db, "DB_PATH", data_dir / "notes.sqlite3"),
            ):
                db.init_db()
                user = db.create_user("user@example.com", "hash")
                self.assertIsNotNone(user)
                self.assertFalse(user["totp_enabled"])

                db.set_user_totp_secret(int(user["id"]), "ABCDEF")
                pending = db.get_user_with_password("user@example.com")
                self.assertEqual(pending["totp_secret"], "ABCDEF")
                self.assertFalse(pending["totp_enabled"])

                enabled = db.enable_user_totp(int(user["id"]))
                self.assertIsNotNone(enabled)
                self.assertTrue(enabled["totp_enabled"])
                db.create_session(int(user["id"]), "token-hash", "csrf-token", db.expiry(1))
                session = db.get_session("token-hash")
                self.assertIsNotNone(session)
                self.assertTrue(session["user"]["totp_enabled"])

                disabled = db.disable_user_totp(int(user["id"]))
                self.assertIsNotNone(disabled)
                self.assertFalse(disabled["totp_enabled"])

    def test_list_users_handles_admin_without_totp(self) -> None:
        with tempfile.TemporaryDirectory() as raw_dir:
            data_dir = Path(raw_dir)
            with (
                patch.object(db, "DATA_DIR", data_dir),
                patch.object(db, "DB_PATH", data_dir / "notes.sqlite3"),
            ):
                db.init_db()
                admin = db.create_first_admin("admin@example.com", "hash")
                self.assertIsNotNone(admin)

                users = db.list_users()

                self.assertEqual(len(users), 1)
                self.assertEqual(users[0]["email"], "admin@example.com")
                self.assertFalse(users[0]["totp_enabled"])


if __name__ == "__main__":
    unittest.main()
