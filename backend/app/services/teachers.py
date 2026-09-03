from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from app.models.teacher import Teacher
from app.schemas.teacher import TeacherCreate, TeacherUpdate, TeacherOut
from app.utils.pagination import PaginationParams, PagedResponse


async def get_teachers(db: AsyncSession, params: PaginationParams) -> PagedResponse[TeacherOut]:
    total = (await db.execute(select(func.count(Teacher.id)))).scalar_one()
    result = await db.execute(
        select(Teacher).order_by(Teacher.name).offset(params.offset).limit(params.limit)
    )
    teachers = list(result.scalars().all())
    return PagedResponse.create(items=teachers, total=total, params=params, item_schema=TeacherOut)


async def get_teacher(db: AsyncSession, teacher_id: UUID) -> Teacher:
    result = await db.execute(select(Teacher).where(Teacher.id == teacher_id))
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")
    return teacher


async def create_teacher(data: TeacherCreate, db: AsyncSession) -> Teacher:
    values = data.model_dump()
    values["name"] = values["name"].strip()
    values["bio"] = values["bio"].strip()
    if values.get("photo_url"):
        values["photo_url"] = str(values["photo_url"])
    teacher = Teacher(**values)
    db.add(teacher)
    await db.flush()
    await db.refresh(teacher)
    return teacher


async def update_teacher(teacher_id: UUID, data: TeacherUpdate, db: AsyncSession) -> Teacher:
    teacher = await get_teacher(db, teacher_id)
    changes = data.model_dump(exclude_unset=True)
    for field in ("name", "bio"):
        if field in changes and changes[field] is not None:
            changes[field] = changes[field].strip()
    if changes.get("photo_url"):
        changes["photo_url"] = str(changes["photo_url"])
    for field, value in changes.items():
        setattr(teacher, field, value)
    await db.flush()
    await db.refresh(teacher)
    return teacher


async def delete_teacher(teacher_id: UUID, db: AsyncSession) -> None:
    teacher = await get_teacher(db, teacher_id)
    await db.delete(teacher)
    await db.flush()
