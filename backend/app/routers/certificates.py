from uuid import UUID

from fastapi import APIRouter, Query
from fastapi.responses import Response

from app.core.deps import DBSession, CurrentAdmin
from app.core.config import settings
from app.schemas.certificate import (
    CertificateOut,
    CertificateCreate,
    CertificateUpdate,
    CertificateVerifyOut,
)
from app.services import certificates as certificate_service
from app.services.certificate_pdf import render_certificate
from app.utils.pagination import PaginationParams, PagedResponse

router = APIRouter(prefix="/certificates", tags=["certificates"])


def _pdf_url(code: str) -> str:
    return f"/api/certificates/verify/{code}/pdf"


# --- Public verification -----------------------------------------------------

@router.get("/verify/{code}", response_model=CertificateVerifyOut)
async def verify_certificate(code: str, db: DBSession):
    """Public endpoint — look a certificate up by the code printed on it."""
    certificate = await certificate_service.get_by_code(db, code)
    return CertificateVerifyOut(
        code=certificate.code,
        student_name=certificate.student_name,
        course_title=certificate.course_title,
        subjects=certificate.subjects,
        issued_at=certificate.issued_at,
        pdf_url=_pdf_url(certificate.code),
    )


@router.get("/verify/{code}/pdf", response_class=Response)
async def certificate_pdf(
    code: str, db: DBSession, download: bool = Query(False)
):
    """Public endpoint — the certificate itself, rendered on demand."""
    certificate = await certificate_service.get_by_code(db, code)
    pdf = render_certificate(
        code=certificate.code,
        student_name=certificate.student_name,
        course_title=certificate.course_title,
        subjects=certificate.subjects,
        issued_at=certificate.issued_at,
        verify_url=(
            f"{settings.PUBLIC_SITE_URL.rstrip('/')}/#/verify?code={certificate.code}"
        ),
    )
    disposition = "attachment" if download else "inline"
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'{disposition}; filename="{certificate.code}.pdf"',
            "Cache-Control": "no-store",
        },
    )


# --- Admin -------------------------------------------------------------------

@router.get("", response_model=PagedResponse[CertificateOut])
async def list_certificates(
    db: DBSession,
    _: CurrentAdmin,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
):
    params = PaginationParams(page=page, size=size)
    return await certificate_service.get_certificates(db, params, search=search)


@router.post("", response_model=CertificateOut, status_code=201)
async def create_certificate(data: CertificateCreate, db: DBSession, _: CurrentAdmin):
    return await certificate_service.create_certificate(data, db)


@router.get("/{certificate_id}", response_model=CertificateOut)
async def get_certificate(certificate_id: UUID, db: DBSession, _: CurrentAdmin):
    return await certificate_service.get_certificate(db, certificate_id)


@router.patch("/{certificate_id}", response_model=CertificateOut)
async def update_certificate(
    certificate_id: UUID, data: CertificateUpdate, db: DBSession, _: CurrentAdmin
):
    return await certificate_service.update_certificate(certificate_id, data, db)


@router.delete("/{certificate_id}", status_code=204)
async def delete_certificate(certificate_id: UUID, db: DBSession, _: CurrentAdmin):
    await certificate_service.delete_certificate(certificate_id, db)
