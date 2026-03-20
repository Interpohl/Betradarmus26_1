import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://live-sports-ai-3.preview.emergentagent.com').rstrip('/')

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def admin_token(api_client):
    """Get admin authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@betradarmus.de",
        "password": "Betradarmus2024!"
    })
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("token"):
            return data["token"]
    pytest.skip("Admin authentication failed - skipping authenticated tests")

@pytest.fixture
def authenticated_client(api_client, admin_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
    return api_client
