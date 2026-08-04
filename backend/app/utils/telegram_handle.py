import re

# Telegram's own rule: 5–32 chars, letters/digits/underscore, must start with a
# letter. Stored without the @ so links can be built from it directly.
HANDLE_RE = re.compile(r"^[A-Za-z][A-Za-z0-9_]{4,31}$")

ERROR_MESSAGE = "Enter a Telegram username like @itstek (5–32 letters, digits or _)"


def normalize_telegram_handle(raw: str | None) -> str | None:
    """Accept @name, t.me/name or a bare name. Blank means 'not given'."""
    if raw is None:
        return None

    value = raw.strip()
    if not value:
        return None

    value = re.sub(r"^(https?://)?(www\.)?(t\.me|telegram\.me)/", "", value, flags=re.I)
    value = value.lstrip("@").strip()

    if not HANDLE_RE.match(value):
        raise ValueError(ERROR_MESSAGE)
    return value
