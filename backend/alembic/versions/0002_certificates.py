"""Add certificates table

Revision ID: 0002_certificates
Revises: 0001_uuid_pks
Create Date: 2026-07-27
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0002_certificates"
down_revision = "0001_uuid_pks"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "certificates",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("code", sa.String(length=32), nullable=False),
        sa.Column("student_name", sa.String(length=255), nullable=False),
        sa.Column("course_id", sa.Uuid(), nullable=True),
        sa.Column("course_title", sa.String(length=255), nullable=False),
        sa.Column("subjects", JSONB(), nullable=False),
        sa.Column("issued_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="certificates_pkey"),
        sa.ForeignKeyConstraint(
            ["course_id"],
            ["courses.id"],
            name="certificates_course_id_fkey",
            ondelete="SET NULL",
        ),
    )
    op.create_index("ix_certificates_id", "certificates", ["id"])
    op.create_index("ix_certificates_code", "certificates", ["code"], unique=True)
    op.create_index("ix_certificates_student_name", "certificates", ["student_name"])
    op.create_index("ix_certificates_course_id", "certificates", ["course_id"])


def downgrade() -> None:
    op.drop_index("ix_certificates_course_id", table_name="certificates")
    op.drop_index("ix_certificates_student_name", table_name="certificates")
    op.drop_index("ix_certificates_code", table_name="certificates")
    op.drop_index("ix_certificates_id", table_name="certificates")
    op.drop_table("certificates")
