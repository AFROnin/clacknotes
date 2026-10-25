from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import time
from pathlib import Path
from typing import Annotated, Any

from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, VerifyMismatchError
from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, Response, UploadFile, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, EmailStr, Field

import db
from auth_security import generate_totp_secret, otpauth_uri, qr_svg, verify_totp


ROOT = Path(__file__).resolve().parent
WEB_DIR = ROOT / "web"
SESSION_COOKIE = "clack_session"
SESSION_DAYS = 14
INVITE_DAYS = 7
MIN_PASSWORD_LENGTH = 12
TOTP_ISSUER = os.getenv("CLACK_TOTP_ISSUER", "Clack Notes")
AUTH_RATE_LIMIT_ATTEMPTS = int(os.getenv("CLACK_AUTH_RATE_LIMIT_ATTEMPTS", "8"))
AUTH_RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("CLACK_AUTH_RATE_LIMIT_WINDOW_SECONDS", "300"))
ALLOWED_HOSTS = [host.strip() for host in os.getenv("CLACK_ALLOWED_HOSTS", "").split(",") if host.strip()]

app = FastAPI(title="Clack Notes")
if ALLOWED_HOSTS:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=ALLOWED_HOSTS)
password_hasher = PasswordHasher()
auth_failures: dict[str, list[float]] = {}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Referrer-Policy", "same-origin")
        response.headers.setdefault("X-Frame-Options", "DENY")
        return response


app.add_middleware(SecurityHeadersMiddleware)


class SettingsPatch(BaseModel):
    theme: str | None = None
    font: str | None = None
    custom_font: str | None = None
    font_size: str | int | None = None
    code_font_size: str | int | None = None
    cursor_type: str | None = None
    tag_pill_style: str | None = None
    action_icon_style: str | None = None
    editor_line_numbers: bool | str | None = None
    focus_letter_effect: bool | str | None = None
    start_note: str | None = None
    last_note_id: int | str | None = None
    sunrise_time: str | None = None
    sunrise_theme: str | None = None
    sunset_time: str | None = None
    sunset_theme: str | None = None


class NoteInput(BaseModel):
    title: str
    body: str = ""
    # The version this edit started from; the save is refused (409) if someone saved a newer one since.
    base_version: int | None = None


class NoteCreate(NoteInput):
    # Browser-generated id for a new note; repeated creates with the same id reuse one row.
    client_id: str | None = Field(default=None, pattern=r"^[A-Za-z0-9-]{8,64}$")


class Note(NoteInput):
    id: int
    slug: str
    date: str
    created_at: str
    updated_at: str
    version: int = 1
    tags: list[str]
    # "owner", or "edit" / "view" for a note someone shared with you.
    access: str = "owner"
    owner_email: str | None = None
    # Your own notes: how many people they are shared with.
    share_count: int = 0


class NoteSummary(BaseModel):
    id: int
    slug: str
    title: str
    date: str
    updated_at: str
    version: int = 1
    tags: list[str]
    access: str = "owner"
    owner_email: str | None = None
    share_count: int = 0


class ShareInput(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    permission: str = "edit"


class SharePatch(BaseModel):
    permission: str


class Share(BaseModel):
    user_id: int
    email: str
    permission: str


class AuthInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=MIN_PASSWORD_LENGTH)
    totp_code: str | None = None


class SignupInput(AuthInput):
    invite_token: str | None = None


class TotpCodeInput(BaseModel):
    code: str


class TotpDisableInput(BaseModel):
    password: str = Field(min_length=MIN_PASSWORD_LENGTH)
    code: str | None = None


class UserPatch(BaseModel):
    role: str | None = None
    enabled: bool | None = None


class SignupSettingsPatch(BaseModel):
    enabled: bool


class InviteInput(BaseModel):
    role: str = "user"


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def public_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "enabled": user["enabled"],
        "created_at": user["created_at"],
        "updated_at": user["updated_at"],
        "last_login_at": user["last_login_at"],
        "totp_enabled": user["totp_enabled"],
    }


def cookie_secure(request: Request) -> bool:
    return request.url.scheme == "https" or request.headers.get("x-forwarded-proto", "").split(",")[0].strip() == "https"


def set_session_cookie(response: Response, request: Request, token: str) -> None:
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=cookie_secure(request),
        samesite="lax",
    )


def clear_session_cookie(response: Response, request: Request) -> None:
    response.delete_cookie(
        SESSION_COOKIE,
        httponly=True,
        secure=cookie_secure(request),
        samesite="lax",
    )


def make_session(user: dict[str, Any], response: Response, request: Request) -> dict[str, Any]:
    token = secrets.token_urlsafe(32)
    csrf_token = secrets.token_urlsafe(32)
    db.create_session(user["id"], token_hash(token), csrf_token, db.expiry(SESSION_DAYS))
    db.mark_login(user["id"])
    set_session_cookie(response, request, token)
    return {"user": public_user(user), "csrf_token": csrf_token}


def session_from_request(request: Request) -> dict[str, Any]:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="not authenticated")
    session = db.get_session(token_hash(token))
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="not authenticated")
    return session


def current_user(request: Request) -> dict[str, Any]:
    return session_from_request(request)["user"]


def current_admin(request: Request) -> dict[str, Any]:
    user = current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="admin required")
    return user


def require_csrf(
    request: Request,
    x_csrf_token: Annotated[str | None, Header(alias="X-CSRF-Token")] = None,
) -> None:
    session = session_from_request(request)
    if not x_csrf_token or not hmac.compare_digest(x_csrf_token, session["csrf_token"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="csrf token invalid")


UserDep = Annotated[dict[str, Any], Depends(current_user)]
AdminDep = Annotated[dict[str, Any], Depends(current_admin)]
CsrfDep = Annotated[None, Depends(require_csrf)]


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except (VerifyMismatchError, VerificationError):
        return False


def client_key(request: Request, email: str) -> str:
    host = request.client.host if request.client else "unknown"
    forwarded = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    return f"{forwarded or host}:{email.lower()}"


def check_auth_rate_limit(request: Request, email: str) -> None:
    key = client_key(request, email)
    cutoff = time.time() - AUTH_RATE_LIMIT_WINDOW_SECONDS
    attempts = [attempt for attempt in auth_failures.get(key, []) if attempt >= cutoff]
    auth_failures[key] = attempts
    if len(attempts) >= AUTH_RATE_LIMIT_ATTEMPTS:
        raise HTTPException(status_code=429, detail="too many login attempts")


def record_auth_failure(request: Request, email: str) -> None:
    key = client_key(request, email)
    auth_failures.setdefault(key, []).append(time.time())


def clear_auth_failures(request: Request, email: str) -> None:
    auth_failures.pop(client_key(request, email), None)


@app.on_event("startup")
def startup() -> None:
    db.init_db()


@app.get("/api/auth/status")
def auth_status() -> dict[str, Any]:
    return {
        "setup_required": not db.users_exist(),
        "signup_enabled": db.signup_enabled(),
        # Which build is running: set by the Docker image (see Dockerfile), "dev" when run locally.
        "version": os.getenv("CLACK_VERSION", "dev"),
        "built": os.getenv("CLACK_BUILT", ""),
    }


@app.post("/api/auth/setup")
def setup(auth: AuthInput, response: Response, request: Request) -> dict[str, Any]:
    user = db.create_first_admin(str(auth.email), password_hasher.hash(auth.password))
    if not user:
        raise HTTPException(status_code=400, detail="setup already completed")
    return make_session(user, response, request)


@app.post("/api/auth/login")
def login(auth: AuthInput, response: Response, request: Request) -> dict[str, Any]:
    check_auth_rate_limit(request, str(auth.email))
    user = db.get_user_with_password(str(auth.email))
    if not user or not user["enabled"] or not verify_password(auth.password, user["password_hash"]):
        record_auth_failure(request, str(auth.email))
        raise HTTPException(status_code=401, detail="invalid email or password")
    if user["totp_enabled"]:
        if not auth.totp_code:
            record_auth_failure(request, str(auth.email))
            raise HTTPException(status_code=401, detail="totp required")
        if not verify_totp(user["totp_secret"], auth.totp_code):
            record_auth_failure(request, str(auth.email))
            raise HTTPException(status_code=401, detail="invalid authenticator code")
    clear_auth_failures(request, str(auth.email))
    return make_session(user, response, request)


@app.post("/api/auth/signup")
def signup(auth: SignupInput, response: Response, request: Request) -> dict[str, Any]:
    invite_hash = token_hash(auth.invite_token) if auth.invite_token else None
    if invite_hash:
        user = db.consume_invite(invite_hash, str(auth.email), password_hasher.hash(auth.password))
        if not user:
            raise HTTPException(status_code=400, detail="invite invalid or email already exists")
    else:
        if not db.signup_enabled():
            raise HTTPException(status_code=403, detail="signup disabled")
        user = db.create_user(str(auth.email), password_hasher.hash(auth.password))
        if not user:
            raise HTTPException(status_code=400, detail="email already exists")
    return make_session(user, response, request)


@app.post("/api/auth/logout", status_code=204)
def logout(request: Request, response: Response, _: CsrfDep) -> Response:
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        db.delete_session(token_hash(token))
    clear_session_cookie(response, request)
    response.status_code = 204
    return response


@app.get("/api/auth/me")
def me(request: Request) -> dict[str, Any]:
    session = session_from_request(request)
    return {"user": public_user(session["user"]), "csrf_token": session["csrf_token"]}


@app.get("/api/auth/totp")
def totp_status(user: UserDep) -> dict[str, bool]:
    return {"enabled": bool(user["totp_enabled"])}


@app.post("/api/auth/totp/setup")
def totp_setup(user: UserDep, _: CsrfDep) -> dict[str, str]:
    if user["totp_enabled"]:
        raise HTTPException(status_code=400, detail="totp already enabled")
    secret = generate_totp_secret()
    db.set_user_totp_secret(user["id"], secret)
    uri = otpauth_uri(user["email"], secret, TOTP_ISSUER)
    return {"secret": secret, "otpauth_uri": uri, "qr_svg": qr_svg(uri)}


@app.post("/api/auth/totp/enable")
def totp_enable(payload: TotpCodeInput, user: UserDep, _: CsrfDep) -> dict[str, Any]:
    stored = db.get_user_with_password(user["email"])
    if not stored or not stored.get("totp_secret"):
        raise HTTPException(status_code=400, detail="totp setup required")
    if not verify_totp(stored["totp_secret"], payload.code):
        raise HTTPException(status_code=400, detail="invalid authenticator code")
    enabled = db.enable_user_totp(user["id"])
    if not enabled:
        raise HTTPException(status_code=400, detail="totp setup required")
    return {"enabled": True, "user": public_user(enabled)}


@app.post("/api/auth/totp/disable")
def totp_disable(payload: TotpDisableInput, user: UserDep, _: CsrfDep) -> dict[str, Any]:
    stored = db.get_user_with_password(user["email"])
    if not stored or not verify_password(payload.password, stored["password_hash"]):
        raise HTTPException(status_code=400, detail="invalid password")
    if stored["totp_enabled"] and not verify_totp(stored["totp_secret"], payload.code or ""):
        raise HTTPException(status_code=400, detail="invalid authenticator code")
    disabled = db.disable_user_totp(user["id"])
    if not disabled:
        raise HTTPException(status_code=404, detail="user not found")
    return {"enabled": False, "user": public_user(disabled)}


@app.get("/api/auth/invite/{token}")
def invite_status(token: str) -> dict[str, Any]:
    role = db.invite_role(token_hash(token))
    if not role:
        raise HTTPException(status_code=404, detail="invite invalid")
    return {"role": role}


@app.get("/api/config")
def get_config(user: UserDep) -> dict[str, str]:
    return db.get_settings(user["id"])


@app.patch("/api/config")
def update_config(patch: SettingsPatch, user: UserDep, _: CsrfDep) -> dict[str, str]:
    return db.update_settings(user["id"], patch.model_dump(exclude_unset=True))


@app.get("/api/notes", response_model=list[NoteSummary])
def list_notes(user: UserDep) -> list[dict]:
    return db.list_notes(user["id"])


@app.post("/api/notes", response_model=Note)
def create_note(note: NoteCreate, user: UserDep, _: CsrfDep) -> dict:
    return db.create_note(user["id"], note.title, note.body, note.client_id)


@app.get("/api/notes/{id_or_slug}", response_model=Note)
def read_note(id_or_slug: str, user: UserDep) -> dict:
    note = db.get_note_by_id_or_slug(user["id"], id_or_slug)
    if not note:
        raise HTTPException(status_code=404, detail="note not found")
    return note


@app.put("/api/notes/{note_id}", response_model=Note)
def update_note(note_id: int, note: NoteInput, user: UserDep, _: CsrfDep) -> dict:
    try:
        saved = db.update_note(user["id"], note_id, note.title, note.body, note.base_version)
    except PermissionError:
        raise HTTPException(status_code=403, detail="view only") from None
    except db.VersionConflict as conflict:
        # Someone saved a newer version: send it back so the browser can merge.
        return JSONResponse(status_code=409, content={"detail": "note changed", "note": jsonable_encoder(conflict.note)})
    if not saved:
        raise HTTPException(status_code=404, detail="note not found")
    return saved


@app.delete("/api/notes/{note_id}", status_code=204)
def delete_note(note_id: int, user: UserDep, _: CsrfDep) -> Response:
    # The owner deletes the note; someone it's shared with removes it from their notes.
    if not db.delete_note(user["id"], note_id):
        raise HTTPException(status_code=404, detail="note not found")
    return Response(status_code=204)


def share_errors(action):
    """Runs a share change and maps db errors to HTTP answers."""
    try:
        return action()
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from None
    except PermissionError as error:
        raise HTTPException(status_code=403, detail=str(error)) from None
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from None


@app.get("/api/notes/{note_id}/shares", response_model=list[Share])
def list_note_shares(note_id: int, user: UserDep) -> list[dict]:
    return share_errors(lambda: db.list_shares(user["id"], note_id))


@app.post("/api/notes/{note_id}/shares", response_model=list[Share])
def share_note(note_id: int, share: ShareInput, user: UserDep, _: CsrfDep) -> list[dict]:
    return share_errors(lambda: db.share_note(user["id"], note_id, share.email, share.permission))


@app.patch("/api/notes/{note_id}/shares/{share_user_id}", response_model=list[Share])
def update_note_share(note_id: int, share_user_id: int, patch: SharePatch, user: UserDep, _: CsrfDep) -> list[dict]:
    return share_errors(lambda: db.set_share_permission(user["id"], note_id, share_user_id, patch.permission))


@app.delete("/api/notes/{note_id}/shares/{share_user_id}", response_model=list[Share])
def unshare_note(note_id: int, share_user_id: int, user: UserDep, _: CsrfDep) -> list[dict]:
    return share_errors(lambda: db.unshare_note(user["id"], note_id, share_user_id))


@app.get("/api/sync")
def sync(user: UserDep, note_id: int | None = None) -> dict[str, Any]:
    return db.sync_state(user["id"], note_id)


@app.get("/api/search", response_model=list[NoteSummary])
def search_notes(user: UserDep, q: str = "") -> list[dict]:
    if not q.strip():
        return db.list_notes(user["id"])
    return db.search_notes(user["id"], q)


@app.post("/api/import-markdown", response_model=Note)
async def import_markdown(file: Annotated[UploadFile, File()], user: UserDep, _: CsrfDep) -> dict:
    content = await file.read()
    parsed = db.parse_markdown(content.decode("utf-8"))
    return db.create_note(user["id"], parsed["title"], parsed["body"])


@app.get("/api/export-markdown/{note_id}")
def export_markdown(note_id: int, user: UserDep) -> Response:
    note = db.get_note(user["id"], note_id)
    if not note:
        raise HTTPException(status_code=404, detail="note not found")
    filename = f"{note['date']}-{note['slug']}.md"
    return Response(
        content=db.format_markdown(note),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/api/admin/users")
def admin_users(_: AdminDep) -> list[dict[str, Any]]:
    return db.list_users()


@app.patch("/api/admin/users/{user_id}")
def admin_update_user(user_id: int, patch: UserPatch, _: AdminDep, __: CsrfDep) -> dict[str, Any]:
    try:
        user = db.update_user(user_id, role=patch.role, enabled=patch.enabled)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    return user


@app.delete("/api/admin/users/{user_id}", status_code=204)
def admin_delete_user(user_id: int, admin: AdminDep, _: CsrfDep) -> Response:
    try:
        deleted = db.delete_user(user_id, admin["id"])
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not deleted:
        raise HTTPException(status_code=404, detail="user not found")
    return Response(status_code=204)


@app.get("/api/admin/signup")
def admin_signup(_: AdminDep) -> dict[str, bool]:
    return {"enabled": db.signup_enabled()}


@app.put("/api/admin/signup")
def admin_set_signup(patch: SignupSettingsPatch, _: AdminDep, __: CsrfDep) -> dict[str, bool]:
    return {"enabled": db.set_signup_enabled(patch.enabled)}


@app.get("/api/admin/invites")
def admin_invites(_: AdminDep) -> list[dict[str, Any]]:
    return db.list_invites()


@app.post("/api/admin/invites")
def admin_create_invite(invite: InviteInput, admin: AdminDep, _: CsrfDep) -> dict[str, Any]:
    if invite.role not in db.ROLES:
        raise HTTPException(status_code=400, detail="invalid role")
    token = secrets.token_urlsafe(32)
    saved = db.create_invite(token_hash(token), admin["id"], invite.role, INVITE_DAYS)
    saved["token"] = token
    return saved


@app.delete("/api/admin/invites/{invite_id}", status_code=204)
def admin_revoke_invite(invite_id: int, _: AdminDep, __: CsrfDep) -> Response:
    if not (db.revoke_invite(invite_id) or db.delete_used_invite(invite_id)):
        raise HTTPException(status_code=404, detail="invite not found")
    return Response(status_code=204)


@app.get("/")
def index() -> FileResponse:
    return FileResponse(WEB_DIR / "index.html")


app.mount("/", StaticFiles(directory=WEB_DIR), name="web")
