import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export const CartPage: React.FC = () => {
  const { items, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
          Explore our collection of top-rated items and find something you love.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">{items.length} items in your bag</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex items-center space-x-4 shadow-sm"
            >
              <img
                src={item.product?.image}
                alt={item.product?.name}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-slate-100 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  {item.product?.category}
                </span>
                <Link to={`/products/${item.product_id}`}>
                  <h3 className="font-semibold text-slate-800 text-sm hover:text-indigo-600 truncate transition-colors">
                    {item.product?.name}
                  </h3>
                </Link>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {formatPrice(item.product?.price)}
                </p>

                {/* Mobile controls */}
                <div className="flex sm:hidden items-center justify-between mt-3">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-white font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-white font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.product_id)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Desktop controls */}
              <div className="hidden sm:flex items-center space-x-6">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 shadow-xs"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 shadow-xs"
                  >
                    +
                  </button>
                </div>

                <div className="w-20 text-right font-extrabold text-sm text-slate-900">
                  {formatPrice((item.product?.price || 0) * item.quantity)}
                </div>

                <button
                  onClick={() => removeFromCart(item.id, item.product_id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-indigo-600"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Sales Tax (Est.)</span>
                <span className="font-semibold text-slate-900">{formatPrice(0)}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Estimated Total</span>
              <span className="text-xl font-extrabold text-slate-900">{formatPrice(totalAmount)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-400">
              Free returns within 30 days • Safe demo payment methods
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
