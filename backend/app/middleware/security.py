"""Small, dependency-free protections for the public API."""

import asyncio
import time
from collections import defaultdict, deque

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        response.headers.setdefault("Cross-Origin-Opener-Policy", "same-origin")
        if settings.is_production:
            response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        if request.url.path.startswith("/api/auth"):
            response.headers["Cache-Control"] = "no-store"
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Per-client limits for abuse-prone public endpoints.

    Render's free service runs one instance, so an in-memory window is enough
    here and avoids adding Redis solely for a small academy website.
    """

    RULES = {
        ("POST", "/api/auth/login"): (10, 600),
        ("POST", "/api/leads"): (5, 600),
    }

    def __init__(self, app):
        super().__init__(app)
        self._hits = defaultdict(deque)
        self._lock = asyncio.Lock()

    @staticmethod
    def _client_key(request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for", "").split(",", 1)[0].strip()
        return forwarded or (request.client.host if request.client else "unknown")

    async def dispatch(self, request: Request, call_next):
        if not settings.RATE_LIMIT_ENABLED:
            return await call_next(request)
        rule = self.RULES.get((request.method, request.url.path))
        if not rule and request.method == "GET" and request.url.path.startswith("/api/certificates/verify/"):
            rule = (30, 60)
        if not rule:
            return await call_next(request)

        limit, window = rule
        key = (self._client_key(request), request.method, request.url.path.split("/verify/")[0])
        now = time.monotonic()
        async with self._lock:
            hits = self._hits[key]
            while hits and hits[0] <= now - window:
                hits.popleft()
            if len(hits) >= limit:
                retry_after = max(1, int(window - (now - hits[0])))
                return JSONResponse(
                    {"detail": "Too many requests. Please try again later."},
                    status_code=429,
                    headers={"Retry-After": str(retry_after)},
                )
            hits.append(now)
        return await call_next(request)
