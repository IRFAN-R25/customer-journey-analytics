import React, { useEffect, useState } from 'react';
import { Package, Eye, ShoppingBag, Heart, IndianRupee, AlertCircle, ArrowUpDown } from 'lucide-react';
import { api } from '../../services/api';
import { ProductPerformance } from '../../types';
import { formatPrice } from '../../utils/format';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductPerformance[]>([]);
  const [sortKey, setSortKey] = useState<keyof ProductPerformance>('views');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await api.getProductAnalytics();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load product analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    return (Number(b[sortKey]) || 0) - (Number(a[sortKey]) || 0);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
          Catalog Performance
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Product Intelligence & Abandonment
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Tracking product interactions, conversion metrics, and high-friction drop-offs
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center space-x-2 text-sky-400 mb-2">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Most Viewed</span>
          </div>
          <p className="font-bold text-white text-sm truncate">{sortedProducts[0]?.name || '--'}</p>
          <p className="text-xs text-slate-400 mt-1">{sortedProducts[0]?.views || 0} lifetime views</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center space-x-2 text-emerald-400 mb-2">
            <IndianRupee className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Top Revenue Product</span>
          </div>
          {(() => {
            const topRev = [...products].sort((a, b) => b.revenue - a.revenue)[0];
            return (
              <>
                <p className="font-bold text-white text-sm truncate">{topRev?.name || '--'}</p>
                <p className="text-xs text-slate-400 mt-1">{formatPrice(topRev?.revenue || 0)} generated</p>
              </>
            );
          })()}
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center space-x-2 text-rose-400 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Highest Abandonment</span>
          </div>
          {(() => {
            const topAbandon = [...products].sort((a, b) => b.abandonment_count - a.abandonment_count)[0];
            return (
              <>
                <p className="font-bold text-white text-sm truncate">{topAbandon?.name || '--'}</p>
                <p className="text-xs text-slate-400 mt-1">{topAbandon?.abandonment_count || 0} cart drop-offs</p>
              </>
            );
          })()}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Catalog Interactions Matrix</h3>
            <p className="text-xs text-slate-400">Sort by interaction metrics to uncover conversion gaps</p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Sort Matrix By:</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as keyof ProductPerformance)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="views">Most Views</option>
              <option value="cart_adds">Most Added to Cart</option>
              <option value="purchases">Most Purchased Units</option>
              <option value="revenue">Highest Revenue</option>
              <option value="abandonment_count">Highest Abandonment</option>
              <option value="wishlists">Most Wishlisted</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase text-slate-400 bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4">Cart Adds</th>
                <th className="py-3 px-4">Wishlists</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4">Revenue</th>
                <th className="py-3 px-4">Cart Abandonment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {sortedProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                    {p.name}
                  </td>
                  <td className="py-3.5 px-4 text-indigo-400">
                    {p.category}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {formatPrice(p.price)}
                  </td>
                  <td className="py-3.5 px-4 text-sky-400 font-semibold">
                    {p.views}
                  </td>
                  <td className="py-3.5 px-4 text-amber-400 font-semibold">
                    {p.cart_adds}
                  </td>
                  <td className="py-3.5 px-4 text-rose-400 font-semibold">
                    {p.wishlists}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                    {p.purchases}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-300">
                    {formatPrice(p.revenue)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                      p.abandonment_count > 0 ? 'bg-rose-500/10 text-rose-400' : 'text-slate-500'
                    }`}>
                      {p.abandonment_count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
