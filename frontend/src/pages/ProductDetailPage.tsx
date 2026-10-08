import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, Sparkles, Check, ArrowLeft, MessageSquare } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { trackEvent } from '../services/analytics';
import { ProductCard } from '../components/ProductCard';
import { formatPrice } from '../utils/format';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [isLoading, setIsLoading] = useState(true);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setIsLoading(true);
      try {
        const prod = await api.getProduct(productId);
        setProduct(prod);

        // Core Requirement: Track product_view clickstream event!
        trackEvent('product_view', `/products/${productId}`, productId, {
          product_name: prod.name,
          category: prod.category,
          price: prod.price,
        });

        // Fetch category recommendations
        const recs = await api.getRecommendations(productId, 4);
        setRecommendations(recs);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
    setQuantity(1);
    setActiveTab('details');
  }, [productId]);

  const handleTabChange = (tab: 'details' | 'reviews') => {
    setActiveTab(tab);
    if (tab === 'reviews' && product) {
      // Core Requirement: Track review_view clickstream event!
      trackEvent('review_view', `/products/${productId}`, productId, {
        product_name: product.name,
      });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <Link to="/products" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Back button */}
      <div>
        <Link to="/products" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to products</span>
        </Link>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Product Image Stage */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-md">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-indigo-700 uppercase tracking-wider shadow-sm">
            {product.category}
          </div>
        </div>

        {/* Product Info & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-amber-500 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">{product.rating.toFixed(1)} / 5.0</span>
              <span className="text-xs text-slate-400">({Math.floor(product.rating * 14)} verified ratings)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline space-x-3">
              <span className="text-3xl font-black text-slate-900">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                In Stock ({product.stock} units available)
              </span>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed border-t border-b border-slate-100 py-4">
            {product.description}
          </p>

          {/* Quantity selector & Add to cart */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-semibold text-slate-700">Quantity</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white shadow-emerald-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart • ${(product.price * quantity).toFixed(2)}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-2xl border transition-all ${
                  wishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-rose-600 hover:border-slate-300'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-500">
            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50">
              <Truck className="w-4 h-4 text-indigo-600 mb-1" />
              <span>Fast Shipping</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
              <span>Authentic Guarantee</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50">
              <RefreshCw className="w-4 h-4 text-amber-600 mb-1" />
              <span>30-Day Returns</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs: Description vs Reviews */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex space-x-6 border-b border-slate-200 pb-3">
          <button
            onClick={() => handleTabChange('details')}
            className={`pb-2 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Overview & Specs
          </button>
          <button
            onClick={() => handleTabChange('reviews')}
            className={`pb-2 text-sm font-bold border-b-2 flex items-center space-x-1.5 transition-all ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Customer Reviews ({Math.floor(product.rating * 14)})</span>
          </button>
        </div>

        <div className="pt-6">
          {activeTab === 'details' ? (
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed max-w-3xl">
              <p>{product.description}</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
                <li>Crafted with premium durable components for everyday longevity</li>
                <li>Full manufacturer 1-year domestic hardware replacement warranty</li>
                <li>Item SKU Identifier: JRN-PROD-00{product.id}</li>
                <li>Category classification: {product.category}</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Alexander Hayes</span>
                  <span className="text-[11px] text-slate-400">Verified Buyer • 3 days ago</span>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
                </div>
                <p className="text-xs text-slate-600">
                  "Exceeded all expectations! The quality feels premium, packaging was sleek, and delivery was exceptionally fast."
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Jessica Miller</span>
                  <span className="text-[11px] text-slate-400">Verified Buyer • 1 week ago</span>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(4)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
                  <Star className="w-3.5 h-3.5 text-slate-300" />
                </div>
                <p className="text-xs text-slate-600">
                  "Very good build for the price point. Highly recommend if you're comparing against alternatives in this department."
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommended For You Section */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">
              Customers Also Explored in {product.category}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <ProductCard
                key={rec.id}
                product={rec}
                recommendationSource={`product_detail_${product.id}`}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
