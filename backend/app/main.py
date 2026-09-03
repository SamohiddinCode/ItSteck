import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, AsyncSessionLocal, Base, ensure_database_exists
from app.core.security import hash_password
from app.middleware.cors import setup_cors
from app.middleware.security import RateLimitMiddleware, SecurityHeadersMiddleware
from app.models import User, UserRole, Course
from app.routers import (
    auth_router,
    users_router,
    courses_router,
    teachers_router,
    leads_router,
    dashboard_router,
    telegram_router,
    certificates_router,
    promotions_router,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def seed_admin():
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, func
        count = (await session.execute(select(func.count(User.id)))).scalar_one()
        if count == 0:
            admin = User(
                email=settings.FIRST_ADMIN_EMAIL,
                full_name="Super Admin",
                hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                role=UserRole.admin,
            )
            session.add(admin)
            await session.commit()
            logger.info(f"✓ Admin user seeded: {settings.FIRST_ADMIN_EMAIL}")


async def seed_catalog():
    """Give a fresh installation a useful public catalog without overwriting
    anything an administrator has already created."""
    from sqlalchemy import select, func
    async with AsyncSessionLocal() as session:
        count = (await session.execute(select(func.count(Course.id)))).scalar_one()
        if count:
            return
        items = [
            ("Frontend-разработчик (React & TypeScript)", "Создание современных веб-приложений и интерактивных интерфейсов с React, TypeScript, Tailwind CSS, Git и практикой на реальных проектах."),
            ("Backend-разработчик (Node.js & PostgreSQL)", "Серверная разработка, базы данных, REST API, авторизация, архитектура сервисов и безопасная работа с PostgreSQL."),
            ("Python & AI Engineering", "Python, FastAPI, Telegram-боты, интеграция нейросетей, автоматизация рабочих процессов и основы Data Science."),
            ("UI/UX & Product Design", "UX-исследования, интерфейсы в Figma, дизайн-системы, прототипирование и продуктовый подход."),
            ("QA Engineer", "Ручное тестирование веб- и мобильных приложений, тест-дизайн, Postman, SQL, DevTools и работа с баг-трекерами."),
            ("Кибербезопасность & Ethical Hacking", "Защита сетей и серверов, Linux, анализ трафика, поиск уязвимостей и основы безопасного тестирования."),
        ]
        session.add_all([Course(title=title, description=description, is_active=True) for title, description in items])
        await session.commit()
        logger.info("✓ Seeded %d starter courses", len(items))


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ItStek API...")
    await ensure_database_exists()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("✓ Database tables created")
    await seed_admin()
    await seed_catalog()
    logger.info("✓ Application ready")
    yield
    await engine.dispose()
    logger.info("Application shut down")


app = FastAPI(
    title="ItStek API",
    version="1.0.0",
    # Served under /api/ so nginx (which proxies only /api/ to the backend) exposes them.
    docs_url=None if settings.is_production else "/api/docs",
    redoc_url=None if settings.is_production else "/api/redoc",
    openapi_url=None if settings.is_production else "/api/openapi.json",
    lifespan=lifespan,
)

setup_cors(app)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(courses_router, prefix="/api")
app.include_router(teachers_router, prefix="/api")
app.include_router(leads_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(telegram_router, prefix="/api")
app.include_router(certificates_router, prefix="/api")
app.include_router(promotions_router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return JSONResponse({"status": "ok", "service": "itstek-api"})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse({"detail": "Internal server error"}, status_code=500)


# --- Single-process mode -----------------------------------------------------
# Platforms like Replit or Render give one process and one port, so there is no
# nginx to serve the built frontend. Point STATIC_DIR at frontend/dist and this
# app serves it too. Left unset (the Docker path), nothing below is mounted.
if settings.STATIC_DIR:
    static_dir = Path(settings.STATIC_DIR).resolve()
    index_file = static_dir / "index.html"

    if not index_file.is_file():
        logger.warning("STATIC_DIR=%s has no index.html — serving API only", static_dir)
    else:
        app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

        @app.get("/{full_path:path}", include_in_schema=False)
        async def serve_spa(full_path: str):
            """Any non-API path returns index.html so client routing survives a
            reload on /courses, /verify and the rest."""
            if full_path.startswith("api/"):
                return JSONResponse({"detail": "Not Found"}, status_code=404)

            # A real file (favicon, logo, robots.txt) wins over the SPA shell.
            candidate = (static_dir / full_path).resolve()
            if full_path and candidate.is_file() and candidate.is_relative_to(static_dir):
                return FileResponse(candidate)

            return FileResponse(index_file)

        logger.info("✓ Serving frontend from %s", static_dir)
