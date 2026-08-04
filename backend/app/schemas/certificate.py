from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class SubjectGrade(BaseModel):
    subject: str = Field(min_length=1, max_length=255)
    grade: str = Field(min_length=1, max_length=32)


class CertificateCreate(BaseModel):
    student_name: str = Field(min_length=1, max_length=255)
    course_id: UUID | None = None
    # Optional when course_id is given — the course title is copied instead.
    course_title: str | None = Field(default=None, max_length=255)
    subjects: list[SubjectGrade] = []
    issued_at: datetime | None = None


class CertificateUpdate(BaseModel):
    student_name: str | None = Field(default=None, min_length=1, max_length=255)
    course_id: UUID | None = None
    course_title: str | None = Field(default=None, max_length=255)
    subjects: list[SubjectGrade] | None = None
    issued_at: datetime | None = None


class CertificateOut(BaseModel):
    id: UUID
    code: str
    student_name: str
    course_id: UUID | None
    course_title: str
    subjects: list[SubjectGrade]
    issued_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CertificateVerifyOut(BaseModel):
    """Public verification payload — intentionally omits internal ids."""

    code: str
    student_name: str
    course_title: str
    subjects: list[SubjectGrade]
    issued_at: datetime
    pdf_url: str

    model_config = {"from_attributes": True}
