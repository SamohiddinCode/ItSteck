from fastapi import APIRouter
from app.schemas.user import LoginRequest, UserOut
from app.schemas.token import Token
from app.services.auth import login_user
from app.core.deps import DBSession, CurrentStaff

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
async def login(data: LoginRequest, db: DBSession):
    return await login_user(data, db)


@router.get("/me", response_model=UserOut)
async def read_me(current_user: CurrentStaff):
    """Identity and role of the signed-in user — drives what the panel shows."""
    return current_user
