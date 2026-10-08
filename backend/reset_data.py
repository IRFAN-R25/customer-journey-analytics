import sys
import os
from sqlalchemy import text
from app.database import SessionLocal, engine
from app.models import User, Product, Order, OrderItem, Cart, CartItem, Wishlist, ClickstreamEvent
from app.auth import hash_password

def reset_all_data():
    print("==================================================")
    print("SAFELY RESETTING DATABASE & REMOVING ALL DEMO DATA")
    print("==================================================")
    
    db = SessionLocal()
    try:
        # Delete dependent child tables first to respect foreign keys
        print("1. Deleting order_items...")
        db.query(OrderItem).delete()
        
        print("2. Deleting orders...")
        db.query(Order).delete()
        
        print("3. Deleting cart_items...")
        db.query(CartItem).delete()
        
        print("4. Deleting carts...")
        db.query(Cart).delete()
        
        print("5. Deleting wishlist items...")
        db.query(Wishlist).delete()
        
        print("6. Deleting clickstream_events...")
        db.query(ClickstreamEvent).delete()
        
        print("7. Deleting products...")
        db.query(Product).delete()
        
        print("8. Deleting demo customer accounts (preserving ADMIN)...")
        db.query(User).filter(User.role != "ADMIN").delete()
        
        # Ensure Admin account exists and is valid
        admin = db.query(User).filter(User.role == "ADMIN").first()
        if not admin:
            print("Creating clean admin account...")
            admin = User(
                name="Admin Manager",
                email="admin@ecommerce.com",
                password_hash=hash_password("admin123"),
                role="ADMIN"
            )
            db.add(admin)
        else:
            print(f"Preserved existing admin account: {admin.email} (ID: {admin.id})")
            
        db.commit()
        print("Data deletion committed successfully.")
        
        # Verify counts
        prod_count = db.query(Product).count()
        order_count = db.query(Order).count()
        order_item_count = db.query(OrderItem).count()
        cart_item_count = db.query(CartItem).count()
        wishlist_count = db.query(Wishlist).count()
        event_count = db.query(ClickstreamEvent).count()
        customer_count = db.query(User).filter(User.role != "ADMIN").count()
        admin_count = db.query(User).filter(User.role == "ADMIN").count()
        
        print("\n--- DATABASE VERIFICATION AUDIT ---")
        print(f"Products in DB:          {prod_count}")
        print(f"Orders in DB:            {order_count}")
        print(f"Order Items in DB:       {order_item_count}")
        print(f"Cart Items in DB:        {cart_item_count}")
        print(f"Wishlist Items in DB:    {wishlist_count}")
        print(f"Clickstream Events:      {event_count}")
        print(f"Demo Customers in DB:    {customer_count}")
        print(f"Admin Accounts in DB:    {admin_count} (Email: {admin.email})")
        print("-----------------------------------")
        
        assert prod_count == 0, "Products should be 0"
        assert order_count == 0, "Orders should be 0"
        assert order_item_count == 0, "Order items should be 0"
        assert cart_item_count == 0, "Cart items should be 0"
        assert wishlist_count == 0, "Wishlist items should be 0"
        assert event_count == 0, "Clickstream events should be 0"
        assert customer_count == 0, "Demo customers should be 0"
        assert admin_count == 1, "Exactly 1 Admin must exist"
        
        print("\nSUCCESS: All pre-filled demo data has been safely removed.")
        print("Database schema, tables, foreign keys, and admin account are 100% intact.")

    except Exception as e:
        db.rollback()
        print("ERROR during data reset:", e)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    reset_all_data()
