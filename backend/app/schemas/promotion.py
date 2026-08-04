from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, model_validator


class PromotionCreate(BaseModel):
    text: str = Field(min_length=1, max_length=255)
    discount: str | None = Field(default=None, max_length=32)
    link_url: str | None = Field(default=None, max_length=512)
    is_active: bool = True
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    sort_order: int = 0

    @model_validator(mode="after")
    def check_window(self):
        if self.starts_at and self.ends_at and self.ends_at < self.starts_at:
            raise ValueError("ends_at must be on or after starts_at")
        return self


class PromotionUpdate(BaseModel):
    text: str | None = Field(default=None, min_length=1, max_length=255)
    discount: str | None = Field(default=None, max_length=32)
    link_url: str | None = Field(default=None, max_length=512)
    is_active: bool | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    sort_order: int | None = None


class PromotionOut(BaseModel):
    id: UUID
    text: str
    discount: str | None
    link_url: str | None
    is_active: bool
    starts_at: datetime | None
    ends_at: datetime | None
    sort_order: int
    created_at: datetime
    updated_at: datetime
    # Whether this row is on the public ticker *right now* — is_active alone
    # doesn't say, because the schedule window also has a vote.
    is_live: bool

    model_config = {"from_attributes": True}


class PromotionPublicOut(BaseModel):
    """What the ticker needs — no ids, no schedule, no bookkeeping."""

    text: str
    discount: str | None
    link_url: str | None

    model_config = {"from_attributes": True}
