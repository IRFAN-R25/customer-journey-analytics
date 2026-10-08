import urllib.request
import json

def api_call(url, data=None, headers=None):
    if headers is None:
        headers = {}
    h = {'Content-Type': 'application/json', **headers}
    payload = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(url, data=payload, headers=h)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def test_empty_system():
    print("--- TESTING CLEAN SYSTEM AFTER DATA RESET ---")
    
    # 1. Verify Products is empty
    prods = api_call('http://127.0.0.1:8001/api/products')
    print(f"1. Products API count: {len(prods)} (Expected: 0)")
    assert len(prods) == 0, "Products should be empty"

    # 2. Test Admin Login with preserved admin credentials
    admin_login = api_call('http://127.0.0.1:8001/api/auth/login', {'email': 'admin@ecommerce.com', 'password': 'admin123'})
    admin_token = admin_login['access_token']
    admin_headers = {'Authorization': f'Bearer {admin_token}'}
    print(f"2. Admin Login: SUCCESS (Role: {admin_login['user']['role']})")
    assert admin_login['user']['role'] == 'ADMIN'

    # 3. Test Admin Overview Analytics for Natural Empty State (all zeros)
    overview = api_call('http://127.0.0.1:8001/api/admin/analytics/overview', headers=admin_headers)
    print("3. Admin Overview KPIs (Natural Empty State):")
    print(f"   - Customers: {overview['total_customers']}")
    print(f"   - Orders: {overview['total_orders']}")
    print(f"   - Revenue: ${overview['revenue']}")
    print(f"   - Sessions: {overview['total_sessions']}")
    print(f"   - Products: {overview['total_products']}")
    print(f"   - Product Views: {overview['product_views']}")
    print(f"   - Searches: {overview['searches']}")
    print(f"   - Conversion Rate: {overview['conversion_rate']}%")
    print(f"   - Cart Abandonment Rate: {overview['cart_abandonment_rate']}%")
    print(f"   - Revenue Trend Entries: {len(overview['revenue_trend'])}")
    print(f"   - Event Distribution Entries: {len(overview['event_distribution'])}")
    
    assert overview['total_customers'] == 0
    assert overview['total_orders'] == 0
    assert overview['revenue'] == 0.0
    assert overview['total_sessions'] == 0
    assert overview['total_products'] == 0
    assert overview['product_views'] == 0
    assert overview['searches'] == 0
    assert overview['conversion_rate'] == 0.0
    assert overview['cart_abandonment_rate'] == 0.0
    assert len(overview['revenue_trend']) == 0
    assert len(overview['event_distribution']) == 0

    # 4. Test Customer Journeys is naturally empty
    journeys = api_call('http://127.0.0.1:8001/api/admin/analytics/journeys', headers=admin_headers)
    print(f"4. Customer Journeys count: {len(journeys['journeys'])} (Expected: 0)")
    assert len(journeys['journeys']) == 0

    # 5. Test Clickstream Stream is naturally empty
    clickstream = api_call('http://127.0.0.1:8001/api/admin/analytics/clickstream', headers=admin_headers)
    print(f"5. Clickstream Log count: {len(clickstream)} (Expected: 0)")
    assert len(clickstream) == 0

    # 6. Test Registering a brand new fresh customer
    test_email = "fresh.shopper@example.com"
    reg_res = api_call('http://127.0.0.1:8001/api/auth/register', {
        'name': 'Fresh Shopper',
        'email': test_email,
        'password': 'password123'
    })
    fresh_token = reg_res['access_token']
    fresh_headers = {'Authorization': f'Bearer {fresh_token}'}
    print(f"6. Fresh Customer Registration: SUCCESS (ID: {reg_res['user']['id']}, Name: {reg_res['user']['name']})")

    # 7. Test Fresh Customer Login
    fresh_login = api_call('http://127.0.0.1:8001/api/auth/login', {'email': test_email, 'password': 'password123'})
    print(f"7. Fresh Customer Login: SUCCESS")

    # 8. Test Fresh Customer Cart & Orders (must be clean and empty)
    fresh_cart = api_call('http://127.0.0.1:8001/api/cart', headers=fresh_headers)
    fresh_orders = api_call('http://127.0.0.1:8001/api/orders', headers=fresh_headers)
    fresh_history = api_call('http://127.0.0.1:8001/api/events/user-history', headers=fresh_headers)
    print(f"8. Fresh Customer Data State:")
    print(f"   - Cart items: {len(fresh_cart['items'])} (Total: ${fresh_cart['total_amount']})")
    print(f"   - Orders count: {len(fresh_orders)}")
    print(f"   - Recently viewed count: {len(fresh_history['recently_viewed'])}")
    print(f"   - Recent searches count: {len(fresh_history['recent_searches'])}")
    assert len(fresh_cart['items']) == 0
    assert len(fresh_orders) == 0
    assert len(fresh_history['recently_viewed']) == 0
    assert len(fresh_history['recent_searches']) == 0

    # 9. Clean up test user so the DB remains completely clean for the user
    # (delete fresh.shopper from DB)
    from app.database import SessionLocal
    from app.models import User, Cart
    db = SessionLocal()
    u = db.query(User).filter(User.email == test_email).first()
    if u:
        if u.cart:
            db.delete(u.cart)
        db.delete(u)
        db.commit()
    db.close()
    print("9. Cleaned up verification customer. Only Admin account remains in DB.")

    print("\n=======================================================")
    print("ALL TESTS PASSED: DATABASE IS CLEAN & APPS WORK PERFECTLY!")
    print("=======================================================")

if __name__ == "__main__":
    test_empty_system()
