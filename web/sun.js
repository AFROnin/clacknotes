// Sunrise and sunset for a place and day, computed locally (no external service).
// sunTimes(date, latitude, longitude) returns { sunrise, sunset, polar } for the calendar day of
// `date` in the device's time zone. sunrise/sunset are Date objects; on days when the sun never
// rises or never sets they are null and polar is "night" or "day". Accurate to about a minute.
// Formulas: NOAA's solar calculator (Meeus, "Astronomical Algorithms").
(function (root) {
  const RAD = Math.PI / 180;
  const DAY_MS = 86400000;
  // Sun's centre 0.833° below the horizon: refraction plus the sun's radius.
  const ZENITH = RAD * 90.833;

  // Declination (radians) and equation of time (minutes) at a Julian date.
  function sunAt(julian) {
    const t = (julian - 2451545) / 36525;
    const meanLongitude = RAD * ((280.46646 + t * (36000.76983 + t * 0.0003032)) % 360);
    const anomaly = RAD * (357.52911 + t * (35999.05029 - 0.0001537 * t));
    const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
    const center =
      Math.sin(anomaly) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
      Math.sin(2 * anomaly) * (0.019993 - 0.000101 * t) +
      Math.sin(3 * anomaly) * 0.000289;
    const omega = RAD * (125.04 - 1934.136 * t);
    const apparentLongitude = meanLongitude + RAD * (center - 0.00569 - 0.00478 * Math.sin(omega));
    const meanObliquity = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
    const obliquity = RAD * (meanObliquity + 0.00256 * Math.cos(omega));
    const y = Math.tan(obliquity / 2) ** 2;
    const equationOfTime =
      (4 / RAD) *
      (y * Math.sin(2 * meanLongitude) -
        2 * eccentricity * Math.sin(anomaly) +
        4 * eccentricity * y * Math.sin(anomaly) * Math.cos(2 * meanLongitude) -
        0.5 * y * y * Math.sin(4 * meanLongitude) -
        1.25 * eccentricity * eccentricity * Math.sin(2 * anomaly));
    return { declination: Math.asin(Math.sin(obliquity) * Math.sin(apparentLongitude)), equationOfTime };
  }

  // cos of the hour angle at which the sun crosses the horizon; outside [-1, 1] it never does.
  function cosHourAngle(phi, declination) {
    return Math.cos(ZENITH) / (Math.cos(phi) * Math.cos(declination)) - Math.tan(phi) * Math.tan(declination);
  }

  function sunTimes(date, latitude, longitude) {
    // Times are minutes after 00:00 UTC of the local calendar date (negative for far-east places).
    const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const julianMidnight = utcMidnight / DAY_MS + 2440587.5;
    const phi = RAD * latitude;
    const noonMinutes = (minutes) => 720 - 4 * longitude - sunAt(julianMidnight + minutes / 1440).equationOfTime;

    const solarNoon = noonMinutes(720 - 4 * longitude);
    const cosAtNoon = cosHourAngle(phi, sunAt(julianMidnight + solarNoon / 1440).declination);
    if (cosAtNoon > 1) return { sunrise: null, sunset: null, polar: "night" };
    if (cosAtNoon < -1) return { sunrise: null, sunset: null, polar: "day" };

    // Start from the noon estimate, then redo it with the sun's position at the event itself:
    // the declination moves enough in a few hours to shift spring and autumn times by minutes.
    const event = (direction) => {
      let minutes = solarNoon + (direction * 4 * Math.acos(cosAtNoon)) / RAD;
      for (let step = 0; step < 3; step += 1) {
        const sun = sunAt(julianMidnight + minutes / 1440);
        const cos = Math.min(1, Math.max(-1, cosHourAngle(phi, sun.declination)));
        minutes = 720 - 4 * longitude - sun.equationOfTime + (direction * 4 * Math.acos(cos)) / RAD;
      }
      return new Date(utcMidnight + minutes * 60000);
    };
    return { sunrise: event(-1), sunset: event(1), polar: null };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { sunTimes };
  } else {
    root.sunTimes = sunTimes;
  }
})(typeof window !== "undefined" ? window : globalThis);
