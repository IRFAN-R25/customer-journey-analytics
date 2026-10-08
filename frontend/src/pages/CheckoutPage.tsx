import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, CreditCard, Banknote, Smartphone, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { trackEvent } from '../services/analytics';
import { Order } from '../types';
import { formatPrice } from '../utils/format';

export const CheckoutPage: React.FC = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+91 98765 43210',
    address: '42 MG Road, Indiranagar',
    city: 'Bengaluru',
    pincode: '560038',
    paymentMethod: 'Demo Card',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Core Requirement: Track checkout_started clickstream event!
    trackEvent('checkout_started', '/checkout', null, {
      cart_items_count: items.length,
      estimated_total: totalAmount,
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('Your cart is empty. Add items before checking out.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        payment_method: formData.paymentMethod,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      };

      const orderResult = await api.checkout(orderPayload);

      // Core Requirement: Track purchase clickstream event!
      trackEvent('purchase', '/checkout', null, {
        order_code: orderResult.order_code,
        total_amount: orderResult.total_amount,
        items_count: orderResult.items?.length || items.length,
      });

      // Clear the local / remote cart
      await clearCart();
      setPlacedOrder(orderResult);
    } catch (err: any) {
      console.error('Checkout failed:', err);
      setErrorMsg(err.message || 'Failed to place order. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
            Payment & Order Confirmed
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-3">
            Thank you for your order!
          </h1>
          <p className="text-slate-600 text-sm mt-2">
            Your demo order has been logged into the PostgreSQL database.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <p className="text-xs text-slate-400">Order Reference</p>
              <p className="text-sm font-bold text-indigo-600">{placedOrder.order_code}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Total Paid</p>
              <p className="text-base font-extrabold text-slate-900">{formatPrice(placedOrder.total_amount)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400">Shipping To:</p>
              <p className="font-semibold text-slate-800">{placedOrder.customer_name}</p>
              <p className="text-slate-600">{placedOrder.shipping_address}, {placedOrder.city}</p>
            </div>
            <div>
              <p className="text-slate-400">Payment Option:</p>
              <p className="font-semibold text-slate-800">{placedOrder.payment_method}</p>
              <p className="text-emerald-600 font-medium">Verified Demo Status</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            to="/orders"
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-md transition-all"
          >
            View in My Orders
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Secure Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">Complete your shipping and demo payment credentials</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Shipping & Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shipping Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              1. Shipping & Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shipping Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode / Postal Code</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              2. Demo Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'Demo Card', label: 'Demo Card', icon: CreditCard, desc: 'Instant demo clearance' },
                { id: 'UPI Demo', label: 'UPI Demo', icon: Smartphone, desc: 'Simulated QR / VPA' },
                { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay at doorstep' },
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <label
                    key={p.id}
                    className={`border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
                      formData.paymentMethod === p.id
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${formData.paymentMethod === p.id ? 'text-indigo-600' : 'text-slate-500'}`} />
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={p.id}
                        checked={formData.paymentMethod === p.id}
                        onChange={handleChange}
                        className="accent-indigo-600"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{p.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Order Review & Place Button */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Items in Order ({items.length})
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 text-xs">
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    className="w-12 h-12 object-cover rounded-lg bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{item.product?.name}</p>
                    <p className="text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-slate-900">
                    {formatPrice((item.product?.price || 0) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Amount</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
