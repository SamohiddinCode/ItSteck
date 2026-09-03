from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate, CourseOut
from app.utils.pagination import PaginationParams, PagedResponse


async def get_courses(
    db: AsyncSession,
    params: PaginationParams,
    active_only: bool = False,
) -> PagedResponse[CourseOut]:
    query = select(Course)
    count_query = select(func.count(Course.id))

    if active_only:
        query = query.where(Course.is_active == True)   # noqa: E712
        count_query = count_query.where(Course.is_active == True)  # noqa: E712

    query = query.order_by(Course.created_at.desc()).offset(params.offset).limit(params.limit)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(query)
    courses = list(result.scalars().all())

    return PagedResponse.create(items=courses, total=total, params=params, item_schema=CourseOut)


async def get_course(db: AsyncSession, course_id: UUID) -> Course:
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


async def create_course(data: CourseCreate, db: AsyncSession) -> Course:
    values = data.model_dump()
    values["title"] = values["title"].strip()
    values["description"] = values["description"].strip()
    if values.get("image_url"):
        values["image_url"] = str(values["image_url"])
    course = Course(**values)
    db.add(course)
    await db.flush()
    await db.refresh(course)
    return course


async def update_course(course_id: UUID, data: CourseUpdate, db: AsyncSession) -> Course:
    course = await get_course(db, course_id)
    changes = data.model_dump(exclude_unset=True)
    for field in ("title", "description"):
        if field in changes and changes[field] is not None:
            changes[field] = changes[field].strip()
    if changes.get("image_url"):
        changes["image_url"] = str(changes["image_url"])
    for field, value in changes.items():
        setattr(course, field, value)
    await db.flush()
    await db.refresh(course)
    return course


async def delete_course(course_id: UUID, db: AsyncSession) -> None:
    course = await get_course(db, course_id)
    await db.delete(course)
    await db.flush()
