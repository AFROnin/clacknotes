FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app

# Exactly the library versions in uv.lock, so every build gets the same dependencies.
COPY pyproject.toml uv.lock ./
RUN uv sync --no-dev --frozen

COPY . .

# Which build this is (set by the GitHub workflow); shown in Settings.
ARG CLACK_VERSION=dev
ARG CLACK_BUILT=
ENV CLACK_VERSION=${CLACK_VERSION} \
    CLACK_BUILT=${CLACK_BUILT}

EXPOSE 8000

CMD ["uv", "run", "--frozen", "--no-dev", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*", "--no-access-log", "--log-level", "warning"]
