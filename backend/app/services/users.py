from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.core.security import hash_password
from app.utils.pagination import PaginationParams, PagedResponse


async def _assert_email_available(db: AsyncSession, email: str, exclude_id: UUID | None = None) -> None:
    stmt = select(User.id).where(func.lower(User.email) == email.lower())
    if exclude_id is not None:
        stmt = stmt.where(User.id != exclude_id)
    if (await db.execute(stmt)).scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )


async def _assert_not_last_admin(db: AsyncSession, user: User) -> None:
    """Refuse changes that would leave the panel without a working admin."""
    if user.role != UserRole.admin or not user.is_active:
        return
    stmt = select(func.count(User.id)).where(
        User.role == UserRole.admin,
        User.is_active.is_(True),
        User.id != user.id,
    )
    if (await db.execute(stmt)).scalar_one() == 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This is the last active admin — promote another admin first",
        )


async def get_users(
    db: AsyncSession,
    params: PaginationParams,
    role_filter: UserRole | None = None,
    search: str | None = None,
) -> PagedResponse[UserOut]:
    filters = []
    if role_filter is not None:
        filters.append(User.role == role_filter)
    if search:
        pattern = f"%{search.strip()}%"
        filters.append(or_(User.full_name.ilike(pattern), User.email.ilike(pattern)))

    total = (await db.execute(select(func.count(User.id)).where(*filters))).scalar_one()
    result = await db.execute(
        select(User)
        .where(*filters)
        .order_by(User.created_at.desc())
        .offset(params.offset)
        .limit(params.limit)
    )
    users = list(result.scalars().all())
    return PagedResponse.create(items=users, total=total, params=params, item_schema=UserOut)


async def get_user(db: AsyncSession, user_id: UUID) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


async def create_user(data: UserCreate, db: AsyncSession) -> User:
    await _assert_email_available(db, data.email)

    user = User(
        email=data.email.lower(),
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def update_user(user_id: UUID, data: UserUpdate, db: AsyncSession, actor: User) -> User:
    user = await get_user(db, user_id)
    changes = data.model_dump(exclude_unset=True, exclude_none=True)

    if user.id == actor.id:
        if changes.get("role") not in (None, UserRole.admin) or changes.get("is_active") is False:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You cannot remove your own admin access",
            )

    losing_admin_access = (
        changes.get("is_active") is False
        or (changes.get("role") is not None and changes["role"] != UserRole.admin)
    )
    if losing_admin_access:
        await _assert_not_last_admin(db, user)

    if "email" in changes:
        await _assert_email_available(db, changes["email"], exclude_id=user.id)
        changes["email"] = changes["email"].lower()

    if "password" in changes:
        user.hashed_password = hash_password(changes.pop("password"))

    for field, value in changes.items():
        setattr(user, field, value)

    await db.flush()
    await db.refresh(user)
    return user


async def delete_user(user_id: UUID, db: AsyncSession, actor: User) -> None:
    user = await get_user(db, user_id)
    if user.id == actor.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You cannot delete your own account",
        )
    await _assert_not_last_admin(db, user)
    await db.delete(user)
    await db.flush()
