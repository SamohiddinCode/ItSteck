from uuid import UUID
from pydantic import BaseModel
from datetime import datetime


class CourseBase(BaseModel):
    title: str
    description: str
    image_url: str | None = None
    is_active: bool = True


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    image_url: str | None = None
    is_active: bool | None = None


class CourseOut(CourseBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
