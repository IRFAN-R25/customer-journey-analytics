import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft, Calendar, CreditCard, ShoppingBag } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { formatPrice } from '../utils/format';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await api.getOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link to="/account" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Account</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="text-xs text-slate-500 mt-1">Review all completed transactions and delivery addresses</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto">
          <Package className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">No orders yet</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">When you place an order, it will appear here.</p>
          <Link
            to="/products"
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-indigo-600">{order.order_code}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{order.payment_method}</span>
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-400">Total Order Amount</p>
                  <p className="text-xl font-black text-slate-900">{formatPrice(order.total_amount)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 text-xs">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="w-14 h-14 object-cover rounded-xl bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.product_id}`} className="font-semibold text-slate-800 hover:text-indigo-600 truncate block">
                        {item.product?.name}
                      </Link>
                      <p className="text-slate-400">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping snapshot */}
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Delivered to: </span>
                <span>{order.customer_name}, {order.shipping_address}, {order.city} ({order.pincode})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
