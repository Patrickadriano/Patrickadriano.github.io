#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta

class GatekeeperAPITester:
    def __init__(self, base_url="https://visitor-fleet-log.preview.emergentagent.com"):
        self.base_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, expect_json=True):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            print(f"   Status: {response.status_code}")
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if expect_json:
                    try:
                        resp_data = response.json()
                        return success, resp_data
                    except:
                        return success, {}
                else:
                    return success, response.content
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            self.failed_tests.append(f"{name}: Network error - {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("Root API", "GET", "/", 200)

    def test_login(self, username="admin", password="admin123"):
        """Test login and store token"""
        success, response = self.run_test(
            "Login",
            "POST",
            "/auth/login",
            200,
            data={"username": username, "password": password}
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Token acquired for user: {response['user']['name']}")
            return True
        return False

    def test_verify_token(self):
        """Test token verification"""
        return self.run_test("Verify Token", "GET", "/auth/verify", 200)

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        return self.run_test("Dashboard Stats", "GET", "/dashboard/stats", 200)

    def test_visitor_operations(self):
        """Test visitor CRUD operations"""
        print("\n📋 Testing Visitor Operations...")
        
        # Create visitor
        visitor_data = {
            "name": "João Silva Test",
            "document": "12345678901",
            "vehicle_plate": "ABC-1234",
            "company": "Test Company",
            "observation": "Test visitor for API testing"
        }
        success, visitor_response = self.run_test(
            "Create Visitor", "POST", "/visitors", 200, visitor_data
        )
        if not success:
            return False
        
        visitor_id = visitor_response.get('id')
        
        # List visitors
        success, _ = self.run_test("List All Visitors", "GET", "/visitors", 200)
        if not success:
            return False
            
        # List active visitors
        success, _ = self.run_test("List Active Visitors", "GET", "/visitors?active=true", 200)
        if not success:
            return False
            
        # List today's visitors
        today = datetime.now().strftime("%Y-%m-%d")
        success, _ = self.run_test("List Today's Visitors", "GET", f"/visitors?date={today}", 200)
        if not success:
            return False
        
        # Checkout visitor
        if visitor_id:
            success, _ = self.run_test(
                "Checkout Visitor", "PUT", f"/visitors/{visitor_id}/checkout", 200
            )
            return success
        
        return True

    def test_schedule_operations(self):
        """Test schedule CRUD operations"""
        print("\n📅 Testing Schedule Operations...")
        
        # Create schedule
        schedule_data = {
            "visitor_name": "Maria Santos Test",
            "company": "Test Corp",
            "visit_date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
            "visit_time": "14:30",
            "notes": "Important meeting test"
        }
        success, schedule_response = self.run_test(
            "Create Schedule", "POST", "/schedules", 200, schedule_data
        )
        if not success:
            return False
        
        schedule_id = schedule_response.get('id')
        
        # List schedules
        success, _ = self.run_test("List All Schedules", "GET", "/schedules", 200)
        if not success:
            return False
            
        # List today's schedules
        success, _ = self.run_test("List Today's Schedules", "GET", "/schedules/today", 200)
        if not success:
            return False
        
        # Complete schedule
        if schedule_id:
            success, _ = self.run_test(
                "Complete Schedule", "PUT", f"/schedules/{schedule_id}/complete", 200
            )
            if not success:
                return False
                
            # Delete schedule
            success, _ = self.run_test(
                "Delete Schedule", "DELETE", f"/schedules/{schedule_id}", 200
            )
            return success
        
        return True

    def test_fleet_operations(self):
        """Test fleet CRUD operations"""
        print("\n🚗 Testing Fleet Operations...")
        
        # Create fleet trip
        trip_data = {
            "driver_name": "Carlos Oliveira Test",
            "vehicle": "Toyota Hilux - XYZ-5678",
            "departure_km": 45230.5
        }
        success, trip_response = self.run_test(
            "Create Fleet Trip", "POST", "/fleet", 200, trip_data
        )
        if not success:
            return False
        
        trip_id = trip_response.get('id')
        
        # List fleet trips
        success, _ = self.run_test("List All Fleet Trips", "GET", "/fleet", 200)
        if not success:
            return False
            
        # List active trips
        success, _ = self.run_test("List Active Fleet Trips", "GET", "/fleet?active=true", 200)
        if not success:
            return False
            
        # List today's trips
        today = datetime.now().strftime("%Y-%m-%d")
        success, _ = self.run_test("List Today's Fleet Trips", "GET", f"/fleet?date={today}", 200)
        if not success:
            return False
        
        # Return fleet trip
        if trip_id:
            return_data = {"arrival_km": 45280.7}
            success, return_response = self.run_test(
                "Return Fleet Trip", "PUT", f"/fleet/{trip_id}/return", 200, return_data
            )
            if success:
                distance = return_response.get('distance', 0)
                print(f"   Distance calculated: {distance} km")
            return success
        
        return True

    def test_report_operations(self):
        """Test report operations"""
        print("\n📊 Testing Report Operations...")
        
        # Get daily report
        today = datetime.now().strftime("%Y-%m-%d")
        success, _ = self.run_test("Get Daily Report", "GET", f"/reports/daily?date={today}", 200)
        if not success:
            return False
        
        # Save report observation
        obs_data = {
            "observation": "Test report observation from API test",
            "porter_name": "Test Porter"
        }
        success, _ = self.run_test(
            "Save Report Observation", "POST", f"/reports/observation?date={today}", 200, obs_data
        )
        return success

    def test_export_functions(self):
        """Test export functions (Excel/PDF)"""
        print("\n📄 Testing Export Functions...")
        
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Test Excel export
        success, content = self.run_test(
            "Export Excel", "GET", f"/reports/export/excel?date={today}", 200, expect_json=False
        )
        if success:
            print(f"   Excel export size: {len(content)} bytes")
        
        if not success:
            return False
        
        # Test PDF export
        success, content = self.run_test(
            "Export PDF", "GET", f"/reports/export/pdf?date={today}", 200, expect_json=False
        )
        if success:
            print(f"   PDF export size: {len(content)} bytes")
        
        return success

    def test_user_management(self):
        """Test user management operations (Admin only)"""
        print("\n👥 Testing User Management (Admin Operations)...")
        
        # List users
        success, users_response = self.run_test("List Users", "GET", "/users", 200)
        if not success:
            return False
            
        # Create new user
        user_data = {
            "username": "testuser123",
            "password": "testpass123",
            "name": "Test User API",
            "role": "porteiro"
        }
        success, new_user = self.run_test("Create User", "POST", "/users", 200, user_data)
        if not success:
            return False
            
        new_user_id = new_user.get('id')
        
        # Update user
        if new_user_id:
            update_data = {
                "name": "Test User Updated",
                "role": "porteiro"
            }
            success, _ = self.run_test(
                "Update User", "PUT", f"/users/{new_user_id}", 200, update_data
            )
            if not success:
                return False
                
            # Delete user
            success, _ = self.run_test(
                "Delete User", "DELETE", f"/users/{new_user_id}", 200
            )
            return success
        
        return True

    def test_auth_edge_cases(self):
        """Test authentication edge cases"""
        print("\n🔐 Testing Authentication Edge Cases...")
        
        # Test invalid login
        success, _ = self.run_test(
            "Invalid Login", "POST", "/auth/login", 401,
            data={"username": "wronguser", "password": "wrongpass"}
        )
        if not success:
            return False
        
        # Store original token
        original_token = self.token
        
        # Test expired/invalid token
        self.token = "invalid.token.here"
        success, _ = self.run_test("Invalid Token", "GET", "/auth/verify", 401)
        
        # Restore original token
        self.token = original_token
        
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Gatekeeper API Tests")
        print("=" * 50)
        
        # Test connection
        if not self.test_root_endpoint()[0]:
            print("❌ Cannot connect to API. Stopping tests.")
            return False
            
        # Login first
        if not self.test_login():
            print("❌ Login failed. Cannot continue with authenticated tests.")
            return False
            
        # Run authenticated tests
        test_methods = [
            self.test_verify_token,
            self.test_dashboard_stats,
            self.test_visitor_operations,
            self.test_schedule_operations,
            self.test_fleet_operations,
            self.test_report_operations,
            self.test_export_functions,
            self.test_user_management,
            self.test_auth_edge_cases,
        ]
        
        for test_method in test_methods:
            try:
                if not test_method()[0] if isinstance(test_method(), tuple) else not test_method():
                    print(f"⚠️  Some issues in {test_method.__name__}")
            except Exception as e:
                print(f"❌ Exception in {test_method.__name__}: {str(e)}")
                self.failed_tests.append(f"{test_method.__name__}: Exception - {str(e)}")
        
        # Print final results
        print("\n" + "=" * 50)
        print(f"📊 FINAL RESULTS")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"   • {failure}")
        
        return self.tests_run - self.tests_passed == 0

if __name__ == "__main__":
    tester = GatekeeperAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)