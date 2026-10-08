import urllib.request
import json

def test_req(url, data=None, headers=None):
    if headers is None:
        headers = {}
    h = {'Content-Type': 'application/json', **headers}
    payload = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(url, data=payload, headers=h)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def run_suite():
    print("--- STARTING END-TO-END VERIFICATION SUITE ---")
    
    # 1. Health
    h = test_req('http://127.0.0.1:8001/api/health')
    print("1. Health Check:", h)
    assert h["status"] == "healthy"

    # 2. Products
    prods = test_req('http://127.0.0.1:8001/api/products?limit=5')
    print(f"2. Products List: {len(prods)} products fetched. Item #1: {prods[0]['name']}")
    assert len(prods) == 5

    # 3. Product Search
    search_res = test_req('http://127.0.0.1:8001/api/products?search=shoes')
    print(f"3. Search 'shoes': {len(search_res)} matching results.")
    assert len(search_res) > 0

    # 4. Customer Login
    login = test_req('http://127.0.0.1:8001/api/auth/login', {'email': 'demo@user.com', 'password': 'user123'})
    user_token = login['access_token']
    user_headers = {'Authorization': f'Bearer {user_token}'}
    print(f"4. Customer Auth: Logged in as {login['user']['name']} ({login['user']['email']})")

    # 5. Clickstream Event Tracking
    ev = test_req('http://127.0.0.1:8001/api/events', {
        'session_id': 'sess_automated_verification_01',
        'event_type': 'product_view',
        'page': '/products/1',
        'product_id': 1
    }, user_headers)
    print("5. Clickstream Ingestion:", ev)
    assert ev["status"] == "success"

    # 6. Cart Add
    cart = test_req('http://127.0.0.1:8001/api/cart/add', {'product_id': 1, 'quantity': 1}, user_headers)
    print(f"6. Cart Ingestion: {len(cart['items'])} items, Total: ${cart['total_amount']}")

    # 7. Wishlist Toggle
    wl = test_req('http://127.0.0.1:8001/api/wishlist/toggle', {'product_id': 2}, user_headers)
    print("7. Wishlist Toggle:", wl)

    # 8. Checkout Flow
    order = test_req('http://127.0.0.1:8001/api/orders/checkout', {
        'customer_name': 'Demo Shopper',
        'customer_email': 'demo@user.com',
        'customer_phone': '+1 555-0199',
        'shipping_address': '123 Market Street',
        'city': 'San Francisco',
        'pincode': '94105',
        'payment_method': 'Demo Card'
    }, user_headers)
    print(f"8. Checkout Complete: Order {order['order_code']}, Total: ${order['total_amount']}")
    assert order["order_code"].startswith("ORD-")

    # 9. Verify Customer Orders
    orders_list = test_req('http://127.0.0.1:8001/api/orders', headers=user_headers)
    print(f"9. Customer Orders History: {len(orders_list)} orders recorded.")

    # 10. Admin Login
    admin_login = test_req('http://127.0.0.1:8001/api/auth/login', {'email': 'admin@ecommerce.com', 'password': 'admin123'})
    admin_token = admin_login['access_token']
    admin_headers = {'Authorization': f'Bearer {admin_token}'}
    print(f"10. Admin Auth: Logged in as {admin_login['user']['name']} (Role: {admin_login['user']['role']})")
    assert admin_login["user"]["role"] == "ADMIN"

    # 11. Admin Overview
    overview = test_req('http://127.0.0.1:8001/api/admin/analytics/overview', headers=admin_headers)
    print(f"11. Admin Overview KPI: Revenue=${overview['revenue']}, Orders={overview['total_orders']}, Conversion={overview['conversion_rate']}%, Abandonment={overview['cart_abandonment_rate']}%")

    # 12. Customer Journeys
    journeys = test_req('http://127.0.0.1:8001/api/admin/analytics/journeys', headers=admin_headers)
    print(f"12. Customer Journeys: {len(journeys['journeys'])} reconstructed sessions. Drop-off stages: {len(journeys['drop_off_summary'])}")
    assert len(journeys["journeys"]) > 0

    # 13. Funnel Analytics
    funnel = test_req('http://127.0.0.1:8001/api/admin/analytics/funnel', headers=admin_headers)
    print(f"13. Funnel Stages: {len(funnel)} stages. Visitors={funnel[0]['count']}, Purchases={funnel[-1]['count']}")
    assert len(funnel) == 5

    # 14. AI Status & Predict
    ai_status = test_req('http://127.0.0.1:8001/api/admin/ai/status', headers=admin_headers)
    pred = test_req('http://127.0.0.1:8001/api/admin/ai/predict', {
        'searches_count': 3,
        'product_views_count': 6,
        'review_views_count': 2,
        'add_to_cart_count': 2,
        'wishlist_count': 1,
        'checkout_started': 1
    }, admin_headers)
    print(f"14. AI Machine Learning: Accuracy={(ai_status['accuracy']*100):.1f}%, F1={(ai_status['f1_score']*100):.1f}%")
    print(f"    Live Prediction Output: Purchase={pred['purchase_probability']}%, Abandonment={pred['cart_abandonment_probability']}%, Badge='{pred['risk_level']}'")

    # 15. AI Live Scored Sessions
    sessions = test_req('http://127.0.0.1:8001/api/admin/ai/sessions', headers=admin_headers)
    print(f"15. AI Session Inference: {len(sessions)} real sessions classified.")
    assert len(sessions) > 0

    print("\n=======================================================")
    print("SUCCESS: ALL 15 END-TO-END FLOWS FULLY VERIFIED & WORKING!")
    print("=======================================================")

if __name__ == "__main__":
    run_suite()
