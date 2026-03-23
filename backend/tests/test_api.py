"""
Backend API Integration Tests for BETRADARMUS
Tests: Auth, Signal Generator, Statistics, Admin endpoints
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://betfair-predictions.preview.emergentagent.com').rstrip('/')


class TestAPIRoot:
    """Test basic API connectivity"""
    
    def test_api_root_returns_200(self, api_client):
        """API root should return 200 with welcome message"""
        response = api_client.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "BETRADARMUS" in data["message"]


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_register_new_user(self, api_client):
        """Should register a new user successfully"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "TestPassword123!",
            "name": "Test User"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["user"]["email"] == unique_email
        
    def test_register_short_password_fails(self, api_client):
        """Should reject passwords shorter than 8 characters"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "short",
            "name": "Test User"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == False
        assert "8 Zeichen" in data["message"]
        
    def test_login_admin_user(self, api_client):
        """Should login admin user successfully"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@betradarmus.de",
            "password": "Betradarmus2024!"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["user"]["email"] == "admin@betradarmus.de"
        
    def test_login_wrong_password_fails(self, api_client):
        """Should reject wrong password"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@betradarmus.de",
            "password": "wrongpassword"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == False
        
    def test_get_me_with_token(self, authenticated_client):
        """Should return user info with valid token"""
        response = authenticated_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "subscription" in data
        
    def test_get_me_without_token_fails(self, api_client):
        """Should reject request without token"""
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401


class TestSignalGeneratorEndpoints:
    """Test signal generator start/stop endpoints"""
    
    def test_get_generator_status(self, authenticated_client):
        """Should return generator status"""
        response = authenticated_client.get(f"{BASE_URL}/api/signals/generator/status")
        assert response.status_code == 200
        data = response.json()
        assert "running" in data
        
    def test_start_generator(self, authenticated_client):
        """Should start the signal generator or return 503 if not configured"""
        response = authenticated_client.post(f"{BASE_URL}/api/signals/generator/start")
        # 200 = started, 503 = not configured (Telegram bot not available)
        assert response.status_code in [200, 503]
        if response.status_code == 200:
            data = response.json()
            assert data.get("success") == True or "running" in data
        else:
            # 503 is acceptable - means Telegram bot not configured
            data = response.json()
            assert "nicht verfügbar" in data.get("detail", "").lower() or "not available" in data.get("detail", "").lower()
        
    def test_stop_generator(self, authenticated_client):
        """Should stop the signal generator or return 503 if not configured"""
        response = authenticated_client.post(f"{BASE_URL}/api/signals/generator/stop")
        # 200 = stopped, 503 = not configured (Telegram bot not available)
        assert response.status_code in [200, 503]
        if response.status_code == 200:
            data = response.json()
            assert data.get("success") == True or "stopped" in str(data).lower()
        else:
            # 503 is acceptable - means Telegram bot not configured
            data = response.json()
            assert "nicht verfügbar" in data.get("detail", "").lower() or "not available" in data.get("detail", "").lower()


class TestStatisticsEndpoints:
    """Test statistics endpoints"""
    
    def test_get_statistics(self, api_client):
        """Should return overall statistics"""
        response = api_client.get(f"{BASE_URL}/api/statistics")
        assert response.status_code == 200
        data = response.json()
        assert "total_tips" in data
        assert "win_rate" in data
        assert "roi" in data
        
    def test_get_league_statistics(self, api_client):
        """Should return league performance statistics"""
        response = api_client.get(f"{BASE_URL}/api/statistics/leagues")
        assert response.status_code == 200
        data = response.json()
        assert "leagues" in data
        
    def test_get_monthly_statistics(self, api_client):
        """Should return monthly performance data"""
        response = api_client.get(f"{BASE_URL}/api/statistics/monthly")
        assert response.status_code == 200
        data = response.json()
        assert "monthly" in data
        
    def test_get_recent_tips(self, api_client):
        """Should return recent evaluated tips"""
        response = api_client.get(f"{BASE_URL}/api/statistics/recent?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert "tips" in data


class TestAdminEndpoints:
    """Test admin dashboard endpoints"""
    
    def test_get_admin_users(self, authenticated_client):
        """Should return list of website users"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/users?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        
    def test_get_early_access_registrations(self, authenticated_client):
        """Should return early access registrations"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/early-access?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert "registrations" in data
        
    def test_get_telegram_status(self, api_client):
        """Should return telegram bot status"""
        response = api_client.get(f"{BASE_URL}/api/telegram/status")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data


class TestSubscriptionPlans:
    """Test subscription plans endpoint"""
    
    def test_get_plans(self, api_client):
        """Should return available subscription plans"""
        response = api_client.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        plans = data["plans"]
        assert len(plans) == 3
        
        # Verify plan structure
        plan_ids = [p["id"] for p in plans]
        assert "free" in plan_ids
        assert "pro" in plan_ids
        assert "elite" in plan_ids
        
        # Verify pricing
        for plan in plans:
            if plan["id"] == "free":
                assert plan["price"] == 0
            elif plan["id"] == "pro":
                assert plan["price"] == 19
            elif plan["id"] == "elite":
                assert plan["price"] == 39


class TestLiveDataEndpoints:
    """Test live data endpoints"""
    
    def test_get_live_matches(self, api_client):
        """Should return live matches data"""
        response = api_client.get(f"{BASE_URL}/api/live/matches")
        assert response.status_code == 200
        data = response.json()
        assert "events" in data
        
    def test_get_analysis_opportunities(self, api_client):
        """Should return analysis opportunities"""
        response = api_client.get(f"{BASE_URL}/api/analysis/opportunities")
        assert response.status_code == 200
        data = response.json()
        # Should have live, starting_soon, or prematch data
        assert "live" in data or "prematch" in data


class TestContactAndEarlyAccess:
    """Test contact and early access endpoints"""
    
    def test_submit_contact_form(self, api_client):
        """Should submit contact form successfully"""
        response = api_client.post(f"{BASE_URL}/api/contact", json={
            "name": "Test User",
            "email": f"test_{uuid.uuid4().hex[:8]}@test.com",
            "subject": "Test Subject",
            "message": "This is a test message"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
    def test_submit_early_access(self, api_client):
        """Should submit early access signup"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        response = api_client.post(f"{BASE_URL}/api/early-access", json={
            "email": unique_email,
            "plan_interest": "pro"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
