import React, { useEffect, useState } from 'react';
import { ListOrdered, Filter, RefreshCw, Clock, Search, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { ClickstreamEvent } from '../../types';

const EVENT_TYPES = [
  'all',
  'page_view',
  'search',
  'product_view',
  'review_view',
  'add_to_cart',
  'remove_from_cart',
  'wishlist',
  'checkout_started',
  'purchase',
  'logout',
  'recommendation_click'
];

export const AdminClickstreamPage: React.FC = () => {
  const [events, setEvents] = useState<ClickstreamEvent[]>([]);
  const [eventType, setEventType] = useState('all');
  const [sessionIdSearch, setSessionIdSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getClickstreamLogs({
        event_type: eventType === 'all' ? undefined : eventType,
        session_id: sessionIdSearch.trim() || undefined,
        limit: 80,
      });
      setEvents(data);
    } catch (err) {
      console.error('Failed to load clickstream logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [eventType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
            Telemetry Stream
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Real-Time Clickstream Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Raw immutable clickstream events recorded in PostgreSQL database
          </p>
        </div>

        <button
          onClick={fetchEvents}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Stream</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        
        {/* Event Type Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400 font-medium">Filter Event:</span>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Event Types' : t.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Session ID Search */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by session_id..."
              value={sessionIdSearch}
              onChange={(e) => setSessionIdSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Filter
          </button>
        </form>

      </div>

      {/* Events Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase text-slate-400 bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Page Route</th>
                <th className="py-3 px-4">Target Product</th>
                <th className="py-3 px-4">Session Identifier</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading clickstream telemetry...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No matching clickstream events found.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      #{ev.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        ev.event_type === 'purchase'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : ev.event_type === 'add_to_cart'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : ev.event_type === 'checkout_started'
                          ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                      }`}>
                        {ev.event_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {ev.user_name || 'Anonymous'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {ev.page}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-[150px] truncate">
                      {ev.product_name || (ev.product_id ? `ID #${ev.product_id}` : '--')}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                      {ev.session_id}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      {ev.timestamp}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400 max-w-xs truncate">
                      {ev.metadata ? JSON.stringify(ev.metadata) : '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
