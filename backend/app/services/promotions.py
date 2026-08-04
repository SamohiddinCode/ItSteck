from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.promotion import Promotion
from app.schemas.promotion import PromotionCreate, PromotionUpdate, PromotionOut
from app.utils.pagination import PaginationParams, PagedResponse


def _live_conditions(now: datetime):
    """The SQL half of `Promotion.is_live` — kept next to it on purpose."""
    return (
        Promotion.is_active.is_(True),
        or_(Promotion.starts_at.is_(None), Promotion.starts_at <= now),
        or_(Promotion.ends_at.is_(None), Promotion.ends_at >= now),
    )


async def get_promotions(
    db: AsyncSession, params: PaginationParams, live_only: bool = False
) -> PagedResponse[PromotionOut]:
    query = select(Promotion)
    count_query = select(func.count(Promotion.id))

    if live_only:
        conditions = _live_conditions(datetime.now(timezone.utc))
        query = query.where(*conditions)
        count_query = count_query.where(*conditions)

    query = (
        query.order_by(Promotion.sort_order.asc(), Promotion.created_at.desc())
        .offset(params.offset)
        .limit(params.limit)
    )

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(query)
    items = list(result.scalars().all())

    return PagedResponse.create(items=items, total=total, params=params, item_schema=PromotionOut)


async def get_active_promotions(db: AsyncSession, limit: int = 20) -> list[Promotion]:
    """Public ticker feed — only what is running at this moment."""
    result = await db.execute(
        select(Promotion)
        .where(*_live_conditions(datetime.now(timezone.utc)))
        .order_by(Promotion.sort_order.asc(), Promotion.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_promotion(db: AsyncSession, promotion_id: UUID) -> Promotion:
    result = await db.execute(select(Promotion).where(Promotion.id == promotion_id))
    promotion = result.scalar_one_or_none()
    if not promotion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found")
    return promotion


async def create_promotion(data: PromotionCreate, db: AsyncSession) -> Promotion:
    promotion = Promotion(
        text=data.text.strip(),
        discount=(data.discount or "").strip() or None,
        link_url=(data.link_url or "").strip() or None,
        is_active=data.is_active,
        starts_at=data.starts_at,
        ends_at=data.ends_at,
        sort_order=data.sort_order,
    )
    db.add(promotion)
    await db.flush()
    await db.refresh(promotion)
    return promotion


async def update_promotion(
    promotion_id: UUID, data: PromotionUpdate, db: AsyncSession
) -> Promotion:
    promotion = await get_promotion(db, promotion_id)
    changes = data.model_dump(exclude_unset=True)

    for field in ("text", "discount", "link_url"):
        if field in changes and changes[field] is not None:
            cleaned = changes[field].strip()
            changes[field] = cleaned or None
    if changes.get("text") is None:
        changes.pop("text", None)  # never blank out the line itself

    for field, value in changes.items():
        setattr(promotion, field, value)

    starts_at = promotion.starts_at
    ends_at = promotion.ends_at
    if starts_at and ends_at and ends_at < starts_at:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="ends_at must be on or after starts_at",
        )

    await db.flush()
    await db.refresh(promotion)
    return promotion


async def delete_promotion(promotion_id: UUID, db: AsyncSession) -> None:
    promotion = await get_promotion(db, promotion_id)
    await db.delete(promotion)
    await db.flush()
