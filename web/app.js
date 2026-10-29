const state = {
  notes: [],
  selected: null,
  dirty: false,
  autosaveTimer: null,
  savePromise: null,
  lastSavedSnapshot: null,
  preview: true,
  sidebarWidth: 320,
  sidebarCollapsed: false,
  drawerOpen: false,
  previewSheetOpen: false,
  previewWidth: 520,
  deletePending: false,
  settings: null,
  lastScheduleBoundary: null,
  manualThemeOverrideBoundary: null,
  themeTransitionTimer: null,
  scheduleTimer: null,
  editorCursorFrame: null,
  noteHoverTarget: null,
  noteHoverTimer: null,
  focusLetterInput: null,
  profileMenuCloseTimer: null,
  previewCodeBlocks: [],
  zenMode: false,
  user: null,
  csrfToken: null,
  setupRequired: false,
  signupEnabled: false,
  inviteToken: null,
  inviteValid: false,
  userDeleteTarget: null,
  userDeletePending: false,
};

const el = {
  app: document.querySelector("#app-shell"),
  authScreen: document.querySelector("#auth-screen"),
  authSubtitle: document.querySelector("#auth-subtitle"),
  authError: document.querySelector("#auth-error"),
  setupForm: document.querySelector("#setup-form"),
  setupEmail: document.querySelector("#setup-email"),
  setupPassword: document.querySelector("#setup-password"),
  loginForm: document.querySelector("#login-form"),
  loginEmail: document.querySelector("#login-email"),
  loginPassword: document.querySelector("#login-password"),
  loginTotpRow: document.querySelector("#login-totp-row"),
  loginTotpCode: document.querySelector("#login-totp-code"),
  signupForm: document.querySelector("#signup-form"),
  signupEmail: document.querySelector("#signup-email"),
  signupPassword: document.querySelector("#signup-password"),
  showSignup: document.querySelector("#show-signup"),
  showLogin: document.querySelector("#show-login"),
  inviteNote: document.querySelector("#invite-note"),
  brandMain: document.querySelector(".brand-main"),
  noteCount: document.querySelector("#note-count"),
  noteList: document.querySelector("#note-list"),
  search: document.querySelector("#search-input"),
  title: document.querySelector("#title-input"),
  titleTags: document.querySelector("#title-tags"),
  body: document.querySelector("#body-input"),
  editorLineNumbers: document.querySelector("#editor-line-numbers"),
  editorFocusLetters: document.querySelector("#editor-focus-letters"),
  editorCursor: document.querySelector("#editor-cursor"),
  listOverlay: document.querySelector("#editor-list-overlay"),
  status: document.querySelector("#status"),
  error: document.querySelector("#error"),
  previewButton: document.querySelector("#preview-button"),
  preview: document.querySelector("#preview"),
  previewContent: document.querySelector("#preview-content"),
  editorGrid: document.querySelector("#editor-grid"),
  del: document.querySelector("#delete-button"),
  create: document.querySelector("#new-button"),
  export: document.querySelector("#export-button"),
  sidebarToggle: document.querySelector("#sidebar-toggle"),
  drawerButton: document.querySelector("#drawer-button"),
  sidebar: document.querySelector(".sidebar"),
  toolbar: document.querySelector(".toolbar"),
  sidebarResizer: document.querySelector("#sidebar-resizer"),
  previewResizer: document.querySelector("#preview-resizer"),
  profileShell: document.querySelector("#profile-shell"),
  profileButton: document.querySelector("#profile-button"),
  profileMenu: document.querySelector("#profile-menu"),
  settingsButton: document.querySelector("#settings-button"),
  logout: document.querySelector("#logout-button"),
  settingsModal: document.querySelector("#settings-modal"),
  settingsClose: document.querySelector("#settings-close"),
  settingsNavButtons: document.querySelectorAll(".settings-nav-button"),
  settingsSections: document.querySelectorAll(".settings-section"),
  adminSectionButton: document.querySelector("#admin-section-button"),
  usersSectionButton: document.querySelector("#users-section-button"),
  theme: document.querySelector("#theme-select"),
  themeSchedule: document.querySelector("#theme-schedule-select"),
  scheduleTimes: document.querySelector("#schedule-times"),
  scheduleSun: document.querySelector("#schedule-sun"),
  scheduleSystemNote: document.querySelector("#schedule-system-note"),
  scheduleThemes: document.querySelector("#schedule-themes"),
  sunLocateButton: document.querySelector("#sun-locate-button"),
  sunLatitude: document.querySelector("#sun-latitude-input"),
  sunLongitude: document.querySelector("#sun-longitude-input"),
  sunTimesNote: document.querySelector("#sun-times-note"),
  sunriseTime: document.querySelector("#sunrise-time-input"),
  sunriseTheme: document.querySelector("#sunrise-theme-select"),
  sunsetTime: document.querySelector("#sunset-time-input"),
  sunsetTheme: document.querySelector("#sunset-theme-select"),
  font: document.querySelector("#font-input"),
  customFontRow: document.querySelector("#custom-font-row"),
  customFont: document.querySelector("#custom-font-input"),
  fontSize: document.querySelector("#font-size-input"),
  fontSizeValue: document.querySelector("#font-size-value"),
  codeFontSize: document.querySelector("#code-font-size-input"),
  codeFontSizeValue: document.querySelector("#code-font-size-value"),
  cursorType: document.querySelector("#cursor-type-input"),
  tagPillStyle: document.querySelector("#tag-pill-style-input"),
  editorLineNumbersInput: document.querySelector("#editor-line-numbers-input"),
  focusLetterEffect: document.querySelector("#focus-letter-effect-input"),
  startNote: document.querySelector("#start-note-input"),
  importButton: document.querySelector("#import-button"),
  importInput: document.querySelector("#import-input"),
  deleteModal: document.querySelector("#delete-modal"),
  deleteTitle: document.querySelector("#delete-title"),
  deleteMessage: document.querySelector("#delete-message"),
  shareButton: document.querySelector("#share-button"),
  shareModal: document.querySelector("#share-modal"),
  shareForm: document.querySelector("#share-form"),
  shareEmail: document.querySelector("#share-email"),
  sharePermission: document.querySelector("#share-permission"),
  shareError: document.querySelector("#share-error"),
  shareList: document.querySelector("#share-list"),
  shareClose: document.querySelector("#share-close"),
  conflictBar: document.querySelector("#conflict-bar"),
  conflictKeep: document.querySelector("#conflict-keep"),
  conflictTheirs: document.querySelector("#conflict-theirs"),
  deleteCancel: document.querySelector("#delete-cancel"),
  deleteConfirm: document.querySelector("#delete-confirm"),
  userDeleteModal: document.querySelector("#user-delete-modal"),
  userDeleteMessage: document.querySelector("#user-delete-message"),
  userDeleteCancel: document.querySelector("#user-delete-cancel"),
  userDeleteConfirm: document.querySelector("#user-delete-confirm"),
  signupEnabledInput: document.querySelector("#signup-enabled-input"),
  inviteRole: document.querySelector("#invite-role-select"),
  createInvite: document.querySelector("#create-invite-button"),
  inviteLinkRow: document.querySelector("#invite-link-row"),
  inviteLinkOutput: document.querySelector("#invite-link-output"),
  inviteList: document.querySelector("#invite-list"),
  userList: document.querySelector("#user-list"),
  totpStatus: document.querySelector("#totp-status"),
  totpSetupButton: document.querySelector("#totp-setup-button"),
  totpDisableOpenButton: document.querySelector("#totp-disable-open-button"),
  totpSetupPanel: document.querySelector("#totp-setup-panel"),
  totpQrCode: document.querySelector("#totp-qr-code"),
  totpSecretOutput: document.querySelector("#totp-secret-output"),
  totpUriOutput: document.querySelector("#totp-uri-output"),
  totpEnableCode: document.querySelector("#totp-enable-code"),
  totpEnableButton: document.querySelector("#totp-enable-button"),
  totpDisablePanel: document.querySelector("#totp-disable-panel"),
  totpDisablePassword: document.querySelector("#totp-disable-password"),
  totpDisableCode: document.querySelector("#totp-disable-code"),
  totpDisableConfirmButton: document.querySelector("#totp-disable-confirm-button"),
};

const SIDEBAR_MIN = 260;
const SIDEBAR_MAX = 520;
const SIDEBAR_WIDTH_KEY = "clack.sidebarWidth";
const SIDEBAR_COLLAPSED_KEY = "clack.sidebarCollapsed";
// On phones the sidebar becomes a slide-over drawer; the desktop collapsed state is left untouched.
const PHONE_LAYOUT = window.matchMedia("(max-width: 560px)");
const CHECKLIST_TAG = "list";
// A whole line wrapped in Markdown strikethrough is a checked checklist entry.
const CHECKED_LINE = /^(\s*)~~(.+)~~(\s*)$/;
// Space left of the text for the checkboxes; matches --list-gutter in styles.css.
const CHECKLIST_GUTTER = 26;
// The remove "×" sits in a fixed column at the editor's right edge. Its square tap area is larger on touch
// screens; the column adds a little room around it and is reserved as right padding (--list-remove-column).
const COARSE_POINTER = window.matchMedia("(pointer: coarse)");
const checklistRemoveSize = () => (COARSE_POINTER.matches ? { width: 40, column: 48 } : { width: 30, column: 40 });
// Touch screens only: a 6-dot drag handle left of each checkbox; the CSS gutter grows by this much.
const CHECKLIST_HANDLE = 30;
// While dragging an entry, scroll the editor when the finger is this close to its top or bottom edge.
const CHECKLIST_DRAG_SCROLL_EDGE = 48;
const HANDLE_ICON =
  '<svg viewBox="0 0 10 16" aria-hidden="true"><circle cx="2" cy="2" r="1.6"/><circle cx="8" cy="2" r="1.6"/>' +
  '<circle cx="2" cy="8" r="1.6"/><circle cx="8" cy="8" r="1.6"/><circle cx="2" cy="14" r="1.6"/><circle cx="8" cy="14" r="1.6"/></svg>';
const DRAWER_SWIPE_SLOP = 8;
const DRAWER_FLICK_DISTANCE = 40;
const DRAWER_FLICK_MS = 250;
// Upright phones and tablets show the preview as a bottom sheet instead of a side column.
const PREVIEW_SHEET = window.matchMedia("(max-width: 960px) and (orientation: portrait)");
const PREVIEW_SHEET_DEFAULT_RATIO = 0.6;
const PREVIEW_SHEET_CLOSE_RATIO = 0.25;
const PREVIEW_WIDTH_KEY = "clack.previewWidth";
const PREVIEW_MIN = 300;
const PREVIEW_MAX_RATIO = 0.5;
const PREVIEW_EDITOR_MIN = 360;
const PREVIEW_RESIZER_WIDTH = 6;
const AUTOSAVE_DELAY = 800;
// How often an open, visible app checks the server for changes made elsewhere.
const SYNC_INTERVAL_MS = 5000;
const NOTE_HOVER_DELAY_MS = 1200;
const PROFILE_MENU_CLOSE_DELAY_MS = 160;
const SCHEDULE_POLL_MS = 30000;
// See THEME_SCHEDULES in db.py.
const THEME_SCHEDULES = new Set(["off", "times", "sun", "system"]);
const systemDarkQuery = window.matchMedia?.("(prefers-color-scheme: dark)") ?? null;
const THEME_TRANSITION_MS = 2000;
const THEME_OPTIONS = [
  ["plain", "plain"],
  ["gruvbox", "gruvbox"],
  ["tokyonight", "tokyonight"],
  ["catppuccin", "catppuccin"],
  ["nord", "nord"],
  ["sepia", "sepia"],
  ["lavender", "lavender"],
  ["brutalism", "brutalism"],
  ["aurora", "aurora"],
  ["mono", "mono"],
  ["gruvbox-dark", "gruvbox dark"],
  ["tokyonight-dark", "tokyonight dark"],
  ["catppuccin-dark", "catppuccin dark"],
  ["nord-dark", "nord dark"],
  ["dracula", "dracula"],
  ["lavender-dark", "lavender dark"],
  ["brutalism-dark", "brutalism dark"],
  ["matrix-dark", "matrix dark"],
  ["mono-dark", "mono dark"],
];
for (const select of [el.theme, el.sunriseTheme, el.sunsetTheme]) {
  select.append(...THEME_OPTIONS.map(([value, label]) => new Option(label, value)));
}
const THEME_VALUES = new Set(THEME_OPTIONS.map(([value]) => value));
const FONT_VALUES = new Set([...el.font.options].map((option) => option.value));
const CURSOR_TYPE_VALUES = new Set([...el.cursorType.options].map((option) => option.value));
const TAG_PILL_STYLE_VALUES = new Set([...el.tagPillStyle.options].map((option) => option.value));
const EDITOR_INDENT = "  ";
const CODE_LANGUAGE_ALIASES = new Map([
  ["bash", "shell"],
  ["cjs", "javascript"],
  ["conf", "ini"],
  ["css", "css"],
  ["htm", "html"],
  ["html", "html"],
  ["ini", "ini"],
  ["js", "javascript"],
  ["json", "json"],
  ["jsx", "javascript"],
  ["md", "markdown"],
  ["py", "python"],
  ["python", "python"],
  ["sh", "shell"],
  ["shell", "shell"],
  ["sql", "sql"],
  ["toml", "toml"],
  ["ts", "javascript"],
  ["tsx", "javascript"],
  ["xml", "html"],
  ["yaml", "yaml"],
  ["yml", "yaml"],
  ["zsh", "shell"],
]);
const CODE_LANGUAGE_LABELS = {
  css: "CSS",
  html: "HTML",
  ini: "INI",
  javascript: "JavaScript",
  json: "JSON",
  markdown: "Markdown",
  python: "Python",
  shell: "Shell",
  sql: "SQL",
  toml: "TOML",
  yaml: "YAML",
};
const DEFAULT_FONT_SIZE = 15;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 24;
const DEFAULT_CODE_FONT_SIZE = 14;
const MIN_CODE_FONT_SIZE = 11;
const MAX_CODE_FONT_SIZE = 22;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
// A tag only counts when it is the sole content of its line, e.g. "#todo".
const TAG_LINE_PATTERN = /^[^\S\n]*(#[A-Za-z0-9-][^\s#]*)[^\S\n]*$/gm;
const TAG_PALETTE = [
  "#5c8d4c",
  "#a56d24",
  "#4f7fa3",
  "#b45d8b",
  "#7367ba",
  "#93852c",
  "#27806f",
  "#b15e51",
];

async function request(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (state.csrfToken && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set("X-CSRF-Token", state.csrfToken);
  }
  const response = await fetch(path, {
    ...options,
    method,
    headers,
  });
  if (!response.ok) {
    let data = null;
    try {
      data = await response.json();
    } catch {
      // Not JSON: fall back to the status text.
    }
    const detail = data?.detail;
    // Validation errors arrive as a list of {msg, ...}; show them as readable text.
    const message = Array.isArray(detail)
      ? detail.map((item) => item?.msg || String(item)).join("; ")
      : typeof detail === "string"
        ? detail
        : response.statusText;
    const error = new Error(message);
    error.status = response.status;
    error.body = data;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

function setError(error) {
  el.error.hidden = !error;
  el.error.textContent = error || "";
}

function setStatus(status) {
  el.status.textContent = status;
}

function setAuthError(error) {
  el.authError.hidden = !error;
  el.authError.textContent = error || "";
}

function setAuthenticated(auth) {
  state.user = auth.user;
  state.csrfToken = auth.csrf_token;
  el.authScreen.hidden = true;
  el.app.hidden = false;
  el.adminSectionButton.hidden = auth.user.role !== "admin";
  el.usersSectionButton.hidden = auth.user.role !== "admin";
}

function setLoginTotpRequired(required) {
  el.loginTotpRow.hidden = !required;
  el.loginTotpCode.required = required;
  if (!required) el.loginTotpCode.value = "";
}

function clearAuthenticated() {
  state.user = null;
  state.csrfToken = null;
  state.notes = [];
  state.selected = null;
  state.dirty = false;
  clearInterval(state.scheduleTimer);
  clearAutosaveTimer();
  renderEditor(emptyNote());
  renderList();
  el.adminSectionButton.hidden = true;
  el.usersSectionButton.hidden = true;
  el.settingsModal.hidden = true;
  el.app.hidden = true;
  el.authScreen.hidden = false;
}

function inviteTokenFromUrl() {
  return new URLSearchParams(window.location.search).get("invite") || "";
}

function showAuthMode(mode) {
  clearTimeout(state.themeTransitionTimer);
  document.documentElement.classList.remove("theme-transitioning");
  applyTheme("plain");
  el.setupForm.hidden = mode !== "setup";
  el.loginForm.hidden = mode !== "login";
  el.signupForm.hidden = mode !== "signup";
  if (mode !== "login") setLoginTotpRequired(false);
  el.authSubtitle.textContent = mode === "setup" ? "Create first admin" : mode === "signup" ? "Create account" : "Sign in to continue";
  el.showSignup.hidden = !(state.signupEnabled || state.inviteValid);
  el.inviteNote.hidden = !state.inviteValid;
  el.inviteNote.textContent = state.inviteValid ? "Invite link detected." : "";
  requestAnimationFrame(() => {
    if (mode === "setup") el.setupEmail.focus({ preventScroll: true });
    if (mode === "login") el.loginEmail.focus({ preventScroll: true });
    if (mode === "signup") el.signupEmail.focus({ preventScroll: true });
  });
}

// Sync across devices and people: the editor remembers the version it started from (state.base);
// while the app is visible it checks the server every few seconds and on focus, pulls in changes
// when nothing is unsaved, and saves carry base_version so a stale copy can't overwrite newer text.
function setSyncBase(note) {
  state.base = note?.id ? { version: note.version ?? 1, title: note.title, body: note.body } : null;
}

// Position in `before` mapped into `after`: text before the changed region stays put, text after shifts.
function mapPosition(before, after, position) {
  let prefix = 0;
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) prefix += 1;
  let suffix = 0;
  while (
    suffix < before.length - prefix &&
    suffix < after.length - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix += 1;
  }
  if (position <= prefix) return position;
  if (position >= before.length - suffix) return position + after.length - before.length;
  return Math.min(position, after.length - suffix);
}

// Puts new text in the editor without losing the caret or scroll position.
function replaceEditorText(title, body) {
  const before = el.body.value;
  const { selectionStart, selectionEnd, scrollTop } = el.body;
  if (el.title.value !== title) el.title.value = title;
  if (before !== body) {
    el.body.value = body;
    el.body.setSelectionRange(mapPosition(before, body, selectionStart), mapPosition(before, body, selectionEnd));
    el.body.scrollTop = scrollTop;
  }
  renderPreview();
  renderEditorLineNumbers();
  scheduleEditorCursorUpdate();
}

// A newer version from elsewhere, applied while nothing is unsaved here.
function applyRemoteNote(note) {
  replaceEditorText(note.title, note.body);
  state.selected = note;
  setSyncBase(note);
  state.lastSavedSnapshot = noteSnapshot(note);
  state.dirty = false;
  applyNoteAccess(note);
  renderTagPills(el.titleTags, note.tags || [], jumpToTag);
  setStatus("Updated from another device");
}

function showConflict() {
  el.conflictBar.hidden = false;
  setStatus("Conflict");
}

function hideConflict() {
  state.conflict = null;
  if (el.conflictBar) el.conflictBar.hidden = true;
}

function handleVersionConflict(theirs) {
  const mine = noteFromInputs();
  const base = state.base || { title: theirs.title, body: theirs.body };
  const merged = merge3(base.body, mine.body, theirs.body);
  // Title: a change on one side wins; if both changed it, yours wins.
  const title = mine.title !== base.title ? mine.title : theirs.title;
  if (merged.conflict) {
    state.conflict = { theirs };
    state.dirty = true;
    showConflict();
    return;
  }
  replaceEditorText(title, merged.text);
  state.selected = { ...theirs, title, body: merged.text };
  setSyncBase(theirs);
  state.dirty = true;
  setStatus("Merged with changes from elsewhere");
  scheduleAutosave();
}

function keepMyVersion() {
  if (!state.conflict) return;
  // Save my text on top of their version.
  setSyncBase(state.conflict.theirs);
  hideConflict();
  state.dirty = true;
  persistNote().catch(() => null);
}

async function useTheirVersion() {
  if (!state.conflict) return;
  const { theirs } = state.conflict;
  await copyText(el.body.value).catch(() => null);
  hideConflict();
  applyRemoteNote(theirs);
  setStatus("Loaded their version · yours is on the clipboard");
}

// The open note was deleted elsewhere (or is no longer shared with you).
function handleNoteGone() {
  if (sharedWithMe(state.selected)) {
    state.dirty = false;
    el.body.readOnly = true;
    el.title.readOnly = true;
    el.body.parentElement.classList.add("read-only");
    setError("This note is no longer shared with you. Your text is still here to copy.");
    return;
  }
  // Keep the text as a new, unsaved note: it is only saved again if typing resumes.
  state.selected = { ...emptyNote(), title: el.title.value.trim() || "Untitled", body: el.body.value };
  setSyncBase(null);
  state.lastSavedSnapshot = noteSnapshot(state.selected);
  state.dirty = false;
  applyNoteAccess(state.selected);
  setError("This note was deleted on another device. Your text is kept and will be saved as a new note if you keep typing.");
}

async function syncNow() {
  if (!state.user || document.hidden || state.syncing) return;
  state.syncing = true;
  try {
    const id = state.selected?.id;
    const result = await request(id ? `/api/sync?note_id=${id}` : "/api/sync");
    if (result.list !== state.listStamp) {
      const firstCheck = state.listStamp === undefined;
      state.listStamp = result.list;
      if (!firstCheck) await loadNotes();
    }
    // Only act on the note if it's still the one open and nothing is being saved or resolved.
    if (!id || state.selected?.id !== id || state.savePromise || state.conflict) return;
    if (!result.note) {
      handleNoteGone();
      return;
    }
    if (result.note.version === state.base?.version || state.dirty) return;
    const note = await request(`/api/notes/${id}`);
    if (state.selected?.id === id && !state.dirty && !state.savePromise && !state.conflict) applyRemoteNote(note);
  } catch {
    // Offline or signed out: the next check tries again.
  } finally {
    state.syncing = false;
  }
}

function startSyncLoop() {
  clearInterval(state.syncTimer);
  state.listStamp = undefined;
  state.syncTimer = setInterval(syncNow, SYNC_INTERVAL_MS);
}

// Remembers which note is in use, for "On app start: Last used note". Only writes when it changes.
function rememberLastNote(noteId) {
  if (!noteId || !state.settings || state.settings.last_note_id === noteId) return;
  state.settings.last_note_id = noteId;
  request("/api/config", { method: "PATCH", body: JSON.stringify({ last_note_id: noteId }) }).catch(() => null);
}

// On app start: the last used note if the user chose that and it's still there, otherwise a blank note.
async function openStartNote() {
  const lastId = state.settings?.start_note === "last" ? state.settings.last_note_id : null;
  if (lastId && state.notes.some((note) => note.id === lastId)) {
    await selectNote(lastId);
    return;
  }
  await newNote();
}

async function enterApp(auth) {
  setAuthenticated(auth);
  loadSidebarState();
  loadPreviewState();
  await loadSettings();
  startScheduleTimer();
  await loadNotes();
  await openStartNote();
  startSyncLoop();
}

async function submitAuth(path, email, password, extra = {}) {
  const auth = await request(path, {
    method: "POST",
    body: JSON.stringify({ email, password, ...extra }),
  });
  setAuthError("");
  await enterApp(auth);
}

async function submitLogin() {
  try {
    await submitAuth("/api/auth/login", el.loginEmail.value, el.loginPassword.value, {
      totp_code: el.loginTotpRow.hidden ? null : el.loginTotpCode.value,
    });
    setLoginTotpRequired(false);
  } catch (error) {
    if (error.status === 401 && error.message === "totp required") {
      setLoginTotpRequired(true);
      setAuthError("Authenticator code required");
      el.loginTotpCode.focus({ preventScroll: true });
      return;
    }
    setAuthError(error.message);
  }
}

async function logout() {
  try {
    await request("/api/auth/logout", { method: "POST" });
  } catch (error) {
    if (error.status !== 401) setError(error.message);
  } finally {
    clearAuthenticated();
    showAuthMode("login");
  }
}

async function loadAdmin() {
  if (state.user?.role !== "admin") return;
  const [signup, invites] = await Promise.all([
    request("/api/admin/signup"),
    request("/api/admin/invites"),
  ]);
  el.signupEnabledInput.checked = signup.enabled;
  renderInvites(invites);
}

async function loadUsers() {
  if (state.user?.role !== "admin") return;
  renderUsers(await request("/api/admin/users"));
}

function renderTotpStatus(enabled) {
  el.totpStatus.textContent = enabled ? "Authenticator app enabled." : "Authenticator app not enabled.";
  el.totpSetupButton.hidden = enabled;
  el.totpDisableOpenButton.hidden = !enabled;
  el.totpSetupPanel.hidden = true;
  el.totpDisablePanel.hidden = true;
  el.totpQrCode.replaceChildren();
  el.totpEnableCode.value = "";
  el.totpDisablePassword.value = "";
  el.totpDisableCode.value = "";
}

async function loadTotpStatus() {
  const status = await request("/api/auth/totp");
  renderTotpStatus(status.enabled);
}

async function startTotpSetup() {
  const setup = await request("/api/auth/totp/setup", { method: "POST", body: JSON.stringify({}) });
  el.totpSecretOutput.value = setup.secret;
  el.totpUriOutput.value = setup.otpauth_uri;
  el.totpQrCode.innerHTML = setup.qr_svg;
  el.totpSetupPanel.hidden = false;
  el.totpDisablePanel.hidden = true;
  el.totpEnableCode.value = "";
  el.totpEnableCode.focus({ preventScroll: true });
}

async function enableTotp() {
  const result = await request("/api/auth/totp/enable", {
    method: "POST",
    body: JSON.stringify({ code: el.totpEnableCode.value }),
  });
  state.user = result.user;
  renderTotpStatus(result.enabled);
}

async function disableTotp() {
  const result = await request("/api/auth/totp/disable", {
    method: "POST",
    body: JSON.stringify({
      password: el.totpDisablePassword.value,
      code: el.totpDisableCode.value,
    }),
  });
  state.user = result.user;
  renderTotpStatus(result.enabled);
}

function renderUsers(users) {
  el.userList.innerHTML = "";
  if (!users.length) {
    el.userList.textContent = "No users";
    return;
  }
  for (const user of users) {
    const row = document.createElement("div");
    row.className = "admin-row user-row";
    row.dataset.userId = user.id;
    row.dataset.userEmail = user.email;
    const isMe = state.user?.id === user.id;
    const lastLogin = user.last_login_at ? `Last sign-in ${formatDateTime(user.last_login_at, "")}` : "Never signed in";
    // <wbr> lets long addresses wrap before the @ instead of mid-word.
    row.innerHTML = `
      <div class="user-info">
        <strong class="user-email">${escapeHtml(user.email).replace("@", "<wbr>@")}</strong>
        <small>${escapeHtml(lastLogin)}${isMe ? " · you" : ""}</small>
      </div>
      <div class="user-controls">
        <select class="user-role" aria-label="Role">
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <label class="admin-check"><input class="user-enabled" type="checkbox" /><span>enabled</span></label>
        <button class="secondary-button save-user" type="button">Save</button>
        <button class="danger-button delete-user" type="button">Delete</button>
      </div>
    `;
    row.querySelector(".user-role").value = user.role;
    row.querySelector(".user-enabled").checked = user.enabled;
    row.querySelector(".delete-user").disabled = isMe;
    el.userList.append(row);
  }
}

function renderInvites(invites) {
  el.inviteList.innerHTML = "";
  if (!invites.length) {
    el.inviteList.textContent = "No invites";
    return;
  }
  for (const invite of invites) {
    const row = document.createElement("div");
    const used = Boolean(invite.used_at);
    const expired = !used && new Date(invite.expires_at) <= new Date();
    const active = !used && !expired;
    const action = active
      ? '<button class="danger-button revoke-invite" type="button">Revoke</button>'
      : used
        ? '<button class="danger-button remove-invite" type="button">Remove</button>'
        : "";
    row.className = "admin-row";
    row.dataset.inviteId = invite.id;
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(invite.role)}</strong>
        <small>${used ? "Used" : expired ? "Expired" : "Active"} · expires ${escapeHtml(formatDateTime(invite.expires_at, ""))}</small>
      </div>
      ${action}
    `;
    el.inviteList.append(row);
  }
}

function openUserDeleteModal(userId, email) {
  state.userDeleteTarget = { id: userId, email };
  el.userDeleteMessage.textContent = `Delete "${email}" and all private notes/settings for this user? This cannot be undone.`;
  el.userDeleteModal.hidden = false;
  requestAnimationFrame(() => el.userDeleteCancel.focus({ preventScroll: true }));
}

function closeUserDeleteModal() {
  if (state.userDeletePending) return;
  state.userDeleteTarget = null;
  el.userDeleteModal.hidden = true;
}

async function confirmDeleteUser() {
  if (!state.userDeleteTarget || state.userDeletePending) return;
  state.userDeletePending = true;
  el.userDeleteCancel.disabled = true;
  el.userDeleteConfirm.disabled = true;
  try {
    await request(`/api/admin/users/${state.userDeleteTarget.id}`, { method: "DELETE" });
    setError("");
    state.userDeleteTarget = null;
    el.userDeleteModal.hidden = true;
    await loadUsers();
  } catch (error) {
    setError(error.message);
  } finally {
    state.userDeletePending = false;
    el.userDeleteCancel.disabled = false;
    el.userDeleteConfirm.disabled = false;
  }
}

function normalizeTheme(theme, fallback = "plain") {
  return THEME_VALUES.has(theme) ? theme : fallback;
}

function normalizeFont(font) {
  return FONT_VALUES.has(font) ? font : "system-mono";
}

function normalizeCursorType(cursorType) {
  return CURSOR_TYPE_VALUES.has(cursorType) ? cursorType : "bar";
}

function normalizeTagPillStyle(style) {
  return TAG_PILL_STYLE_VALUES.has(style) ? style : "soft";
}

function normalizeBoolean(value) {
  return value === true || value === "true";
}

function normalizeCustomFont(font) {
  return String(font || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/["'\\;]/g, "")
    .slice(0, 80);
}

function normalizeTime(value) {
  return TIME_PATTERN.test(value || "") ? value : "";
}

function normalizeFontSize(fontSize) {
  const size = Number.parseInt(fontSize, 10);
  return Number.isInteger(size) && size >= MIN_FONT_SIZE && size <= MAX_FONT_SIZE ? String(size) : String(DEFAULT_FONT_SIZE);
}

function normalizeCodeFontSize(fontSize) {
  const size = Number.parseInt(fontSize, 10);
  return Number.isInteger(size) && size >= MIN_CODE_FONT_SIZE && size <= MAX_CODE_FONT_SIZE ? String(size) : String(DEFAULT_CODE_FONT_SIZE);
}

function normalizeSettings(settings) {
  return {
    theme: normalizeTheme(settings.theme),
    font: normalizeFont(settings.font),
    custom_font: normalizeCustomFont(settings.custom_font),
    font_size: normalizeFontSize(settings.font_size),
    code_font_size: normalizeCodeFontSize(settings.code_font_size),
    cursor_type: normalizeCursorType(settings.cursor_type),
    tag_pill_style: normalizeTagPillStyle(settings.tag_pill_style),
    editor_line_numbers: normalizeBoolean(settings.editor_line_numbers),
    focus_letter_effect: normalizeBoolean(settings.focus_letter_effect),
    start_note: settings.start_note === "last" ? "last" : "new",
    last_note_id: /^\d+$/.test(String(settings.last_note_id ?? "")) ? Number(settings.last_note_id) : null,
    sunrise_time: normalizeTime(settings.sunrise_time),
    sunrise_theme: normalizeTheme(settings.sunrise_theme, "plain"),
    sunset_time: normalizeTime(settings.sunset_time),
    sunset_theme: normalizeTheme(settings.sunset_theme, "nord-dark"),
    theme_schedule: THEME_SCHEDULES.has(settings.theme_schedule) ? settings.theme_schedule : "off",
    sun_latitude: normalizeCoordinate(settings.sun_latitude, 90),
    sun_longitude: normalizeCoordinate(settings.sun_longitude, 180),
  };
}

// "" or a number within ±limit; accepts a decimal comma as typed on German keyboards.
function normalizeCoordinate(value, limit) {
  const text = String(value ?? "").trim().replace(",", ".");
  const number = Number(text);
  return text && Number.isFinite(number) && Math.abs(number) <= limit ? number.toFixed(2) : "";
}

function applyFontSize(fontSize) {
  const normalized = normalizeFontSize(fontSize);
  document.documentElement.style.setProperty("--editor-font-size", `${normalized}px`);
  el.fontSize.value = normalized;
  el.fontSizeValue.textContent = `${normalized} px`;
  scheduleEditorCursorUpdate();
}

function applyCodeFontSize(fontSize) {
  const normalized = normalizeCodeFontSize(fontSize);
  document.documentElement.style.setProperty("--preview-code-font-size", `${normalized}px`);
  el.codeFontSize.value = normalized;
  el.codeFontSizeValue.textContent = `${normalized} px`;
  requestAnimationFrame(syncPreviewScrollFromEditor);
}

function quoteFontFamily(font) {
  return `"${normalizeCustomFont(font).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function editorFontStack(settings) {
  const systemSans = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const systemMono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  if (settings.font === "system-sans") return systemSans;
  if (settings.font === "serif") return 'Georgia, "Times New Roman", serif';
  if (settings.font === "noto-sans") return '"Clack Noto Sans", ui-sans-serif, system-ui, sans-serif';
  if (settings.font === "dejavu-mono") return '"Clack DejaVu Sans Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  if (settings.font === "courier-prime") return '"Clack Courier Prime", "Courier New", ui-monospace, monospace';
  if (settings.font === "custom" && settings.custom_font) return `${quoteFontFamily(settings.custom_font)}, ${systemMono}`;
  return systemMono;
}

function applyEditorFont(settings) {
  document.documentElement.style.setProperty("--editor-font", editorFontStack(settings));
  el.customFontRow.hidden = settings.font !== "custom";
  el.customFont.value = settings.custom_font;
  scheduleEditorCursorUpdate();
}

function applyEditorCursorType(cursorType) {
  const normalized = normalizeCursorType(cursorType);
  document.documentElement.dataset.editorCursor = normalized;
  el.cursorType.value = normalized;
  scheduleEditorCursorUpdate();
}

function applyTagPillStyle(style) {
  const normalized = normalizeTagPillStyle(style);
  document.documentElement.dataset.tagPillStyle = normalized;
  el.tagPillStyle.value = normalized;
}

function applyFocusEffectControls(settings) {
  el.editorLineNumbersInput.checked = normalizeBoolean(settings.editor_line_numbers);
  el.focusLetterEffect.checked = normalizeBoolean(settings.focus_letter_effect);
  scheduleEditorCursorUpdate();
}

function applyEditorLineNumbers(enabled) {
  document.documentElement.dataset.editorLineNumbers = normalizeBoolean(enabled) ? "true" : "false";
  el.editorLineNumbersInput.checked = normalizeBoolean(enabled);
  renderEditorLineNumbers();
  scheduleEditorCursorUpdate();
}

function hideEditorCursor() {
  if (el.editorCursor) el.editorCursor.style.display = "none";
}

function hideEditorFocusEffects() {
  if (el.editorFocusLetters) el.editorFocusLetters.replaceChildren();
}

function lineNumberCount(text) {
  return text ? text.split("\n").length : 1;
}

// A hidden copy of the editor's text box, used to measure how lines wrap.
function createEditorMirror() {
  const computed = window.getComputedStyle(el.body);
  const fontSize = Number.parseFloat(computed.fontSize) || DEFAULT_FONT_SIZE;
  const lineHeight = Number.parseFloat(computed.lineHeight) || fontSize * 1.65;
  const paddingLeft = Number.parseFloat(computed.paddingLeft) || 0;
  const paddingRight = Number.parseFloat(computed.paddingRight) || 0;
  const paddingTop = Number.parseFloat(computed.paddingTop) || 0;
  const contentWidth = Math.max(1, el.body.clientWidth - paddingLeft - paddingRight);
  const mirror = document.createElement("div");
  const copiedProperties = [
    "fontFamily",
    "fontSize",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "letterSpacing",
    "lineHeight",
    "tabSize",
    "textTransform",
    "wordBreak",
    "wordSpacing",
  ];

  for (const property of copiedProperties) {
    mirror.style[property] = computed[property];
  }

  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.overflowWrap = "break-word";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.style.width = `${contentWidth}px`;
  mirror.style.padding = "0";
  mirror.style.border = "0";
  mirror.style.minHeight = "0";
  mirror.style.contain = "layout style";
  document.body.append(mirror);
  return { mirror, lineHeight, paddingLeft, paddingTop, contentWidth };
}

function editorLineMetrics() {
  const { mirror, lineHeight } = createEditorMirror();
  const lineHeights = el.body.value.split("\n").map((line) => {
    mirror.textContent = line || " ";
    return Math.max(lineHeight, mirror.getBoundingClientRect().height);
  });

  mirror.remove();
  return { lineHeight, lineHeights };
}

function renderEditorLineNumbers() {
  if (!el.editorLineNumbers) return;
  const enabled = normalizeBoolean(state.settings?.editor_line_numbers);
  if (!enabled) {
    el.editorLineNumbers.replaceChildren();
    el.editorLineNumbers.dataset.count = "";
    return;
  }
  const count = lineNumberCount(el.body.value);
  const digits = String(count).length;
  const gutterWidth = Math.min(54, Math.max(30, digits * 8 + 14));
  const { lineHeight, lineHeights } = editorLineMetrics();
  el.editorLineNumbers.style.setProperty("--editor-line-digits", String(digits));
  el.editorLineNumbers.style.setProperty("--editor-text-line-height", `${lineHeight}px`);
  el.editorLineNumbers.parentElement?.style.setProperty("--editor-line-gutter-width", `${gutterWidth}px`);
  el.editorLineNumbers.replaceChildren(
    ...Array.from({ length: count }, (_, index) => {
      const row = document.createElement("span");
      row.textContent = String(index + 1);
      row.style.height = `${lineHeights[index] || lineHeight}px`;
      return row;
    })
  );
  el.editorLineNumbers.dataset.count = String(count);
  el.editorLineNumbers.scrollTop = el.body.scrollTop;
}

function scheduleEditorCursorUpdate() {
  if (state.editorCursorFrame) cancelAnimationFrame(state.editorCursorFrame);
  state.editorCursorFrame = requestAnimationFrame(() => {
    state.editorCursorFrame = null;
    renderEditorLineNumbers();
    renderChecklistOverlay();
    updateEditorCursor();
    updateEditorFocusEffects();
  });
}

function caretCoordinates(textarea, position = textarea.selectionStart) {
  const computed = window.getComputedStyle(textarea);
  const mirror = document.createElement("div");
  const marker = document.createElement("span");
  const copiedProperties = [
    "borderBottomWidth",
    "borderLeftWidth",
    "borderRightWidth",
    "borderTopWidth",
    "boxSizing",
    "fontFamily",
    "fontSize",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "letterSpacing",
    "lineHeight",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "tabSize",
    "textTransform",
    "wordBreak",
    "wordSpacing",
  ];

  for (const property of copiedProperties) {
    mirror.style[property] = computed[property];
  }

  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.overflowWrap = "break-word";
  mirror.style.overflow = "hidden";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.style.width = `${textarea.clientWidth}px`;
  mirror.style.minHeight = "0";
  mirror.textContent = textarea.value.slice(0, position);
  marker.textContent = "\u200b";
  mirror.append(marker);
  document.body.append(mirror);

  const coordinates = {
    left: marker.offsetLeft - textarea.scrollLeft,
    top: marker.offsetTop - textarea.scrollTop,
  };
  mirror.remove();
  return coordinates;
}

function updateEditorCursor() {
  const cursorType = normalizeCursorType(state.settings?.cursor_type);
  if (
    !el.editorCursor ||
    cursorType === "bar" ||
    document.activeElement !== el.body ||
    el.body.selectionStart !== el.body.selectionEnd
  ) {
    hideEditorCursor();
    return;
  }

  const computed = window.getComputedStyle(el.body);
  const fontSize = Number.parseFloat(computed.fontSize) || DEFAULT_FONT_SIZE;
  const lineHeight = Number.parseFloat(computed.lineHeight) || fontSize * 1.65;
  const cursorWidth = Math.max(2, fontSize * 0.62);
  const coordinates = caretCoordinates(el.body);
  const top = cursorType === "underline" ? coordinates.top + lineHeight - 3 : coordinates.top;

  el.editorCursor.className = `editor-cursor ${cursorType}`;
  el.editorCursor.style.display = "block";
  el.editorCursor.style.left = `${coordinates.left}px`;
  el.editorCursor.style.top = `${top}px`;
  el.editorCursor.style.width = `${cursorWidth}px`;
  el.editorCursor.style.height = `${cursorType === "underline" ? 2 : lineHeight}px`;
}

function lineRangeAtPosition(text, position) {
  const start = text.lastIndexOf("\n", Math.max(0, position - 1)) + 1;
  const nextBreak = text.indexOf("\n", position);
  return {
    start,
    end: nextBreak === -1 ? text.length : nextBreak,
  };
}

function visibleEditorTop(top, lineHeight) {
  return top > -lineHeight && top < el.body.clientHeight;
}

function makeFocusLetter(text, index, computed, lineHeight) {
  const char = Array.from(text.slice(index))[0];
  if (!char || !/^\p{L}$/u.test(char)) return null;
  const coordinates = caretCoordinates(el.body, index);
  if (!visibleEditorTop(coordinates.top, lineHeight)) return null;
  const letter = document.createElement("span");
  letter.className = "editor-focus-letter";
  letter.textContent = char;
  letter.style.left = `${coordinates.left}px`;
  letter.style.top = `${coordinates.top}px`;
  letter.style.lineHeight = `${lineHeight}px`;
  letter.style.fontFamily = computed.fontFamily;
  return letter;
}

function nextTextCharacter(text, cursor) {
  return Array.from(text.slice(cursor))[0] || "";
}

function clearFocusLetterInput() {
  state.focusLetterInput = null;
  if (el.editorFocusLetters) el.editorFocusLetters.replaceChildren();
}

function captureFocusLetterInput(event) {
  const data = event.data || "";
  const chars = Array.from(data);
  const cursor = el.body.selectionStart;
  const char = chars[chars.length - 1] || "";
  const nextChar = nextTextCharacter(el.body.value, cursor);
  if (!event.inputType?.startsWith("insert") || chars.length !== 1 || !/^\p{L}$/u.test(char) || /^\p{L}$/u.test(nextChar)) {
    clearFocusLetterInput();
    return;
  }

  state.focusLetterInput = {
    index: cursor - data.length,
    cursor,
  };
}

function updateFocusLetterEffect(computed, lineHeight) {
  el.editorFocusLetters.replaceChildren();
  if (!normalizeBoolean(state.settings?.focus_letter_effect)) return;
  if (!state.focusLetterInput || state.focusLetterInput.cursor !== el.body.selectionStart) return;

  const text = el.body.value;
  const letter = makeFocusLetter(text, state.focusLetterInput.index, computed, lineHeight);
  if (letter) el.editorFocusLetters.replaceChildren(letter);
}

function updateEditorFocusEffects() {
  if (
    !el.editorFocusLetters ||
    document.activeElement !== el.body ||
    el.body.selectionStart !== el.body.selectionEnd
  ) {
    hideEditorFocusEffects();
    return;
  }

  const computed = window.getComputedStyle(el.body);
  const fontSize = Number.parseFloat(computed.fontSize) || DEFAULT_FONT_SIZE;
  const lineHeight = Number.parseFloat(computed.lineHeight) || fontSize * 1.65;
  updateFocusLetterEffect(computed, lineHeight);
}

// Checklists: a note tagged #list shows a checkbox in front of every entry (each non-empty line
// that isn't a tag line). A checked entry is stored as Markdown strikethrough, "~~Milk~~", so it
// also reads as done in the preview and in exported Markdown.
function isChecklistText(text) {
  return tagTokenRanges(text).some((range) => range.tag === CHECKLIST_TAG);
}

function isChecklistEntry(line) {
  return Boolean(line.trim()) && !tagTokenRanges(line).length;
}

function checklistLineStart(lines, index) {
  return lines.slice(0, index).reduce((sum, line) => sum + line.length + 1, 0);
}

// Replaces text[start, end) with `replacement`. While the editor has focus this goes through the
// browser's own editing, so Ctrl+Z can undo a toggle or a removed line like normal typing.
function applyChecklistEdit(start, end, replacement, selectionStart, selectionEnd) {
  const text = el.body.value;
  let applied = false;
  if (document.activeElement === el.body) {
    el.body.setSelectionRange(start, end);
    applied = replacement
      ? document.execCommand("insertText", false, replacement)
      : document.execCommand("delete", false);
  }
  if (!applied) {
    el.body.value = text.slice(0, start) + replacement + text.slice(end);
    el.body.dispatchEvent(new Event("input", { bubbles: true }));
  }
  el.body.setSelectionRange(selectionStart, selectionEnd);
  scheduleEditorCursorUpdate();
}

function toggleChecklistLine(index) {
  if (el.body.readOnly) return;
  const lines = el.body.value.split("\n");
  const line = lines[index];
  if (line === undefined || !isChecklistEntry(line)) return;
  const checked = CHECKED_LINE.exec(line);
  const next = checked ? `${checked[1]}${checked[2]}${checked[3]}` : line.replace(/^(\s*)(.*?)(\s*)$/, "$1~~$2~~$3");
  const lineStart = checklistLineStart(lines, index);
  const shift = (position) => {
    if (position <= lineStart) return position;
    if (position >= lineStart + line.length) return position + next.length - line.length;
    return clamp(position + (checked ? -2 : 2), lineStart, lineStart + next.length);
  };
  const { selectionStart, selectionEnd } = el.body;
  applyChecklistEdit(lineStart, lineStart + line.length, next, shift(selectionStart), shift(selectionEnd));
}

function deleteChecklistLine(index) {
  if (el.body.readOnly) return;
  const lines = el.body.value.split("\n");
  if (lines[index] === undefined) return;
  const lineStart = checklistLineStart(lines, index);
  const lastLine = index === lines.length - 1;
  // Remove the line with its line break: the one after it, or the one before it for the last line.
  const start = lastLine ? Math.max(0, lineStart - 1) : lineStart;
  const end = lastLine ? lineStart + lines[index].length : lineStart + lines[index].length + 1;
  // The caret lands at the start of the entry that moved up into this place (or the end of the note).
  applyChecklistEdit(start, end, "", start, start);
}

// Moves line `from` so it lands before line `boundary` (0..lines.length), as one undoable edit.
function moveChecklistLine(from, boundary) {
  if (el.body.readOnly) return;
  if (boundary === from || boundary === from + 1) return;
  const lines = el.body.value.split("\n");
  const to = boundary > from ? boundary - 1 : boundary;
  const moved = [...lines];
  const [line] = moved.splice(from, 1);
  moved.splice(to, 0, line);
  const low = Math.min(from, to);
  const high = Math.max(from, to);
  const start = checklistLineStart(lines, low);
  const end = checklistLineStart(lines, high) + lines[high].length;
  const caret = checklistLineStart(moved, to) + moved[to].length;
  applyChecklistEdit(start, end, moved.slice(low, high + 1).join("\n"), caret, caret);
}

// Drag an entry by its handle: a tinted row follows the entry, a line marks where it will land,
// and the editor scrolls when the finger nears its top or bottom edge.
function startChecklistDrag(event, index, handle) {
  const lines = state.checklistLines;
  if (!lines?.[index]) return;
  event.preventDefault();
  try {
    handle.setPointerCapture(event.pointerId);
  } catch {
    // Capture is a nicety; the move/up listeners below are on window anyway.
  }
  const { lineHeight, markerLeft, markerWidth } = state.checklistGeometry;
  const row = document.createElement("div");
  row.className = "list-drag-row";
  const marker = document.createElement("div");
  marker.className = "list-drop-marker";
  Object.assign(row.style, { left: `${markerLeft}px`, width: `${markerWidth}px`, height: `${lines[index].height}px` });
  Object.assign(marker.style, { left: `${markerLeft}px`, width: `${markerWidth}px` });
  el.listOverlay.append(row, marker);
  state.checklistDrag = { index, boundary: index };

  const boundaryTop = (boundary) =>
    boundary < lines.length ? lines[boundary].contentTop : lines[lines.length - 1].contentTop + lines[lines.length - 1].height;

  let lastY = event.clientY;
  let frame = null;
  const update = (clientY) => {
    lastY = clientY;
    const box = el.listOverlay.getBoundingClientRect();
    const y = clientY - box.top;
    if (y < CHECKLIST_DRAG_SCROLL_EDGE) el.body.scrollTop -= lineHeight / 3;
    if (y > box.height - CHECKLIST_DRAG_SCROLL_EDGE) el.body.scrollTop += lineHeight / 3;
    const contentY = y + el.body.scrollTop;
    const found = lines.findIndex((line) => contentY < line.contentTop + line.height / 2);
    state.checklistDrag.boundary = found === -1 ? lines.length : found;
    row.style.top = `${lines[index].contentTop - el.body.scrollTop}px`;
    marker.style.top = `${boundaryTop(state.checklistDrag.boundary) - el.body.scrollTop}px`;
    const unchanged = state.checklistDrag.boundary === index || state.checklistDrag.boundary === index + 1;
    marker.style.visibility = unchanged ? "hidden" : "visible";
  };
  // Keeps scrolling while the finger rests near an edge, not only while it moves.
  const keepScrolling = () => {
    if (!state.checklistDrag) return;
    update(lastY);
    frame = requestAnimationFrame(keepScrolling);
  };

  const finish = (dropped) => {
    cancelAnimationFrame(frame);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", drop);
    window.removeEventListener("pointercancel", cancel);
    row.remove();
    marker.remove();
    const { boundary } = state.checklistDrag;
    state.checklistDrag = null;
    state.checklistOverlayKey = "";
    if (dropped) moveChecklistLine(index, boundary);
    scheduleEditorCursorUpdate();
  };
  const move = (moveEvent) => update(moveEvent.clientY);
  const drop = () => finish(true);
  const cancel = () => finish(false);

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", drop);
  window.addEventListener("pointercancel", cancel);
  update(event.clientY);
  frame = requestAnimationFrame(keepScrolling);
}

function checklistControl(className, attributes, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  for (const [name, value] of Object.entries(attributes)) button.setAttribute(name, value);
  // Keep the caret and focus in the editor when a control is pressed.
  button.addEventListener("pointerdown", (event) => event.preventDefault());
  button.addEventListener("click", onClick);
  return button;
}

function renderChecklistOverlay() {
  if (!el.listOverlay) return;
  const text = el.body.value;
  const active = isChecklistText(text);
  const removeSize = checklistRemoveSize();
  el.body.parentElement.classList.toggle("list-mode", active);
  el.body.parentElement.style.setProperty("--list-remove-column", `${removeSize.column}px`);
  if (!active) {
    if (state.checklistOverlayKey) el.listOverlay.replaceChildren();
    state.checklistOverlayKey = "";
    return;
  }
  // Leave the overlay alone mid-drag: replacing the handle would end the gesture.
  if (state.checklistDrag) return;

  const { mirror, lineHeight, paddingLeft, paddingTop, contentWidth } = createEditorMirror();
  const touch = COARSE_POINTER.matches;
  // Every line's position in the scrolled text (not just visible ones), for dragging entries around.
  const lineBoxes = [];
  const mirrorBox = () => mirror.getBoundingClientRect();
  const focused = document.activeElement === el.body && el.body.selectionStart === el.body.selectionEnd;
  const caret = el.body.selectionStart;
  const viewHeight = el.body.clientHeight;
  const items = [];
  let top = paddingTop - el.body.scrollTop;
  let lineStart = 0;

  text.split("\n").forEach((line, index) => {
    mirror.replaceChildren();
    const span = document.createElement("span");
    span.textContent = line || " ";
    mirror.append(span);
    const box = mirrorBox();
    const height = Math.max(lineHeight, box.height);
    const visible = top + height > 0 && top < viewHeight;
    lineBoxes.push({ contentTop: top + el.body.scrollTop, height });

    if (visible && isChecklistEntry(line)) {
      const done = CHECKED_LINE.exec(line);
      const checked = Boolean(done);
      const label = (done ? done[2] : line).trim();
      // One rectangle per wrapped row of this line.
      const rows = [...span.getClientRects()].map((rect) => ({
        left: paddingLeft + rect.left - box.left,
        top: top + Math.floor((rect.top - box.top + 1) / lineHeight) * lineHeight,
        width: rect.width,
      }));
      if (touch && !el.body.readOnly) items.push({ kind: "handle", index, top, label });
      items.push({ kind: "check", index, checked, top, label });
      if (checked) rows.forEach((row) => items.push({ kind: "strike", ...row }));
      if (focused && !el.body.readOnly && caret >= lineStart && caret <= lineStart + line.length) {
        items.push({ kind: "remove", index, top, height, label });
      }
    }

    top += height;
    lineStart += line.length + 1;
  });
  mirror.remove();

  const checkLeft = paddingLeft - CHECKLIST_GUTTER;
  const handleLeft = checkLeft - CHECKLIST_HANDLE;
  // Centre of the reserved column, just right of where the text wraps.
  const removeLeft = paddingLeft + contentWidth + (removeSize.column - removeSize.width) / 2;
  state.checklistLines = lineBoxes;
  state.checklistGeometry = {
    lineHeight,
    markerLeft: (touch ? handleLeft : checkLeft) - 4,
    markerWidth: removeLeft + removeSize.width + 4 - ((touch ? handleLeft : checkLeft) - 4),
  };

  // Only touch the DOM when something moved, so a click isn't lost to a re-render.
  const key = JSON.stringify([items, lineHeight, paddingLeft, contentWidth, removeSize, el.body.readOnly]);
  if (key === state.checklistOverlayKey) return;
  state.checklistOverlayKey = key;

  el.listOverlay.replaceChildren(
    ...items.flatMap((item) => {
      if (item.kind === "handle") {
        const handle = document.createElement("button");
        handle.type = "button";
        handle.className = "list-handle";
        handle.setAttribute("aria-label", `Move "${item.label}"`);
        handle.innerHTML = HANDLE_ICON;
        Object.assign(handle.style, {
          left: `${handleLeft}px`,
          top: `${item.top}px`,
          width: `${CHECKLIST_HANDLE}px`,
          height: `${lineHeight}px`,
        });
        handle.addEventListener("pointerdown", (event) => startChecklistDrag(event, item.index, handle));
        return handle;
      }
      if (item.kind === "strike") {
        const strike = document.createElement("div");
        strike.className = "list-strike";
        Object.assign(strike.style, {
          left: `${item.left}px`,
          top: `${item.top}px`,
          width: `${item.width}px`,
          height: `${lineHeight}px`,
        });
        return strike;
      }
      if (item.kind === "check") {
        const check = checklistControl(
          "list-check",
          {
            role: "checkbox",
            "aria-checked": String(item.checked),
            "aria-label": item.label,
            "aria-disabled": String(el.body.readOnly),
            title: el.body.readOnly ? "View only" : item.checked ? "Mark as not done" : "Mark as done",
          },
          () => toggleChecklistLine(item.index)
        );
        Object.assign(check.style, { left: `${checkLeft}px`, top: `${item.top}px`, height: `${lineHeight}px` });
        return check;
      }
      // Shown while the "×" is hovered: marks the whole entry, every wrapped row, from checkbox to "×".
      const band = document.createElement("div");
      band.className = "list-remove-band";
      Object.assign(band.style, {
        left: `${checkLeft - 6}px`,
        top: `${item.top}px`,
        width: `${removeLeft + removeSize.width + 6 - (checkLeft - 6)}px`,
        height: `${item.height}px`,
      });
      const remove = checklistControl(
        "list-remove",
        { "aria-label": `Remove "${item.label}"`, title: "Remove line" },
        () => deleteChecklistLine(item.index)
      );
      // A square tap area, level with the entry's first row (and its checkbox).
      Object.assign(remove.style, {
        left: `${removeLeft}px`,
        top: `${item.top + Math.min(0, (lineHeight - removeSize.width) / 2)}px`,
        width: `${removeSize.width}px`,
        height: `${Math.max(lineHeight, removeSize.width)}px`,
      });
      remove.textContent = "×";
      return [band, remove];
    })
  );
}

function applyTheme(theme, { animate = false } = {}) {
  const normalized = normalizeTheme(theme);
  clearTimeout(state.themeTransitionTimer);
  if (animate) {
    document.documentElement.classList.add("theme-transitioning");
    requestAnimationFrame(() => {
      document.documentElement.dataset.theme = normalized;
    });
    state.themeTransitionTimer = setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, THEME_TRANSITION_MS);
    return;
  }
  document.documentElement.classList.remove("theme-transitioning");
  document.documentElement.dataset.theme = normalized;
}

function minutesFromTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function scheduleActive(settings) {
  if (!settings || !THEME_VALUES.has(settings.sunrise_theme) || !THEME_VALUES.has(settings.sunset_theme)) return false;
  switch (settings.theme_schedule) {
    case "times":
      return Boolean(settings.sunrise_time && settings.sunset_time && settings.sunrise_time !== settings.sunset_time);
    case "sun":
      return Boolean(settings.sun_latitude && settings.sun_longitude);
    case "system":
      return Boolean(systemDarkQuery);
    default:
      return false;
  }
}

// Today's sunrise and sunset at the saved location (see web/sun.js).
function todaysSunTimes(settings, date = new Date()) {
  return sunTimes(date, Number(settings.sun_latitude), Number(settings.sun_longitude));
}

function scheduledThemeState(settings, date = new Date()) {
  if (!scheduleActive(settings)) return null;

  // Boundaries name the moment the scheduled theme last changed; a theme picked by hand
  // stays until the next one.
  if (settings.theme_schedule === "system") {
    return systemDarkQuery.matches
      ? { theme: settings.sunset_theme, boundary: "system-dark" }
      : { theme: settings.sunrise_theme, boundary: "system-light" };
  }

  const today = localDateKey(date);
  let sunrise;
  let sunset;
  if (settings.theme_schedule === "sun") {
    const sun = todaysSunTimes(settings, date);
    if (sun.polar === "day") return { theme: settings.sunrise_theme, boundary: `${today}-polar-day` };
    if (sun.polar === "night") return { theme: settings.sunset_theme, boundary: `${today}-polar-night` };
    sunrise = sun.sunrise.getHours() * 60 + sun.sunrise.getMinutes();
    sunset = sun.sunset.getHours() * 60 + sun.sunset.getMinutes();
  } else {
    sunrise = minutesFromTime(settings.sunrise_time);
    sunset = minutesFromTime(settings.sunset_time);
  }
  const current = date.getHours() * 60 + date.getMinutes();
  const yesterdayDate = new Date(date);
  yesterdayDate.setDate(date.getDate() - 1);
  const yesterday = localDateKey(yesterdayDate);

  if (sunrise < sunset) {
    if (current >= sunset) return { theme: settings.sunset_theme, boundary: `${today}-sunset` };
    if (current >= sunrise) return { theme: settings.sunrise_theme, boundary: `${today}-sunrise` };
    return { theme: settings.sunset_theme, boundary: `${yesterday}-sunset` };
  }

  if (current >= sunrise) return { theme: settings.sunrise_theme, boundary: `${today}-sunrise` };
  if (current >= sunset) return { theme: settings.sunset_theme, boundary: `${today}-sunset` };
  return { theme: settings.sunrise_theme, boundary: `${yesterday}-sunrise` };
}

function applySchedule({ initial = false, force = false } = {}) {
  if (!state.settings) return;
  const scheduled = scheduledThemeState(state.settings);
  if (!scheduled) {
    state.lastScheduleBoundary = null;
    state.manualThemeOverrideBoundary = null;
    applyTheme(state.settings.theme);
    return;
  }

  if (state.manualThemeOverrideBoundary === scheduled.boundary && !force) return;

  const boundaryChanged = state.lastScheduleBoundary !== scheduled.boundary;
  state.lastScheduleBoundary = scheduled.boundary;
  applyTheme(scheduled.theme, { animate: !initial && boundaryChanged });
}

function applySettingsControls(settings) {
  el.theme.value = settings.theme;
  el.font.value = settings.font;
  el.cursorType.value = settings.cursor_type;
  el.tagPillStyle.value = settings.tag_pill_style;
  el.focusLetterEffect.checked = settings.focus_letter_effect;
  el.startNote.value = settings.start_note;
  el.themeSchedule.value = settings.theme_schedule;
  el.sunriseTheme.value = settings.sunrise_theme;
  el.sunsetTheme.value = settings.sunset_theme;
  // A save of one field returns while the next may be in use; don't overwrite what is being typed.
  for (const [input, value] of [
    [el.sunriseTime, settings.sunrise_time],
    [el.sunsetTime, settings.sunset_time],
    [el.sunLatitude, settings.sun_latitude],
    [el.sunLongitude, settings.sun_longitude],
  ]) {
    if (document.activeElement !== input) input.value = value;
  }
  el.scheduleTimes.hidden = settings.theme_schedule !== "times";
  el.scheduleSun.hidden = settings.theme_schedule !== "sun";
  el.scheduleSystemNote.hidden = settings.theme_schedule !== "system";
  el.scheduleThemes.hidden = settings.theme_schedule === "off";
  renderSunTimesNote(settings);
}

function renderSunTimesNote(settings) {
  if (!settings.sun_latitude || !settings.sun_longitude) {
    el.sunTimesNote.textContent = "Set your location to switch at the real sunrise and sunset. Daylight saving time is taken care of.";
    return;
  }
  const sun = todaysSunTimes(settings);
  if (sun.polar === "day") {
    el.sunTimesNote.textContent = "Today the sun doesn't set here, so the day theme stays.";
  } else if (sun.polar === "night") {
    el.sunTimesNote.textContent = "Today the sun doesn't rise here, so the night theme stays.";
  } else {
    const time = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    el.sunTimesNote.textContent = `Today: sunrise ${time(sun.sunrise)} · sunset ${time(sun.sunset)}`;
  }
}

// Fills latitude/longitude from the browser's location (asks for permission once).
function locateForSunSchedule() {
  if (!navigator.geolocation) {
    el.sunTimesNote.textContent = "This browser can't share its location. Enter latitude and longitude instead.";
    return;
  }
  el.sunLocateButton.disabled = true;
  el.sunTimesNote.textContent = "Finding your location…";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      el.sunLocateButton.disabled = false;
      saveSettings(
        {
          theme_schedule: "sun",
          sun_latitude: position.coords.latitude.toFixed(2),
          sun_longitude: position.coords.longitude.toFixed(2),
        },
        { scheduleChanged: true },
      ).catch((error) => setError(error.message));
    },
    (error) => {
      el.sunLocateButton.disabled = false;
      el.sunTimesNote.textContent =
        error.code === error.PERMISSION_DENIED
          ? "Location access was blocked. Allow it in the browser's site settings, or enter latitude and longitude."
          : "Couldn't get your location. Try again, or enter latitude and longitude.";
    },
    { enableHighAccuracy: false, timeout: 15000, maximumAge: 6 * 60 * 60 * 1000 },
  );
}

function currentConfiguredTheme() {
  if (!state.settings) return "plain";
  const scheduled = scheduledThemeState(state.settings);
  if (scheduled && state.manualThemeOverrideBoundary !== scheduled.boundary) return scheduled.theme;
  return state.settings.theme;
}

function restoreConfiguredTheme() {
  applyTheme(currentConfiguredTheme());
}

function previewTheme(theme) {
  applyTheme(theme);
}

function enableThemePreview(select) {
  select.addEventListener("input", () => previewTheme(select.value));
  select.addEventListener("mouseleave", restoreConfiguredTheme);
  select.addEventListener("blur", restoreConfiguredTheme);
}

function showSettingsSection(section) {
  for (const button of el.settingsNavButtons) {
    const active = button.dataset.settingsSection === section;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  }
  for (const panel of el.settingsSections) {
    panel.hidden = panel.id !== `settings-section-${section}`;
    panel.classList.toggle("active", !panel.hidden);
  }
}

function markDirty() {
  // No note loaded yet (starting up or signed out): the text came from the browser restoring the
  // tab, not from typing, and saving it would add a copy of whatever note was open last time.
  if (!state.selected) return;
  state.dirty = true;
  setStatus("Unsaved");
  scheduleAutosave();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function loadSidebarState() {
  const savedWidth = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));
  if (Number.isFinite(savedWidth)) {
    state.sidebarWidth = clamp(savedWidth, SIDEBAR_MIN, SIDEBAR_MAX);
  }
  state.sidebarCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  applySidebarState();
}

function applySidebarState() {
  const phone = PHONE_LAYOUT.matches;
  const collapsed = state.sidebarCollapsed && !phone;
  const toggleLabel = phone ? "Hide notes" : collapsed ? "Expand panel" : "Minimize panel";
  el.app.style.setProperty("--sidebar-width", `${state.sidebarWidth}px`);
  el.app.classList.toggle("sidebar-collapsed", collapsed);
  el.app.classList.toggle("drawer-open", phone && state.drawerOpen);
  el.drawerButton.setAttribute("aria-expanded", String(phone && state.drawerOpen));
  el.sidebarToggle.title = toggleLabel;
  el.sidebarToggle.setAttribute("aria-label", toggleLabel);
  el.sidebarToggle.querySelector(".sidebar-toggle-label").textContent = toggleLabel;
}

function setDrawerOpen(open) {
  if (state.drawerOpen === open) return;
  state.drawerOpen = open;
  hideNoteHoverCard();
  hideProfileMenu();
  applySidebarState();
}

function saveSidebarState() {
  localStorage.setItem(SIDEBAR_WIDTH_KEY, String(state.sidebarWidth));
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(state.sidebarCollapsed));
}

function previewMax() {
  const gridWidth = el.editorGrid.clientWidth || window.innerWidth;
  const usableMax = gridWidth - PREVIEW_EDITOR_MIN - PREVIEW_RESIZER_WIDTH;
  const ratioMax = Math.floor(gridWidth * PREVIEW_MAX_RATIO);
  return Math.max(PREVIEW_MIN, Math.min(ratioMax, usableMax));
}

function clampPreviewWidth(width) {
  return clamp(width, PREVIEW_MIN, previewMax());
}

function applyPreviewState() {
  state.previewWidth = clampPreviewWidth(state.previewWidth);
  el.app.style.setProperty("--preview-width", `${state.previewWidth}px`);
  el.previewResizer.setAttribute("aria-valuemin", String(PREVIEW_MIN));
  el.previewResizer.setAttribute("aria-valuemax", String(previewMax()));
  el.previewResizer.setAttribute("aria-valuenow", String(state.previewWidth));
}

function loadPreviewState() {
  const savedWidth = Number(localStorage.getItem(PREVIEW_WIDTH_KEY));
  if (Number.isFinite(savedWidth)) {
    state.previewWidth = savedWidth;
  }
  applyPreviewState();
}

function savePreviewState() {
  localStorage.setItem(PREVIEW_WIDTH_KEY, String(state.previewWidth));
}

function shortTitle(title) {
  const words = title
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "—";
  if (words.length === 1) return words[0].slice(0, 4);
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function newClientId() {
  // randomUUID only exists in secure contexts (HTTPS/localhost); plain-HTTP LAN access needs the fallback.
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function emptyNote() {
  return {
    id: null,
    // Sent with every create of this note, so a retried save updates one row instead of adding copies.
    client_id: newClientId(),
    slug: "",
    title: "Untitled",
    body: "",
    date: "",
    updated_at: "",
    tags: [],
  };
}

function noteFromInputs() {
  return {
    ...state.selected,
    title: el.title.value.trim() || "Untitled",
    body: el.body.value,
  };
}

function noteSnapshot(note) {
  return JSON.stringify({
    id: note.id || null,
    title: note.title,
    body: note.body,
  });
}

function hasMeaningfulContent(note) {
  return Boolean(note.id || note.body.trim() || note.title !== "Untitled");
}

function clearAutosaveTimer() {
  clearTimeout(state.autosaveTimer);
  state.autosaveTimer = null;
}

function scheduleAutosave() {
  clearAutosaveTimer();
  state.autosaveTimer = setTimeout(() => {
    persistNote().catch(() => {
      // Error state is rendered by persistNote.
    });
  }, AUTOSAVE_DELAY);
}

async function flushAutosave() {
  clearAutosaveTimer();
  if (state.savePromise) {
    await state.savePromise;
  }
  if (!state.dirty) return;
  await persistNote();
}

function renderList() {
  hideNoteHoverCard();
  const terms = searchTerms();
  el.noteCount.textContent = `${state.notes.length} ${state.notes.length === 1 ? "note" : "notes"}`;
  el.noteList.replaceChildren();
  if (!state.notes.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No notes";
    el.noteList.append(empty);
    return;
  }

  for (const note of state.notes) {
    const button = document.createElement("button");
    const tags = Array.isArray(note.tags) ? note.tags : [];
    button.className = `note-row${state.selected?.id === note.id ? " selected" : ""}`;
    button.type = "button";
    button.innerHTML = `<span class="note-title"></span><span class="note-short"></span><small class="note-meta"></small>`;
    setHighlightedText(button.querySelector(".note-title"), note.title, terms);
    button.querySelector(".note-short").textContent = shortTitle(note.title);
    renderNoteMeta(button.querySelector(".note-meta"), note.date, tags, note);
    // Only a real mouse hover or keyboard focus shows the card; a tap on a touch screen just opens the note.
    button.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") scheduleNoteHoverCard(note, button);
    });
    // pointerleave, not mouseleave: moving straight into the next row fires the next row's pointerenter
    // before this row's mouseleave, which would cancel the card that was just scheduled.
    button.addEventListener("pointerleave", hideNoteHoverCard);
    button.addEventListener("focus", () => {
      if (button.matches(":focus-visible")) showNoteHoverCard(note, button);
    });
    button.addEventListener("blur", hideNoteHoverCard);
    button.addEventListener("click", () => selectNote(note.id));
    el.noteList.append(button);
  }
}

function tagHash(tag) {
  let hash = 0;
  for (let index = 0; index < tag.length; index += 1) {
    hash = (hash * 31 + tag.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function normalizeTag(tag) {
  return String(tag || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32)
    .replace(/^-+|-+$/g, "");
}

function tagTokenRanges(text) {
  const ranges = [];
  for (const match of text.matchAll(TAG_LINE_PATTERN)) {
    const token = match[1];
    const start = match.index + match[0].indexOf(token);
    const tag = normalizeTag(token.slice(1));
    if (tag) ranges.push({ tag, start, end: start + token.length, token });
  }
  return ranges;
}

function findTagTokenRange(text, tag) {
  const normalized = normalizeTag(tag);
  return tagTokenRanges(text).find((range) => range.tag === normalized) || null;
}

function makeTagPill(tag, onClick = null) {
  const color = TAG_PALETTE[tagHash(tag) % TAG_PALETTE.length];
  const pill = document.createElement(onClick ? "button" : "span");
  pill.className = "tag-pill";
  pill.textContent = tag;
  pill.style.setProperty("--tag-accent", color);
  if (onClick) {
    pill.type = "button";
    pill.title = `Jump to #${tag}`;
    pill.addEventListener("click", () => onClick(tag));
  }
  return pill;
}

function renderTagPills(container, tags, onClick = null) {
  container.replaceChildren();
  for (const tag of tags) {
    container.append(makeTagPill(tag, onClick));
  }
}

// Sharing: a note's `access` is "owner", or "edit" / "view" when someone shared it with you.
function sharedWithMe(note) {
  return Boolean(note?.access && note.access !== "owner");
}

function sharedLabel(note) {
  return `Shared by ${note.owner_email} · can ${note.access === "view" ? "view" : "edit"}`;
}

function sharedMarker(note) {
  if (sharedWithMe(note)) {
    const marker = document.createElement("span");
    marker.className = "note-shared";
    marker.textContent = `↙ ${note.owner_email.split("@")[0]}`;
    marker.title = sharedLabel(note);
    return marker;
  }
  if (note?.share_count > 0) {
    const marker = document.createElement("span");
    marker.className = "note-shared";
    marker.textContent = `↗ ${note.share_count}`;
    marker.title = `Shared with ${note.share_count} ${note.share_count === 1 ? "person" : "people"}`;
    return marker;
  }
  return null;
}

function renderNoteMeta(container, date, tags, note = null) {
  container.replaceChildren(document.createTextNode(date || ""));
  const marker = sharedMarker(note);
  if (marker) {
    const separator = document.createElement("span");
    separator.className = "note-meta-separator";
    separator.textContent = "·";
    container.append(separator, marker);
  }
  if (!tags.length) return;

  const separator = document.createElement("span");
  separator.className = "note-meta-separator";
  separator.textContent = "·";
  container.append(separator, makeTagPill(tags[0]));

  if (tags.length <= 1) return;

  const more = document.createElement("span");
  more.className = "tag-more";
  more.textContent = `+${tags.length - 1}`;
  container.append(more);
}

function noteHoverCard() {
  let card = document.querySelector("#note-hover-card");
  if (!card) {
    card = document.createElement("aside");
    card.id = "note-hover-card";
    card.className = "note-hover-card";
    card.setAttribute("role", "tooltip");
    card.hidden = true;
    document.body.append(card);
  }
  return card;
}

function formatDateTime(value, fallback) {
  const date = new Date(value);
  if (value && Number.isFinite(date.getTime())) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }
  return value || fallback;
}

function formatNoteDateTime(note) {
  return formatDateTime(note.updated_at || note.date || "", "No date");
}

function showNoteHoverCard(note, anchor) {
  clearNoteHoverTimer();
  state.noteHoverTarget = anchor;
  const tags = Array.isArray(note.tags) ? note.tags : [];
  const card = noteHoverCard();
  const title = document.createElement("strong");
  const datetime = document.createElement("time");
  const tagList = document.createElement("div");

  title.className = "note-hover-title";
  title.textContent = note.title || "Untitled";
  datetime.className = "note-hover-date";
  datetime.textContent = formatNoteDateTime(note);
  if (note.updated_at) datetime.dateTime = note.updated_at;
  tagList.className = "note-hover-tags";

  if (tags.length) {
    for (const tag of tags) tagList.append(makeTagPill(tag));
  } else {
    const empty = document.createElement("span");
    empty.className = "note-hover-empty";
    empty.textContent = "No tags";
    tagList.append(empty);
  }

  card.replaceChildren(title, datetime, tagList);
  const marker = sharedMarker(note);
  if (marker) {
    const shared = document.createElement("span");
    shared.className = "note-hover-date";
    shared.textContent = marker.title;
    card.append(shared);
  }
  card.hidden = false;
  card.style.left = "0px";
  card.style.top = "0px";

  const anchorRect = anchor.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  let left = anchorRect.right + 10;
  if (left + cardRect.width + 10 > window.innerWidth) {
    left = anchorRect.left - cardRect.width - 10;
  }
  left = clamp(left, 10, Math.max(10, window.innerWidth - cardRect.width - 10));

  const centeredTop = anchorRect.top + (anchorRect.height - cardRect.height) / 2;
  const top = clamp(centeredTop, 10, Math.max(10, window.innerHeight - cardRect.height - 10));
  card.style.left = `${left}px`;
  card.style.top = `${top}px`;
}

function clearNoteHoverTimer() {
  clearTimeout(state.noteHoverTimer);
  state.noteHoverTimer = null;
}

function scheduleNoteHoverCard(note, anchor) {
  clearNoteHoverTimer();
  state.noteHoverTarget = anchor;
  if (state.sidebarCollapsed) {
    showNoteHoverCard(note, anchor);
    return;
  }
  state.noteHoverTimer = setTimeout(() => {
    if (state.noteHoverTarget === anchor) showNoteHoverCard(note, anchor);
  }, NOTE_HOVER_DELAY_MS);
}

function hideNoteHoverCard() {
  clearNoteHoverTimer();
  state.noteHoverTarget = null;
  const card = document.querySelector("#note-hover-card");
  if (card) card.hidden = true;
}

function openSettingsModal() {
  hideProfileMenu();
  showSettingsSection("appearance");
  el.settingsModal.hidden = false;
}

function showProfileMenu() {
  clearTimeout(state.profileMenuCloseTimer);
  state.profileMenuCloseTimer = null;
  el.profileMenu.hidden = false;
  el.profileButton.setAttribute("aria-expanded", "true");
}

function hideProfileMenu() {
  clearTimeout(state.profileMenuCloseTimer);
  state.profileMenuCloseTimer = null;
  el.profileMenu.hidden = true;
  el.profileButton.setAttribute("aria-expanded", "false");
}

function setZenMode(enabled) {
  state.zenMode = Boolean(enabled);
  el.app.classList.toggle("zen-mode", state.zenMode);
  hideProfileMenu();
  hideNoteHoverCard();
  requestAnimationFrame(() => {
    el.body.focus({ preventScroll: true });
    applyPreviewState();
    renderEditorLineNumbers();
    scheduleEditorCursorUpdate();
  });
}

function toggleZenMode() {
  setZenMode(!state.zenMode);
}

function scheduleProfileMenuHide() {
  clearTimeout(state.profileMenuCloseTimer);
  state.profileMenuCloseTimer = setTimeout(hideProfileMenu, PROFILE_MENU_CLOSE_DELAY_MS);
}

function scrollTextareaSelectionIntoView(textarea) {
  const lineHeight = Number.parseFloat(window.getComputedStyle(textarea).lineHeight) || DEFAULT_FONT_SIZE * 1.65;
  const beforeSelection = textarea.value.slice(0, textarea.selectionStart);
  const line = beforeSelection.split("\n").length - 1;
  const targetTop = Math.max(0, line * lineHeight - textarea.clientHeight / 2);
  textarea.scrollTop = targetTop;
}

function jumpToTag(tag) {
  if (!state.selected?.id) return;

  const currentBody = el.body.value;
  const savedBody = state.selected.body || "";
  const bodies = state.dirty ? [currentBody, savedBody] : [savedBody, currentBody];
  let range = null;

  for (const body of bodies) {
    const candidate = findTagTokenRange(body, tag);
    if (!candidate) continue;

    if (body === currentBody) {
      range = candidate;
      break;
    }

    const visibleStart = currentBody.indexOf(candidate.token);
    if (visibleStart >= 0) {
      range = { start: visibleStart, end: visibleStart + candidate.token.length };
      break;
    }
  }

  if (!range) return;
  el.body.focus({ preventScroll: true });
  el.body.setSelectionRange(range.start, range.end);
  scrollTextareaSelectionIntoView(el.body);
  syncPreviewScrollFromEditor();
  scheduleEditorCursorUpdate();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function searchTerms() {
  const terms = searchTextQuery(el.search.value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.toLowerCase());
  return [...new Set(terms)].slice(0, 12);
}

function searchTextQuery(query) {
  const trimmed = query.trim();
  if (!trimmed.toLowerCase().startsWith("tag:")) return trimmed;
  const firstSpace = trimmed.search(/\s/);
  return firstSpace === -1 ? "" : trimmed.slice(firstSpace + 1).trim();
}

function highlightedFragment(value, terms) {
  const fragment = document.createDocumentFragment();
  if (!terms.length) {
    fragment.append(document.createTextNode(value));
    return fragment;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  let index = 0;
  for (const match of value.matchAll(pattern)) {
    if (match.index > index) {
      fragment.append(document.createTextNode(value.slice(index, match.index)));
    }
    const mark = document.createElement("mark");
    mark.className = "search-hit";
    mark.textContent = match[0];
    fragment.append(mark);
    index = match.index + match[0].length;
  }
  if (index < value.length) {
    fragment.append(document.createTextNode(value.slice(index)));
  }
  return fragment;
}

function setHighlightedText(element, value, terms) {
  element.replaceChildren(highlightedFragment(value, terms));
}

function highlightElement(element, terms) {
  if (!terms.length) return;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    const parent = walker.currentNode.parentElement;
    if (walker.currentNode.nodeValue.trim() && !parent?.closest(".code-block")) {
      textNodes.push(walker.currentNode);
    }
  }
  for (const textNode of textNodes) {
    textNode.replaceWith(highlightedFragment(textNode.nodeValue, terms));
  }
}

function renderInlineFormatting(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>")
    .replace(/&lt;u&gt;(.+?)&lt;\/u&gt;/g, "<u>$1</u>")
    .replace(/\+\+([^+]+)\+\+/g, "<u>$1</u>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function safeHref(url) {
  const href = url.trim();
  if (!href || href.startsWith("//") || /[\u0000-\u001f\u007f]/.test(href)) return null;
  const scheme = /^([a-zA-Z][a-zA-Z\d+.-]*):/.exec(href);
  if (scheme && !["http", "https", "mailto"].includes(scheme[1].toLowerCase())) return null;
  return href;
}

function splitTrailingPunctuation(url) {
  const match = /^(.*?)([.,!?;]+)?$/.exec(url);
  return {
    href: match?.[1] || url,
    trailing: match?.[2] || "",
  };
}

function renderLink(label, url) {
  const href = safeHref(url);
  if (!href) return renderInlineFormatting(label);
  return `<a href="${escapeHtml(href)}">${renderInlineFormatting(label)}</a>`;
}

function renderInline(value) {
  const pattern = /\[([^\]\n]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<>()]+)/gi;
  let rendered = "";
  let index = 0;

  for (const match of value.matchAll(pattern)) {
    rendered += renderInlineFormatting(value.slice(index, match.index));
    if (match[1] !== undefined) {
      rendered += renderLink(match[1], match[2]);
    } else {
      const { href, trailing } = splitTrailingPunctuation(match[3]);
      rendered += renderLink(href, href);
      rendered += renderInlineFormatting(trailing);
    }
    index = match.index + match[0].length;
  }

  rendered += renderInlineFormatting(value.slice(index));
  return rendered;
}

function normalizeCodeLanguage(rawLanguage) {
  const language = String(rawLanguage || "")
    .trim()
    .toLowerCase()
    .replace(/^language-/, "")
    .split(/[^\w+.#-]/)[0];
  return CODE_LANGUAGE_ALIASES.get(language) || language || "";
}

function codeLanguageLabel(language) {
  return CODE_LANGUAGE_LABELS[language] || language.toUpperCase();
}

function syntaxClass(token, groups) {
  if (groups.comment) return "comment";
  if (groups.key) return "key";
  if (groups.string) return "string";
  if (groups.keyword) return "keyword";
  if (groups.literal) return "literal";
  if (groups.number) return "number";
  if (groups.tag) return "tag";
  if (groups.property) return "property";
  if (groups.variable) return "variable";
  if (groups.punctuation) return "punctuation";
  if (token.startsWith("-")) return "variable";
  return "keyword";
}

function highlightPattern(code, pattern) {
  let rendered = "";
  let index = 0;
  for (const match of code.matchAll(pattern)) {
    rendered += escapeHtml(code.slice(index, match.index));
    const token = match[0];
    rendered += `<span class="syntax-${syntaxClass(token, match.groups || {})}">${escapeHtml(token)}</span>`;
    index = match.index + token.length;
  }
  rendered += escapeHtml(code.slice(index));
  return rendered;
}

function highlightCode(code, language) {
  if (["javascript"].includes(language)) {
    return highlightPattern(
      code,
      /(?<comment>\/\/.*|\/\*[\s\S]*?\*\/)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(?<keyword>\b(?:async|await|break|case|catch|class|const|continue|default|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|super|switch|this|throw|try|typeof|var|while|yield)\b)|(?<literal>\b(?:false|null|true|undefined)\b)|(?<number>\b\d+(?:\.\d+)?\b)/g
    );
  }
  if (language === "python") {
    return highlightPattern(
      code,
      /(?<comment>#.*)|(?<string>"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<keyword>\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b)|(?<literal>\b(?:False|None|True)\b)|(?<number>\b\d+(?:\.\d+)?\b)/g
    );
  }
  if (language === "json") {
    return highlightPattern(
      code,
      /(?<key>"(?:\\.|[^"\\])*"(?=\s*:))|(?<string>"(?:\\.|[^"\\])*")|(?<literal>\b(?:false|null|true)\b)|(?<number>-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)|(?<punctuation>[{}\[\],:])/gi
    );
  }
  if (["yaml", "toml", "ini"].includes(language)) {
    return highlightPattern(
      code,
      /(?<comment>#.*|;.*)|(?<key>^\s*[\w.-]+(?=\s*[:=]))|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<literal>\b(?:false|null|true)\b)|(?<number>-?\b\d+(?:\.\d+)?\b)|(?<punctuation>[:=\[\]{}])/gim
    );
  }
  if (language === "html") {
    return highlightPattern(code, /(?<comment><!--[\s\S]*?-->)|(?<tag><\/?[A-Za-z][^>]*>)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g);
  }
  if (language === "css") {
    return highlightPattern(
      code,
      /(?<comment>\/\*[\s\S]*?\*\/)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<number>#[0-9a-f]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms)?\b)|(?<property>[\w-]+(?=\s*:))|(?<keyword>\b(?:auto|block|border-box|center|flex|grid|hidden|inherit|inline|none|relative|absolute|fixed|sticky|solid|transparent|var)\b)/gi
    );
  }
  if (language === "sql") {
    return highlightPattern(
      code,
      /(?<comment>--.*|\/\*[\s\S]*?\*\/)|(?<string>'(?:''|[^'])*'|"(?:\\.|[^"\\])*")|(?<keyword>\b(?:alter|and|as|by|create|delete|drop|from|group|having|insert|into|join|left|limit|not|null|on|or|order|primary|right|select|set|table|update|values|where)\b)|(?<number>\b\d+(?:\.\d+)?\b)/gi
    );
  }
  if (language === "shell") {
    return highlightPattern(
      code,
      /(?<comment>#.*)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<variable>\$[\w{}]+)|(?<keyword>\b(?:awk|cat|cd|cp|curl|docker|echo|export|find|grep|mkdir|mv|npm|python|rg|rm|sed|sudo|tar|uv)\b|--?[\w-]+)/g
    );
  }
  if (language === "markdown") {
    return highlightPattern(code, /(?<keyword>^#{1,6}\s.*|^\s*[-*+]\s|^\s*\d+[.)]\s)|(?<string>`[^`]+`|\*\*[^*]+\*\*)/gm);
  }
  return escapeHtml(code);
}

function renderCodeBlock(code, rawLanguage) {
  const language = normalizeCodeLanguage(rawLanguage);
  const className = language ? ` class="language-${escapeHtml(language)}"` : "";
  const label = language ? `<figcaption>${escapeHtml(codeLanguageLabel(language))}</figcaption>` : "<span></span>";
  const codeIndex = state.previewCodeBlocks.push(code) - 1;
  const lineCount = Math.max(1, code.split("\n").length);
  const lineNumbers = Array.from({ length: lineCount }, (_, index) => `<span>${index + 1}</span>`).join("");
  return `
    <figure class="code-block">
      <header class="code-block-header">
        ${label}
        <button class="code-copy-button" type="button" data-code-index="${codeIndex}">Copy</button>
      </header>
      <div class="code-scroll">
        <div class="code-table">
          <div class="code-line-numbers" aria-hidden="true">${lineNumbers}</div>
          <pre><code${className}>${highlightCode(code, language)}</code></pre>
        </div>
      </div>
    </figure>
  `;
}

function splitTableRow(line) {
  let content = line.trim();
  if (!content.includes("|")) return [];
  if (content.startsWith("|")) content = content.slice(1);
  if (content.endsWith("|")) content = content.slice(0, -1);

  const cells = [];
  let cell = "";
  let escaped = false;
  for (const char of content) {
    if (escaped) {
      cell += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === "|") {
      cells.push(cell.trim());
      cell = "";
      continue;
    }
    cell += char;
  }
  cells.push(cell.trim());
  return cells;
}

function isTableSeparator(line) {
  const cells = splitTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function tableAlignments(line) {
  return splitTableRow(line).map((cell) => {
    const trimmed = cell.trim();
    if (trimmed.startsWith(":") && trimmed.endsWith(":")) return "center";
    if (trimmed.endsWith(":")) return "right";
    return "left";
  });
}

function renderTableCell(tag, value, align) {
  const style = align && align !== "left" ? ` style="text-align: ${align}"` : "";
  return `<${tag}${style}>${renderInline(value)}</${tag}>`;
}

function renderTable(headerLine, separatorLine, bodyLines) {
  const headers = splitTableRow(headerLine);
  const alignments = tableAlignments(separatorLine);
  const width = Math.max(headers.length, alignments.length);
  const head = Array.from({ length: width }, (_, index) => renderTableCell("th", headers[index] || "", alignments[index])).join("");
  const body = bodyLines
    .map((line) => {
      const cells = splitTableRow(line);
      return `<tr>${Array.from({ length: width }, (_, index) => renderTableCell("td", cells[index] || "", alignments[index])).join("")}</tr>`;
    })
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function renderMarkdown(markdown) {
  state.previewCodeBlocks = [];
  const blocks = [];
  let paragraph = [];
  let list = [];
  let listType = "ul";
  let codeFence = null;
  let codeLanguage = "";
  let codeLines = [];

  function flushParagraph() {
    if (paragraph.length) {
      blocks.push(`<p>${paragraph.map(renderInline).join("<br>")}</p>`);
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length) {
      blocks.push(`<${listType}>${list.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${listType}>`);
      list = [];
    }
  }

  function addListItem(type, item) {
    flushParagraph();
    if (list.length && listType !== type) flushList();
    listType = type;
    list.push(item);
  }

  function renderBlockquote(quoteLines) {
    return `<blockquote>${quoteLines.map(renderInline).join("<br>")}</blockquote>`;
  }

  function flushCode() {
    blocks.push(renderCodeBlock(codeLines.join("\n"), codeLanguage));
    codeFence = null;
    codeLanguage = "";
    codeLines = [];
  }

  const lines = markdown.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    const fence = /^(```+|~~~+)/.exec(trimmed);
    if (codeFence) {
      if (fence && fence[1].startsWith(codeFence)) {
        flushCode();
      } else {
        codeLines.push(line);
      }
      continue;
    }
    if (fence) {
      flushParagraph();
      flushList();
      codeFence = fence[1][0];
      codeLanguage = trimmed.slice(fence[1].length).trim();
      codeLines = [];
      continue;
    }
    if (/^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push("<hr>");
      continue;
    }
    if (index + 1 < lines.length && splitTableRow(line).length > 1 && isTableSeparator(lines[index + 1])) {
      flushParagraph();
      flushList();
      const separatorLine = lines[index + 1];
      const tableLines = [];
      index += 2;
      while (index < lines.length && splitTableRow(lines[index]).length > 1 && lines[index].trim()) {
        tableLines.push(lines[index]);
        index += 1;
      }
      index -= 1;
      blocks.push(renderTable(line, separatorLine, tableLines));
      continue;
    }
    if (/^>\s?/.test(trimmed)) {
      flushParagraph();
      flushList();
      const quoteLines = [];
      while (index < lines.length) {
        const quoteMatch = /^>\s?(.*)$/.exec(lines[index].trim());
        if (!quoteMatch) break;
        quoteLines.push(quoteMatch[1]);
        index += 1;
      }
      index -= 1;
      blocks.push(renderBlockquote(quoteLines));
      continue;
    }
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }
    const unorderedItem = /^[-*]\s+(.+)$/.exec(trimmed);
    if (unorderedItem) {
      addListItem("ul", unorderedItem[1]);
      continue;
    }
    const orderedItem = /^\d+[.)]\s+(.+)$/.exec(trimmed);
    if (orderedItem) {
      addListItem("ol", orderedItem[1]);
      continue;
    }
    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  if (codeFence) flushCode();
  return blocks.join("");
}

function applyNoteAccess(note) {
  const shared = sharedWithMe(note);
  const viewOnly = note.access === "view";
  el.body.readOnly = viewOnly;
  el.title.readOnly = viewOnly;
  el.body.parentElement.classList.toggle("read-only", viewOnly);
  el.shareButton.disabled = !note.id || shared;
  const deleteLabel = shared ? "Remove from my notes" : "Delete note";
  el.del.title = shared ? deleteLabel : "Delete";
  el.del.setAttribute("aria-label", deleteLabel);
  if (shared) setStatus(viewOnly ? `View only · shared by ${note.owner_email}` : `Shared by ${note.owner_email}`);
}

function renderEditor(note) {
  state.selected = note;
  setSyncBase(note);
  hideConflict();
  state.lastSavedSnapshot = noteSnapshot(note);
  applyNoteAccess(note);
  el.title.value = note.title;
  el.body.value = note.body;
  el.editorLineNumbers.dataset.count = "";
  renderEditorLineNumbers();
  renderTagPills(el.titleTags, note.tags || [], jumpToTag);
  el.del.disabled = !note.id;
  el.export.disabled = !note.id;
  renderPreview();
  renderList();
  scheduleEditorCursorUpdate();
}

function previewVisible() {
  return PREVIEW_SHEET.matches ? state.previewSheetOpen : state.preview;
}

function setPreviewSheetOpen(open) {
  state.previewSheetOpen = open;
  el.editorGrid.classList.toggle("preview-sheet-open", open && PREVIEW_SHEET.matches);
  el.editorGrid.classList.remove("preview-sheet-full");
  if (open) {
    el.editorGrid.style.removeProperty("--sheet-height");
    requestAnimationFrame(syncPreviewScrollFromEditor);
  }
}

function syncPreviewScrollFromEditor() {
  if (!previewVisible()) return;
  const editorMax = el.body.scrollHeight - el.body.clientHeight;
  const previewMax = el.preview.scrollHeight - el.preview.clientHeight;
  const ratio = editorMax > 0 ? el.body.scrollTop / editorMax : 0;
  el.preview.scrollTop = previewMax > 0 ? previewMax * ratio : 0;
  scheduleEditorCursorUpdate();
}

function placeEditorCursorAtStart() {
  requestAnimationFrame(() => {
    el.body.focus({ preventScroll: true });
    el.body.setSelectionRange(0, 0);
    el.body.scrollTop = 0;
    el.body.scrollLeft = 0;
    syncPreviewScrollFromEditor();
  });
}

function placeTitleCursorAtStart() {
  requestAnimationFrame(() => {
    el.title.focus({ preventScroll: true });
    el.title.setSelectionRange(0, el.title.value.length);
  });
}

function selectedLineRange(text, selectionStart, selectionEnd) {
  const start = text.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  let end = selectionEnd;
  if (selectionEnd > selectionStart && text[selectionEnd - 1] === "\n") {
    end = selectionEnd - 1;
  }
  const nextBreak = text.indexOf("\n", end);
  return {
    start,
    end: nextBreak === -1 ? text.length : nextBreak,
  };
}

function moveSelectedLines(direction) {
  const text = el.body.value;
  const selectionStart = el.body.selectionStart;
  const selectionEnd = el.body.selectionEnd;
  const range = selectedLineRange(text, selectionStart, selectionEnd);

  if (direction < 0) {
    if (range.start === 0) return false;
    const previousStart = text.lastIndexOf("\n", range.start - 2) + 1;
    const previousEnd = range.start - 1;
    const previousLine = text.slice(previousStart, previousEnd);
    const selectedLines = text.slice(range.start, range.end);
    el.body.value = `${text.slice(0, previousStart)}${selectedLines}\n${previousLine}${text.slice(range.end)}`;
    el.body.setSelectionRange(selectionStart - (range.start - previousStart), selectionEnd - (range.start - previousStart));
    return true;
  }

  if (range.end === text.length) return false;
  const nextStart = range.end + 1;
  if (nextStart >= text.length) return false;
  const nextBreak = text.indexOf("\n", nextStart);
  const nextEnd = nextBreak === -1 ? text.length : nextBreak;
  const selectedLines = text.slice(range.start, range.end);
  const nextLine = text.slice(nextStart, nextEnd);
  el.body.value = `${text.slice(0, range.start)}${nextLine}\n${selectedLines}${text.slice(nextEnd)}`;
  el.body.setSelectionRange(selectionStart + (nextEnd - range.end), selectionEnd + (nextEnd - range.end));
  return true;
}

function duplicateSelectionOrLine() {
  const text = el.body.value;
  const selectionStart = el.body.selectionStart;
  const selectionEnd = el.body.selectionEnd;

  if (selectionStart !== selectionEnd) {
    const selectedText = text.slice(selectionStart, selectionEnd);
    el.body.value = `${text.slice(0, selectionEnd)}${selectedText}${text.slice(selectionEnd)}`;
    el.body.setSelectionRange(selectionEnd, selectionEnd + selectedText.length);
    return true;
  }

  const range = lineRangeAtPosition(text, selectionStart);
  const line = text.slice(range.start, range.end);
  const column = selectionStart - range.start;
  const insert = `\n${line}`;
  const duplicateStart = range.end + 1;
  el.body.value = `${text.slice(0, range.end)}${insert}${text.slice(range.end)}`;
  el.body.setSelectionRange(duplicateStart + column, duplicateStart + column);
  return true;
}

function indentSelectedLines() {
  const text = el.body.value;
  const selectionStart = el.body.selectionStart;
  const selectionEnd = el.body.selectionEnd;
  const range = selectedLineRange(text, selectionStart, selectionEnd);
  const selectedLines = text.slice(range.start, range.end);
  const lines = selectedLines.split("\n");
  const replacement = lines.map((line) => `${EDITOR_INDENT}${line}`).join("\n");
  const inserted = EDITOR_INDENT.length * lines.length;

  el.body.value = `${text.slice(0, range.start)}${replacement}${text.slice(range.end)}`;
  const nextStart = selectionStart === range.start ? selectionStart : selectionStart + EDITOR_INDENT.length;
  el.body.setSelectionRange(nextStart, selectionEnd + inserted);
  return true;
}

function deindentLine(line) {
  if (line.startsWith(EDITOR_INDENT)) return { text: line.slice(EDITOR_INDENT.length), removed: EDITOR_INDENT.length };
  if (line.startsWith("\t")) return { text: line.slice(1), removed: 1 };
  if (line.startsWith(" ")) return { text: line.slice(1), removed: 1 };
  return { text: line, removed: 0 };
}

function deindentSelectedLines() {
  const text = el.body.value;
  const selectionStart = el.body.selectionStart;
  const selectionEnd = el.body.selectionEnd;
  const range = selectedLineRange(text, selectionStart, selectionEnd);
  const selectedLines = text.slice(range.start, range.end);
  const lines = selectedLines.split("\n");
  const deindented = lines.map(deindentLine);
  if (!deindented.some((line) => line.removed > 0)) return false;

  const replacement = deindented.map((line) => line.text).join("\n");
  const lineStarts = [];
  let offset = range.start;
  for (const line of lines) {
    lineStarts.push(offset);
    offset += line.length + 1;
  }

  function removedBefore(position) {
    return deindented.reduce((total, line, index) => {
      const distance = position - lineStarts[index];
      if (distance <= 0) return total;
      return total + Math.min(line.removed, distance);
    }, 0);
  }

  el.body.value = `${text.slice(0, range.start)}${replacement}${text.slice(range.end)}`;
  el.body.setSelectionRange(selectionStart - removedBefore(selectionStart), selectionEnd - removedBefore(selectionEnd));
  return true;
}

function indentSelection(direction) {
  return direction < 0 ? deindentSelectedLines() : indentSelectedLines();
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.left = "-1000px";
  document.body.append(textarea);
  textarea.select();
  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  if (!fallbackCopyText(text)) {
    throw new Error("copy failed");
  }
}

function setCodeCopyButtonState(button, label) {
  button.textContent = label;
  clearTimeout(button._resetTimer);
  button._resetTimer = setTimeout(() => {
    button.textContent = "Copy";
  }, 1400);
}

// Preview of a #list note: entries become checkbox items, tag lines stay as they are.
function renderChecklist(markdown) {
  const blocks = [];
  let items = [];
  const flushItems = () => {
    if (items.length) blocks.push(`<ul class="checklist">${items.join("")}</ul>`);
    items = [];
  };

  markdown.split("\n").forEach((line, index) => {
    if (!line.trim()) {
      flushItems();
      return;
    }
    if (!isChecklistEntry(line)) {
      flushItems();
      blocks.push(`<p>${renderInline(line.trim())}</p>`);
      return;
    }
    const checked = CHECKED_LINE.exec(line);
    const entry = (checked ? checked[2] : line).trim().replace(/^[-*]\s+/, "");
    items.push(
      `<li class="checklist-item${checked ? " checked" : ""}"><label>` +
        `<input class="checklist-box" type="checkbox" data-line="${index}"${checked ? " checked" : ""}${el.body.readOnly ? " disabled" : ""}>` +
        `<span>${renderInline(entry)}</span></label></li>`
    );
  });
  flushItems();
  return blocks.join("");
}

function renderPreview() {
  el.previewContent.innerHTML = isChecklistText(el.body.value) ? renderChecklist(el.body.value) : renderMarkdown(el.body.value);
  highlightElement(el.previewContent, searchTerms());
  requestAnimationFrame(syncPreviewScrollFromEditor);
}

async function loadSettings() {
  const settings = normalizeSettings(await request("/api/config"));
  state.settings = settings;
  applyEditorFont(settings);
  applyFontSize(settings.font_size);
  applyCodeFontSize(settings.code_font_size);
  applyEditorCursorType(settings.cursor_type);
  applyTagPillStyle(settings.tag_pill_style);
  applyEditorLineNumbers(settings.editor_line_numbers);
  applyFocusEffectControls(settings);
  applySettingsControls(settings);
  applySchedule({ initial: true });
}

async function saveSettings(patch, { manualTheme = false, scheduleChanged = false } = {}) {
  const settings = normalizeSettings(await request("/api/config", {
    method: "PATCH",
    body: JSON.stringify(patch),
  }));
  state.settings = settings;
  applyEditorFont(settings);
  applyFontSize(settings.font_size);
  applyCodeFontSize(settings.code_font_size);
  applyEditorCursorType(settings.cursor_type);
  applyTagPillStyle(settings.tag_pill_style);
  applyEditorLineNumbers(settings.editor_line_numbers);
  applyFocusEffectControls(settings);
  applySettingsControls(settings);

  if (manualTheme) {
    const scheduled = scheduledThemeState(settings);
    state.manualThemeOverrideBoundary = scheduled?.boundary || null;
    state.lastScheduleBoundary = scheduled?.boundary || null;
    applyTheme(settings.theme);
    return;
  }

  if (scheduleChanged) {
    state.manualThemeOverrideBoundary = null;
    applySchedule({ force: true });
  } else {
    applySchedule();
  }
}

function saveScheduleSettings() {
  return saveSettings(
    {
      theme_schedule: el.themeSchedule.value,
      sunrise_time: el.sunriseTime.value,
      sunrise_theme: el.sunriseTheme.value,
      sunset_time: el.sunsetTime.value,
      sunset_theme: el.sunsetTheme.value,
      sun_latitude: normalizeCoordinate(el.sunLatitude.value, 90),
      sun_longitude: normalizeCoordinate(el.sunLongitude.value, 180),
    },
    { scheduleChanged: true },
  );
}

function startScheduleTimer() {
  clearInterval(state.scheduleTimer);
  state.scheduleTimer = setInterval(() => applySchedule(), SCHEDULE_POLL_MS);
}

async function loadNotes() {
  const query = el.search.value.trim();
  state.notes = await request(query ? `/api/search?q=${encodeURIComponent(query)}` : "/api/notes");
  renderList();
}

async function selectNote(id) {
  if (state.conflict && state.selected?.id !== id) {
    setError('Choose "Keep mine" or "Use theirs" first.');
    return;
  }
  try {
    await flushAutosave();
    const note = await request(`/api/notes/${id}`);
    state.dirty = false;
    setStatus("Ready");
    setError("");
    renderEditor(note);
    placeEditorCursorAtStart();
    setDrawerOpen(false);
    rememberLastNote(note.id);
  } catch (error) {
    setError(error.message);
  }
}

async function newNote() {
  if (state.conflict) {
    setError('Choose "Keep mine" or "Use theirs" first.');
    return;
  }
  try {
    await flushAutosave();
    state.dirty = false;
    setStatus("New Note");
    setError("");
    renderEditor(emptyNote());
    placeTitleCursorAtStart();
    setDrawerOpen(false);
  } catch (error) {
    setError(error.message);
  }
}

async function persistNote({ force = false } = {}) {
  clearAutosaveTimer();
  // A clash with someone else's change waits for "Keep mine" / "Use theirs" before anything is saved.
  if (state.conflict) return state.selected;
  // Every real edit happens on a loaded note (a new one has a client_id); see markDirty.
  if (!state.selected) {
    state.dirty = false;
    return null;
  }
  if (state.savePromise) {
    await state.savePromise;
    if (!state.dirty) return state.selected;
  }

  const note = noteFromInputs();
  const snapshot = noteSnapshot(note);
  if (snapshot === state.lastSavedSnapshot && !(force && !note.id)) {
    state.dirty = false;
    setStatus(note.id ? "Saved" : "New Note");
    return state.selected;
  }
  if (!force && !hasMeaningfulContent(note)) {
    state.dirty = false;
    state.lastSavedSnapshot = snapshot;
    setStatus("New Note");
    return state.selected;
  }

  setStatus("Saving...");
  const savePromise = request(note.id ? `/api/notes/${note.id}` : "/api/notes", {
    method: note.id ? "PUT" : "POST",
    body: JSON.stringify(
      note.id
        ? { title: note.title, body: note.body, base_version: state.base?.version ?? null }
        : { title: note.title, body: note.body, client_id: note.client_id },
    ),
  });
  state.savePromise = savePromise;

  try {
    const saved = await savePromise;
    state.selected = saved;
    setSyncBase(saved);
    rememberLastNote(saved.id);
    state.lastSavedSnapshot = noteSnapshot(saved);
    renderTagPills(el.titleTags, saved.tags || [], jumpToTag);
    el.del.disabled = !saved.id;
    el.export.disabled = !saved.id;
    el.shareButton.disabled = !saved.id || sharedWithMe(saved);
    setError("");
    await loadNotes();
    if (noteSnapshot(noteFromInputs()) === state.lastSavedSnapshot) {
      state.dirty = false;
      setStatus("Saved");
    } else {
      state.dirty = true;
      setStatus("Unsaved");
      scheduleAutosave();
    }
    return saved;
  } catch (error) {
    if (error.status === 409 && error.body?.note) {
      // Someone saved a newer version since this edit started: merge, or ask when both changed the same lines.
      handleVersionConflict(error.body.note);
      return state.selected;
    }
    setStatus("Save failed");
    if (sharedWithMe(state.selected) && (error.status === 403 || error.status === 404)) {
      // The owner stopped sharing or made it view only: keep the text on screen to copy, stop saving.
      error.message =
        error.status === 404
          ? "This note is no longer shared with you. Your text is still here to copy."
          : "This note is view only now. Your text is still here to copy.";
      state.dirty = false;
      el.body.readOnly = true;
      el.title.readOnly = true;
      el.body.parentElement.classList.add("read-only");
      loadNotes().catch(() => null);
    }
    setError(error.message);
    throw error;
  } finally {
    if (state.savePromise === savePromise) {
      state.savePromise = null;
    }
  }
}

async function saveNote() {
  try {
    await persistNote({ force: true });
  } catch (error) {
    setError(error.message);
  }
}

function openDeleteModal() {
  if (!state.selected?.id) return;
  const shared = sharedWithMe(state.selected);
  el.deleteTitle.textContent = shared ? "Remove from my notes?" : "Delete note?";
  el.deleteConfirm.textContent = shared ? "Remove" : "Delete";
  el.deleteMessage.textContent = shared
    ? `"${state.selected.title}" stays with ${state.selected.owner_email}; it's only removed from your notes.`
    : `Delete "${state.selected.title}"?`;
  el.deleteModal.hidden = false;
  requestAnimationFrame(() => el.deleteCancel.focus({ preventScroll: true }));
}

function closeDeleteModal() {
  if (state.deletePending) return;
  el.deleteModal.hidden = true;
}

async function confirmDeleteNote() {
  if (!state.selected?.id || state.deletePending) return;
  state.deletePending = true;
  el.deleteConfirm.disabled = true;
  el.deleteCancel.disabled = true;
  try {
    clearAutosaveTimer();
    if (state.savePromise) {
      await state.savePromise.catch(() => null);
    }
    const shared = sharedWithMe(state.selected);
    await request(`/api/notes/${state.selected.id}`, { method: "DELETE" });
    state.dirty = false;
    setStatus(shared ? "Removed" : "Deleted");
    el.deleteModal.hidden = true;
    renderEditor(emptyNote());
    await loadNotes();
  } catch (error) {
    setError(error.message);
  } finally {
    state.deletePending = false;
    el.deleteConfirm.disabled = false;
    el.deleteCancel.disabled = false;
  }
}

// Share dialog (owner only): add people by email, change their permission, or stop sharing.
function setShareError(message) {
  el.shareError.hidden = !message;
  el.shareError.textContent = message || "";
}

function renderShares(shares) {
  if (state.selected) state.selected.share_count = shares.length;
  if (!shares.length) {
    const empty = document.createElement("li");
    empty.className = "share-empty";
    empty.textContent = "Not shared with anyone yet.";
    el.shareList.replaceChildren(empty);
    return;
  }
  el.shareList.replaceChildren(
    ...shares.map((share) => {
      const row = document.createElement("li");
      row.className = "share-row";
      const email = document.createElement("span");
      email.className = "share-email";
      email.textContent = share.email;
      email.title = share.email;
      const permission = document.createElement("select");
      permission.setAttribute("aria-label", `Permission for ${share.email}`);
      permission.append(new Option("Can edit", "edit"), new Option("Can view", "view"));
      permission.value = share.permission;
      permission.addEventListener("change", () =>
        changeShares(`/${share.user_id}`, { method: "PATCH", body: JSON.stringify({ permission: permission.value }) })
      );
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "share-remove";
      remove.textContent = "×";
      remove.title = `Stop sharing with ${share.email}`;
      remove.setAttribute("aria-label", `Stop sharing with ${share.email}`);
      remove.addEventListener("click", () => changeShares(`/${share.user_id}`, { method: "DELETE" }));
      row.append(email, permission, remove);
      return row;
    })
  );
}

async function changeShares(path, options = {}) {
  const noteId = state.selected?.id;
  if (!noteId) return false;
  try {
    setShareError("");
    renderShares(await request(`/api/notes/${noteId}/shares${path}`, options));
    loadNotes().catch(() => null);
    return true;
  } catch (error) {
    setShareError(error.message);
    return false;
  }
}

async function openShareModal() {
  if (!state.selected?.id || sharedWithMe(state.selected)) return;
  await flushAutosave().catch(() => null);
  setShareError("");
  el.shareEmail.value = "";
  el.sharePermission.value = "edit";
  el.shareList.replaceChildren();
  el.shareModal.hidden = false;
  requestAnimationFrame(() => el.shareEmail.focus({ preventScroll: true }));
  await changeShares("");
}

function closeShareModal() {
  el.shareModal.hidden = true;
}

async function submitShare(event) {
  event.preventDefault();
  const shared = await changeShares("", {
    method: "POST",
    body: JSON.stringify({ email: el.shareEmail.value.trim(), permission: el.sharePermission.value }),
  });
  if (shared) el.shareEmail.value = "";
}

async function exportNote() {
  if (!state.selected?.id) return;
  try {
    await flushAutosave();
    if (!state.selected?.id) return;
    window.location.href = `/api/export-markdown/${state.selected.id}`;
  } catch (error) {
    setError(error.message);
  }
}

async function importMarkdown(file) {
  if (!file) return;
  const form = new FormData();
  form.append("file", file);
  try {
    await flushAutosave();
    const note = await request("/api/import-markdown", { method: "POST", body: form });
    state.dirty = false;
    setStatus("Imported");
    renderEditor(note);
    rememberLastNote(note.id);
    await loadNotes();
  } catch (error) {
    setError(error.message);
  } finally {
    el.importInput.value = "";
  }
}

let searchTimer = null;
el.search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  renderList();
  renderPreview();
  searchTimer = setTimeout(() => loadNotes().catch((error) => setError(error.message)), 160);
});
el.previewContent.addEventListener("change", (event) => {
  const box = event.target.closest(".checklist-box");
  if (box) toggleChecklistLine(Number.parseInt(box.dataset.line, 10));
});
el.previewContent.addEventListener("click", (event) => {
  const button = event.target.closest(".code-copy-button");
  if (!button) return;
  const code = state.previewCodeBlocks[Number.parseInt(button.dataset.codeIndex, 10)];
  if (code === undefined) return;
  copyText(code)
    .then(() => setCodeCopyButtonState(button, "Copied"))
    .catch(() => setCodeCopyButtonState(button, "Failed"));
});
el.title.addEventListener("input", markDirty);
el.title.addEventListener("keydown", (event) => {
  if (event.key !== "Tab" || event.shiftKey) return;
  event.preventDefault();
  el.body.focus({ preventScroll: true });
});
el.body.addEventListener("input", (event) => {
  captureFocusLetterInput(event);
  markDirty();
  renderPreview();
  renderEditorLineNumbers();
  scheduleEditorCursorUpdate();
});
el.body.addEventListener("keydown", (event) => {
  // View-only notes: the shortcuts below edit the text directly, so leave keys to the browser.
  if (el.body.readOnly) return;
  if (event.key === "Tab" && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    clearFocusLetterInput();
    const changed = indentSelection(event.shiftKey ? -1 : 1);
    if (!changed) return;
    markDirty();
    renderPreview();
    el.body.focus({ preventScroll: true });
    scheduleEditorCursorUpdate();
    return;
  }
  if (event.ctrlKey && event.altKey && !event.shiftKey && event.key.toLowerCase() === "d") {
    event.preventDefault();
    clearFocusLetterInput();
    duplicateSelectionOrLine();
    markDirty();
    renderPreview();
    el.body.focus({ preventScroll: true });
    scheduleEditorCursorUpdate();
    return;
  }
  if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) {
    clearFocusLetterInput();
  }
  if (!event.shiftKey || !event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
  event.preventDefault();
  clearFocusLetterInput();
  const moved = moveSelectedLines(event.key === "ArrowUp" ? -1 : 1);
  if (!moved) return;
  markDirty();
  renderPreview();
  el.body.focus({ preventScroll: true });
  scheduleEditorCursorUpdate();
});
el.body.addEventListener("keydown", scheduleEditorCursorUpdate);
el.body.addEventListener("keyup", scheduleEditorCursorUpdate);
el.body.addEventListener("click", () => {
  clearFocusLetterInput();
  scheduleEditorCursorUpdate();
});
el.body.addEventListener("select", () => {
  if (el.body.selectionStart !== el.body.selectionEnd || state.focusLetterInput?.cursor !== el.body.selectionStart) {
    clearFocusLetterInput();
  }
  scheduleEditorCursorUpdate();
});
el.body.addEventListener("focus", scheduleEditorCursorUpdate);
el.body.addEventListener("blur", () => {
  hideEditorCursor();
  hideEditorFocusEffects();
  // Hides the checklist's remove "×", which only shows on the line with the caret.
  scheduleEditorCursorUpdate();
});
el.body.addEventListener("scroll", () => {
  renderEditorLineNumbers();
  syncPreviewScrollFromEditor();
  scheduleEditorCursorUpdate();
});
el.create.addEventListener("click", newNote);
el.del.addEventListener("click", openDeleteModal);
el.shareButton.addEventListener("click", () => openShareModal().catch((error) => setError(error.message)));
el.shareForm.addEventListener("submit", submitShare);
el.shareClose.addEventListener("click", closeShareModal);
el.conflictKeep.addEventListener("click", keepMyVersion);
el.conflictTheirs.addEventListener("click", () => useTheirVersion().catch((error) => setError(error.message)));
el.export.addEventListener("click", exportNote);
el.importButton.addEventListener("click", () => el.importInput.click());
el.sidebarToggle.addEventListener("click", () => {
  if (PHONE_LAYOUT.matches) {
    setDrawerOpen(false);
    return;
  }
  hideNoteHoverCard();
  hideProfileMenu();
  state.sidebarCollapsed = !state.sidebarCollapsed;
  applySidebarState();
  saveSidebarState();
  scheduleEditorCursorUpdate();
});
el.drawerButton.addEventListener("click", () => setDrawerOpen(!state.drawerOpen));
el.app.addEventListener("click", (event) => {
  // Clicks on the drawer backdrop (the .app::after overlay) target the app shell itself.
  if (event.target === el.app && state.drawerOpen) setDrawerOpen(false);
});
el.app.addEventListener("pointerdown", (event) => {
  if (!PHONE_LAYOUT.matches || !state.drawerOpen || !event.isPrimary) return;
  const startX = event.clientX;
  const startY = event.clientY;
  const startTime = performance.now();
  const width = el.sidebar.offsetWidth || 1;
  let offset = 0;
  let dragging = false;

  const move = (moveEvent) => {
    const dx = moveEvent.clientX - startX;
    const dy = moveEvent.clientY - startY;
    if (!dragging) {
      if (Math.abs(dx) < DRAWER_SWIPE_SLOP || Math.abs(dx) < Math.abs(dy)) return;
      dragging = true;
      el.app.classList.add("drawer-dragging");
    }
    offset = Math.min(0, dx);
    el.sidebar.style.transform = `translateX(${offset}px)`;
    el.app.style.setProperty("--drawer-progress", String(1 + offset / width));
  };

  const stop = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);
    window.removeEventListener("pointercancel", stop);
    if (!dragging) return;
    // Swallow the click that follows a drag so it doesn't open a note or hit the backdrop.
    const swallowClick = (clickEvent) => clickEvent.stopPropagation();
    window.addEventListener("click", swallowClick, { capture: true, once: true });
    setTimeout(() => window.removeEventListener("click", swallowClick, { capture: true }), 100);
    // Re-enable transitions before clearing the inline offset so the drawer animates to its resting place.
    el.app.classList.remove("drawer-dragging");
    void el.sidebar.offsetWidth;
    el.sidebar.style.removeProperty("transform");
    el.app.style.removeProperty("--drawer-progress");
    const flick = offset < -DRAWER_FLICK_DISTANCE && performance.now() - startTime < DRAWER_FLICK_MS;
    if (offset < -width / 3 || flick) setDrawerOpen(false);
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop);
  window.addEventListener("pointercancel", stop);
});
PHONE_LAYOUT.addEventListener("change", () => {
  state.drawerOpen = false;
  applySidebarState();
  scheduleEditorCursorUpdate();
});
el.brandMain.addEventListener("click", () => {
  if (!state.sidebarCollapsed || PHONE_LAYOUT.matches) return;
  state.sidebarCollapsed = false;
  applySidebarState();
  saveSidebarState();
  scheduleEditorCursorUpdate();
});
el.sidebarResizer.addEventListener("pointerdown", (event) => {
  if (state.sidebarCollapsed) return;
  event.preventDefault();
  const startX = event.clientX;
  const startWidth = state.sidebarWidth;
  el.app.classList.add("resizing");
  el.sidebarResizer.setPointerCapture(event.pointerId);

  const resize = (moveEvent) => {
    state.sidebarWidth = clamp(startWidth + moveEvent.clientX - startX, SIDEBAR_MIN, SIDEBAR_MAX);
    applySidebarState();
    scheduleEditorCursorUpdate();
  };

  const stop = () => {
    el.app.classList.remove("resizing");
    saveSidebarState();
    el.sidebarResizer.removeEventListener("pointermove", resize);
    el.sidebarResizer.removeEventListener("pointerup", stop);
    el.sidebarResizer.removeEventListener("pointercancel", stop);
  };

  el.sidebarResizer.addEventListener("pointermove", resize);
  el.sidebarResizer.addEventListener("pointerup", stop);
  el.sidebarResizer.addEventListener("pointercancel", stop);
});
el.previewResizer.addEventListener("pointerdown", (event) => {
  if (!state.preview) return;
  event.preventDefault();
  const startX = event.clientX;
  const startWidth = state.previewWidth;
  el.editorGrid.classList.add("resizing-preview");
  el.previewResizer.setPointerCapture(event.pointerId);

  const resize = (moveEvent) => {
    state.previewWidth = clampPreviewWidth(startWidth - (moveEvent.clientX - startX));
    applyPreviewState();
    scheduleEditorCursorUpdate();
  };

  const stop = () => {
    el.editorGrid.classList.remove("resizing-preview");
    savePreviewState();
    el.previewResizer.removeEventListener("pointermove", resize);
    el.previewResizer.removeEventListener("pointerup", stop);
    el.previewResizer.removeEventListener("pointercancel", stop);
  };

  el.previewResizer.addEventListener("pointermove", resize);
  el.previewResizer.addEventListener("pointerup", stop);
  el.previewResizer.addEventListener("pointercancel", stop);
});
el.preview.addEventListener("pointerdown", (event) => {
  if (!PREVIEW_SHEET.matches || !state.previewSheetOpen || !event.isPrimary) return;
  if (!event.target.closest(".preview-handle, .preview-label")) return;
  event.preventDefault();
  const startY = event.clientY;
  const startTime = performance.now();
  // The sheet can be pulled all the way to the top of the screen, over the toolbar.
  const maxHeight = window.innerHeight;
  let height = el.preview.offsetHeight;
  el.editorGrid.classList.add("preview-sheet-dragging");
  try {
    el.preview.setPointerCapture(event.pointerId);
  } catch {
    // Capture is a nicety; the drag still follows pointer events on the sheet.
  }

  const move = (moveEvent) => {
    height = clamp(window.innerHeight - moveEvent.clientY, 0, maxHeight);
    el.editorGrid.style.setProperty("--sheet-height", `${height}px`);
  };

  const stop = (stopEvent) => {
    el.preview.removeEventListener("pointermove", move);
    el.preview.removeEventListener("pointerup", stop);
    el.preview.removeEventListener("pointercancel", stop);
    el.editorGrid.classList.remove("preview-sheet-dragging");
    const flickDown = stopEvent.clientY - startY > DRAWER_FLICK_DISTANCE && performance.now() - startTime < DRAWER_FLICK_MS;
    if (flickDown || height < window.innerHeight * PREVIEW_SHEET_CLOSE_RATIO) {
      setPreviewSheetOpen(false);
      return;
    }
    // Snap to whichever resting height is closer: the default sheet or the full screen.
    const defaultHeight = window.innerHeight * PREVIEW_SHEET_DEFAULT_RATIO;
    const full = Math.abs(height - defaultHeight) > Math.abs(height - maxHeight);
    el.editorGrid.classList.toggle("preview-sheet-full", full);
    if (full) {
      el.editorGrid.style.setProperty("--sheet-height", "100dvh");
    } else {
      el.editorGrid.style.removeProperty("--sheet-height");
    }
  };

  el.preview.addEventListener("pointermove", move);
  el.preview.addEventListener("pointerup", stop);
  el.preview.addEventListener("pointercancel", stop);
});
PREVIEW_SHEET.addEventListener("change", () => setPreviewSheetOpen(false));
el.previewButton.addEventListener("click", () => {
  if (PREVIEW_SHEET.matches) {
    setPreviewSheetOpen(!state.previewSheetOpen);
    return;
  }
  const scrollTop = el.body.scrollTop;
  const scrollLeft = el.body.scrollLeft;
  const selectionStart = el.body.selectionStart;
  const selectionEnd = el.body.selectionEnd;
  state.preview = !state.preview;
  el.editorGrid.classList.toggle("editor-only", !state.preview);
  applyPreviewState();
  const restoreEditorViewport = () => {
    el.body.setSelectionRange(selectionStart, selectionEnd);
    el.body.scrollTop = scrollTop;
    el.body.scrollLeft = scrollLeft;
  };
  restoreEditorViewport();
  requestAnimationFrame(() => {
    restoreEditorViewport();
    syncPreviewScrollFromEditor();
    requestAnimationFrame(() => {
      restoreEditorViewport();
      syncPreviewScrollFromEditor();
    });
  });
});
window.addEventListener("resize", () => {
  hideNoteHoverCard();
  hideProfileMenu();
  applyPreviewState();
  scheduleEditorCursorUpdate();
  requestAnimationFrame(syncPreviewScrollFromEditor);
});
if ("ResizeObserver" in window) {
  const editorResizeObserver = new ResizeObserver(scheduleEditorCursorUpdate);
  editorResizeObserver.observe(el.body);
  editorResizeObserver.observe(el.editorGrid);
}
el.noteList.addEventListener("scroll", hideNoteHoverCard, { passive: true });
el.profileButton.addEventListener("mouseenter", showProfileMenu);
el.profileButton.addEventListener("mouseleave", scheduleProfileMenuHide);
el.profileButton.addEventListener("focus", showProfileMenu);
el.profileButton.addEventListener("click", showProfileMenu);
el.profileMenu.addEventListener("mouseenter", showProfileMenu);
el.profileMenu.addEventListener("mouseleave", scheduleProfileMenuHide);
el.profileMenu.addEventListener("focusin", showProfileMenu);
el.profileMenu.addEventListener("focusout", (event) => {
  if (!el.profileShell.contains(event.relatedTarget)) scheduleProfileMenuHide();
});
el.settingsButton.addEventListener("click", openSettingsModal);
el.settingsClose.addEventListener("click", () => {
  el.settingsModal.hidden = true;
});
el.settingsModal.addEventListener("click", (event) => {
  if (event.target === el.settingsModal) el.settingsModal.hidden = true;
});
for (const button of el.settingsNavButtons) {
  button.addEventListener("click", () => {
    showSettingsSection(button.dataset.settingsSection);
    if (button.dataset.settingsSection === "admin") {
      loadAdmin().catch((error) => setError(error.message));
    } else if (button.dataset.settingsSection === "users") {
      loadUsers().catch((error) => setError(error.message));
    } else if (button.dataset.settingsSection === "security") {
      loadTotpStatus().catch((error) => setError(error.message));
    }
  });
}
el.deleteModal.addEventListener("click", (event) => {
  if (event.target === el.deleteModal) closeDeleteModal();
});
el.deleteCancel.addEventListener("click", closeDeleteModal);
el.deleteConfirm.addEventListener("click", confirmDeleteNote);
el.userDeleteModal.addEventListener("click", (event) => {
  if (event.target === el.userDeleteModal) closeUserDeleteModal();
});
el.userDeleteCancel.addEventListener("click", closeUserDeleteModal);
el.userDeleteConfirm.addEventListener("click", confirmDeleteUser);
window.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.altKey && !event.shiftKey && event.key.toLowerCase() === "z" && state.user) {
    event.preventDefault();
    toggleZenMode();
    return;
  }
  if (event.key !== "Escape") return;
  if (!el.userDeleteModal.hidden) {
    closeUserDeleteModal();
  } else if (!el.deleteModal.hidden) {
    closeDeleteModal();
  } else if (!el.shareModal.hidden) {
    closeShareModal();
  } else if (!el.settingsModal.hidden) {
    el.settingsModal.hidden = true;
  } else if (!el.profileMenu.hidden) {
    hideProfileMenu();
  } else if (state.drawerOpen) {
    setDrawerOpen(false);
  } else if (state.previewSheetOpen) {
    setPreviewSheetOpen(false);
  } else if (state.zenMode) {
    setZenMode(false);
  }
});
el.theme.addEventListener("change", () => saveSettings({ theme: el.theme.value }, { manualTheme: true }).catch((error) => setError(error.message)));
el.font.addEventListener("change", () => saveSettings({ font: el.font.value }).catch((error) => setError(error.message)));
el.customFont.addEventListener("change", () => saveSettings({ custom_font: el.customFont.value }).catch((error) => setError(error.message)));
el.fontSize.addEventListener("input", () => applyFontSize(el.fontSize.value));
el.fontSize.addEventListener("change", () => saveSettings({ font_size: el.fontSize.value }).catch((error) => setError(error.message)));
el.codeFontSize.addEventListener("input", () => applyCodeFontSize(el.codeFontSize.value));
el.codeFontSize.addEventListener("change", () => saveSettings({ code_font_size: el.codeFontSize.value }).catch((error) => setError(error.message)));
el.cursorType.addEventListener("change", () => saveSettings({ cursor_type: el.cursorType.value }).catch((error) => setError(error.message)));
el.tagPillStyle.addEventListener("change", () => saveSettings({ tag_pill_style: el.tagPillStyle.value }).catch((error) => setError(error.message)));
el.editorLineNumbersInput.addEventListener("change", () => {
  state.settings = {
    ...state.settings,
    editor_line_numbers: el.editorLineNumbersInput.checked,
  };
  applyEditorLineNumbers(el.editorLineNumbersInput.checked);
  saveSettings({ editor_line_numbers: el.editorLineNumbersInput.checked }).catch((error) => setError(error.message));
});
el.startNote.addEventListener("change", () => saveSettings({ start_note: el.startNote.value }).catch((error) => setError(error.message)));
el.focusLetterEffect.addEventListener("change", () => {
  state.settings = {
    ...state.settings,
    focus_letter_effect: el.focusLetterEffect.checked,
  };
  applyFocusEffectControls({
    focus_letter_effect: el.focusLetterEffect.checked,
  });
  saveSettings({ focus_letter_effect: el.focusLetterEffect.checked }).catch((error) => setError(error.message));
});
el.sunriseTime.addEventListener("change", () => saveScheduleSettings().catch((error) => setError(error.message)));
el.sunriseTheme.addEventListener("change", () => saveScheduleSettings().catch((error) => setError(error.message)));
el.sunsetTime.addEventListener("change", () => saveScheduleSettings().catch((error) => setError(error.message)));
el.sunsetTheme.addEventListener("change", () => saveScheduleSettings().catch((error) => setError(error.message)));
el.themeSchedule.addEventListener("change", () => saveScheduleSettings().catch((error) => setError(error.message)));
el.sunLatitude.addEventListener("change", () => saveScheduleSettings().catch((error) => setError(error.message)));
el.sunLongitude.addEventListener("change", () => saveScheduleSettings().catch((error) => setError(error.message)));
el.sunLocateButton.addEventListener("click", locateForSunSchedule);
systemDarkQuery?.addEventListener("change", () => applySchedule());
el.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitAuth("/api/auth/setup", el.setupEmail.value, el.setupPassword.value).catch((error) => setAuthError(error.message));
});
el.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitLogin();
});
el.signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitAuth("/api/auth/signup", el.signupEmail.value, el.signupPassword.value, {
    invite_token: state.inviteValid ? state.inviteToken : null,
  }).catch((error) => setAuthError(error.message));
});
el.showSignup.addEventListener("click", () => {
  setAuthError("");
  showAuthMode("signup");
});
el.showLogin.addEventListener("click", () => {
  setAuthError("");
  showAuthMode("login");
});
el.logout.addEventListener("click", () => {
  hideProfileMenu();
  logout();
});
el.totpSetupButton.addEventListener("click", () => startTotpSetup().catch((error) => setError(error.message)));
el.totpEnableButton.addEventListener("click", () => enableTotp().catch((error) => setError(error.message)));
el.totpDisableOpenButton.addEventListener("click", () => {
  el.totpDisablePanel.hidden = false;
  el.totpSetupPanel.hidden = true;
  el.totpDisablePassword.focus({ preventScroll: true });
});
el.totpDisableConfirmButton.addEventListener("click", () => disableTotp().catch((error) => setError(error.message)));
el.signupEnabledInput.addEventListener("change", () => {
  request("/api/admin/signup", {
    method: "PUT",
    body: JSON.stringify({ enabled: el.signupEnabledInput.checked }),
  }).catch((error) => setError(error.message));
});
el.createInvite.addEventListener("click", async () => {
  try {
    const invite = await request("/api/admin/invites", {
      method: "POST",
      body: JSON.stringify({ role: el.inviteRole.value }),
    });
    const link = new URL(window.location.href);
    link.search = "";
    link.hash = "";
    link.searchParams.set("invite", invite.token);
    el.inviteLinkOutput.value = link.toString();
    el.inviteLinkRow.hidden = false;
    await loadUsers();
  } catch (error) {
    setError(error.message);
  }
});
el.userList.addEventListener("click", async (event) => {
  const saveButton = event.target.closest(".save-user");
  const deleteButton = event.target.closest(".delete-user");
  if (!saveButton && !deleteButton) return;
  const row = event.target.closest(".user-row");
  if (deleteButton) {
    openUserDeleteModal(row.dataset.userId, row.dataset.userEmail);
    return;
  }
  try {
    await request(`/api/admin/users/${row.dataset.userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        role: row.querySelector(".user-role").value,
        enabled: row.querySelector(".user-enabled").checked,
      }),
    });
    await loadAdmin();
  } catch (error) {
    setError(error.message);
  }
});
el.inviteList.addEventListener("click", async (event) => {
  const button = event.target.closest(".revoke-invite, .remove-invite");
  if (!button) return;
  const row = button.closest(".admin-row");
  try {
    await request(`/api/admin/invites/${row.dataset.inviteId}`, { method: "DELETE" });
    await loadAdmin();
  } catch (error) {
    setError(error.message);
  }
});
enableThemePreview(el.theme);
enableThemePreview(el.sunriseTheme);
enableThemePreview(el.sunsetTheme);
el.importInput.addEventListener("change", () => importMarkdown(el.importInput.files[0]));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    hideNoteHoverCard();
    hideProfileMenu();
    // Send pending typing now, so another device sees it on its next check.
    flushAutosave().catch(() => null);
    return;
  }
  applySchedule();
  syncNow();
});
window.addEventListener("pagehide", () => flushAutosave().catch(() => null));
document.addEventListener("pointerdown", (event) => {
  if (!el.profileMenu.hidden && !el.profileShell.contains(event.target)) hideProfileMenu();
});
document.addEventListener("selectionchange", () => {
  if (document.activeElement === el.body) scheduleEditorCursorUpdate();
});
window.addEventListener("focus", () => {
  applySchedule();
  syncNow();
});

async function boot() {
  try {
    state.inviteToken = inviteTokenFromUrl();
    state.inviteValid = false;
    const status = await request("/api/auth/status");
    state.setupRequired = status.setup_required;
    state.signupEnabled = status.signup_enabled;
    const buildInfo = document.querySelector("#build-info");
    if (buildInfo) {
      buildInfo.textContent = `Clack Notes · ${status.version || "dev"}`;
      if (status.built) {
        // Own line in the side panel, joined with " · " on phones (see .build-date).
        const date = document.createElement("span");
        date.className = "build-date";
        date.textContent = `built ${status.built.slice(0, 10)}`;
        buildInfo.append(date);
      }
    }
    if (state.setupRequired) {
      showAuthMode("setup");
      return;
    }
    try {
      const auth = await request("/api/auth/me");
      await enterApp(auth);
      return;
    } catch (error) {
      if (error.status !== 401) throw error;
    }
    if (state.inviteToken) {
      try {
        await request(`/api/auth/invite/${encodeURIComponent(state.inviteToken)}`);
        state.inviteValid = true;
        showAuthMode("signup");
      } catch (error) {
        state.inviteValid = false;
        setAuthError(error.message);
        showAuthMode("login");
      }
      return;
    }
    showAuthMode("login");
  } catch (error) {
    setAuthError(error.message);
  }
}

boot();
