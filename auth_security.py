from __future__ import annotations

import base64
import binascii
import hashlib
import hmac
import secrets
import struct
import time
from urllib.parse import quote, urlencode


def generate_totp_secret() -> str:
    return base64.b32encode(secrets.token_bytes(20)).decode("ascii").rstrip("=")


def totp_key(secret: str) -> bytes:
    padded = secret.strip().replace(" ", "").upper()
    padded += "=" * ((8 - len(padded) % 8) % 8)
    return base64.b32decode(padded, casefold=True)


def totp_code(secret: str, counter: int | None = None, *, for_time: int | None = None) -> str:
    if counter is None:
        counter = int((for_time if for_time is not None else time.time()) // 30)
    digest = hmac.new(totp_key(secret), struct.pack(">Q", counter), hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    value = struct.unpack(">I", digest[offset : offset + 4])[0] & 0x7FFFFFFF
    return f"{value % 1_000_000:06d}"


def verify_totp(secret: str, code: str) -> bool:
    normalized = "".join(char for char in code if char.isdigit())
    if len(normalized) != 6:
        return False
    try:
        key = totp_key(secret)
    except (binascii.Error, ValueError):
        return False
    counter = int(time.time() // 30)
    for offset in (-1, 0, 1):
        digest = hmac.new(key, struct.pack(">Q", counter + offset), hashlib.sha1).digest()
        dynamic_offset = digest[-1] & 0x0F
        value = struct.unpack(">I", digest[dynamic_offset : dynamic_offset + 4])[0] & 0x7FFFFFFF
        expected = f"{value % 1_000_000:06d}"
        if hmac.compare_digest(expected, normalized):
            return True
    return False


def otpauth_uri(email: str, secret: str, issuer: str) -> str:
    label = f"{issuer}:{email}"
    return f"otpauth://totp/{quote(label)}?{urlencode({'secret': secret, 'issuer': issuer})}"


def qr_svg(data: str) -> str:
    import qrcode
    from qrcode.constants import ERROR_CORRECT_M
    from qrcode.image.svg import SvgPathImage

    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_M, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    image = qr.make_image(image_factory=SvgPathImage)
    svg = image.to_string(encoding="unicode")
    return svg if isinstance(svg, str) else svg.decode("utf-8")
