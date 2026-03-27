import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://betfair-predictions.preview.emergentagent.com').rstrip('/')

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def admin_token(api_client):
    """Get admin authentication token (elite user)"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test_admin@betradarmus.de",
        "password": "TestAdmin123!"
    })
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("token"):
            return data["token"]
    pytest.skip("Admin authentication failed - skipping authenticated tests")

@pytest.fixture
def authenticated_client(api_client, admin_token):
    """Session with auth header (elite user)"""
    api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
    return api_client

@pytest.fixture
def admin_client(api_client, admin_token):
    """Session with admin auth header (elite user) - alias for authenticated_client"""
    api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
    return api_client

@pytest.fixture
def regular_user_token(api_client):
    """Get regular (non-elite) user token"""
    # First try to create a new user
    import uuid
    unique_email = f"test_regular_{uuid.uuid4().hex[:8]}@test.com"
    response = api_client.post(f"{BASE_URL}/api/auth/register", json={
        "email": unique_email,
        "password": "TestPassword123!",
        "name": "Regular User"
    })
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("token"):
            return data["token"]
    pytest.skip("Regular user creation failed")

@pytest.fixture
def regular_client(api_client, regular_user_token):
    """Session with regular (non-elite) user auth"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {regular_user_token}"
    })
    return session
