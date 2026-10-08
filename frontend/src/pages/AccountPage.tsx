import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Eye, Sparkles, User, Package, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../services/api';
import { Order, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { formatPrice } from '../utils/format';

export const AccountPage: React.FC = () => {
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();

  const [orders, setOrders] = useState<Order[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAccountData() {
      try {
        const [ordersData, historyData, recData] = await Promise.all([
          api.getOrders(),
          api.getUserHistory(),
          api.getRecommendations(undefined, 4),
        ]);
        setOrders(ordersData);
        setRecentlyViewed(historyData.recently_viewed || []);
        setRecentSearches(historyData.recent_searches || []);
        setRecommendations(recData);
      } catch (err) {
        console.error('Failed to load user account dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAccountData();
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-indigo-500/30">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">Customer Portal</span>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-xs text-slate-300">{user?.email}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Link
            to="/profile"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-all"
          >
            Edit Profile
          </Link>
          <Link
            to="/orders"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            All Orders
          </Link>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Orders Placed</p>
            <p className="text-2xl font-black text-slate-800">{orders.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Spend (Demo)</p>
            <p className="text-2xl font-black text-slate-800">{formatPrice(totalSpent)}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Saved In Wishlist</p>
            <p className="text-2xl font-black text-slate-800">{wishlistCount}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
          </div>
          <Link to="/orders" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No orders placed yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((o) => (
              <div
                key={o.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/70 rounded-2xl border border-slate-100 gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {o.status}
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1">{o.order_code}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(o.created_at).toLocaleDateString()} • {o.items.length} items
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                  <span className="text-base font-extrabold text-slate-900">{formatPrice(o.total_amount)}</span>
                  <Link
                    to="/orders"
                    className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search History & Recently Viewed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recently Viewed Products */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Eye className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Recently Viewed Products</h3>
          </div>

          {recentlyViewed.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No recent product views recorded in session.</p>
          ) : (
            <div className="space-y-3">
              {recentlyViewed.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg bg-slate-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400">{p.category}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{formatPrice(p.price)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Search Queries */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Search className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Recent Search Activity</h3>
          </div>

          {recentSearches.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No recent search keywords logged.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              {recentSearches.map((term, i) => (
                <Link
                  key={i}
                  to={`/search?q=${encodeURIComponent(term)}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-medium rounded-xl transition-colors flex items-center space-x-1.5"
                >
                  <Search className="w-3 h-3 text-slate-400" />
                  <span>{term}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Recommended For You in Dashboard */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Recommended For You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} recommendationSource="account_dashboard" />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
