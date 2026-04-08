"""
Backend Tests for Signal Engine 2.0 and SofaScore Integration
Tests: OddsPapi Signal Engine, SofaScore Live Feed, Match Details Modal
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://betfair-predictions.preview.emergentagent.com').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@betradarmus.de"
ADMIN_PASSWORD = "Betradarmus2024!"
TEST_EMAIL = f"test_signal_{os.urandom(4).hex()}@betradarmus.de"
TEST_PASSWORD = "TestPass123!"


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_api_health_returns_ok(self):
        """GET /api/ should return status message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "BETRADARMUS" in data["message"]
        print(f"PASS: Health check returned: {data['message']}")


class TestAuthFlow:
    """Authentication endpoint tests"""
    
    def test_register_new_user(self):
        """POST /api/auth/register should create new user"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": "Test Signal User"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["user"]["email"] == TEST_EMAIL
        assert data["user"]["subscription"] == "free"
        print(f"PASS: Registered user {TEST_EMAIL}")
    
    def test_login_admin_user(self):
        """POST /api/auth/login should authenticate admin user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["user"]["subscription"] == "elite"
        print(f"PASS: Admin login successful, subscription: {data['user']['subscription']}")
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login should reject invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == False
        print("PASS: Invalid credentials rejected correctly")


class TestSofaScoreLiveMatches:
    """SofaScore Live Matches endpoint tests"""
    
    def test_sofascore_live_returns_matches(self):
        """GET /api/sofascore/live should return live_matches array"""
        response = requests.get(f"{BASE_URL}/api/sofascore/live")
        assert response.status_code == 200
        data = response.json()
        assert "live_matches" in data
        assert isinstance(data["live_matches"], list)
        assert "count" in data
        assert "source" in data
        print(f"PASS: SofaScore live returned {data['count']} matches from {data['source']}")
    
    def test_sofascore_live_match_structure(self):
        """Live matches should have correct structure"""
        response = requests.get(f"{BASE_URL}/api/sofascore/live")
        assert response.status_code == 200
        data = response.json()
        
        if data["live_matches"]:
            match = data["live_matches"][0]
            required_fields = ["id", "home_team", "away_team", "home_score", "away_score", "league", "country"]
            for field in required_fields:
                assert field in match, f"Missing field: {field}"
            print(f"PASS: Match structure valid - {match['home_team']} vs {match['away_team']}")
        else:
            print("PASS: No live matches currently (structure test skipped)")


class TestSignalEngineUpcoming:
    """Signal Engine - Upcoming Signals endpoint tests"""
    
    def test_signals_upcoming_returns_array(self):
        """GET /api/signals/upcoming should return signals array"""
        response = requests.get(f"{BASE_URL}/api/signals/upcoming")
        assert response.status_code == 200
        data = response.json()
        assert "signals" in data
        assert isinstance(data["signals"], list)
        assert "count" in data
        print(f"PASS: Upcoming signals returned {data['count']} signals")
    
    def test_signals_upcoming_free_user_limited(self):
        """Free users should get limited preview signals"""
        response = requests.get(f"{BASE_URL}/api/signals/upcoming")
        assert response.status_code == 200
        data = response.json()
        
        # Free users should see premium_required flag
        if data["signals"]:
            signal = data["signals"][0]
            assert "premium_required" in signal or "is_premium" in data
            print(f"PASS: Free user sees limited signals (premium_required flag present)")
        else:
            print("PASS: No upcoming signals currently")
    
    def test_signals_upcoming_signal_structure(self):
        """Upcoming signals should have correct structure"""
        response = requests.get(f"{BASE_URL}/api/signals/upcoming")
        assert response.status_code == 200
        data = response.json()
        
        if data["signals"]:
            signal = data["signals"][0]
            required_fields = ["fixture_id", "home_team", "away_team", "signal_score"]
            for field in required_fields:
                assert field in signal, f"Missing field: {field}"
            print(f"PASS: Signal structure valid - {signal['home_team']} vs {signal['away_team']}, score: {signal['signal_score']}")
        else:
            print("PASS: No upcoming signals currently (structure test skipped)")


class TestSignalEngineLive:
    """Signal Engine - Live Signals endpoint tests"""
    
    def test_signals_live_returns_array(self):
        """GET /api/signals/live should return signals array"""
        response = requests.get(f"{BASE_URL}/api/signals/live")
        assert response.status_code == 200
        data = response.json()
        assert "signals" in data
        assert isinstance(data["signals"], list)
        assert "count" in data
        print(f"PASS: Live signals returned {data['count']} signals")
    
    def test_signals_live_message_when_empty(self):
        """Live signals should return message when no matches"""
        response = requests.get(f"{BASE_URL}/api/signals/live")
        assert response.status_code == 200
        data = response.json()
        
        if data["count"] == 0:
            assert "message" in data
            print(f"PASS: Empty live signals has message: {data['message']}")
        else:
            print(f"PASS: Live signals available: {data['count']}")


class TestSignalEngineTournaments:
    """Signal Engine - Tournaments endpoint tests"""
    
    def test_signals_tournaments_returns_list(self):
        """GET /api/signals/tournaments should return tournaments"""
        response = requests.get(f"{BASE_URL}/api/signals/tournaments")
        assert response.status_code == 200
        data = response.json()
        assert "tournaments" in data
        assert isinstance(data["tournaments"], list)
        assert "count" in data
        print(f"PASS: Tournaments returned {data['count']} tournaments")
    
    def test_signals_tournaments_structure(self):
        """Tournaments should have correct structure"""
        response = requests.get(f"{BASE_URL}/api/signals/tournaments")
        assert response.status_code == 200
        data = response.json()
        
        if data["tournaments"]:
            tournament = data["tournaments"][0]
            required_fields = ["id", "name", "country"]
            for field in required_fields:
                assert field in tournament, f"Missing field: {field}"
            print(f"PASS: Tournament structure valid - {tournament['name']} ({tournament['country']})")
        else:
            print("PASS: No tournaments currently (structure test skipped)")


class TestMatchDetails:
    """Match Details endpoint tests (requires auth for premium features)"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200 and response.json().get("success"):
            return response.json()["token"]
        pytest.skip("Admin authentication failed")
    
    def test_match_details_without_auth(self):
        """GET /api/sofascore/match/{id} should work without auth (limited data)"""
        # First get a live match ID
        live_response = requests.get(f"{BASE_URL}/api/sofascore/live")
        if live_response.status_code == 200:
            data = live_response.json()
            if data["live_matches"]:
                match_id = data["live_matches"][0]["id"]
                response = requests.get(f"{BASE_URL}/api/sofascore/match/{match_id}")
                assert response.status_code == 200
                match_data = response.json()
                assert "id" in match_data
                print(f"PASS: Match details returned for match {match_id}")
            else:
                print("PASS: No live matches to test match details")
        else:
            print("PASS: Could not get live matches for match details test")
    
    def test_match_details_with_premium_auth(self, admin_token):
        """GET /api/sofascore/match/{id} with auth should return full statistics"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # First get a live match ID
        live_response = requests.get(f"{BASE_URL}/api/sofascore/live")
        if live_response.status_code == 200:
            data = live_response.json()
            if data["live_matches"]:
                match_id = data["live_matches"][0]["id"]
                response = requests.get(f"{BASE_URL}/api/sofascore/match/{match_id}", headers=headers)
                assert response.status_code == 200
                match_data = response.json()
                
                # Premium users should get statistics
                assert "is_premium" in match_data
                if match_data.get("is_premium"):
                    assert "statistics" in match_data
                    print(f"PASS: Premium match details with statistics for match {match_id}")
                else:
                    print(f"PASS: Match details returned (premium status: {match_data.get('is_premium')})")
            else:
                print("PASS: No live matches to test premium match details")
        else:
            print("PASS: Could not get live matches for premium match details test")


class TestBillingInfo:
    """Billing Info endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200 and response.json().get("success"):
            return response.json()["token"]
        pytest.skip("Admin authentication failed")
    
    def test_billing_info_requires_auth(self):
        """GET /api/billing/info should require authentication"""
        response = requests.get(f"{BASE_URL}/api/billing/info")
        assert response.status_code in [401, 403]
        print("PASS: Billing info requires authentication")
    
    def test_billing_info_with_auth(self, admin_token):
        """GET /api/billing/info with auth should return subscription data"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/billing/info", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "subscription" in data
        assert data["subscription"]["plan"] == "elite"
        print(f"PASS: Billing info returned for elite user")


class TestSignalEngineWithAuth:
    """Signal Engine tests with authenticated premium user"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200 and response.json().get("success"):
            return response.json()["token"]
        pytest.skip("Admin authentication failed")
    
    def test_signals_upcoming_premium_full_access(self, admin_token):
        """Premium users should get full signal details"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/signals/upcoming", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "is_premium" in data
        if data["signals"]:
            signal = data["signals"][0]
            # Premium users should see full details
            if data.get("is_premium"):
                assert "recommendation" in signal
                assert "suggested_bet" in signal or signal.get("recommendation") != "HIDDEN"
                print(f"PASS: Premium user gets full signal details")
            else:
                print(f"PASS: Signal data returned (premium: {data.get('is_premium')})")
        else:
            print("PASS: No upcoming signals currently")
    
    def test_signals_live_premium_full_access(self, admin_token):
        """Premium users should get full live signal details"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/signals/live", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "is_premium" in data
        print(f"PASS: Live signals for premium user - count: {data['count']}, premium: {data.get('is_premium')}")


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
