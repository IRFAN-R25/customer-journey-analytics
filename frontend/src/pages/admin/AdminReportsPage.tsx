import React, { useState } from 'react';
import { FileSpreadsheet, Download, Calendar, Filter, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

const REPORT_TYPES = [
  { id: 'sales', name: 'Sales & Revenue Report', desc: 'Detailed order records, transaction totals, buyer emails, and payment modes.' },
  { id: 'events', name: 'Clickstream Telemetry Report', desc: 'Raw event sequences, timestamps, user/anonymous sessions, and page targets.' },
  { id: 'products', name: 'Product Catalog Performance Report', desc: 'Inventory breakdown, stock, ratings, and price tiers.' },
  { id: 'customers', name: 'Customer Cohorts & Accounts Report', desc: 'Registered user credentials, creation dates, and role scopes.' },
];

const PERIODS = [
  { id: 'today', name: 'Today' },
  { id: '7days', name: 'Last 7 Days' },
  { id: '30days', name: 'Last 30 Days' },
  { id: 'all', name: 'All Time' },
];

export const AdminReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  const handleDownloadCsv = () => {
    const url = api.getExportUrl(selectedReport, selectedPeriod);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
          Data Export Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Admin Reports & CSV Export
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Generate structured CSV data extracts from the PostgreSQL warehouse for academic audit or offline analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Report Type Selection */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Select Report Dataset
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REPORT_TYPES.map((rep) => {
              const isSelected = selectedReport === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <FileSpreadsheet className={`w-5 h-5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <h4 className="font-bold text-sm text-white">{rep.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rep.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Period Filter & Download Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Export Configuration
            </h3>

            {/* Time Window Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Time Period Filter</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {PERIODS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPeriod(p.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                      selectedPeriod === p.id
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Summary */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Dataset:</span>
                <span className="font-bold text-white uppercase">{selectedReport}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date Range:</span>
                <span className="font-bold text-indigo-400">{PERIODS.find(p => p.id === selectedPeriod)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Format:</span>
                <span className="font-bold text-emerald-400">CSV (RFC 4180)</span>
              </div>
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleDownloadCsv}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV File</span>
            </button>

            <p className="text-[10px] text-slate-500 text-center">
              Streamed directly from FastAPI backend endpoint
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
