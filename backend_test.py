#!/usr/bin/env python3
"""
Backend API Testing for BETRADARMUS
Tests all API endpoints for functionality
"""
import requests
import sys
from datetime import datetime
import json

class BetradarmusAPITester:
    def __init__(self, base_url="https://betradarmus-live.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.token = None
        self.test_user_email = "test@betradarmus.de"
        self.test_user_password = "test12345"

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if 'message' in response_data:
                        self.log(f"   Response: {response_data['message']}")
                except:
                    pass
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    self.log(f"   Error: {error_data}")
                except:
                    self.log(f"   Error: {response.text}")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else {}

        except requests.exceptions.RequestException as e:
            self.log(f"❌ {name} - Connection Error: {str(e)}")
            self.failed_tests.append(f"{name}: Connection Error - {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_early_access_signup(self):
        """Test early access signup endpoint"""
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        success, response = self.run_test(
            "Early Access Signup",
            "POST", 
            "early-access",
            200,
            data={"email": test_email, "plan_interest": "pro"}
        )
        
        if success and response.get('success'):
            self.log(f"   Signup successful with ID: {response.get('id')}")
        
        return success

    def test_early_access_duplicate_email(self):
        """Test early access signup with duplicate email"""
        test_email = "duplicate@example.com"
        # First signup
        self.run_test("Early Access First Signup", "POST", "early-access", 200, 
                     data={"email": test_email, "plan_interest": "free"})
        
        # Duplicate signup - should return error but still 200 status
        success, response = self.run_test(
            "Early Access Duplicate Check", 
            "POST", 
            "early-access", 
            200,
            data={"email": test_email, "plan_interest": "free"}
        )
        
        if success and not response.get('success'):
            self.log("   ✅ Duplicate email properly rejected")
            return True
        else:
            self.log("   ❌ Duplicate email validation failed")
            return False

    def test_early_access_count(self):
        """Test early access count endpoint"""
        success, response = self.run_test("Early Access Count", "GET", "early-access/count", 200)
        if success and 'count' in response:
            self.log(f"   Current signups count: {response['count']}")
        return success

    def test_contact_form(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "API Test",
            "message": "This is a test message from the backend test suite."
        }
        
        success, response = self.run_test(
            "Contact Form Submission",
            "POST",
            "contact",
            200,
            data=contact_data
        )
        
        if success and response.get('success'):
            self.log("   Contact form submission successful")
        
        return success

    def test_invalid_contact_form(self):
        """Test contact form with missing fields"""
        invalid_data = {
            "name": "",
            "email": "invalid-email",
            "subject": "Test",
            "message": ""
        }
        
        # This should fail validation but FastAPI might still return 422
        success, response = self.run_test(
            "Contact Form Invalid Data",
            "POST",
            "contact", 
            422,  # Expecting validation error
            data=invalid_data
        )
        
        return success

    # ========== NEW AUTHENTICATION & PAYMENT FEATURES ==========

    def test_user_registration(self):
        """Test user registration endpoint"""
        register_data = {
            "name": "Test User",
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=register_data
        )
        
        if success and response.get('success'):
            self.log(f"   Registration successful for: {response.get('user', {}).get('email')}")
            if response.get('token'):
                self.token = response['token']
                self.log("   JWT token received")
        
        return success

    def test_user_login(self):
        """Test user login endpoint"""
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and response.get('success'):
            self.log(f"   Login successful for: {response.get('user', {}).get('email')}")
            if response.get('token'):
                self.token = response['token']
                self.log("   JWT token received and stored")
        
        return success

    def test_protected_route_me(self):
        """Test protected /auth/me endpoint"""
        if not self.token:
            self.log("❌ No token available for authentication test")
            return False
            
        headers = {"Authorization": f"Bearer {self.token}"}
        
        success, response = self.run_test(
            "Protected Route /auth/me",
            "GET",
            "auth/me",
            200,
            headers=headers
        )
        
        if success and response.get('email'):
            self.log(f"   User data retrieved: {response.get('email')} (subscription: {response.get('subscription')})")
        
        return success

    def test_live_opportunities_free_user(self):
        """Test live opportunities endpoint without authentication (free user)"""
        success, response = self.run_test(
            "Live Opportunities (Free User)",
            "GET",
            "analysis/opportunities",
            200
        )
        
        if success and 'opportunities' in response:
            opportunities = response['opportunities']
            self.log(f"   Retrieved {len(opportunities)} opportunities for free user")
            if len(opportunities) <= 5:
                self.log(f"   ✅ Free user limit enforced (max 5, got {len(opportunities)})")
            else:
                self.log(f"   ⚠️ Free user limit issue (expected max 5, got {len(opportunities)})")
        
        return success

    def test_live_opportunities_authenticated(self):
        """Test live opportunities endpoint with authentication"""
        if not self.token:
            self.log("❌ No token available for authenticated opportunities test")
            return False
            
        headers = {"Authorization": f"Bearer {self.token}"}
        
        success, response = self.run_test(
            "Live Opportunities (Authenticated)",
            "GET",
            "analysis/opportunities",
            200,
            headers=headers
        )
        
        if success and 'opportunities' in response:
            opportunities = response['opportunities']
            is_premium = response.get('is_premium', False)
            self.log(f"   Retrieved {len(opportunities)} opportunities (premium: {is_premium})")
            
            # Check if opportunities have expected structure
            if opportunities and len(opportunities) > 0:
                opp = opportunities[0]
                required_fields = ['id', 'match', 'market', 'confidence', 'risk_score', 'ev']
                missing_fields = [field for field in required_fields if field not in opp]
                if not missing_fields:
                    self.log("   ✅ Opportunity structure complete")
                else:
                    self.log(f"   ⚠️ Missing fields in opportunity: {missing_fields}")
        
        return success

    def test_payment_checkout_auth_required(self):
        """Test payment checkout endpoint (requires authentication)"""
        if not self.token:
            self.log("❌ No token available for payment checkout test")
            return False
            
        checkout_data = {
            "plan": "pro",
            "origin_url": "https://betradarmus-live.preview.emergentagent.com"
        }
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        success, response = self.run_test(
            "Payment Checkout (Pro Plan)",
            "POST",
            "payments/checkout",
            200,
            data=checkout_data,
            headers=headers
        )
        
        if success and response.get('success'):
            checkout_url = response.get('checkout_url', '')
            session_id = response.get('session_id', '')
            self.log(f"   Checkout session created: {session_id[:20]}...")
            if 'stripe.com' in checkout_url:
                self.log("   ✅ Stripe checkout URL generated")
        
        return success

    def test_subscription_plans_endpoint(self):
        """Test subscription plans endpoint"""
        success, response = self.run_test(
            "Subscription Plans",
            "GET",
            "plans",
            200
        )
        
        if success and 'plans' in response:
            plans = response['plans']
            self.log(f"   Retrieved {len(plans)} subscription plans")
            
            plan_names = [plan.get('id') for plan in plans]
            expected_plans = ['free', 'pro', 'elite']
            
            if all(plan in plan_names for plan in expected_plans):
                self.log("   ✅ All expected plans available (free, pro, elite)")
            else:
                self.log(f"   ⚠️ Plans mismatch. Expected: {expected_plans}, Got: {plan_names}")
                
            # Check pricing
            for plan in plans:
                if plan.get('id') == 'pro':
                    if plan.get('price') == 19:
                        self.log("   ✅ Pro plan pricing correct (€19)")
                    else:
                        self.log(f"   ⚠️ Pro plan pricing issue: expected €19, got €{plan.get('price')}")
                elif plan.get('id') == 'elite':
                    if plan.get('price') == 39:
                        self.log("   ✅ Elite plan pricing correct (€39)")
                    else:
                        self.log(f"   ⚠️ Elite plan pricing issue: expected €39, got €{plan.get('price')}")
        
        return success

    def run_all_tests(self):
        """Run all API tests"""
        self.log("🚀 Starting BETRADARMUS Backend API Tests")
        self.log(f"Testing against: {self.api_url}")
        self.log("=" * 50)

        # Test authentication and new features first
        auth_tests = [
            self.test_user_registration,
            self.test_user_login, 
            self.test_protected_route_me,
            self.test_live_opportunities_free_user,
            self.test_live_opportunities_authenticated,
            self.test_payment_checkout_auth_required,
            self.test_subscription_plans_endpoint
        ]

        # Legacy tests
        legacy_tests = [
            self.test_root_endpoint,
            self.test_early_access_signup,
            self.test_early_access_count,
            self.test_early_access_duplicate_email,
            self.test_contact_form,
            self.test_invalid_contact_form
        ]

        all_tests = auth_tests + legacy_tests

        for test_method in all_tests:
            try:
                test_method()
            except Exception as e:
                self.log(f"❌ {test_method.__name__} - Exception: {str(e)}")
                self.failed_tests.append(f"{test_method.__name__}: Exception - {str(e)}")
            self.log("-" * 30)

        # Print summary
        self.log("📊 TEST SUMMARY")
        self.log(f"Tests run: {self.tests_run}")
        self.log(f"Tests passed: {self.tests_passed}")
        self.log(f"Tests failed: {self.tests_run - self.tests_passed}")
        self.log(f"Success rate: {(self.tests_passed / self.tests_run * 100):.1f}%")

        if self.failed_tests:
            self.log("\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                self.log(f"  - {failure}")

        return self.tests_passed == self.tests_run

def main():
    tester = BetradarmusAPITester()
    all_passed = tester.run_all_tests()
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())