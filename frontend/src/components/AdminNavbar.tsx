import React from 'react';
import { ShieldCheck, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface AdminNavbarProps {
  title: string;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <Link
          to="/"
          target="_blank"
          className="hidden sm:flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <span>Live Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-800">{user?.name || 'Administrator'}</div>
            <div className="text-[10px] text-slate-400">ADMIN PRIVILEGE</div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out of admin console"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
