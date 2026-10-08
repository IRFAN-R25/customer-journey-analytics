import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { trackEvent } from './services/analytics';

// Customer Storefront Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchPage } from './pages/SearchPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { OrdersPage } from './pages/OrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin Components & Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCustomerJourneyPage } from './pages/admin/AdminCustomerJourneyPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminAiPredictionsPage } from './pages/admin/AdminAiPredictionsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminProductManagementPage } from './pages/admin/AdminProductManagementPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminClickstreamPage } from './pages/admin/AdminClickstreamPage';
import { AdminRecommendationsPage } from './pages/admin/AdminRecommendationsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

/**
 * Clickstream tracker component listening to route changes
 * to record page_view clickstream events seamlessly.
 */
function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    // Only track public/customer routes to avoid cluttering customer journey with admin pages
    if (!location.pathname.startsWith('/admin')) {
      trackEvent('page_view', location.pathname);
    }
  }, [location.pathname]);

  return null;
}

// Storefront wrapper containing standard Navbar and Footer
function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <RouteChangeTracker />
            <Routes>
              
              {/* Public Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/login" element={<Navigate to="/login" replace />} />

              {/* Customer Facing Storefront Routes (Protected: First page is /login for visitors) */}
              <Route
                element={
                  <ProtectedRoute>
                    <StorefrontLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Admin Dashboard Protected Routes (Requires role = ADMIN) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="customer-journey" element={<AdminCustomerJourneyPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="ai-predictions" element={<AdminAiPredictionsPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="products" element={<AdminProductManagementPage />} />
                <Route path="product-analytics" element={<AdminProductsPage />} />
                <Route path="clickstream" element={<AdminClickstreamPage />} />
                <Route path="recommendations" element={<AdminRecommendationsPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
