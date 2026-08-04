import secrets
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.certificate import Certificate
from app.models.course import Course
from app.schemas.certificate import CertificateCreate, CertificateUpdate, CertificateOut
from app.utils.pagination import PaginationParams, PagedResponse

CODE_PREFIX = "ITS"
# No 0/O/1/I/L — codes get read off a printed certificate and retyped.
CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"
CODE_LENGTH = 8


def normalize_code(code: str) -> str:
    """Accept what a human types: any case, stray spaces, missing prefix."""
    cleaned = code.strip().upper().replace(" ", "")
    if cleaned and not cleaned.startswith(f"{CODE_PREFIX}-"):
        bare = cleaned.removeprefix(CODE_PREFIX).lstrip("-")
        cleaned = f"{CODE_PREFIX}-{bare}"
    return cleaned


async def _generate_code(db: AsyncSession) -> str:
    for _ in range(10):
        body = "".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LENGTH))
        code = f"{CODE_PREFIX}-{body}"
        exists = await db.execute(select(Certificate.id).where(Certificate.code == code))
        if exists.scalar_one_or_none() is None:
            return code
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Could not allocate a unique certificate code",
    )


async def _resolve_course_title(
    db: AsyncSession, course_id: UUID | None, course_title: str | None
) -> str:
    if course_title and course_title.strip():
        return course_title.strip()
    if course_id:
        result = await db.execute(select(Course).where(Course.id == course_id))
        course = result.scalar_one_or_none()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
        return course.title
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail="Either course_id or course_title is required",
    )


async def get_certificates(
    db: AsyncSession, params: PaginationParams, search: str | None = None
) -> PagedResponse[CertificateOut]:
    query = select(Certificate)
    count_query = select(func.count(Certificate.id))

    if search and search.strip():
        pattern = f"%{search.strip()}%"
        condition = Certificate.student_name.ilike(pattern) | Certificate.code.ilike(pattern)
        query = query.where(condition)
        count_query = count_query.where(condition)

    query = query.order_by(Certificate.issued_at.desc()).offset(params.offset).limit(params.limit)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(query)
    items = list(result.scalars().all())

    return PagedResponse.create(items=items, total=total, params=params, item_schema=CertificateOut)


async def get_certificate(db: AsyncSession, certificate_id: UUID) -> Certificate:
    result = await db.execute(select(Certificate).where(Certificate.id == certificate_id))
    certificate = result.scalar_one_or_none()
    if not certificate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found")
    return certificate


async def get_by_code(db: AsyncSession, code: str) -> Certificate:
    result = await db.execute(
        select(Certificate).where(Certificate.code == normalize_code(code))
    )
    certificate = result.scalar_one_or_none()
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No certificate matches this code",
        )
    return certificate


async def create_certificate(data: CertificateCreate, db: AsyncSession) -> Certificate:
    certificate = Certificate(
        code=await _generate_code(db),
        student_name=data.student_name.strip(),
        course_id=data.course_id,
        course_title=await _resolve_course_title(db, data.course_id, data.course_title),
        subjects=[s.model_dump() for s in data.subjects],
    )
    if data.issued_at:
        certificate.issued_at = data.issued_at
    db.add(certificate)
    await db.flush()
    await db.refresh(certificate)
    return certificate


async def update_certificate(
    certificate_id: UUID, data: CertificateUpdate, db: AsyncSession
) -> Certificate:
    certificate = await get_certificate(db, certificate_id)
    changes = data.model_dump(exclude_unset=True)

    if "subjects" in changes and changes["subjects"] is not None:
        changes["subjects"] = [s.model_dump() for s in data.subjects]
    if "course_id" in changes or "course_title" in changes:
        changes["course_title"] = await _resolve_course_title(
            db,
            changes.get("course_id", certificate.course_id),
            changes.get("course_title"),
        )

    for field, value in changes.items():
        setattr(certificate, field, value)

    await db.flush()
    await db.refresh(certificate)
    return certificate


async def delete_certificate(certificate_id: UUID, db: AsyncSession) -> None:
    certificate = await get_certificate(db, certificate_id)
    await db.delete(certificate)
    await db.flush()
