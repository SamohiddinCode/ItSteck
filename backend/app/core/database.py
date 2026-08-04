import logging

from sqlalchemy import make_url, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

logger = logging.getLogger(__name__)


async def ensure_database_exists() -> None:
    """Create the target database when it is missing.

    The postgres image only runs initdb — and only then creates POSTGRES_DB —
    against an *empty* data volume. A volume left over from an interrupted first
    start, or from a run with a different POSTGRES_DB, silently skips that, and
    every connection afterwards fails with 'database does not exist'.
    """
    url = make_url(settings.DATABASE_URL)
    target = url.database
    if not target:
        return

    # "postgres" always exists — connect there to ask about the other one.
    admin_engine = create_async_engine(
        url.set(database="postgres"), isolation_level="AUTOCOMMIT"
    )
    try:
        async with admin_engine.connect() as conn:
            exists = await conn.scalar(
                text("select 1 from pg_database where datname = :name"), {"name": target}
            )
            if exists:
                return
            # The name comes from our own config, never from a request; quote it
            # anyway so an unusual database name cannot break the statement.
            await conn.execute(text(f'create database "{target}"'))
            logger.info("✓ Created missing database %r", target)
    except Exception as exc:
        # Not fatal on its own: the connection below produces the better error.
        logger.warning("Could not verify/create database %r: %s", target, exc)
    finally:
        await admin_engine.dispose()


engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.APP_ENV == "development",
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
