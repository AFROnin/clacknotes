from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import db
import main


class TotpApiTest(unittest.TestCase):
    def test_totp_setup_returns_qr_svg(self) -> None:
        with tempfile.TemporaryDirectory() as raw_dir:
            data_dir = Path(raw_dir)
            with (
                patch.object(db, "DATA_DIR", data_dir),
                patch.object(db, "DB_PATH", data_dir / "notes.sqlite3"),
            ):
                db.init_db()
                user = db.create_first_admin("admin@example.com", "hash")
                self.assertIsNotNone(user)

                payload = main.totp_setup(user, None)

                self.assertTrue(payload["secret"])
                self.assertTrue(payload["otpauth_uri"].startswith("otpauth://totp/"))
                self.assertIn("<svg", payload["qr_svg"])
                self.assertIn("<path", payload["qr_svg"])


if __name__ == "__main__":
    unittest.main()
