from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime


class CourseBase(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=10, max_length=10000)
    image_url: HttpUrl | None = None
    is_active: bool = True


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = Field(default=None, min_length=10, max_length=10000)
    image_url: HttpUrl | None = None
    is_active: bool | None = None


class CourseOut(CourseBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
