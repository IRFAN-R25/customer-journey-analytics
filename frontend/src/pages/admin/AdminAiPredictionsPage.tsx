import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  SlidersHorizontal,
  Layers,
  HelpCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { PredictionStatus, SessionPrediction, PredictionResult } from '../../types';

export const AdminAiPredictionsPage: React.FC = () => {
  const [modelStatus, setModelStatus] = useState<PredictionStatus | null>(null);
  const [sessions, setSessions] = useState<SessionPrediction[]>([]);
  const [isRetraining, setIsRetraining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Interactive Live Simulator State
  const [simFeatures, setSimFeatures] = useState({
    searches_count: 3,
    product_views_count: 5,
    review_views_count: 2,
    add_to_cart_count: 2,
    wishlist_count: 1,
    checkout_started: 1,
    session_duration_secs: 240,
    unique_products_viewed: 3,
    previous_purchases: 1,
    previous_abandoned_carts: 0,
  });

  const [livePrediction, setLivePrediction] = useState<PredictionResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [statusData, sessionsData] = await Promise.all([
          api.getAiStatus(),
          api.getAiSessions(),
        ]);
        setModelStatus(statusData);
        setSessions(sessionsData);
      } catch (err) {
        console.error('Failed to load AI predictions data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
    runSimulator();
  }, []);

  const runSimulator = async () => {
    setIsSimulating(true);
    try {
      const pred = await api.predictAi(simFeatures);
      setLivePrediction(pred);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      const updatedStatus = await api.trainAi();
      setModelStatus(updatedStatus);
      const updatedSessions = await api.getAiSessions();
      setSessions(updatedSessions);
    } catch (err) {
      console.error('Retraining failed:', err);
    } finally {
      setIsRetraining(false);
    }
  };

  const getRiskBadge = (badge: string) => {
    if (badge === 'High Purchase Probability') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    } else if (badge === 'High Abandonment Risk') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    } else {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-bold text-violet-400 uppercase tracking-widest">
            Predictive Machine Learning
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Customer Behavior Prediction
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervised Random Forest classifiers predicting purchase likelihood and cart abandonment risk
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md flex items-center space-x-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
          <span>{isRetraining ? 'Retraining Models...' : 'Retrain Model with Live Data'}</span>
        </button>
      </div>

      {/* Model Performance Validation Metrics (Section 20) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-violet-400">
            <BrainCircuit className="w-5 h-5" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Validated Model Evaluation Metrics
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Trained: {modelStatus?.trained_at || 'Just now'} • {modelStatus?.sample_count} records
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Model Accuracy</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {modelStatus ? `${(modelStatus.accuracy * 100).toFixed(1)}%` : '--'}
            </span>
            <span className="text-[10px] text-slate-500">Test split classification</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Precision</span>
            <span className="text-2xl font-black text-sky-400 mt-1 block">
              {modelStatus ? `${(modelStatus.precision * 100).toFixed(1)}%` : '--'}
            </span>
            <span className="text-[10px] text-slate-500">True positive fidelity</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recall</span>
            <span className="text-2xl font-black text-violet-400 mt-1 block">
              {modelStatus ? `${(modelStatus.recall * 100).toFixed(1)}%` : '--'}
            </span>
            <span className="text-[10px] text-slate-500">Sensitivity rate</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">F1 Score</span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">
              {modelStatus ? `${(modelStatus.f1_score * 100).toFixed(1)}%` : '--'}
            </span>
            <span className="text-[10px] text-slate-500">Harmonic balanced mean</span>
          </div>
        </div>
      </div>

      {/* Live AI Prediction Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 text-indigo-400">
          <SlidersHorizontal className="w-5 h-5" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Live Interactive Prediction Simulator
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Adjust the behavioral feature controls below to calculate simulated probabilities through the Random Forest model:
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Feature Inputs */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Product Views Count</span>
                <span className="text-indigo-400 font-bold">{simFeatures.product_views_count}</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={simFeatures.product_views_count}
                onChange={(e) => {
                  setSimFeatures({ ...simFeatures, product_views_count: Number(e.target.value) });
                  runSimulator();
                }}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Add to Cart Count</span>
                <span className="text-indigo-400 font-bold">{simFeatures.add_to_cart_count}</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={simFeatures.add_to_cart_count}
                onChange={(e) => {
                  setSimFeatures({ ...simFeatures, add_to_cart_count: Number(e.target.value) });
                  runSimulator();
                }}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Review Views Count</span>
                <span className="text-indigo-400 font-bold">{simFeatures.review_views_count}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={simFeatures.review_views_count}
                onChange={(e) => {
                  setSimFeatures({ ...simFeatures, review_views_count: Number(e.target.value) });
                  runSimulator();
                }}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Checkout Initiated?</span>
                <span className="text-indigo-400 font-bold">{simFeatures.checkout_started ? 'Yes (1)' : 'No (0)'}</span>
              </div>
              <select
                value={simFeatures.checkout_started}
                onChange={(e) => {
                  setSimFeatures({ ...simFeatures, checkout_started: Number(e.target.value) });
                  runSimulator();
                }}
                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 mt-1 cursor-pointer"
              >
                <option value={1}>Yes (Checkout Started)</option>
                <option value={0}>No (Not Started)</option>
              </select>
            </div>

          </div>

          {/* Real-time Calculated Output Score */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Evaluated Model Inference
            </span>

            {livePrediction ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold">Purchase Prob.</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">
                      {livePrediction.purchase_probability}%
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold">Abandonment Risk</p>
                    <p className="text-2xl font-black text-rose-400 mt-1">
                      {livePrediction.cart_abandonment_probability}%
                    </p>
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-full text-xs font-bold border inline-block ${getRiskBadge(livePrediction.risk_level)}`}>
                  {livePrediction.risk_level}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Calculating inference...</p>
            )}
          </div>

        </div>
      </div>

      {/* Live Evaluated Sessions Table (Section 22) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Real Clickstream Sessions Scored by Machine Learning
        </h3>
        <p className="text-xs text-slate-400">
          Telemetry extracted directly from PostgreSQL clickstream tables passed through the model
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase text-slate-400 bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Session & Customer</th>
                <th className="py-3 px-4">Interactions</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Purchase Prob.</th>
                <th className="py-3 px-4">Abandonment Risk</th>
                <th className="py-3 px-4">AI Classification</th>
                <th className="py-3 px-4">Actual Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {sessions.slice(0, 20).map((s) => (
                <tr key={s.session_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white">{s.user_name}</p>
                    <p className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">{s.session_id}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="text-indigo-400 font-semibold">{s.event_count}</span> events
                    <span className="text-slate-500 text-[10px] block">
                      {s.features.product_views_count} views • {s.features.add_to_cart_count} cart
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    {s.duration_secs}s
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${s.purchase_probability}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-emerald-400">{s.purchase_probability}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-rose-400 h-full rounded-full"
                          style={{ width: `${s.cart_abandonment_probability}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-rose-400">{s.cart_abandonment_probability}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getRiskBadge(s.risk_level)}`}>
                      {s.risk_level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-300">
                      {s.actual_outcome}
                    </span>
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
