// Mirrors backend/app/utils/telegram_handle.py — keep the two in step.

const HANDLE_RE = /^[A-Za-z][A-Za-z0-9_]{4,31}$/

/** Accepts @name, t.me/name or a bare name; returns the bare name. */
export function normalizeHandle(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//i, '')
    .replace(/^@+/, '')
    .trim()
}

export const isValidHandle = (raw) => HANDLE_RE.test(normalizeHandle(raw))

/** Link to a stored handle, or null when there isn't one. */
export const telegramLink = (handle) => (handle ? `https://t.me/${handle}` : null)
