from uuid import UUID
from fastapi import APIRouter, Query
from app.schemas.teacher import TeacherOut, TeacherCreate, TeacherUpdate
from app.services import teachers as teacher_service
from app.utils.pagination import PaginationParams, PagedResponse
from app.core.deps import DBSession, CurrentAdmin

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("", response_model=PagedResponse[TeacherOut])
async def list_teachers(
    db: DBSession,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    params = PaginationParams(page=page, size=size)
    return await teacher_service.get_teachers(db, params)


@router.get("/{teacher_id}", response_model=TeacherOut)
async def get_teacher(teacher_id: UUID, db: DBSession):
    return await teacher_service.get_teacher(db, teacher_id)


@router.post("", response_model=TeacherOut, status_code=201)
async def create_teacher(data: TeacherCreate, db: DBSession, _: CurrentAdmin):
    return await teacher_service.create_teacher(data, db)


@router.patch("/{teacher_id}", response_model=TeacherOut)
async def update_teacher(teacher_id: UUID, data: TeacherUpdate, db: DBSession, _: CurrentAdmin):
    return await teacher_service.update_teacher(teacher_id, data, db)


@router.delete("/{teacher_id}", status_code=204)
async def delete_teacher(teacher_id: UUID, db: DBSession, _: CurrentAdmin):
    await teacher_service.delete_teacher(teacher_id, db)
