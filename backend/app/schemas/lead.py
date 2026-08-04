from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from app.models.lead import LeadStatus
from app.schemas.course import CourseOut
from app.utils.phone import normalize_phone
from app.utils.telegram_handle import normalize_telegram_handle


class LeadBase(BaseModel):
    name: str
    phone: str
    telegram_username: str | None = None
    course_id: UUID | None = None


# Validation lives on the input schemas only. LeadOut inherits LeadBase and is
# built from existing rows — rows saved before this check would fail to read.
class LeadCreate(LeadBase):
    name: str = Field(min_length=1, max_length=255)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Name is required")
        return cleaned

    @field_validator("phone")
    @classmethod
    def check_phone(cls, value: str) -> str:
        return normalize_phone(value)

    @field_validator("telegram_username")
    @classmethod
    def check_handle(cls, value: str | None) -> str | None:
        return normalize_telegram_handle(value)


class LeadUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    phone: str | None = None
    telegram_username: str | None = None
    course_id: UUID | None = None
    status: LeadStatus | None = None
    notes: str | None = None

    @field_validator("phone")
    @classmethod
    def check_phone(cls, value: str | None) -> str | None:
        return normalize_phone(value) if value is not None else None

    @field_validator("telegram_username")
    @classmethod
    def check_handle(cls, value: str | None) -> str | None:
        return normalize_telegram_handle(value)


class LeadOut(LeadBase):
    id: UUID
    status: LeadStatus
    notes: str | None
    created_at: datetime
    updated_at: datetime
    course_rel: CourseOut | None = None

    model_config = {"from_attributes": True}


class LeadStatusUpdate(BaseModel):
    status: LeadStatus
    notes: str | None = None
