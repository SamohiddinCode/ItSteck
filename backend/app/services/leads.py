from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.lead import Lead, LeadStatus
from app.models.course import Course
from app.schemas.lead import LeadCreate, LeadUpdate, LeadStatusUpdate, LeadOut
from app.services.telegram import send_lead_notification
from app.utils.pagination import PaginationParams, PagedResponse


async def _get_lead_with_course(db: AsyncSession, lead_id: UUID) -> Lead:
    """Always loads course_rel eagerly to avoid MissingGreenlet."""
    result = await db.execute(
        select(Lead).options(selectinload(Lead.course_rel)).where(Lead.id == lead_id)
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead


async def get_leads(
    db: AsyncSession,
    params: PaginationParams,
    status_filter: LeadStatus | None = None,
) -> PagedResponse[LeadOut]:
    query = select(Lead).options(selectinload(Lead.course_rel))
    count_query = select(func.count(Lead.id))

    if status_filter:
        query = query.where(Lead.status == status_filter)
        count_query = count_query.where(Lead.status == status_filter)

    query = query.order_by(Lead.created_at.desc()).offset(params.offset).limit(params.limit)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(query)
    leads = list(result.scalars().all())

    return PagedResponse.create(items=leads, total=total, params=params, item_schema=LeadOut)


async def get_lead(db: AsyncSession, lead_id: UUID) -> Lead:
    return await _get_lead_with_course(db, lead_id)


async def create_lead(data: LeadCreate, db: AsyncSession) -> Lead:
    course_name: str | None = None
    if data.course_id:
        course_result = await db.execute(select(Course).where(Course.id == data.course_id))
        course = course_result.scalar_one_or_none()
        if course:
            course_name = course.title

    lead = Lead(**data.model_dump())
    db.add(lead)
    await db.flush()

    # Re-fetch with course_rel eagerly loaded before the session commits
    lead = await _get_lead_with_course(db, lead.id)

    # Fire Telegram notification (non-blocking — errors are logged, not raised)
    await send_lead_notification(
        name=data.name,
        phone=data.phone,
        course_name=course_name,
        telegram_username=data.telegram_username,
    )

    return lead


async def update_lead(lead_id: UUID, data: LeadUpdate, db: AsyncSession) -> Lead:
    lead = await _get_lead_with_course(db, lead_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(lead, field, value)
    await db.flush()
    return await _get_lead_with_course(db, lead_id)


async def update_lead_status(lead_id: UUID, data: LeadStatusUpdate, db: AsyncSession) -> Lead:
    lead = await _get_lead_with_course(db, lead_id)
    lead.status = data.status
    if data.notes is not None:
        lead.notes = data.notes
    await db.flush()
    return await _get_lead_with_course(db, lead_id)


async def delete_lead(lead_id: UUID, db: AsyncSession) -> None:
    lead = await _get_lead_with_course(db, lead_id)
    await db.delete(lead)
    await db.flush()


async def get_leads_stats(db: AsyncSession) -> dict:
    result = await db.execute(
        select(Lead.status, func.count(Lead.id)).group_by(Lead.status)
    )
    rows = result.all()
    stats = {s.value: 0 for s in LeadStatus}
    for row_status, count in rows:
        stats[row_status.value] = count
    stats["total"] = sum(v for k, v in stats.items() if k != "total")
    return stats
