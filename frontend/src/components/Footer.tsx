import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span>JourneyCart AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              AI-Powered E-Commerce Customer Journey Analytics platform reconstructing full session clickstreams, predicting conversion outcomes, and delivering explainable product recommendations.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-3">Shop Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products?category=Electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=Fashion" className="hover:text-white transition-colors">Fashion & Apparel</Link></li>
              <li><Link to="/products?category=Shoes" className="hover:text-white transition-colors">Footwear & Sneakers</Link></li>
              <li><Link to="/products?category=Accessories" className="hover:text-white transition-colors">Accessories & Bags</Link></li>
              <li><Link to="/products?category=Home & Living" className="hover:text-white transition-colors">Home & Living</Link></li>
            </ul>
          </div>

          {/* Customer Support & Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Account & Orders</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/account" className="hover:text-white transition-colors">My Dashboard</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Order History</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Saved Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Bag</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">User Profile</Link></li>
            </ul>
          </div>

          {/* Platform Architecture */}
          <div>
            <h4 className="text-white font-semibold mb-3">Platform Architecture</h4>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs space-y-1.5">
              <p className="text-indigo-400 font-medium">Customer Intelligence Suite</p>
              <p className="text-slate-300">AI Journey Analytics</p>
              <p className="text-slate-400 text-[11px]">FastAPI • PostgreSQL • React • scikit-learn</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JourneyCart AI. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>AI E-Commerce Analytics</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
