from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import LoginRequest
from app.schemas.token import Token
from app.core.security import verify_password, create_access_token


async def login_user(data: LoginRequest, db: AsyncSession) -> Token:
    # Emails are stored lower-cased; sign-in shouldn't care how it was typed.
    result = await db.execute(select(User).where(func.lower(User.email) == data.email.lower()))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    access_token = create_access_token(subject=user.id, role=user.role.value)
    return Token(access_token=access_token)
