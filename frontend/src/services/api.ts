const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => request<any>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<any>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/api/auth/me'),
  updateProfile: (data: any) => request<any>('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Products
  getProducts: (params?: { category?: string; search?: string; min_price?: number; max_price?: number; sort_by?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.search) q.append('search', params.search);
    if (params?.min_price !== undefined) q.append('min_price', params.min_price.toString());
    if (params?.max_price !== undefined) q.append('max_price', params.max_price.toString());
    if (params?.sort_by) q.append('sort_by', params.sort_by);
    if (params?.limit) q.append('limit', params.limit.toString());
    return request<any>(`/api/products?${q.toString()}`);
  },
  getCategories: () => request<string[]>('/api/products/categories'),
  getProduct: (id: number) => request<any>(`/api/products/${id}`),
  createProduct: (data: any) => request<any>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) => request<any>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => request<any>(`/api/products/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: () => request<any>('/api/cart'),
  addToCart: (productId: number, quantity = 1) => request<any>('/api/cart/add', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity }) }),
  updateCartItem: (itemId: number, quantity: number) => request<any>(`/api/cart/item/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeCartItem: (itemId: number) => request<any>(`/api/cart/item/${itemId}`, { method: 'DELETE' }),
  clearCart: () => request<any>('/api/cart/clear', { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => request<any>('/api/wishlist'),
  toggleWishlist: (productId: number) => request<any>('/api/wishlist/toggle', { method: 'POST', body: JSON.stringify({ product_id: productId }) }),
  removeFromWishlist: (productId: number) => request<any>(`/api/wishlist/${productId}`, { method: 'DELETE' }),

  // Orders
  checkout: (data: any) => request<any>('/api/orders/checkout', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => request<any>('/api/orders'),
  getOrder: (id: number) => request<any>(`/api/orders/${id}`),

  // Events / Tracking
  recordEvent: (data: { session_id: string; event_type: string; page: string; product_id?: number | null; metadata?: any }) => 
    request<any>('/api/events', { method: 'POST', body: JSON.stringify(data) }),
  getUserHistory: () => request<any>('/api/events/user-history'),

  // Recommendations
  getRecommendations: (productId?: number, limit = 6) => {
    const q = new URLSearchParams();
    if (productId) q.append('product_id', productId.toString());
    if (limit) q.append('limit', limit.toString());
    return request<any>(`/api/recommendations?${q.toString()}`);
  },

  // Admin Analytics
  getOverviewMetrics: () => request<any>('/api/admin/analytics/overview'),
  getJourneys: () => request<any>('/api/admin/analytics/journeys'),
  getFunnel: () => request<any>('/api/admin/analytics/funnel'),
  getCustomers: () => request<any>('/api/admin/analytics/customers'),
  getProductAnalytics: () => request<any>('/api/admin/analytics/products'),
  getClickstreamLogs: (params?: { event_type?: string; session_id?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.event_type) q.append('event_type', params.event_type);
    if (params?.session_id) q.append('session_id', params.session_id);
    if (params?.limit) q.append('limit', params.limit.toString());
    return request<any>(`/api/admin/analytics/clickstream?${q.toString()}`);
  },
  getRecommendationAnalytics: () => request<any>('/api/admin/analytics/recommendations'),

  // Admin AI
  getAiStatus: () => request<any>('/api/admin/ai/status'),
  predictAi: (features: any) => request<any>('/api/admin/ai/predict', { method: 'POST', body: JSON.stringify(features) }),
  trainAi: () => request<any>('/api/admin/ai/train', { method: 'POST' }),
  getAiSessions: () => request<any>('/api/admin/ai/sessions'),

  // Admin Reports
  getExportUrl: (reportType: string, period = '30days') => 
    `${BASE_URL}/api/admin/reports/export-csv?report_type=${reportType}&period=${period}`,
};
