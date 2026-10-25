# Clack Notes

Local browser notes app. Plain HTML, CSS, and JavaScript frontend. Python FastAPI backend. SQLite storage.

## Run

```bash
uv run uvicorn main:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

`uv run` creates/syncs the virtual environment from `pyproject.toml` before starting server.

## Docker

Every push to `main` runs the tests on GitHub Actions and, if they pass,
publishes an image to `ghcr.io/afronin/clacknotes`. Unraid pulls that image,
so updating is a button in the Docker tab instead of a rebuild.

Image tags:

- `latest`: newest build from `main`.
- `sha-1a2b3c4`: every build, by commit. Use these to roll back.
- `1.2.0` and `1.2`: builds from version tags (`v1.2.0`).

Settings → Appearance shows which build is running, e.g.
`Clack Notes · sha-1a2b3c4 · built 2026-10-25`.

### Install on Unraid

Download the template once (Unraid terminal):

```bash
wget -O /boot/config/plugins/dockerMan/templates-user/my-clacknotes.xml https://raw.githubusercontent.com/AFROnin/clacknotes/main/unraid/clacknotes.xml
```

Then Docker → Add Container → Template: *clacknotes*. Fill in **Allowed hosts**
(see [Allowed hosts](#allowed-hosts)), check the port and data path, and click
Apply.

- **Port:** host port `8010` maps to the app's port `8000`. Use any free host
  port.
- **Network:** `proxynet`. If Nginx Proxy Manager runs on `proxynet`, proxy to
  `http://clacknotes:8000`; if it proxies through the Unraid host, proxy to
  `http://UNRAID_IP:8010`.
- **Data:** `/mnt/cache/appdata/clacknotes/data` → `/app/data`. See
  [Data and backups](#data-and-backups).

### Moving from a locally built container

1. Stop the old `clacknotes` container and copy its `data` folder somewhere
   safe.
2. Remove the old container (Docker tab → clacknotes → Remove). The `data`
   folder stays on disk. The old source folder in appdata is no longer needed
   once the new container works.
3. Install from the template as above. Point **Data** at the existing folder:
   either keep its current path (e.g. `/mnt/user/appdata/clacknotes/data`) or
   move the folder to `/mnt/cache/appdata/clacknotes/data` first.
4. Put the hostnames from the old `.env` into **Allowed hosts**. The template
   sets each variable directly; there is no `.env` file anymore.
5. Open the app: your notes and accounts are there. Settings shows the build.

### Updating

Docker tab → **Check for Updates** → **Apply Update** on clacknotes. Unraid
pulls the new image and recreates the container with the same settings. Notes
stay in the `data` folder; the app adds any new database columns itself on
start.

To update automatically, install the *CA Auto Update Applications* plugin and
schedule it for clacknotes.

To roll back, edit the container and change **Repository** to an older tag,
e.g. `ghcr.io/afronin/clacknotes:sha-1a2b3c4` (tags are listed on the GitHub
package page). Set it back to `:latest` to follow updates again.

### Releasing

- Push to `main`: tests run, then `latest` and `sha-…` are published (about
  2–3 minutes; see the repo's Actions tab).
- For a named version, tag and push: `git tag v1.2.0` then
  `git push origin v1.2.0`.
- The workflow can also be started by hand: Actions → *Test and publish image*
  → Run workflow.

### Data and backups

The SQLite database lives in the mounted `data` folder. On Unraid, prefer a
path on the cache pool (`/mnt/cache/...`) or an exclusive share over
`/mnt/user/...`. The `/mnt/user` FUSE layer is slow at file locking, which
makes SQLite report "database is locked" under load. The app enables WAL mode
when the filesystem allows it, so the folder can also contain
`notes.sqlite3-wal` and `notes.sqlite3-shm` while it runs.

Back up the whole folder, ideally with the container stopped, and do so before
applying an update.

The image starts Uvicorn with access logs disabled and log level `warning`, so
Docker logs do not include one line per API request.

### Build the image yourself

```bash
docker build -t clacknotes .
```

The build installs exactly the versions in `uv.lock`.

### Remove duplicate notes

Older versions could save a new note twice when a save response got lost.
List exact duplicates (same title and text) without changing anything:

```bash
docker exec clacknotes uv run python scripts/dedupe_notes.py
```

Then delete the extra copies, keeping the oldest of each. A backup
`notes.backup-<time>.sqlite3` is written next to the database first:

```bash
docker exec clacknotes uv run python scripts/dedupe_notes.py --apply
```

### Allowed hosts

Environment variables (template fields in Unraid):

```text
CLACK_ALLOWED_HOSTS=notes.example.com,192.168.1.10,tower,localhost,127.0.0.1
CLACK_TOTP_ISSUER=Clack Notes
CLACK_AUTH_RATE_LIMIT_ATTEMPTS=8
CLACK_AUTH_RATE_LIMIT_WINDOW_SECONDS=300
```

Replace `notes.example.com`, `192.168.1.10`, and `tower` with every hostname
or IP you use to open Clack Notes. `TrustedHostMiddleware` rejects any other
`Host` header with `Invalid host header`. Use bare hosts only, no scheme and no
port. If `CLACK_ALLOWED_HOSTS` is empty, every host is accepted, so set it for
anything reachable from outside.

For Cloudflare, keep this list strict:

```text
CLACK_ALLOWED_HOSTS=notes.example.com,192.168.1.10,tower
```

Do not use `*` for internet exposure unless another layer blocks every direct
origin request and fully controls `Host`. Cloudflare region blocking filters
visitors, but it does not make arbitrary `Host` headers safe at app layer.

Proxy must send `X-Forwarded-Proto: https` so session cookie gets `Secure`.

## Features

- Create, list, read, edit, delete notes
- Search title and body
- Markdown textarea and preview
- Theme setting: `plain`, `gruvbox`, `tokyonight`, `catppuccin`, `nord`
- Editor font setting
- Import Markdown file
- Export note as Markdown file

## Storage

SQLite database is generated at:

```text
data/notes.sqlite3
```

Markdown import/export uses:

```markdown
---
title: Example
date: 2026-07-07
created_at: 2026-07-07T00:00:00Z
updated_at: 2026-07-07T00:00:00Z
---
Body text.
```
