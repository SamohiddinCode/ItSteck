import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Integer, Uuid
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Promotion(Base):
    """A single line in the public discounts ticker, managed by the director."""

    __tablename__ = "promotions"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    # The announcement itself — short, it scrolls past in a strip.
    text: Mapped[str] = mapped_column(String(255), nullable=False)
    # Optional pill rendered ahead of the text, e.g. "-30%".
    discount: Mapped[str | None] = mapped_column(String(32), nullable=True)
    # Optional click target; relative paths like /courses work too.
    link_url: Mapped[str | None] = mapped_column(String(512), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    # Both ends optional: an open-ended promo just runs until switched off.
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Lower first — lets the director pin the important offer to the front.
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    @property
    def is_live(self) -> bool:
        """On the public ticker right now — the switch *and* the window agree."""
        if not self.is_active:
            return False
        now = datetime.now(timezone.utc)
        if self.starts_at and self.starts_at > now:
            return False
        if self.ends_at and self.ends_at < now:
            return False
        return True

    def __repr__(self) -> str:
        return f"<Promotion {self.text[:32]!r}>"
