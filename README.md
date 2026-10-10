# AI-Powered E-Commerce Customer Journey Analytics

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/IRFAN-R25/customer-journey-analytics)

**Platform:** Enterprise E-Commerce Journey Intelligence  
**Full-Stack Architecture:** React (Vite + TypeScript) + Tailwind CSS + FastAPI + PostgreSQL + scikit-learn  

---

## 1. Project Overview

**JourneyCart AI** is a complete, production-grade web platform combining a modern customer-facing e-commerce storefront with an enterprise-grade **Customer Journey Intelligence & Machine Learning Analytics Suite**.

The system tracks granular user clickstream activity in real-time, reconstructs individual sessions into visual chronological traversal timelines, calculates full-funnel conversion and stage-by-stage drop-off rates, and runs an embedded **Machine Learning Classifier (Random Forest)** to predict customer purchase probability and cart abandonment risk on the fly.

---

## 2. Key Features

### A. Customer-Facing Storefront
- **Responsive E-Commerce Catalog:** 35+ realistic products across 5 departments (*Electronics, Fashion, Shoes, Accessories, Home & Living*).
- **Search Engine:** Real-time keyword search with automatic clickstream search event logging.
- **Dynamic Catalog Filters:** Category pills, price range sliders, and multi-mode sorting (rating, price, newest).
- **Product Details & Customer Reviews:** High-resolution product showcase, stock availability, specifications, and verified buyer reviews (tracks `product_view` and `review_view` events).
- **Persistent Shopping Cart & Wishlist:** Fully synced with PostgreSQL for logged-in accounts (with seamless anonymous guest fallbacks).
- **Demo Checkout Flow:** Frictionless checkout with simulated payment methods (*Demo Card, UPI Demo, Cash on Delivery*), automated order code generation (`ORD-XXXXXXXX`), and automated cart cleanup upon confirmation.
- **User Dashboard:** Order history, lifetime spend, saved wishlist items, session browsing history, and recent search tags.
- **Explainable Product Recommendations:** "Recommended For You" modules on Home, Product Details, and Dashboard powered by category similarity and user browsing preferences.

### B. Admin Intelligence Console
- **Dashboard Overview:** Real-time KPI summary (Total Revenue, Orders, Sessions, Customers, Conversion Rate %, Abandonment Rate %, Product Views, Searches) and Recharts trend visualizations.
- **Customer Journey Analytics (Core Feature):** Reconstructs browsing sessions into visual timeline graphs with status badges (*Purchased*, *Abandoned Cart*, *Browsing Only*) and automated drop-off diagnostics.
- **Full-Funnel Analytics:** 5-stage conversion funnel (*Visitors → Product Views → Add to Cart → Checkout Started → Purchase Completed*) computing exact step conversions and drop-off rates.
- **AI Behavior Prediction Engine (Core ML):**
  - Supervised Random Forest Classifier trained on multidimensional interaction features.
  - Transparent model validation cards (*Accuracy, Precision, Recall, F1 Score*).
  - Interactive Live Prediction Simulator with real-time probability inference.
  - Live session classification table with behavioral badges (*High Purchase Probability*, *High Abandonment Risk*, *Medium Probability*).
  - One-click model retraining with live PostgreSQL telemetry.
- **Customer Segmentation:** Automated behavioral classification into 5 cohorts (*New Visitor, Browsing, Engaged, Returning Customer, Buyer*).
- **Product Performance Matrix:** Interaction metrics per SKU uncovering views, cart adds, sales, and high cart abandonment.
- **Clickstream Stream:** Live filterable stream of raw clickstream event payloads and session identifiers.
- **Recommendation Telemetry:** Tracks click-through rate (CTR) on personalized recommendation widgets.
- **Reports & CSV Data Export:** One-click CSV downloads for Sales, Clickstream, Catalog, and Customer datasets.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router v7, Lucide React, Recharts |
| **Backend** | Python 3.12, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2, python-jose, bcrypt |
| **Database** | PostgreSQL 17 (`customer_journey_db`) via `psycopg2-binary` (with SQLite fallback) |
| **Machine Learning** | scikit-learn (RandomForestClassifier), NumPy, Pandas, Joblib |

---

## 4. Architecture & Data Flow

```
[ Browser / Customer ]  ──(Route Changes / Clicks)──>  trackEvent()
         │                                                    │
         ▼                                                    ▼
  React + Vite SPA                                    POST /api/events
         │                                                    │
         ▼                                                    ▼
   Central API Client   ────────(JSON HTTP)─────────>   FastAPI Backend
                                                              │
                                            ┌─────────────────┴─────────────────┐
                                            ▼                                   ▼
                                      PostgreSQL DB                   Random Forest ML Model
                                (Tables: products, users,            (Predicts Purchase Prob %
                                 orders, clickstream_events)         & Abandonment Risk %)
                                            │                                   │
                                            └─────────────────┬─────────────────┘
                                                              ▼
                                                   Admin Intelligence Portal
                                             (Journeys, Funnel, Recharts, Reports)
```

---

## 5. Setup & Running Instructions

### Prerequisites
- Python 3.10+ (Installed on system)
- Node.js v18+ and npm
- PostgreSQL (Running on `localhost:5432`)

---

### Step 1: Backend Setup & Execution

1. Open PowerShell or Terminal and navigate to the project root:
   ```powershell
   cd customer-journey-analytics
   ```

2. Activate the existing virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

3. Ensure PostgreSQL database `customer_journey_db` is created:
   ```powershell
   # If not already created:
   # psql -U postgres -c "CREATE DATABASE customer_journey_db;"
   ```

4. Launch the FastAPI server with Uvicorn:
   ```powershell
   cd backend
   ..\venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

*The backend will automatically create all PostgreSQL tables, train the Random Forest model, and seed 35+ realistic products, 12 demo users, and 170+ clickstream events upon startup!*

- Swagger API Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

---

### Step 2: Frontend Setup & Execution

1. In a second terminal window, navigate to the `frontend` folder:
   ```powershell
   cd customer-journey-analytics/frontend
   ```

2. Start the Vite development server:
   ```powershell
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 6. Demo Accounts & Credentials

The database comes pre-seeded with realistic demo accounts:

### Admin Console Access
- **URL:** `http://localhost:5173/admin/login`
- **Email:** `admin@ecommerce.com`
- **Password:** `admin123`
*(A convenient one-click demo login button is provided directly on the admin login page)*

### Standard Customer Shopper Access
- **URL:** `http://localhost:5173/login`
- **Email:** `demo@user.com`
- **Password:** `user123`
*(Also accessible via the quick "Customer Demo" button on the login screen)*

---

## 7. Machine Learning Model Architecture

- **Model Type:** `RandomForestClassifier(n_estimators=50, max_depth=6, random_state=42)`
- **Target Variables:**
  1. `purchase_probability` (0.0% to 100.0%)
  2. `cart_abandonment_probability` (0.0% to 100.0%)
- **Feature Vector:**
  - `searches_count`
  - `product_views_count`
  - `review_views_count`
  - `add_to_cart_count`
  - `wishlist_count`
  - `checkout_started`
  - `session_duration_secs`
  - `unique_products_viewed`
  - `previous_purchases`
  - `previous_abandoned_carts`
- **Model Storage:** Serialized with `joblib` in `backend/app/ml/saved_model.joblib`.
- **Validation Metrics:** Evaluated on test split with real precision, recall, and F1 calculations displayed on the Admin AI page.
