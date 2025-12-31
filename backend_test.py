#!/usr/bin/env python3
"""
K.A.V Auditorium Backend API Test Suite
Tests all refactored modular routes after backend restructuring
"""

import requests
import json
import os
from datetime import datetime, timedelta
import sys

# Get backend URL from frontend .env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("❌ Could not get REACT_APP_BACKEND_URL from frontend/.env")
    sys.exit(1)

API_URL = f"{BASE_URL}/api"
print(f"🔗 Testing API at: {API_URL}")

# Test credentials
TEST_USERNAME = "Shahul"
TEST_PASSWORD = "110076@Catlife"

# Global token storage
auth_token = None

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def add_pass(self, test_name):
        self.passed += 1
        print(f"✅ {test_name}")
    
    def add_fail(self, test_name, error):
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        print(f"❌ {test_name}: {error}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n📊 Test Summary: {self.passed}/{total} passed")
        if self.errors:
            print("\n🚨 Failed Tests:")
            for error in self.errors:
                print(f"   - {error}")

results = TestResults()

def make_request(method, endpoint, data=None, headers=None, auth_required=True):
    """Make HTTP request with proper error handling"""
    url = f"{API_URL}{endpoint}"
    
    # Add auth header if required and token available
    if auth_required and auth_token:
        if headers is None:
            headers = {}
        headers['Authorization'] = f"Bearer {auth_token}"
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=30)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method == 'PUT':
            response = requests.put(url, json=data, headers=headers, timeout=30)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return response
    except requests.exceptions.RequestException as e:
        return None, str(e)

def test_authentication():
    """Test authentication endpoints"""
    global auth_token
    
    print("\n🔐 Testing Authentication Endpoints...")
    
    # Test login
    login_data = {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    }
    
    response = make_request('POST', '/admin/login', login_data, auth_required=False)
    if response is None:
        results.add_fail("POST /admin/login", "Request failed - connection error")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if data.get('success') and data.get('token'):
                auth_token = data['token']
                results.add_pass("POST /admin/login - Login successful")
            else:
                results.add_fail("POST /admin/login", f"Invalid response format: {data}")
                return False
        except json.JSONDecodeError:
            results.add_fail("POST /admin/login", "Invalid JSON response")
            return False
    else:
        results.add_fail("POST /admin/login", f"Status {response.status_code}: {response.text}")
        return False
    
    # Test get users (requires auth)
    response = make_request('GET', '/admin/users')
    if response is None:
        results.add_fail("GET /admin/users", "Request failed - connection error")
    elif response.status_code == 200:
        try:
            data = response.json()
            if 'users' in data:
                results.add_pass("GET /admin/users - Users list retrieved")
            else:
                results.add_fail("GET /admin/users", f"Invalid response format: {data}")
        except json.JSONDecodeError:
            results.add_fail("GET /admin/users", "Invalid JSON response")
    else:
        results.add_fail("GET /admin/users", f"Status {response.status_code}: {response.text}")
    
    return auth_token is not None

def test_bookings():
    """Test booking endpoints"""
    print("\n📅 Testing Booking Endpoints...")
    
    # Test public availability
    response = make_request('GET', '/bookings/availability', auth_required=False)
    if response is None:
        results.add_fail("GET /bookings/availability", "Request failed - connection error")
    elif response.status_code == 200:
        try:
            data = response.json()
            if 'dateStatus' in data:
                results.add_pass("GET /bookings/availability - Public availability retrieved")
            else:
                results.add_fail("GET /bookings/availability", f"Invalid response format: {data}")
        except json.JSONDecodeError:
            results.add_fail("GET /bookings/availability", "Invalid JSON response")
    else:
        results.add_fail("GET /bookings/availability", f"Status {response.status_code}: {response.text}")
    
    # Test admin bookings
    response = make_request('GET', '/admin/bookings')
    if response is None:
        results.add_fail("GET /admin/bookings", "Request failed - connection error")
    elif response.status_code == 200:
        try:
            data = response.json()
            if 'bookings' in data:
                results.add_pass("GET /admin/bookings - Admin bookings retrieved")
            else:
                results.add_fail("GET /admin/bookings", f"Invalid response format: {data}")
        except json.JSONDecodeError:
            results.add_fail("GET /admin/bookings", "Invalid JSON response")
    else:
        results.add_fail("GET /admin/bookings", f"Status {response.status_code}: {response.text}")

def test_enquiries():
    """Test enquiry endpoints"""
    print("\n📝 Testing Enquiry Endpoints...")
    
    # Test admin enquiries
    response = make_request('GET', '/admin/enquiries')
    if response is None:
        results.add_fail("GET /admin/enquiries", "Request failed - connection error")
    elif response.status_code == 200:
        try:
            data = response.json()
            if 'enquiries' in data:
                results.add_pass("GET /admin/enquiries - Admin enquiries retrieved")
            else:
                results.add_fail("GET /admin/enquiries", f"Invalid response format: {data}")
        except json.JSONDecodeError:
            results.add_fail("GET /admin/enquiries", "Invalid JSON response")
    else:
        results.add_fail("GET /admin/enquiries", f"Status {response.status_code}: {response.text}")

def test_content():
    """Test content endpoints (gallery and testimonials)"""
    print("\n🖼️ Testing Content Endpoints...")
    
    # Test public gallery
    response = make_request('GET', '/gallery', auth_required=False)
    if response is None:
        results.add_fail("GET /gallery", "Request failed - connection error")
    elif response.status_code == 200:
        try:
            data = response.json()
            if 'images' in data:
                results.add_pass("GET /gallery - Public gallery retrieved")
            else:
                results.add_fail("GET /gallery", f"Invalid response format: {data}")
        except json.JSONDecodeError:
            results.add_fail("GET /gallery", "Invalid JSON response")
    else:
        results.add_fail("GET /gallery", f"Status {response.status_code}: {response.text}")
    
    # Test public testimonials
    response = make_request('GET', '/testimonials', auth_required=False)
    if response is None:
        results.add_fail("GET /testimonials", "Request failed - connection error")
    elif response.status_code == 200:
        try:
            data = response.json()
            if 'testimonials' in data:
                results.add_pass("GET /testimonials - Public testimonials retrieved")
            else:
                results.add_fail("GET /testimonials", f"Invalid response format: {data}")
        except json.JSONDecodeError:
            results.add_fail("GET /testimonials", "Invalid JSON response")
    else:
        results.add_fail("GET /testimonials", f"Status {response.status_code}: {response.text}")
    
    # Test admin gallery
    response = make_request('GET', '/admin/gallery')
    if response is None:
        results.add_fail("GET /admin/gallery", "Request failed - connection error")
    elif response.status_code == 200:
        try:
            data = response.json()
            if 'images' in data:
                results.add_pass("GET /admin/gallery - Admin gallery retrieved")
            else:
                results.add_fail("GET /admin/gallery", f"Invalid response format: {data}")
        except json.JSONDecodeError:
            results.add_fail("GET /admin/gallery", "Invalid JSON response")
    else:
        results.add_fail("GET /admin/gallery", f"Status {response.status_code}: {response.text}")
    
    # Test admin testimonials
    response = make_request('GET', '/admin/testimonials')
    if response is None:
        results.add_fail("GET /admin/testimonials", "Request failed - connection error")
    elif response.status_code == 200:
        try:
            data = response.json()
            if 'testimonials' in data:
                results.add_pass("GET /admin/testimonials - Admin testimonials retrieved")
            else:
                results.add_fail("GET /admin/testimonials", f"Invalid response format: {data}")
        except json.JSONDecodeError:
            results.add_fail("GET /admin/testimonials", "Invalid JSON response")
    else:
        results.add_fail("GET /admin/testimonials", f"Status {response.status_code}: {response.text}")

def test_dashboard():
    """Test dashboard endpoints"""
    print("\n📊 Testing Dashboard Endpoints...")
    
    # Test dashboard stats
    response = make_request('GET', '/admin/stats')
    if response is None:
        results.add_fail("GET /admin/stats", "Request failed - connection error")
    elif response.status_code == 200:
        try:
            data = response.json()
            expected_keys = ['totalBookings', 'pendingBookings', 'confirmedBookings', 'newEnquiries', 'upcomingBookings']
            if all(key in data for key in expected_keys):
                results.add_pass("GET /admin/stats - Dashboard statistics retrieved")
            else:
                results.add_fail("GET /admin/stats", f"Missing expected keys in response: {data}")
        except json.JSONDecodeError:
            results.add_fail("GET /admin/stats", "Invalid JSON response")
    else:
        results.add_fail("GET /admin/stats", f"Status {response.status_code}: {response.text}")
    
    # Test reminders
    response = make_request('GET', '/admin/reminders')
    if response is None:
        results.add_fail("GET /admin/reminders", "Request failed - connection error")
    elif response.status_code == 200:
        try:
            data = response.json()
            if 'enquiryReminders' in data and 'documentReminders' in data:
                results.add_pass("GET /admin/reminders - Reminders retrieved")
                
                # Check if enquiry reminders include eventType field
                enquiry_reminders = data.get('enquiryReminders', [])
                if enquiry_reminders:
                    first_reminder = enquiry_reminders[0]
                    if 'eventType' in first_reminder:
                        results.add_pass("GET /admin/reminders - Enquiry reminders include eventType field")
                    else:
                        results.add_fail("GET /admin/reminders", "Enquiry reminders missing eventType field")
                else:
                    print("   ℹ️  No enquiry reminders found to verify eventType field")
                
            else:
                results.add_fail("GET /admin/reminders", f"Invalid response format: {data}")
        except json.JSONDecodeError:
            results.add_fail("GET /admin/reminders", "Invalid JSON response")
    else:
        results.add_fail("GET /admin/reminders", f"Status {response.status_code}: {response.text}")


def test_reminders_functionality():
    """Test enhanced reminders functionality"""
    print("\n🔔 Testing Enhanced Reminders Functionality...")
    
    # First get reminders to find IDs for testing
    response = make_request('GET', '/admin/reminders')
    if response is None or response.status_code != 200:
        results.add_fail("Reminders functionality test", "Could not retrieve reminders for testing")
        return
    
    try:
        data = response.json()
        enquiry_reminders = data.get('enquiryReminders', [])
        document_reminders = data.get('documentReminders', [])
        
        # Test marking enquiry reminder as done
        if enquiry_reminders:
            enquiry_id = enquiry_reminders[0].get('id')
            if enquiry_id:
                response = make_request('PUT', f'/admin/reminders/enquiry/{enquiry_id}/done')
                if response is None:
                    results.add_fail("PUT /admin/reminders/enquiry/{id}/done", "Request failed - connection error")
                elif response.status_code == 200:
                    try:
                        result = response.json()
                        if result.get('success'):
                            results.add_pass("PUT /admin/reminders/enquiry/{id}/done - Enquiry reminder marked as done")
                        else:
                            results.add_fail("PUT /admin/reminders/enquiry/{id}/done", f"Unexpected response: {result}")
                    except json.JSONDecodeError:
                        results.add_fail("PUT /admin/reminders/enquiry/{id}/done", "Invalid JSON response")
                else:
                    results.add_fail("PUT /admin/reminders/enquiry/{id}/done", f"Status {response.status_code}: {response.text}")
            else:
                results.add_fail("Enquiry reminder test", "No enquiry ID found in reminders")
        else:
            print("   ℹ️  No enquiry reminders found to test marking as done")
        
        # Test marking document reminder as done
        if document_reminders:
            document_id = document_reminders[0].get('id')
            if document_id:
                response = make_request('PUT', f'/admin/reminders/document/{document_id}/done')
                if response is None:
                    results.add_fail("PUT /admin/reminders/document/{id}/done", "Request failed - connection error")
                elif response.status_code == 200:
                    try:
                        result = response.json()
                        if result.get('success'):
                            results.add_pass("PUT /admin/reminders/document/{id}/done - Document reminder marked as done")
                        else:
                            results.add_fail("PUT /admin/reminders/document/{id}/done", f"Unexpected response: {result}")
                    except json.JSONDecodeError:
                        results.add_fail("PUT /admin/reminders/document/{id}/done", "Invalid JSON response")
                else:
                    results.add_fail("PUT /admin/reminders/document/{id}/done", f"Status {response.status_code}: {response.text}")
            else:
                results.add_fail("Document reminder test", "No document ID found in reminders")
        else:
            print("   ℹ️  No document reminders found to test marking as done")
            
    except json.JSONDecodeError:
        results.add_fail("Reminders functionality test", "Invalid JSON response from reminders endpoint")


def test_bill_categories():
    """Test bill categories functionality"""
    print("\n📋 Testing Bill Categories Functionality...")
    
    # Test get bill categories
    response = make_request('GET', '/admin/bill-categories')
    if response is None:
        results.add_fail("GET /admin/bill-categories", "Request failed - connection error")
    elif response.status_code == 200:
        try:
            data = response.json()
            if 'categories' in data:
                categories = data['categories']
                if len(categories) == 9:
                    results.add_pass("GET /admin/bill-categories - Returns 9 categories")
                    
                    # Check if categories have required fields
                    required_fields = ['id', 'name', 'icon', 'count']
                    if all(all(field in cat for field in required_fields) for cat in categories):
                        results.add_pass("GET /admin/bill-categories - Categories have required fields")
                    else:
                        results.add_fail("GET /admin/bill-categories", "Categories missing required fields")
                    
                    # Test specific category endpoint (water-test)
                    response = make_request('GET', '/admin/bills/water-test')
                    if response is None:
                        results.add_fail("GET /admin/bills/water-test", "Request failed - connection error")
                    elif response.status_code == 200:
                        try:
                            bills_data = response.json()
                            if 'documents' in bills_data and 'category' in bills_data:
                                results.add_pass("GET /admin/bills/water-test - Bills by category retrieved")
                                if bills_data['category'] == 'water-test':
                                    results.add_pass("GET /admin/bills/water-test - Correct category returned")
                                else:
                                    results.add_fail("GET /admin/bills/water-test", f"Wrong category returned: {bills_data['category']}")
                            else:
                                results.add_fail("GET /admin/bills/water-test", f"Invalid response format: {bills_data}")
                        except json.JSONDecodeError:
                            results.add_fail("GET /admin/bills/water-test", "Invalid JSON response")
                    else:
                        results.add_fail("GET /admin/bills/water-test", f"Status {response.status_code}: {response.text}")
                        
                else:
                    results.add_fail("GET /admin/bill-categories", f"Expected 9 categories, got {len(categories)}")
            else:
                results.add_fail("GET /admin/bill-categories", f"Invalid response format: {data}")
        except json.JSONDecodeError:
            results.add_fail("GET /admin/bill-categories", "Invalid JSON response")
    else:
        results.add_fail("GET /admin/bill-categories", f"Status {response.status_code}: {response.text}")

def test_root_endpoint():
    """Test root API endpoint"""
    print("\n🏠 Testing Root Endpoint...")
    
    response = make_request('GET', '/', auth_required=False)
    if response is None:
        results.add_fail("GET /api/", "Request failed - connection error")
    elif response.status_code == 200:
        try:
            data = response.json()
            if 'message' in data:
                results.add_pass("GET /api/ - Root endpoint working")
            else:
                results.add_fail("GET /api/", f"Invalid response format: {data}")
        except json.JSONDecodeError:
            results.add_fail("GET /api/", "Invalid JSON response")
    else:
        results.add_fail("GET /api/", f"Status {response.status_code}: {response.text}")

def main():
    """Run all tests"""
    print("🚀 Starting K.A.V Auditorium Backend API Tests")
    print(f"📍 Backend URL: {BASE_URL}")
    print(f"🔑 Test User: {TEST_USERNAME}")
    
    # Test root endpoint first
    test_root_endpoint()
    
    # Test authentication (required for other tests)
    if not test_authentication():
        print("\n❌ Authentication failed - skipping authenticated tests")
        results.summary()
        return
    
    # Test all other endpoints
    test_bookings()
    test_enquiries()
    test_content()
    test_dashboard()
    
    # Print final results
    results.summary()
    
    # Exit with appropriate code
    if results.failed > 0:
        print(f"\n⚠️  {results.failed} tests failed - check backend logs for details")
        sys.exit(1)
    else:
        print(f"\n🎉 All {results.passed} tests passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()