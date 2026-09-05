"""Comprehensive endpoint test for Stage Platform Backend."""
import requests
import json
import sys
import io

BASE = "http://127.0.0.1:8000"
results = []

def test(method, path, data=None, headers=None, expected_status=None, label="", files=None):
    url = f"{BASE}{path}"
    try:
        if files:
            r = requests.request(method, url, files=files, data=data or {}, headers=headers, timeout=10)
        elif data is not None:
            r = requests.request(method, url, json=data, headers=headers, timeout=10)
        else:
            r = requests.request(method, url, headers=headers, timeout=10)
        status = r.status_code
        ok = expected_status is None or status == expected_status
        mark = "PASS" if ok else "FAIL"
        results.append((mark, f"{method:6s} {path}", status, expected_status, label))
        print(f"  [{mark}] {method:6s} {path} -> {status}" + (f" (expected {expected_status})" if not ok else ""))
        return r
    except Exception as e:
        results.append(("FAIL", f"{method:6s} {path}", 0, expected_status, f"ERROR: {e}"))
        print(f"  [FAIL] {method:6s} {path} -> ERROR: {e}")
        return None

print("=" * 70)
print("STAGE PLATFORM - COMPREHENSIVE ENDPOINT TEST")
print("=" * 70)

# ── 1. AUTH ──
print("\n--- 1. AUTH ---")
r = test("POST", "/api/auth/token/", {"username": "admin", "password": "admin123"}, expected_status=200, label="Login admin")
admin_token = r.json().get("access") if r and r.status_code == 200 else None
admin_refresh = r.json().get("refresh") if r and r.status_code == 200 else None

r = test("POST", "/api/auth/token/", {"username": "admin", "password": "wrong"}, expected_status=401, label="Login bad password")
r = test("POST", "/api/auth/token/refresh/", {"refresh": admin_refresh}, expected_status=200, label="Refresh token")
if r and r.status_code == 200:
    admin_token = r.json().get("access")

AUTH = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}

# Register
r = test("POST", "/api/users/register/", {
    "username": "testinvestor", "email": "investor@test.com",
    "first_name": "Test", "last_name": "Investor",
    "role": "INVESTOR", "password": "testpass123", "password_confirm": "testpass123"
}, expected_status=201, label="Register investor")

r = test("POST", "/api/users/register/", {
    "username": "testowner", "email": "owner@test.com",
    "first_name": "Test", "last_name": "Owner",
    "role": "PROJECT_OWNER", "password": "testpass123", "password_confirm": "testpass123"
}, expected_status=201, label="Register project owner")

r = test("POST", "/api/users/register/", {
    "username": "testinvestor2", "email": "investor@test.com",
    "first_name": "Dup", "last_name": "User",
    "role": "INVESTOR", "password": "testpass123", "password_confirm": "testpass123"
}, expected_status=400, label="Register duplicate email")

# Login investor/owner
r = test("POST", "/api/auth/token/", {"username": "testinvestor", "password": "testpass123"}, expected_status=200, label="Login investor")
investor_token = r.json().get("access") if r and r.status_code == 200 else None
INV_AUTH = {"Authorization": f"Bearer {investor_token}"} if investor_token else {}

r = test("POST", "/api/auth/token/", {"username": "testowner", "password": "testpass123"}, expected_status=200, label="Login owner")
owner_token = r.json().get("access") if r and r.status_code == 200 else None
OWN_AUTH = {"Authorization": f"Bearer {owner_token}"} if owner_token else {}

# ── 2. USERS ──
print("\n--- 2. USERS ---")
r = test("GET", "/api/users/me/", headers=AUTH, expected_status=200, label="Get profile (admin)")
r = test("PATCH", "/api/users/me/", {"first_name": "Super"}, headers=AUTH, expected_status=200, label="Update profile (admin)")
r = test("GET", "/api/users/me/", headers=INV_AUTH, expected_status=200, label="Get profile (investor)")
r = test("PATCH", "/api/users/me/", {"first_name": "Investor"}, headers=INV_AUTH, expected_status=200, label="Update profile (investor)")

# ── 3. KYC ──
print("\n--- 3. KYC ---")
r = test("GET", "/api/users/kyc/", headers=INV_AUTH, expected_status=404, label="Get KYC (not submitted)")
file_content = b"fake pdf content"
files = {'id_document': ('test.pdf', io.BytesIO(file_content), 'application/pdf')}
r = test("POST", "/api/users/kyc/", headers=INV_AUTH, expected_status=201, label="Submit KYC (file)", files=files)
r = test("GET", "/api/users/kyc/", headers=INV_AUTH, expected_status=200, label="Get KYC (submitted)")
kyc_id = r.json().get("id") if r and r.status_code == 200 else None
files2 = {'id_document': ('test2.pdf', io.BytesIO(file_content), 'application/pdf')}
r = test("POST", "/api/users/kyc/", headers=INV_AUTH, expected_status=400, label="Submit KYC duplicate", files=files2)

# Approve KYC so investor can invest
r = test("PATCH", f"/api/users/kyc/{kyc_id}/review/", {"status": "APPROVED"}, headers=AUTH, expected_status=200, label="Approve KYC")

# ── 4. PROJECTS ──
print("\n--- 4. PROJECTS ---")
r = test("GET", "/api/projects/", expected_status=200, label="List projects (public)")
r = test("POST", "/api/projects/", {
    "title": "Test Project", "description": "A test project",
    "risk_type": "MARKET", "target_amount": 100000,
    "duration_months": 12, "risk_level": "MEDIUM"
}, headers=OWN_AUTH, expected_status=201, label="Create project")
project_id = r.json().get("id") if r and r.status_code == 201 else None

r = test("GET", f"/api/projects/{project_id}/", headers=AUTH, expected_status=200, label="Get project (admin)")
r = test("GET", f"/api/projects/{project_id}/", expected_status=403, label="Get non-published (unauth)")
r = test("GET", "/api/projects/mine/", headers=OWN_AUTH, expected_status=200, label="My projects")
r = test("POST", f"/api/projects/{project_id}/submit/", headers=OWN_AUTH, expected_status=200, label="Submit project")
r = test("POST", f"/api/projects/{project_id}/approve/", headers=AUTH, expected_status=200, label="Approve project")
r = test("GET", "/api/projects/", expected_status=200, label="List published (after approve)")
r = test("GET", "/api/projects/admin/pending/", headers=AUTH, expected_status=200, label="Admin pending projects")

# ── 5. ADMIN PROJECTS ──
print("\n--- 5. ADMIN PROJECTS ---")
r = test("GET", "/api/projects/admin/projects/", headers=AUTH, expected_status=200, label="Admin list projects")
r = test("GET", f"/api/projects/admin/projects/{project_id}/", headers=AUTH, expected_status=200, label="Admin get project")
r = test("PATCH", f"/api/projects/admin/projects/{project_id}/", {"title": "Updated Project"}, headers=AUTH, expected_status=200, label="Admin update project")
r = test("GET", "/api/projects/admin/projects/", headers=INV_AUTH, expected_status=403, label="Admin projects (investor forbidden)")

# ── 6. POOLS ──
print("\n--- 6. POOLS ---")
r = test("GET", "/api/pools/", expected_status=200, label="List pools (public)")
r = test("POST", "/api/pools/create/", {
    "project": project_id, "target_amount": 100000,
    "minimum_investment": 100, "start_date": "2026-01-01", "end_date": "2026-12-31"
}, headers=OWN_AUTH, expected_status=201, label="Create pool")
pool_id = r.json().get("id") if r and r.status_code == 201 else None

r = test("POST", "/api/pools/create/", {
    "project": project_id, "target_amount": 50000,
    "minimum_investment": 50, "start_date": "2026-12-31", "end_date": "2026-01-01"
}, headers=OWN_AUTH, expected_status=400, label="Create pool (bad dates)")

r = test("GET", f"/api/pools/{pool_id}/", expected_status=200, label="Pool detail")
r = test("GET", "/api/pools/mine/", headers=OWN_AUTH, expected_status=200, label="My pools")

# ── 7. INVESTMENTS ──
print("\n--- 7. INVESTMENTS ---")
r = test("POST", "/api/investments/", {"pool": pool_id, "amount": 500}, headers=INV_AUTH, expected_status=201, label="Create investment")
investment_id = r.json().get("id") if r and r.status_code == 201 else None
r = test("GET", "/api/investments/mine/", headers=INV_AUTH, expected_status=200, label="My investments")
r = test("GET", f"/api/investments/{investment_id}/", headers=INV_AUTH, expected_status=200, label="Investment detail")

# ── 8. ADMIN INVESTMENTS ──
print("\n--- 8. ADMIN INVESTMENTS ---")
r = test("GET", "/api/investments/admin/investments/", headers=AUTH, expected_status=200, label="Admin list investments")
r = test("GET", f"/api/investments/admin/investments/{investment_id}/", headers=AUTH, expected_status=200, label="Admin get investment")

# ── 9. PAYMENTS ──
print("\n--- 9. PAYMENTS ---")
r = test("POST", "/api/payments/", {"investment_id": investment_id, "method": "CARD"}, headers=INV_AUTH, expected_status=201, label="Create payment")
payment_id = r.json().get("id") if r and r.status_code == 201 else None
r = test("GET", "/api/payments/mine/", headers=INV_AUTH, expected_status=200, label="My payments")
r = test("GET", f"/api/payments/{payment_id}/", headers=INV_AUTH, expected_status=200, label="Payment detail")
r = test("POST", f"/api/payments/{payment_id}/confirm/", headers=INV_AUTH, expected_status=200, label="Confirm payment")

# ── 10. ADMIN PAYMENTS ──
print("\n--- 10. ADMIN PAYMENTS ---")
r = test("GET", "/api/payments/admin/payments/", headers=AUTH, expected_status=200, label="Admin list payments")
r = test("GET", f"/api/payments/admin/payments/{payment_id}/", headers=AUTH, expected_status=200, label="Admin get payment")

# ── 11. TRANSACTIONS ──
print("\n--- 11. TRANSACTIONS ---")
r = test("GET", "/api/transactions/mine/", headers=INV_AUTH, expected_status=200, label="My transactions")

# ── 12. ADMIN TRANSACTIONS ──
print("\n--- 12. ADMIN TRANSACTIONS ---")
r = test("GET", "/api/transactions/admin/transactions/", headers=AUTH, expected_status=200, label="Admin list transactions")

# ── 13. SECONDARY MARKET ──
print("\n--- 13. SECONDARY MARKET ---")
r = test("POST", "/api/secondary-market/", {"investment_id": investment_id, "price": 600}, headers=INV_AUTH, expected_status=201, label="List on market")
listing_id = r.json().get("id") if r and r.status_code == 201 else None
r = test("GET", "/api/secondary-market/market/", headers=INV_AUTH, expected_status=200, label="Market listings")
r = test("GET", "/api/secondary-market/mine/", headers=INV_AUTH, expected_status=200, label="My listings")
if listing_id:
    r = test("POST", f"/api/secondary-market/{listing_id}/cancel/", headers=INV_AUTH, expected_status=200, label="Cancel listing")

# ── 14. ADMIN LISTINGS ──
print("\n--- 14. ADMIN LISTINGS ---")
r = test("GET", "/api/secondary-market/admin/listings/", headers=AUTH, expected_status=200, label="Admin list listings")

# ── 15. NOTIFICATIONS ──
print("\n--- 15. NOTIFICATIONS ---")
r = test("GET", "/api/notifications/", headers=INV_AUTH, expected_status=200, label="My notifications")
r = test("POST", "/api/notifications/read-all/", headers=INV_AUTH, expected_status=200, label="Mark all read")

# ── 16. ADMIN NOTIFICATIONS ──
print("\n--- 16. ADMIN NOTIFICATIONS ---")
r = test("GET", "/api/notifications/admin/notifications/", headers=AUTH, expected_status=200, label="Admin list notifications")

# ── 17. RISK MANAGEMENT ──
print("\n--- 17. RISK MANAGEMENT ---")
r = test("GET", "/api/risk/", expected_status=200, label="List risk assessments")
r = test("GET", f"/api/risk/project/{project_id}/", expected_status=200, label="Risk by project")

# ── 18. ADMIN USERS ──
print("\n--- 18. ADMIN USERS ---")
r = test("GET", "/api/users/admin/users/", headers=AUTH, expected_status=200, label="Admin list users")
r = test("GET", "/api/users/admin/users/", headers=INV_AUTH, expected_status=403, label="Admin users (investor forbidden)")

# ── 19. LOGOUT ──
print("\n--- 19. LOGOUT ---")
# Get a fresh token first
r = test("POST", "/api/auth/token/", {"username": "admin", "password": "admin123"}, expected_status=200, label="Login admin (for logout)")
fresh_refresh = r.json().get("refresh") if r and r.status_code == 200 else None
if fresh_refresh:
    r = test("POST", "/api/users/logout/", {"refresh": fresh_refresh}, headers=AUTH, expected_status=205, label="Logout")

# ── 20. SCHEMA / DOCS ──
print("\n--- 20. API DOCS ---")
r = test("GET", "/api/schema/", expected_status=200, label="OpenAPI schema")
r = test("GET", "/api/docs/", expected_status=200, label="Swagger UI")
r = test("GET", "/api/redoc/", expected_status=200, label="ReDoc")

# ── SUMMARY ──
print("\n" + "=" * 70)
passed = sum(1 for r in results if r[0] == "PASS")
failed = sum(1 for r in results if r[0] == "FAIL")
print(f"RESULTS: {passed} passed, {failed} failed, {len(results)} total")
print("=" * 70)

if failed:
    print("\nFAILED TESTS:")
    for r in results:
        if r[0] == "FAIL":
            print(f"  {r[1]} -> got {r[2]}, expected {r[3]} ({r[4]})")

sys.exit(1 if failed else 0)
