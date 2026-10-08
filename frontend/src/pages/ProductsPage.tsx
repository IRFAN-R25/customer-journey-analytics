import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { formatPrice } from '../utils/format';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Shoes', 'Accessories', 'Home & Living'];

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedCategory = searchParams.get('category') || 'All';
  const selectedSort = searchParams.get('sort_by') || 'featured';
  const [maxPrice, setMaxPrice] = useState<number>(150000);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const data = await api.getProducts({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          sort_by: selectedSort,
          max_price: maxPrice,
          limit: 60,
        });
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory, selectedSort, maxPrice]);

  const handleCategoryChange = (cat: string) => {
    const next = new URLSearchParams(searchParams);
    if (cat === 'All') {
      next.delete('category');
    } else {
      next.set('category', cat);
    }
    setSearchParams(next);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort_by', e.target.value);
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying {products.length} curated items in catalog
          </p>
        </div>

        {/* Sort and Filters */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Sort:</span>
            <select
              value={selectedSort}
              onChange={handleSortChange}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-6">
            
            {/* Category Filter */}
            <div>
              <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm mb-3">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span>Categories</span>
              </div>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-800 mb-2">
                <span className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <span>Max Price</span>
                </span>
                <span className="text-indigo-600 text-xs font-bold">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="299"
                max="150000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>{formatPrice(299)}</span>
                <span>{formatPrice(150000)}+</span>
              </div>
            </div>

          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <p className="text-slate-600 font-medium">No products match your filter criteria.</p>
              <button
                onClick={() => {
                  setMaxPrice(2000);
                  handleCategoryChange('All');
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
