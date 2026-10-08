import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Truck, ShieldCheck, RefreshCw, Zap, Flame } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [allProds, recProds] = await Promise.all([
          api.getProducts({ limit: 12 }),
          api.getRecommendations(undefined, 4),
        ]);
        setFeaturedProducts(allProds.slice(0, 4));
        setPopularProducts(allProds.slice(4, 8));
        setRecommendedProducts(recProds);
      } catch (err) {
        console.error('Failed to load home page products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 p-8 sm:p-14 lg:p-20 shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Personalization & Analytics</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Next-Generation E-Commerce with Real-Time <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200 bg-clip-text text-transparent">Journey Intelligence</span>.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Experience seamless curated shopping powered by predictive customer behavioral machine learning, instant recommendation clustering, and session journey reconstruction.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              to="/products"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Truck className="w-5 h-5" /></div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Free Rapid Shipping</h4>
              <p className="text-xs text-slate-500">On all qualifying orders over ₹499</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="w-5 h-5" /></div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Verified Quality</h4>
              <p className="text-xs text-slate-500">100% authentic curated inventory</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><RefreshCw className="w-5 h-5" /></div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">30-Day Hassle-Free</h4>
              <p className="text-xs text-slate-500">Instant demo return approvals</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600"><Zap className="w-5 h-5" /></div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">AI Personalization</h4>
              <p className="text-xs text-slate-500">Adapts to your browsing patterns</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended For You Section (Powered by Recommendation Engine) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-50/70 via-violet-50/40 to-slate-50 border border-indigo-100 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Recommended For You</h2>
                <p className="text-xs text-slate-500">Dynamically generated based on interaction history & category similarity</p>
              </div>
            </div>
            <Link
              to="/products"
              className="mt-2 sm:mt-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View more recommendations →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 bg-white/60 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((p) => (
                <ProductCard key={p.id} product={p} recommendationSource="home_recommended_for_you" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Editor's Picks</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Featured Products</h2>
          </div>
          <Link to="/products" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
            <span>Explore all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Flame className="w-6 h-6 text-amber-500" />
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Trending Now</span>
              <h2 className="text-2xl font-bold text-slate-900">Popular Products</h2>
            </div>
          </div>
          <Link to="/products?sort_by=rating" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
            <span>Top rated</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

    </div>
  );
};
