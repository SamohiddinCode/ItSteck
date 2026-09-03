import httpx
import logging
from html import escape
from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_lead_notification(
    name: str,
    phone: str,
    course_name: str | None,
    telegram_username: str | None = None,
) -> bool:
    if not settings.BOT_TOKEN or not settings.CHAT_ID:
        logger.warning("Telegram BOT_TOKEN or CHAT_ID not configured — skipping")
        return False

    safe_name = escape(name)
    safe_phone = escape(phone)
    course_display = escape(course_name or "Not specified")
    message = (
        f"🔥 <b>New Lead</b>\n\n"
        f"👤 Name: {safe_name}\n"
        f"📞 Phone: {safe_phone}\n"
    )
    if telegram_username:
        message += f"✈️ Telegram: @{escape(telegram_username)}\n"
    message += f"📚 Course: {course_display}"

    url = f"https://api.telegram.org/bot{settings.BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": settings.CHAT_ID,
        "text": message,
        "parse_mode": "HTML",
    }

    logger.info("Sending Telegram lead notification")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                logger.info("✓ Telegram notification sent successfully")
                return True
            else:
                body = response.json()
                logger.error(
                    f"Telegram API error {response.status_code}: "
                    f"code={body.get('error_code')} desc={body.get('description')}"
                )
                # Common fixes hint
                if body.get('error_code') == 401:
                    logger.error("→ BOT_TOKEN is invalid. Get a new one from @BotFather")
                elif body.get('error_code') == 400 and 'chat not found' in body.get('description', '').lower():
                    logger.error(
                        "→ CHAT_ID is wrong or bot is not a member of the group. "
                        "Add the bot to the group first, then send a message in the group, "
                        "then run: curl 'https://api.telegram.org/bot<TOKEN>/getUpdates'"
                    )
                elif body.get('error_code') == 403:
                    logger.error("→ Bot was kicked from the chat or never added as admin")
                return False
    except httpx.TimeoutException:
        logger.error("Telegram request timed out")
        return False
    except Exception as e:
        logger.error(f"Telegram unexpected error: {e}")
        return False


async def test_telegram() -> dict:
    """Call this endpoint to diagnose Telegram config."""
    if not settings.BOT_TOKEN:
        return {"ok": False, "error": "BOT_TOKEN is empty"}
    if not settings.CHAT_ID:
        return {"ok": False, "error": "CHAT_ID is empty"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Check token
            me = await client.get(f"https://api.telegram.org/bot{settings.BOT_TOKEN}/getMe")
            if me.status_code != 200:
                return {"ok": False, "error": f"Invalid token: {me.json().get('description')}"}

            bot_info = me.json()["result"]

            # Try sending test message
            send = await client.post(
                f"https://api.telegram.org/bot{settings.BOT_TOKEN}/sendMessage",
                json={"chat_id": settings.CHAT_ID, "text": "✅ Telegram test from ItStek API"},
            )
            send_data = send.json()
            return {
                "ok": send_data.get("ok"),
                "bot": bot_info.get("username"),
                "chat_id": settings.CHAT_ID,
                "send_result": send_data,
            }
    except Exception as e:
        return {"ok": False, "error": str(e)}
