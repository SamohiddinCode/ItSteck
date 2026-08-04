import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    # Human-readable code printed on the certificate; this is what a visitor
    # types into the public verification form.
    code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    student_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)

    course_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("courses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    # Snapshot of the course name at issue time. A certificate is a permanent
    # document, so it must stay readable even if the course row is deleted.
    course_title: Mapped[str] = mapped_column(String(255), nullable=False)

    # [{"subject": "Python Basics", "grade": "5"}, ...] — an immutable snapshot
    # of what the student was graded on, so it lives with the document.
    subjects: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list)

    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
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

    course_rel: Mapped["Course"] = relationship("Course")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Certificate {self.code} — {self.student_name}>"
