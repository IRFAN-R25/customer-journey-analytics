import React, { useEffect, useState } from 'react';
import { Sparkles, MousePointerClick, TrendingUp, Package } from 'lucide-react';
import { api } from '../../services/api';

export const AdminRecommendationsPage: React.FC = () => {
  const [data, setData] = useState<{
    total_recommendation_clicks: number;
    top_clicked_recommendations: Array<{
      product_id: number;
      product_name: string;
      category: string;
      clicks: number;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecs() {
      try {
        const res = await api.getRecommendationAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load recommendation analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRecs();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
          Personalization Telemetry
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Recommendation Performance & CTR
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Tracking conversion and engagement driven by the rule-based & category similarity recommendation engine
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Recommendation Clicks</span>
            <span className="text-3xl font-black text-indigo-400 mt-1 block">
              {data?.total_recommendation_clicks || 0}
            </span>
            <span className="text-[11px] text-slate-500">Tracked 'recommendation_click' events</span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
            <MousePointerClick className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Engine Algorithm</span>
            <span className="text-lg font-bold text-white mt-1 block">
              Hybrid Content & Category Similarity
            </span>
            <span className="text-[11px] text-emerald-400">Explainable Rec System Active</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Top Clicked Recommendations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Top Performing Recommended Products
        </h3>
        <p className="text-xs text-slate-400">
          Ranked by highest shopper click-through engagement from 'Recommended For You' widgets
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase text-slate-400 bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Recommendation Clicks</th>
                <th className="py-3 px-4">Engagement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading metrics...</td></tr>
              ) : !data || data.top_clicked_recommendations.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">No recommendation clicks recorded yet.</td></tr>
              ) : (
                data.top_clicked_recommendations.map((p, idx) => (
                  <tr key={p.product_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-indigo-400 font-mono">
                      #{idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {p.product_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      {p.clicks} clicks
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        High Resonance
                      </span>
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
