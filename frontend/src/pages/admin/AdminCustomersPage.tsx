import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Eye, ShoppingBag, Sparkles, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { CustomerSummary } from '../../types';
import { formatPrice } from '../../utils/format';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [segmentSummary, setSegmentSummary] = useState<Array<{ segment: string; count: number }>>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await api.getCustomers();
        setCustomers(data.customers || []);
        setSegmentSummary(data.segment_summary || []);
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    if (selectedSegment === 'ALL') return true;
    return c.segment === selectedSegment;
  });

  const getSegmentBadge = (segment: string) => {
    switch (segment) {
      case 'Returning Customer':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Buyer':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'Engaged':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'Browsing':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
          Cohort Diagnostics
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Customer Segmentation Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Behavioral classification based on browsing frequency, order volume, and session depth
        </p>
      </div>

      {/* Segments Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {segmentSummary.map((s) => (
          <button
            key={s.segment}
            onClick={() => setSelectedSegment(s.segment === selectedSegment ? 'ALL' : s.segment)}
            className={`text-left p-4 rounded-2xl border transition-all ${
              selectedSegment === s.segment
                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {s.segment}
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {s.count}
            </span>
            <span className="text-[10px] text-slate-500">accounts classified</span>
          </button>
        ))}
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Customer Directory</h3>
            <p className="text-xs text-slate-400">Total {filtered.length} profiles listed in current view</p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Filter Segment:</span>
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Segments</option>
              <option value="Returning Customer">Returning Customer</option>
              <option value="Buyer">Buyer</option>
              <option value="Engaged">Engaged</option>
              <option value="Browsing">Browsing</option>
              <option value="New Visitor">New Visitor</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase text-slate-400 bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Customer Name & Email</th>
                <th className="py-3 px-4">Behavioral Segment</th>
                <th className="py-3 px-4">Sessions</th>
                <th className="py-3 px-4">Completed Orders</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Event Volume</th>
                <th className="py-3 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white">{c.name}</p>
                    <p className="text-slate-400 text-[11px]">{c.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getSegmentBadge(c.segment)}`}>
                      {c.segment}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {c.sessions}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {c.orders}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">
                    {formatPrice(c.total_spend)}
                  </td>
                  <td className="py-3.5 px-4 text-indigo-400 font-mono">
                    {c.events_count}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {c.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
