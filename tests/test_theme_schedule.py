from __future__ import annotations

import unittest

import db
from tests.test_notes import TempDbTest


class ThemeScheduleSettingsTest(TempDbTest):
    def test_new_account_has_schedule_off(self) -> None:
        settings = db.get_settings(self.user_id)
        self.assertEqual(
            (settings["theme_schedule"], settings["sun_latitude"], settings["sun_longitude"]), ("off", "", "")
        )

    def test_older_account_with_both_times_keeps_its_fixed_schedule(self) -> None:
        with db.connect() as conn:
            conn.execute("DELETE FROM user_settings WHERE user_id = ? AND key = 'theme_schedule'", (self.user_id,))
        db.update_settings(self.user_id, {"sunrise_time": "07:00", "sunset_time": "19:30"})
        self.assertEqual(db.get_settings(self.user_id)["theme_schedule"], "times")

    def test_coordinates_are_rounded_to_about_a_kilometre(self) -> None:
        settings = db.update_settings(
            self.user_id, {"theme_schedule": "sun", "sun_latitude": 52.520008, "sun_longitude": "-13.404954"}
        )
        self.assertEqual(
            (settings["theme_schedule"], settings["sun_latitude"], settings["sun_longitude"]), ("sun", "52.52", "-13.40")
        )

    def test_invalid_values_are_dropped(self) -> None:
        settings = db.update_settings(
            self.user_id, {"theme_schedule": "moon", "sun_latitude": "91", "sun_longitude": "nan"}
        )
        self.assertEqual(
            (settings["theme_schedule"], settings["sun_latitude"], settings["sun_longitude"]), ("off", "", "")
        )

    def test_empty_coordinates_clear_the_location(self) -> None:
        db.update_settings(self.user_id, {"sun_latitude": "48.1", "sun_longitude": "11.6"})
        settings = db.update_settings(self.user_id, {"sun_latitude": "", "sun_longitude": ""})
        self.assertEqual((settings["sun_latitude"], settings["sun_longitude"]), ("", ""))


if __name__ == "__main__":
    unittest.main()
