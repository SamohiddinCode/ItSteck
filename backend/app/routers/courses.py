from uuid import UUID
from fastapi import APIRouter, Query
from app.schemas.course import CourseOut, CourseCreate, CourseUpdate
from app.services import courses as course_service
from app.utils.pagination import PaginationParams, PagedResponse
from app.core.deps import DBSession, CurrentAdmin

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=PagedResponse[CourseOut])
async def list_courses(
    db: DBSession,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    active_only: bool = Query(False),
):
    """Public endpoint — list courses."""
    params = PaginationParams(page=page, size=size)
    return await course_service.get_courses(db, params, active_only=active_only)


@router.get("/{course_id}", response_model=CourseOut)
async def get_course(course_id: UUID, db: DBSession):
    return await course_service.get_course(db, course_id)


@router.post("", response_model=CourseOut, status_code=201)
async def create_course(data: CourseCreate, db: DBSession, _: CurrentAdmin):
    return await course_service.create_course(data, db)


@router.patch("/{course_id}", response_model=CourseOut)
async def update_course(course_id: UUID, data: CourseUpdate, db: DBSession, _: CurrentAdmin):
    return await course_service.update_course(course_id, data, db)


@router.delete("/{course_id}", status_code=204)
async def delete_course(course_id: UUID, db: DBSession, _: CurrentAdmin):
    await course_service.delete_course(course_id, db)
