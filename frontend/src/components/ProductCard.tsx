import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { trackRecommendationClick } from '../services/analytics';
import { formatPrice } from '../utils/format';

interface ProductCardProps {
  product: Product;
  recommendationSource?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, recommendationSource }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const handleCardClick = () => {
    if (recommendationSource) {
      trackRecommendationClick(product.id, recommendationSource);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
      <Link
        to={`/products/${product.id}`}
        onClick={handleCardClick}
        className="block relative aspect-square overflow-hidden bg-slate-100"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-700 uppercase tracking-wider shadow-sm">
          {product.category}
        </div>

        {/* Wishlist toggle button */}
        <button
          onClick={handleToggleWishlist}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all shadow-sm ${
            wishlisted
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/90 text-slate-600 hover:text-rose-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-1 text-amber-500 mb-1.5 text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({Math.floor(product.rating * 12)})</span>
          </div>

          <Link to={`/products/${product.id}`} onClick={handleCardClick}>
            <h3 className="font-semibold text-slate-800 text-sm line-clamp-1 hover:text-indigo-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-slate-500 text-xs mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="font-bold text-slate-900 text-base">
            {formatPrice(product.price)}
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl shadow-sm hover:shadow transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
