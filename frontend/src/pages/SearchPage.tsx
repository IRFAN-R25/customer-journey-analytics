import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { trackEvent } from '../services/analytics';
import { ProductCard } from '../components/ProductCard';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Track search event!
        trackEvent('search', '/search', null, { keyword: query.trim() });

        const data = await api.getProducts({ search: query.trim(), limit: 50 });
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    performSearch();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Search Header Form */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Product Search</h1>
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, department or keyword..."
            className="w-full pl-11 pr-24 py-3 bg-white border border-slate-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            Search
          </button>
        </form>

        {query && (
          <p className="text-xs text-slate-500">
            Showing results for <span className="font-semibold text-indigo-600">"{query}"</span> ({results.length} found)
          </p>
        )}
      </div>

      {/* Results grid */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : query && results.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 text-sm">No matches found for "{query}"</h3>
            <p className="text-xs text-slate-500 mt-1">Try searching for keywords like "wireless", "shoes", "jacket", or "coffee".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
