from uuid import UUID
from fastapi import APIRouter, Query
from app.schemas.lead import LeadOut, LeadCreate, LeadUpdate, LeadStatusUpdate
from app.models.lead import LeadStatus
from app.services import leads as lead_service
from app.utils.pagination import PaginationParams, PagedResponse
from app.core.deps import DBSession, CurrentStaff

router = APIRouter(prefix="/leads", tags=["leads"])


@router.post("", response_model=LeadOut, status_code=201)
async def create_lead(data: LeadCreate, db: DBSession):
    """Public endpoint — submit application form."""
    return await lead_service.create_lead(data, db)


@router.get("", response_model=PagedResponse[LeadOut])
async def list_leads(
    db: DBSession,
    _: CurrentStaff,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: LeadStatus | None = Query(None),
):
    params = PaginationParams(page=page, size=size)
    return await lead_service.get_leads(db, params, status_filter=status)


@router.get("/stats", response_model=dict)
async def leads_stats(db: DBSession, _: CurrentStaff):
    return await lead_service.get_leads_stats(db)


@router.get("/{lead_id}", response_model=LeadOut)
async def get_lead(lead_id: UUID, db: DBSession, _: CurrentStaff):
    return await lead_service.get_lead(db, lead_id)


@router.patch("/{lead_id}", response_model=LeadOut)
async def update_lead(lead_id: UUID, data: LeadUpdate, db: DBSession, _: CurrentStaff):
    return await lead_service.update_lead(lead_id, data, db)


@router.patch("/{lead_id}/status", response_model=LeadOut)
async def update_lead_status(lead_id: UUID, data: LeadStatusUpdate, db: DBSession, _: CurrentStaff):
    return await lead_service.update_lead_status(lead_id, data, db)


@router.delete("/{lead_id}", status_code=204)
async def delete_lead(lead_id: UUID, db: DBSession, _: CurrentStaff):
    await lead_service.delete_lead(lead_id, db)
