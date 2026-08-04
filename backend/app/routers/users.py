from uuid import UUID
from fastapi import APIRouter, Query
from app.schemas.user import UserOut, UserCreate, UserUpdate
from app.models.user import UserRole
from app.services import users as user_service
from app.utils.pagination import PaginationParams, PagedResponse
from app.core.deps import DBSession, CurrentAdmin

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=PagedResponse[UserOut])
async def list_users(
    db: DBSession,
    _: CurrentAdmin,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    role: UserRole | None = Query(None),
    search: str | None = Query(None),
):
    params = PaginationParams(page=page, size=size)
    return await user_service.get_users(db, params, role_filter=role, search=search)


@router.post("", response_model=UserOut, status_code=201)
async def create_user(data: UserCreate, db: DBSession, _: CurrentAdmin):
    """Create an admin or a manager. Managers can only work with leads."""
    return await user_service.create_user(data, db)


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: UUID, db: DBSession, _: CurrentAdmin):
    return await user_service.get_user(db, user_id)


@router.patch("/{user_id}", response_model=UserOut)
async def update_user(user_id: UUID, data: UserUpdate, db: DBSession, actor: CurrentAdmin):
    return await user_service.update_user(user_id, data, db, actor)


@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: UUID, db: DBSession, actor: CurrentAdmin):
    await user_service.delete_user(user_id, db, actor)
