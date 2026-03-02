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

    def test_status_endpoint(self):
        """Test status check endpoints"""
        # Create status check
        status_data = {"client_name": "test_client"}
        
        success, response = self.run_test(
            "Create Status Check",
            "POST",
            "status",
            200,
            data=status_data
        )
        
        if not success:
            return False
            
        # Get status checks
        success, response = self.run_test(
            "Get Status Checks",
            "GET",
            "status",
            200
        )
        
        if success and isinstance(response, list):
            self.log(f"   Retrieved {len(response)} status checks")
        
        return success

    def run_all_tests(self):
        """Run all API tests"""
        self.log("🚀 Starting BETRADARMUS Backend API Tests")
        self.log(f"Testing against: {self.api_url}")
        self.log("=" * 50)

        test_methods = [
            self.test_root_endpoint,
            self.test_early_access_signup,
            self.test_early_access_count,
            self.test_early_access_duplicate_email,
            self.test_contact_form,
            self.test_invalid_contact_form,
            self.test_status_endpoint
        ]

        for test_method in test_methods:
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