import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GitFork,
  Filter,
  BrainCircuit,
  Users,
  Package,
  ListOrdered,
  Sparkles,
  FileSpreadsheet,
  Settings,
  ArrowLeft,
  Activity,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Customer Journeys', path: '/admin/customer-journey', icon: GitFork },
  { name: 'Funnel Analytics', path: '/admin/analytics', icon: Filter },
  { name: 'AI Predictions', path: '/admin/ai-predictions', icon: BrainCircuit },
  { name: 'Customer Segments', path: '/admin/customers', icon: Users },
  { name: 'Product Management', path: '/admin/products', icon: Package },
  { name: 'Product Analytics', path: '/admin/product-analytics', icon: BarChart3 },
  { name: 'Clickstream Stream', path: '/admin/clickstream', icon: ListOrdered },
  { name: 'Recommendation Stats', path: '/admin/recommendations', icon: Sparkles },
  { name: 'Reports & Export', path: '/admin/reports', icon: FileSpreadsheet },
  { name: 'Admin Settings', path: '/admin/settings', icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen text-slate-300">
      <div>
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-wide">JourneyAI</span>
            <span className="block text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Admin Console</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Return Link & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <NavLink
          to="/"
          className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 text-xs text-rose-400 hover:text-rose-300 transition-colors p-2 rounded-lg hover:bg-rose-500/10 text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
