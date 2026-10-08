import os
from datetime import datetime
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib

MODEL_DIR = os.path.dirname(__file__)
MODEL_FILE = os.path.join(MODEL_DIR, "saved_model.joblib")
METRICS_FILE = os.path.join(MODEL_DIR, "saved_metrics.joblib")

FEATURE_NAMES = [
    "searches_count",
    "product_views_count",
    "review_views_count",
    "add_to_cart_count",
    "wishlist_count",
    "checkout_started",
    "session_duration_secs",
    "unique_products_viewed",
    "previous_purchases",
    "previous_abandoned_carts"
]

class JourneyPredictor:
    def __init__(self):
        self.purchase_model = None
        self.abandonment_model = None
        self.metrics = {
            "model_name": "Random Forest Classifier",
            "trained_at": None,
            "is_trained": False,
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1_score": 0.0,
            "sample_count": 0
        }
        self.load_or_train()

    def generate_synthetic_training_data(self, n_samples: int = 1200):
        """Generates realistic synthetic behavioral patterns for model training."""
        np.random.seed(42)
        rows = []
        for _ in range(n_samples):
            pattern_type = np.random.choice(["buyer", "abandoner", "browser", "hesitant"], p=[0.25, 0.30, 0.35, 0.10])
            
            if pattern_type == "buyer":
                searches = np.random.randint(1, 5)
                product_views = np.random.randint(2, 10)
                review_views = np.random.randint(1, 5)
                add_to_cart = np.random.randint(1, 4)
                wishlist = np.random.randint(0, 3)
                checkout_started = 1
                duration = np.random.randint(180, 900)
                unique_products = np.random.randint(2, 6)
                prev_purchases = np.random.randint(1, 5)
                prev_abandoned = np.random.randint(0, 2)
                purchased = 1
                abandoned = 0

            elif pattern_type == "abandoner":
                searches = np.random.randint(0, 4)
                product_views = np.random.randint(2, 8)
                review_views = np.random.randint(0, 3)
                add_to_cart = np.random.randint(1, 4)
                wishlist = np.random.randint(0, 2)
                checkout_started = np.random.choice([0, 1], p=[0.6, 0.4])
                duration = np.random.randint(120, 700)
                unique_products = np.random.randint(1, 5)
                prev_purchases = np.random.randint(0, 2)
                prev_abandoned = np.random.randint(1, 4)
                purchased = 0
                abandoned = 1

            elif pattern_type == "hesitant":
                searches = np.random.randint(2, 7)
                product_views = np.random.randint(4, 12)
                review_views = np.random.randint(2, 6)
                add_to_cart = np.random.choice([0, 1], p=[0.5, 0.5])
                wishlist = np.random.randint(1, 4)
                checkout_started = 0
                duration = np.random.randint(200, 800)
                unique_products = np.random.randint(3, 8)
                prev_purchases = np.random.randint(0, 2)
                prev_abandoned = np.random.randint(0, 2)
                purchased = 0
                abandoned = 1 if add_to_cart > 0 else 0

            else: # casual browser
                searches = np.random.randint(0, 3)
                product_views = np.random.randint(1, 4)
                review_views = 0
                add_to_cart = 0
                wishlist = np.random.choice([0, 1], p=[0.8, 0.2])
                checkout_started = 0
                duration = np.random.randint(30, 240)
                unique_products = np.random.randint(1, 3)
                prev_purchases = 0
                prev_abandoned = 0
                purchased = 0
                abandoned = 0

            rows.append({
                "searches_count": searches,
                "product_views_count": product_views,
                "review_views_count": review_views,
                "add_to_cart_count": add_to_cart,
                "wishlist_count": wishlist,
                "checkout_started": checkout_started,
                "session_duration_secs": duration,
                "unique_products_viewed": unique_products,
                "previous_purchases": prev_purchases,
                "previous_abandoned_carts": prev_abandoned,
                "purchased": purchased,
                "abandoned": abandoned
            })
        return pd.DataFrame(rows)

    def train(self, df: pd.DataFrame = None):
        if df is None:
            df = self.generate_synthetic_training_data()

        X = df[FEATURE_NAMES]
        y_purchase = df["purchased"]
        y_abandon = df["abandoned"]

        X_train, X_test, y_p_train, y_p_test, y_a_train, y_a_test = train_test_split(
            X, y_purchase, y_abandon, test_size=0.25, random_state=42
        )

        p_model = RandomForestClassifier(n_estimators=50, max_depth=6, random_state=42)
        p_model.fit(X_train, y_p_train)

        a_model = RandomForestClassifier(n_estimators=50, max_depth=6, random_state=42)
        a_model.fit(X_train, y_a_train)

        y_p_pred = p_model.predict(X_test)
        
        acc = float(accuracy_score(y_p_test, y_p_pred))
        prec = float(precision_score(y_p_test, y_p_pred, zero_division=0))
        rec = float(recall_score(y_p_test, y_p_pred, zero_division=0))
        f1 = float(f1_score(y_p_test, y_p_pred, zero_division=0))

        self.purchase_model = p_model
        self.abandonment_model = a_model
        self.metrics = {
            "model_name": "Random Forest Classifier",
            "trained_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "is_trained": True,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "sample_count": len(df)
        }

        # Persist model
        joblib.dump({"purchase_model": p_model, "abandonment_model": a_model}, MODEL_FILE)
        joblib.dump(self.metrics, METRICS_FILE)
        return self.metrics

    def load_or_train(self):
        if os.path.exists(MODEL_FILE) and os.path.exists(METRICS_FILE):
            try:
                models = joblib.load(MODEL_FILE)
                self.purchase_model = models["purchase_model"]
                self.abandonment_model = models["abandonment_model"]
                self.metrics = joblib.load(METRICS_FILE)
                return
            except Exception:
                pass
        self.train()

    def predict(self, features: dict):
        if not self.purchase_model or not self.abandonment_model:
            self.load_or_train()

        vec = pd.DataFrame([[features.get(f, 0) for f in FEATURE_NAMES]], columns=FEATURE_NAMES)
        
        p_prob = float(self.purchase_model.predict_proba(vec)[0][1])
        a_prob = float(self.abandonment_model.predict_proba(vec)[0][1])

        # If user has 0 items in cart, abandonment is naturally 0
        if features.get("add_to_cart_count", 0) == 0:
            a_prob = 0.0

        p_percent = round(p_prob * 100, 1)
        a_percent = round(a_prob * 100, 1)

        if p_percent >= 60.0:
            risk_level = "High Purchase Probability"
        elif a_percent >= 50.0:
            risk_level = "High Abandonment Risk"
        else:
            risk_level = "Medium Probability"

        return {
            "purchase_probability": p_percent,
            "cart_abandonment_probability": a_percent,
            "risk_level": risk_level,
            "features_summary": features
        }

predictor = JourneyPredictor()
