import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../../components/AdminSidebar';

export const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
