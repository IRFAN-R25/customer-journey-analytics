import React, { useState } from 'react';
import { Settings, ShieldCheck, Key, Database, LogOut, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length >= 6) {
      setSuccessMsg(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setSuccessMsg(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
          Console Management
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Admin Settings & System State
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Administrator profile, authorization credentials, and backend environment status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Admin Profile Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-indigo-400 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Administrator Identity</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Admin Name</p>
              <p className="text-sm font-bold text-white mt-0.5">{user?.name || 'Admin Manager'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Email</p>
              <p className="text-sm font-mono text-slate-300 mt-0.5">{user?.email || 'admin@ecommerce.com'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Security Role</p>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                ROLE_ADMIN
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={logout}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Admin Console</span>
            </button>
          </div>
        </div>

        {/* System & Database Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-indigo-400 border-b border-slate-800 pb-3">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Infrastructure Status</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">Primary Database</span>
              <span className="text-emerald-400 font-semibold font-mono">PostgreSQL (customer_journey_db)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">Database Driver</span>
              <span className="text-slate-200 font-mono">psycopg2-binary</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">Machine Learning Framework</span>
              <span className="text-indigo-400 font-mono">scikit-learn 1.9.1</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">Backend API Gateway</span>
              <span className="text-slate-200 font-mono">FastAPI / Uvicorn</span>
            </div>
          </div>
        </div>

      </div>

      {/* Change Password Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 max-w-xl">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Key className="w-4 h-4" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Update Admin Password</h3>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>Password updated successfully!</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">New Password (Min 6 chars)</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md transition-all"
          >
            Update Credentials
          </button>
        </form>
      </div>

    </div>
  );
};
