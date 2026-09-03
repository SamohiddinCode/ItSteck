from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime


class TeacherBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    bio: str = Field(min_length=10, max_length=10000)
    photo_url: HttpUrl | None = None


class TeacherCreate(TeacherBase):
    pass


class TeacherUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    bio: str | None = Field(default=None, min_length=10, max_length=10000)
    photo_url: HttpUrl | None = None


class TeacherOut(TeacherBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
