from fastapi import APIRouter
from app.services.telegram import test_telegram
from app.core.deps import CurrentAdmin

router = APIRouter(prefix="/telegram", tags=["telegram"])


@router.get("/test")
async def telegram_test(_: CurrentAdmin):
    """Diagnose Telegram bot configuration."""
    return await test_telegram()
