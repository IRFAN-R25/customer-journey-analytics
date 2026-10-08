import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User as UserIcon, Search, Activity, ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl tracking-tight text-slate-900">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Activity className="w-5 h-5" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent font-extrabold">
              JourneyCart
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
            <Link to="/products?category=Electronics" className="hover:text-indigo-600 transition-colors">Electronics</Link>
            <Link to="/products?category=Fashion" className="hover:text-indigo-600 transition-colors">Fashion</Link>
            <Link to="/products?category=Shoes" className="hover:text-indigo-600 transition-colors">Shoes</Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative w-72">
            <input
              type="text"
              placeholder="Search 35+ products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Search icon for mobile */}
            <button
              onClick={() => navigate('/search')}
              className="lg:hidden p-2 text-slate-600 hover:text-indigo-600 transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-slate-600 hover:text-rose-600 transition-colors relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-slate-600 hover:text-indigo-600 transition-colors relative"
              title="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-1.5 p-1.5 text-slate-700 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <UserIcon className="w-4 h-4" />
                </div>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setUserMenuOpen(false)}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50"
                        >
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Admin Analytics
                        </Link>
                      )}

                      <Link to="/account" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        User Dashboard
                      </Link>
                      <Link to="/orders" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        My Orders
                      </Link>
                      <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        Profile
                      </Link>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            navigate('/login', { replace: true });
                          }}
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Welcome guest shopper</p>
                      </div>
                      <Link to="/login" className="flex items-center px-4 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50">
                        Sign In
                      </Link>
                      <Link to="/register" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        Create Account
                      </Link>
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <Link to="/admin/login" className="flex items-center px-4 py-2 text-sm text-amber-700 hover:bg-amber-50">
                          <ShieldCheck className="w-4 h-4 mr-2 text-amber-600" />
                          Admin Portal
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>

          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-indigo-600">Home</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-indigo-600">All Products</Link>
            <Link to="/products?category=Electronics" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-indigo-600">Electronics</Link>
            <Link to="/products?category=Fashion" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-indigo-600">Fashion</Link>
            <Link to="/products?category=Shoes" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-indigo-600">Shoes</Link>
            <Link to="/products?category=Accessories" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-indigo-600">Accessories</Link>
            <Link to="/products?category=Home & Living" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-indigo-600">Home & Living</Link>
          </div>
        </div>
      )}
    </header>
  );
};
