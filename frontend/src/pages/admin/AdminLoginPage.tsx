import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Activity, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role !== 'ADMIN') {
        setErrorMsg('Access denied: You do not possess administrator credentials.');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid administrator credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoAdmin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const user = await login('admin@ecommerce.com', 'admin123');
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>

      <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-100">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/40">
            <ShieldCheck className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Administrator Portal</h1>
          <p className="text-xs text-slate-400">Restricted analytics & machine learning control center</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-rose-300 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ecommerce.com"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Authorizing...' : 'Access Intelligence Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-slate-800 pt-4 space-y-2">
          <button
            type="button"
            onClick={handleQuickDemoAdmin}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>One-Click Demo Admin Login (admin@ecommerce.com)</span>
          </button>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
