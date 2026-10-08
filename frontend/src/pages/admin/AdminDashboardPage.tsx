import React, { useEffect, useState } from 'react';
import {
  Users,
  Eye,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  Percent,
  Search,
  Package,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { api } from '../../services/api';
import { DashboardMetrics } from '../../types';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';

const COLORS = ['#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await api.getOverviewMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load admin overview metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/80 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: formatPrice(metrics.revenue), icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Total Orders', value: metrics.total_orders, icon: ShoppingBag, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Total Sessions', value: metrics.total_sessions, icon: Layers, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { title: 'Registered Customers', value: metrics.total_customers, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { title: 'Conversion Rate', value: `${metrics.conversion_rate}%`, icon: TrendingUp, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { title: 'Cart Abandonment', value: `${metrics.cart_abandonment_rate}%`, icon: Percent, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Product Views', value: metrics.product_views, icon: Eye, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { title: 'Searches Conducted', value: metrics.searches, icon: Search, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
            Executive Summary
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Analytics & Clickstream Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time PostgreSQL telemetry, session journey reconstructions, and predictive signals
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/customer-journey"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center space-x-1.5 transition-all"
          >
            <span>Inspect Journeys</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/admin/ai-predictions"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <span>AI Probabilities</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-slate-700 transition-colors"
            >
              <div>
                <p className="text-xs font-medium text-slate-400">{card.title}</p>
                <p className="text-2xl font-black text-white mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue & Orders Trend Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Revenue & Orders Activity</h2>
              <p className="text-xs text-slate-400">Order volumes and revenue recorded in database</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            {metrics.revenue_trend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No revenue or order activity recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.revenue_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any) => [formatPrice(val), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Clickstream Event Distribution Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Clickstream Event Distribution</h2>
            <p className="text-xs text-slate-400">Relative distribution across all event streams</p>
          </div>

          <div className="h-72 w-full pt-2">
            {metrics.event_distribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No clickstream events recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.event_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-30} textAnchor="end" interval={0} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {metrics.event_distribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link
          to="/admin/customer-journey"
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 group transition-all"
        >
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Session Reconstruction</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="text-base font-bold text-white">Customer Journeys</h3>
          <p className="text-xs text-slate-400 mt-1">
            Visual timelines showing step-by-step user traversal from Landing to Purchase or Drop-off.
          </p>
        </Link>

        <Link
          to="/admin/analytics"
          className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 group transition-all"
        >
          <div className="flex items-center justify-between text-sky-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Drop-off Diagnostics</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="text-base font-bold text-white">Funnel Analytics</h3>
          <p className="text-xs text-slate-400 mt-1">
            5-stage conversion funnel measuring conversion percentages and exact bottleneck points.
          </p>
        </Link>

        <Link
          to="/admin/ai-predictions"
          className="bg-slate-900 border border-slate-800 hover:border-violet-500/50 rounded-2xl p-5 group transition-all"
        >
          <div className="flex items-center justify-between text-violet-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Machine Learning</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="text-base font-bold text-white">AI Behavior Predictions</h3>
          <p className="text-xs text-slate-400 mt-1">
            Live Purchase Probability and Cart Abandonment Risk scoring with scikit-learn models.
          </p>
        </Link>

      </div>

    </div>
  );
};
