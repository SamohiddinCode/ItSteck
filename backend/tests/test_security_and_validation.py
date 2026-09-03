import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.schemas.course import CourseCreate
from app.schemas.lead import LeadCreate
from app.schemas.user import LoginRequest, UserCreate


def test_password_hash_round_trip():
    hashed = hash_password("StrongPassword!123")
    assert hashed != "StrongPassword!123"
    assert verify_password("StrongPassword!123", hashed)
    assert not verify_password("wrong", hashed)


def test_access_token_round_trip():
    token = create_access_token("00000000-0000-0000-0000-000000000001", role="admin")
    payload = decode_access_token(token)
    assert payload["sub"] == "00000000-0000-0000-0000-000000000001"
    assert payload["role"] == "admin"


def test_production_rejects_default_secrets():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, APP_ENV="production")


def test_lead_normalizes_phone_and_name():
    lead = LeadCreate(name="  Test User  ", phone="90 123 45 67")
    assert lead.name == "Test User"
    assert lead.phone == "+998901234567"


def test_course_rejects_javascript_url():
    with pytest.raises(ValidationError):
        CourseCreate(title="React", description="A sufficiently long description", image_url="javascript:alert(1)")


def test_input_length_limits():
    with pytest.raises(ValidationError):
        LoginRequest(email="admin@example.com", password="x" * 129)
    with pytest.raises(ValidationError):
        UserCreate(email="admin@example.com", full_name="Admin", password="short")
