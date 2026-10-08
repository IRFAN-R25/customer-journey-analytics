import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export const WishlistPage: React.FC = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Your Wishlist is Empty</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
          Save items you're interested in by clicking the heart icon on any product.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
        >
          <span>Discover Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Saved Wishlist</h1>
        <p className="text-xs text-slate-500 mt-1">{wishlist.length} products saved for later</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div className="relative aspect-square bg-slate-100">
              <img
                src={item.product?.image}
                alt={item.product?.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => toggleWishlist(item.product)}
                className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-rose-500 hover:bg-white shadow-sm"
                title="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  {item.product?.category}
                </span>
                <Link to={`/products/${item.product_id}`}>
                  <h3 className="font-semibold text-slate-800 text-sm hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.product?.name}
                  </h3>
                </Link>
                <p className="text-base font-bold text-slate-900 mt-1">
                  {formatPrice(item.product?.price)}
                </p>
              </div>

              <button
                onClick={() => {
                  addToCart(item.product, 1);
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
