export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  stock: number;
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  total_amount: number;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  created_at: string;
  product: Product;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: number;
  order_code: string;
  user_id: number;
  total_amount: number;
  status: string;
  payment_method: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  pincode: string;
  created_at: string;
  items: OrderItem[];
}

export interface ClickstreamEvent {
  id: number;
  session_id: string;
  user_id?: number | null;
  user_name?: string;
  event_type: string;
  page: string;
  product_id?: number | null;
  product_name?: string | null;
  timestamp: string;
  metadata?: Record<string, any> | null;
}

export interface DashboardMetrics {
  total_customers: number;
  total_sessions: number;
  total_products: number;
  total_orders: number;
  revenue: number;
  conversion_rate: number;
  cart_abandonment_rate: number;
  product_views: number;
  searches: number;
  revenue_trend: Array<{ date: string; orders: number; revenue: number }>;
  event_distribution: Array<{ name: string; type: string; count: number }>;
}

export interface JourneyStep {
  id: number;
  event_type: string;
  page: string;
  product_id?: number;
  product_name?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CustomerJourney {
  session_id: string;
  user_id?: number | null;
  user_name: string;
  user_role?: string;
  is_admin_session?: boolean;
  start_time: string;
  duration_secs: number;
  event_count: number;
  outcome: 'Purchased' | 'Abandoned Cart' | 'Browsing Only';
  timeline: JourneyStep[];
}

export interface FunnelStep {
  stage: string;
  count: number;
  conversion_rate: number;
  step_conversion: number;
  drop_off_rate: number;
}

export interface CustomerSummary {
  id: number;
  name: string;
  email: string;
  created_at: string;
  segment: 'New Visitor' | 'Browsing' | 'Engaged' | 'Returning Customer' | 'Buyer';
  sessions: number;
  orders: number;
  total_spend: number;
  events_count: number;
}

export interface ProductPerformance {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  views: number;
  cart_adds: number;
  wishlists: number;
  purchases: number;
  revenue: number;
  abandonment_count: number;
}

export interface PredictionStatus {
  model_name: string;
  trained_at: string | null;
  is_trained: boolean;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  sample_count: number;
}

export interface PredictionResult {
  purchase_probability: number;
  cart_abandonment_probability: number;
  risk_level: string;
  features_summary: Record<string, any>;
}

export interface SessionPrediction {
  session_id: string;
  user_id?: number | null;
  user_name: string;
  event_count: number;
  duration_secs: number;
  last_active: string;
  purchase_probability: number;
  cart_abandonment_probability: number;
  risk_level: string;
  actual_outcome: string;
  features: Record<string, any>;
}
