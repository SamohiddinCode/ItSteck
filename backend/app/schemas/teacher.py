from uuid import UUID
from pydantic import BaseModel
from datetime import datetime


class TeacherBase(BaseModel):
    name: str
    bio: str
    photo_url: str | None = None


class TeacherCreate(TeacherBase):
    pass


class TeacherUpdate(BaseModel):
    name: str | None = None
    bio: str | None = None
    photo_url: str | None = None


class TeacherOut(TeacherBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
