"""Add telegram_username to leads

Revision ID: 0004_lead_telegram
Revises: 0003_promotions
Create Date: 2026-07-29
"""

import sqlalchemy as sa
from alembic import op

revision = "0004_lead_telegram"
down_revision = "0003_promotions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("leads", sa.Column("telegram_username", sa.String(length=64), nullable=True))


def downgrade() -> None:
    op.drop_column("leads", "telegram_username")
