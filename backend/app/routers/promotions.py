from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import DBSession, CurrentAdmin
from app.schemas.promotion import (
    PromotionOut,
    PromotionCreate,
    PromotionUpdate,
    PromotionPublicOut,
)
from app.services import promotions as promotion_service
from app.utils.pagination import PaginationParams, PagedResponse

router = APIRouter(prefix="/promotions", tags=["promotions"])


# --- Public ------------------------------------------------------------------

# Declared before /{promotion_id} so "active" isn't parsed as a UUID.
@router.get("/active", response_model=list[PromotionPublicOut])
async def active_promotions(db: DBSession):
    """Public endpoint — the lines the discounts ticker is showing right now."""
    return await promotion_service.get_active_promotions(db)


# --- Admin (director) --------------------------------------------------------

@router.get("", response_model=PagedResponse[PromotionOut])
async def list_promotions(
    db: DBSession,
    _: CurrentAdmin,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    live_only: bool = Query(False),
):
    params = PaginationParams(page=page, size=size)
    return await promotion_service.get_promotions(db, params, live_only=live_only)


@router.post("", response_model=PromotionOut, status_code=201)
async def create_promotion(data: PromotionCreate, db: DBSession, _: CurrentAdmin):
    return await promotion_service.create_promotion(data, db)


@router.get("/{promotion_id}", response_model=PromotionOut)
async def get_promotion(promotion_id: UUID, db: DBSession, _: CurrentAdmin):
    return await promotion_service.get_promotion(db, promotion_id)


@router.patch("/{promotion_id}", response_model=PromotionOut)
async def update_promotion(
    promotion_id: UUID, data: PromotionUpdate, db: DBSession, _: CurrentAdmin
):
    return await promotion_service.update_promotion(promotion_id, data, db)


@router.delete("/{promotion_id}", status_code=204)
async def delete_promotion(promotion_id: UUID, db: DBSession, _: CurrentAdmin):
    await promotion_service.delete_promotion(promotion_id, db)
