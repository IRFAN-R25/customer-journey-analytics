import React, { useEffect, useState } from 'react';
import { Filter, ArrowDown, Users, Eye, ShoppingBag, CreditCard, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { FunnelStep } from '../../types';

export const AdminAnalyticsPage: React.FC = () => {
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFunnel() {
      try {
        const data = await api.getFunnel();
        setFunnelData(data);
      } catch (err) {
        console.error('Failed to load funnel analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFunnel();
  }, []);

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Visitors':
        return Users;
      case 'Product Views':
        return Eye;
      case 'Add to Cart':
        return ShoppingBag;
      case 'Checkout Started':
        return CreditCard;
      default:
        return CheckCircle2;
    }
  };

  const getStageColor = (idx: number) => {
    const colors = [
      'from-indigo-600 to-indigo-700',
      'from-sky-600 to-sky-700',
      'from-amber-600 to-amber-700',
      'from-violet-600 to-violet-700',
      'from-emerald-600 to-emerald-700'
    ];
    return colors[idx % colors.length];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
          Conversion Diagnostics
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Full-Funnel Journey Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Tracking conversion velocity and stage-by-stage friction drop-off across all user sessions
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Funnel Steps */}
          <div className="space-y-4">
            {funnelData.map((step, idx) => {
              const Icon = getStageIcon(step.stage);
              const colorGradient = getStageColor(idx);
              const barWidth = Math.max(step.conversion_rate, 8);

              return (
                <div key={step.stage} className="space-y-2">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorGradient} text-white shadow-md`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-400">Step {idx + 1}</span>
                            <h3 className="text-base font-bold text-white">{step.stage}</h3>
                          </div>
                          <p className="text-xs text-slate-400">{step.count.toLocaleString()} sessions reached this stage</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-right">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Funnel Conversion</span>
                          <span className="text-xl font-extrabold text-indigo-400">{step.conversion_rate}%</span>
                        </div>
                        {idx > 0 && (
                          <div className="border-l border-slate-800 pl-4">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Step Conversion</span>
                            <span className="text-base font-bold text-emerald-400">{step.step_conversion}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Funnel Bar representation */}
                    <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${colorGradient} transition-all duration-700`}
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Transition indicator between stages */}
                  {idx < funnelData.length - 1 && (
                    <div className="flex items-center justify-center space-x-2 py-1 text-xs text-slate-500">
                      <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                      <span>
                        Drop-off to next stage:{' '}
                        <span className="font-bold text-rose-400">
                          {funnelData[idx + 1].drop_off_rate}%
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Key Insights Callout */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-white mb-2">Automated Funnel Optimization Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
                <span className="font-semibold text-slate-200 block mb-1">Top Funnel Health</span>
                <span>{funnelData[0]?.count || 0} total browsing sessions monitored with {funnelData[1]?.step_conversion || 0}% moving to deep product inspections.</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
                <span className="font-semibold text-slate-200 block mb-1">Cart-to-Checkout Velocity</span>
                <span>{funnelData[3]?.step_conversion || 0}% of shoppers who added items initiated checkout, showing clear intent.</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
                <span className="font-semibold text-slate-200 block mb-1">Final Purchase Conversion</span>
                <span>{funnelData[4]?.conversion_rate || 0}% overall conversion from visitor arrival to payment confirmation.</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
