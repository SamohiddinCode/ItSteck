"""Add promotions table (public discounts ticker)

Revision ID: 0003_promotions
Revises: 0002_certificates
Create Date: 2026-07-29
"""

import sqlalchemy as sa
from alembic import op

revision = "0003_promotions"
down_revision = "0002_certificates"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "promotions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("text", sa.String(length=255), nullable=False),
        sa.Column("discount", sa.String(length=32), nullable=True),
        sa.Column("link_url", sa.String(length=512), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="promotions_pkey"),
    )
    op.create_index("ix_promotions_id", "promotions", ["id"])
    op.create_index("ix_promotions_is_active", "promotions", ["is_active"])


def downgrade() -> None:
    op.drop_index("ix_promotions_is_active", table_name="promotions")
    op.drop_index("ix_promotions_id", table_name="promotions")
    op.drop_table("promotions")
