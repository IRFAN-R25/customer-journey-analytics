import uuid
import random
import json
from datetime import datetime, timedelta
from app.database import SessionLocal, Base, engine
from app.models import User, Product, Cart, CartItem, Wishlist, Order, OrderItem, ClickstreamEvent
from app.auth import hash_password

PRODUCTS_DATA = [
    # Electronics (7)
    {
        "name": "Sony WH-1000XM5 Wireless Headphones",
        "description": "Industry-leading noise canceling with two processors and 8 microphones for exceptional sound quality and crystal-clear hands-free calling.",
        "price": 26199.0,
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
        "rating": 4.8,
        "stock": 35
    },
    {
        "name": "Apple MacBook Pro 14 M3",
        "description": "Blazing fast speed with Apple M3 chip, Liquid Retina XDR display, up to 22 hours of battery life, and 16GB unified memory.",
        "price": 127899.0,
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
        "rating": 4.9,
        "stock": 18
    },
    {
        "name": "Logitech MX Master 3S Wireless Mouse",
        "description": "Quiet Clicks and 8K DPI any-surface tracking with MagSpeed electromagnetic scrolling for supreme precision.",
        "price": 4999.0,
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80",
        "rating": 4.7,
        "stock": 50
    },
    {
        "name": "Samsung 4K Ultra HD Smart TV 55\"",
        "description": "Crystal Processor 4K delivers true-to-life colors and stunning clarity with HDR support and sleek bezel-less design.",
        "price": 37399.0,
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80",
        "rating": 4.6,
        "stock": 20
    },
    {
        "name": "Apple Watch Ultra 2 GPS + Cellular",
        "description": "Rugged 49mm titanium case, precision dual-frequency GPS, up to 36 hours of battery life, and high-brightness always-on display.",
        "price": 63899.0,
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
        "rating": 4.9,
        "stock": 15
    },
    {
        "name": "Bose SoundLink Flex Bluetooth Speaker",
        "description": "Crisp, clear sound with surprisingly deep bass. IP67 waterproof and dustproof portable outdoor speaker.",
        "price": 11199.0,
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80",
        "rating": 4.6,
        "stock": 40
    },
    {
        "name": "Kindle Paperwhite 16GB",
        "description": "6.8\" glare-free 300 ppi display, adjustable warm light, up to 10 weeks of battery life, and waterproof construction.",
        "price": 10499.0,
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
        "rating": 4.8,
        "stock": 65
    },

    # Fashion (7)
    {
        "name": "Classic Wool Blend Trench Coat",
        "description": "Timeless double-breasted trench coat tailored in luxurious heavyweight wool blend with storm flaps and horn buttons.",
        "price": 14199.0,
        "category": "Fashion",
        "image": "https://images.unsplash.com/photo-1539533018447-63fcce667883?w=600&q=80",
        "rating": 4.7,
        "stock": 28
    },
    {
        "name": "Premium Cotton Oxford Button-Down Shirt",
        "description": "Pre-washed 100% organic combed cotton shirt offering comfort, breathability, and an effortless smart-casual silhouette.",
        "price": 2249.0,
        "category": "Fashion",
        "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
        "rating": 4.5,
        "stock": 80
    },
    {
        "name": "Slim Fit Stretch Denim Jeans",
        "description": "Durable Japanese indigo denim infused with flex stretch fibers for modern contour and all-day ease.",
        "price": 3399.0,
        "category": "Fashion",
        "image": "https://images.unsplash.com/photo-1542272604-780c96856592?w=600&q=80",
        "rating": 4.6,
        "stock": 55
    },
    {
        "name": "Oversized Cashmere Crewneck Sweater",
        "description": "Spun from 100% Grade-A Mongolian cashmere. Incredibly lightweight, cloud-soft, and naturally insulating.",
        "price": 10499.0,
        "category": "Fashion",
        "image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
        "rating": 4.8,
        "stock": 22
    },
    {
        "name": "Water-Resistant Technical Parka",
        "description": "Engineered for chilly weather with seam-sealed water repelling shell and sustainable down alternative filling.",
        "price": 15799.0,
        "category": "Fashion",
        "image": "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80",
        "rating": 4.7,
        "stock": 19
    },
    {
        "name": "Relaxed Linen Blend Resort Shirt",
        "description": "Lightweight breathable linen weave with camp collar, ideal for warm getaways and relaxed weekends.",
        "price": 1899.0,
        "category": "Fashion",
        "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
        "rating": 4.4,
        "stock": 45
    },
    {
        "name": "Tailored High-Waist Chino Trousers",
        "description": "Structured twill weave with pleat front styling, clean cuffs, and refined welt pockets.",
        "price": 2999.0,
        "category": "Fashion",
        "image": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
        "rating": 4.5,
        "stock": 38
    },

    # Shoes (7)
    {
        "name": "Nike Air Zoom Pegasus 40 Running Shoes",
        "description": "Responsive cushioning and engineered mesh upper engineered for smooth daily road runs and maximum endurance.",
        "price": 9799.0,
        "category": "Shoes",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
        "rating": 4.8,
        "stock": 42
    },
    {
        "name": "Adidas Originals Stan Smith Sneakers",
        "description": "Iconic minimalist low-top profile crafted with clean white upper, perforated 3-stripes, and green heel counter.",
        "price": 4199.0,
        "category": "Shoes",
        "image": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80",
        "rating": 4.7,
        "stock": 60
    },
    {
        "name": "Handcrafted Leather Chelsea Boots",
        "description": "Supple full-grain Italian calfskin leather with elastic gore side panels and durable Goodyear welted sole.",
        "price": 14599.0,
        "category": "Shoes",
        "image": "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&q=80",
        "rating": 4.9,
        "stock": 25
    },
    {
        "name": "New Balance 574 Core Heritage Sneakers",
        "description": "Classic suede and mesh hybrid retro silhouette packed with ENCAP midsole support for everyday comfort.",
        "price": 4499.0,
        "category": "Shoes",
        "image": "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80",
        "rating": 4.6,
        "stock": 35
    },
    {
        "name": "Vans Old Skool Skate Shoes",
        "description": "Classic skate shoe boasting durable suede and canvas uppers, reinforced toe caps, and signature rubber waffle outsoles.",
        "price": 3499.0,
        "category": "Shoes",
        "image": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
        "rating": 4.6,
        "stock": 50
    },
    {
        "name": "Oxford Brogue Formal Leather Shoes",
        "description": "Sophisticated wingtip brogue detailing crafted from polished hand-burnished leather for formal and business occasions.",
        "price": 12399.0,
        "category": "Shoes",
        "image": "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80",
        "rating": 4.7,
        "stock": 20
    },
    {
        "name": "Trail Peak Waterproof Hiking Boots",
        "description": "Vibram high-traction outsoles and breathable waterproof membrane built for mountain ascents and rugged trails.",
        "price": 13099.0,
        "category": "Shoes",
        "image": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&q=80",
        "rating": 4.8,
        "stock": 30
    },

    # Accessories (7)
    {
        "name": "Ray-Ban Classic Polarized Wayfarer",
        "description": "Iconic acetate sunglasses with green G-15 polarized crystal lenses offering 100% UV protection and glare elimination.",
        "price": 12199.0,
        "category": "Accessories",
        "image": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",
        "rating": 4.8,
        "stock": 45
    },
    {
        "name": "Fossil Minimalist Leather Chronograph Watch",
        "description": "Clean sunray dial with slim Roman numeral indices, brushed smoke stainless steel case, and genuine saddle leather strap.",
        "price": 9699.0,
        "category": "Accessories",
        "image": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80",
        "rating": 4.7,
        "stock": 32
    },
    {
        "name": "Bellroy Slim Sleeve Bi-fold Leather Wallet",
        "description": "Ultra-slim environmentally certified leather billfold holding up to 11 cards and flat banknotes with quick pull tab.",
        "price": 3999.0,
        "category": "Accessories",
        "image": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80",
        "rating": 4.8,
        "stock": 60
    },
    {
        "name": "Aer Travel Daypack Backpack 20L",
        "description": "Weather-resistant 1680D Cordura ballistic nylon exterior with suspended padded laptop compartment and smart organizer bays.",
        "price": 11199.0,
        "category": "Accessories",
        "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
        "rating": 4.9,
        "stock": 25
    },
    {
        "name": "Silk Paisley Print Necktie & Pocket Square",
        "description": "Jacquard-woven 100% mulberry silk set crafted with dense hand-finished stitching for formal events.",
        "price": 1699.0,
        "category": "Accessories",
        "image": "https://images.unsplash.com/photo-1589756823695-278bc923f962?w=600&q=80",
        "rating": 4.5,
        "stock": 40
    },
    {
        "name": "Handmade Full-Grain Leather Belt",
        "description": "1.5 inch wide vegetable-tanned leather equipped with solid brass buckle and beveled edge burnishing.",
        "price": 1999.0,
        "category": "Accessories",
        "image": "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=80",
        "rating": 4.6,
        "stock": 70
    },
    {
        "name": "Stainless Steel Minimalist Signet Ring",
        "description": "Hypoallergenic 316L surgical-grade steel ring with brushed geometric face and polished comfort-fit band.",
        "price": 1349.0,
        "category": "Accessories",
        "image": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80",
        "rating": 4.4,
        "stock": 50
    },

    # Home & Living (7)
    {
        "name": "Minimalist Ceramic Pour-Over Coffee Maker",
        "description": "Matte white handcrafted ceramic dripper with thermal carafe for artisanal barista-style morning brewing.",
        "price": 2699.0,
        "category": "Home & Living",
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
        "rating": 4.8,
        "stock": 40
    },
    {
        "name": "Nordic Architectural Table Lamp",
        "description": "Sculptural brass and frosted opal glass globe lamp providing ambient warm 2700K illumination with touch dimmer.",
        "price": 8599.0,
        "category": "Home & Living",
        "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
        "rating": 4.7,
        "stock": 25
    },
    {
        "name": "Scented Soy Wax Botanical Candle (3-Pack)",
        "description": "Pure organic soy wax infused with essential oils of cedarwood, lavender, and bergamot. 45-hour clean burn each.",
        "price": 1599.0,
        "category": "Home & Living",
        "image": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&q=80",
        "rating": 4.6,
        "stock": 85
    },
    {
        "name": "Washed French Linen Duvet Cover Set",
        "description": "100% natural pre-washed flax linen offering year-round thermoregulation and soft lived-in drape.",
        "price": 13399.0,
        "category": "Home & Living",
        "image": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80",
        "rating": 4.9,
        "stock": 18
    },
    {
        "name": "Ergonomic Memory Foam Cooling Pillow",
        "description": "Contour-molded viscoelastic foam infused with heat-dissipating cooling gel and breathable bamboo fiber slip.",
        "price": 2249.0,
        "category": "Home & Living",
        "image": "https://images.unsplash.com/photo-1584100936710-5390a786359f?w=600&q=80",
        "rating": 4.5,
        "stock": 50
    },
    {
        "name": "Handmade Acacia Wood Salad Bowl & Servers",
        "description": "Turned from a single solid block of responsibly harvested acacia with organic grain patterns and food-safe finish.",
        "price": 1999.0,
        "category": "Home & Living",
        "image": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80",
        "rating": 4.7,
        "stock": 30
    },
    {
        "name": "Cast Iron Dutch Oven 5.5 Quart",
        "description": "Heavy enamel coated cast iron pot engineered for uniform heat retention, baking crusty sourdough, and slow stews.",
        "price": 4499.0,
        "category": "Home & Living",
        "image": "https://images.unsplash.com/photo-1584990347449-a2e664871e98?w=600&q=80",
        "rating": 4.9,
        "stock": 24
    }
]

DEMO_USERS = [
    {"name": "Admin Manager", "email": "admin@ecommerce.com", "password": "admin123", "role": "ADMIN"},
    {"name": "Demo Shopper", "email": "demo@user.com", "password": "user123", "role": "USER"},
    {"name": "Sarah Jenkins", "email": "sarah.j@example.com", "password": "password123", "role": "USER"},
    {"name": "Michael Chang", "email": "m.chang@example.com", "password": "password123", "role": "USER"},
    {"name": "Emma Watson", "email": "emma.w@example.com", "password": "password123", "role": "USER"},
    {"name": "David Miller", "email": "david.m@example.com", "password": "password123", "role": "USER"},
    {"name": "Priya Sharma", "email": "priya.s@example.com", "password": "password123", "role": "USER"},
    {"name": "Lucas Rossi", "email": "lucas.r@example.com", "password": "password123", "role": "USER"},
    {"name": "Elena Rostova", "email": "elena.r@example.com", "password": "password123", "role": "USER"},
    {"name": "Carlos Gomez", "email": "carlos.g@example.com", "password": "password123", "role": "USER"},
    {"name": "Amina Yusuf", "email": "amina.y@example.com", "password": "password123", "role": "USER"},
    {"name": "Liam O'Connor", "email": "liam.oc@example.com", "password": "password123", "role": "USER"},
]

def seed_database():
    db = SessionLocal()
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)

        # Check if already seeded
        existing_products = db.query(Product).count()
        if existing_products >= 30:
            print("Database already contains seed products.")
            return

        print("Seeding database with realistic e-commerce data...")

        # 1. Seed Products
        products_map = []
        for pdata in PRODUCTS_DATA:
            p = Product(**pdata)
            db.add(p)
            products_map.append(p)
        db.commit()

        # Refresh products to get assigned IDs
        for p in products_map:
            db.refresh(p)
        print(f"Seeded {len(products_map)} products.")

        # 2. Seed Users
        users_map = []
        for udata in DEMO_USERS:
            existing = db.query(User).filter(User.email == udata["email"]).first()
            if not existing:
                u = User(
                    name=udata["name"],
                    email=udata["email"],
                    password_hash=hash_password(udata["password"]),
                    role=udata["role"]
                )
                db.add(u)
                db.commit()
                db.refresh(u)
                # Create empty cart
                c = Cart(user_id=u.id)
                db.add(c)
                db.commit()
                users_map.append(u)
            else:
                users_map.append(existing)

        print(f"Seeded {len(users_map)} users.")

        user_shoppers = [u for u in users_map if u.role == "USER"]

        # 3. Seed Realistic Orders
        now = datetime.utcnow()
        sample_cities = ["New York", "San Francisco", "Austin", "Chicago", "Seattle", "Boston"]
        payment_methods = ["Demo Card", "UPI Demo", "Cash on Delivery"]

        order_count = 0
        for i, user in enumerate(user_shoppers[:8]):
            # 1 to 2 orders per user
            for o_idx in range(random.randint(1, 2)):
                order_time = now - timedelta(days=random.randint(1, 14), hours=random.randint(1, 20))
                num_items = random.randint(1, 3)
                prods_chosen = random.sample(products_map, num_items)
                order_total = sum(p.price for p in prods_chosen)

                order_code = f"ORD-{uuid.uuid4().hex[:8].upper()}"
                order = Order(
                    order_code=order_code,
                    user_id=user.id,
                    total_amount=round(order_total, 2),
                    status="COMPLETED",
                    payment_method=random.choice(payment_methods),
                    customer_name=user.name,
                    customer_email=user.email,
                    customer_phone="+1 555-019" + str(random.randint(10, 99)),
                    shipping_address=f"{random.randint(100, 999)} Market Street",
                    city=random.choice(sample_cities),
                    pincode=str(random.randint(10001, 98101)),
                    created_at=order_time
                )
                db.add(order)
                db.commit()
                db.refresh(order)

                for p in prods_chosen:
                    oi = OrderItem(
                        order_id=order.id,
                        product_id=p.id,
                        quantity=1,
                        price=p.price
                    )
                    db.add(oi)

                order_count += 1
        db.commit()
        print(f"Seeded {order_count} realistic orders.")

        # 4. Seed Wishlist items
        for u in user_shoppers:
            for p in random.sample(products_map, random.randint(1, 3)):
                wl = Wishlist(user_id=u.id, product_id=p.id)
                db.add(wl)
        db.commit()

        # 5. Seed Clickstream Events (Sessions with diverse journeys)
        print("Seeding clickstream events & customer journeys...")
        # A) Buyer Sessions (Reconstruct: Home -> Search -> Product -> Review -> Cart -> Checkout -> Purchase)
        for i in range(12):
            session_id = f"sess_buyer_{uuid.uuid4().hex[:10]}"
            user = random.choice(user_shoppers)
            prod = random.choice(products_map)
            t_base = now - timedelta(days=random.randint(0, 10), hours=random.randint(1, 23), minutes=random.randint(1, 59))

            # Step 1: Page View (Home)
            db.add(ClickstreamEvent(user_id=user.id, session_id=session_id, event_type="page_view", page="/", timestamp=t_base))
            # Step 2: Search
            t_base += timedelta(seconds=random.randint(15, 30))
            db.add(ClickstreamEvent(user_id=user.id, session_id=session_id, event_type="search", page="/search", metadata_json=json.dumps({"keyword": prod.category.lower()}), timestamp=t_base))
            # Step 3: Product View
            t_base += timedelta(seconds=random.randint(20, 45))
            db.add(ClickstreamEvent(user_id=user.id, session_id=session_id, event_type="product_view", page=f"/products/{prod.id}", product_id=prod.id, timestamp=t_base))
            # Step 4: Review View
            t_base += timedelta(seconds=random.randint(20, 40))
            db.add(ClickstreamEvent(user_id=user.id, session_id=session_id, event_type="review_view", page=f"/products/{prod.id}", product_id=prod.id, timestamp=t_base))
            # Step 5: Add to Cart
            t_base += timedelta(seconds=random.randint(15, 35))
            db.add(ClickstreamEvent(user_id=user.id, session_id=session_id, event_type="add_to_cart", page=f"/products/{prod.id}", product_id=prod.id, timestamp=t_base))
            # Step 6: Checkout Started
            t_base += timedelta(seconds=random.randint(25, 50))
            db.add(ClickstreamEvent(user_id=user.id, session_id=session_id, event_type="checkout_started", page="/checkout", timestamp=t_base))
            # Step 7: Purchase
            t_base += timedelta(seconds=random.randint(30, 60))
            db.add(ClickstreamEvent(user_id=user.id, session_id=session_id, event_type="purchase", page="/checkout", metadata_json=json.dumps({"total": prod.price}), timestamp=t_base))

        # B) Abandoned Cart Sessions (Reconstruct: Home -> Product -> Add to Cart -> Drop)
        for i in range(10):
            session_id = f"sess_abandon_{uuid.uuid4().hex[:10]}"
            user = random.choice(user_shoppers) if i % 2 == 0 else None
            user_id = user.id if user else None
            prod = random.choice(products_map)
            t_base = now - timedelta(days=random.randint(0, 8), hours=random.randint(1, 23))

            db.add(ClickstreamEvent(user_id=user_id, session_id=session_id, event_type="page_view", page="/", timestamp=t_base))
            t_base += timedelta(seconds=random.randint(15, 35))
            db.add(ClickstreamEvent(user_id=user_id, session_id=session_id, event_type="product_view", page=f"/products/{prod.id}", product_id=prod.id, timestamp=t_base))
            t_base += timedelta(seconds=random.randint(20, 45))
            db.add(ClickstreamEvent(user_id=user_id, session_id=session_id, event_type="add_to_cart", page=f"/products/{prod.id}", product_id=prod.id, timestamp=t_base))
            if i % 3 == 0:
                t_base += timedelta(seconds=random.randint(20, 40))
                db.add(ClickstreamEvent(user_id=user_id, session_id=session_id, event_type="checkout_started", page="/checkout", timestamp=t_base))

        # C) Casual Browsing Sessions (Reconstruct: Home -> Search -> 2-3 Product views -> Exit)
        for i in range(12):
            session_id = f"sess_browse_{uuid.uuid4().hex[:10]}"
            user = random.choice(user_shoppers) if i % 3 == 0 else None
            user_id = user.id if user else None
            t_base = now - timedelta(days=random.randint(0, 5), hours=random.randint(1, 23))

            db.add(ClickstreamEvent(user_id=user_id, session_id=session_id, event_type="page_view", page="/", timestamp=t_base))
            t_base += timedelta(seconds=random.randint(10, 25))
            db.add(ClickstreamEvent(user_id=user_id, session_id=session_id, event_type="search", page="/search", metadata_json=json.dumps({"keyword": "shoes" if i % 2 == 0 else "wireless"}), timestamp=t_base))
            
            for p in random.sample(products_map, random.randint(1, 2)):
                t_base += timedelta(seconds=random.randint(20, 45))
                db.add(ClickstreamEvent(user_id=user_id, session_id=session_id, event_type="product_view", page=f"/products/{p.id}", product_id=p.id, timestamp=t_base))

        # D) Recommendation Click Events
        for i in range(15):
            session_id = f"sess_rec_{uuid.uuid4().hex[:10]}"
            p = random.choice(products_map)
            t_base = now - timedelta(days=random.randint(0, 5), hours=random.randint(1, 20))
            db.add(ClickstreamEvent(
                user_id=None,
                session_id=session_id,
                event_type="recommendation_click",
                page="/",
                product_id=p.id,
                metadata_json=json.dumps({"source": "home_recommended_for_you"}),
                timestamp=t_base
            ))

        db.commit()
        print("Finished seeding database with realistic products, users, orders, and clickstream events!")

    except Exception as e:
        print("Error while seeding database:", e)
        db.rollback()
def ensure_admin_user():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == "ADMIN").first()
        if not admin:
            admin = User(
                name="Admin Manager",
                email="admin@ecommerce.com",
                password_hash=hash_password("admin123"),
                role="ADMIN"
            )
            db.add(admin)
            db.commit()
            print("Ensured default admin user exists: admin@ecommerce.com")
        return admin
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
