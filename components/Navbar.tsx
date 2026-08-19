'use client';

import React, { useState } from 'react';
import { ShieldCheck, Database, Layers, Sparkles, PlusCircle, Activity, Code2 } from 'lucide-react';
import { Deal } from '@/lib/types';

interface NavbarProps {
  currentDeal: Deal | null;
  deals: Deal[];
  onSelectDeal: (deal: Deal) => void;
  onOpenCreateDealModal: () => void;
  onOpenSqlModal: () => void;
  activeTab: 'audit' | 'ingest' | 'qdrant' | 'sql';
  setActiveTab: (tab: 'audit' | 'ingest' | 'qdrant' | 'sql') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDeal,
  deals,
  onSelectDeal,
  onOpenCreateDealModal,
  onOpenSqlModal,
  activeTab,
  setActiveTab,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Identity */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('audit')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  LedgerClue
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  AI Due Diligence
                </span>
              </div>
              <span className="text-xs text-slate-400 block -mt-0.5">
                Hybrid RAG • 2048-dim Nemotron • Qdrant Payload
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'audit'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Due Diligence Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('ingest')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'ingest'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Document Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab('qdrant')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'qdrant'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Qdrant Payload Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'sql'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>SQL Schema</span>
          </button>
        </nav>

        {/* Right Section: Deal Selector & System Indicators */}
        <div className="flex items-center space-x-3">
          {/* Active Deal Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium hover:border-slate-700 transition-colors shadow-sm"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <div className="text-left max-w-[140px] truncate">
                <span className="block font-semibold truncate text-slate-200">
                  {currentDeal ? currentDeal.name : 'Select Deal'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">▼</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 space-y-1">
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                  Active Financial Deals ({deals.length})
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 py-1">
                  {deals.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        onSelectDeal(d);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        currentDeal?.id === d.id
                          ? 'bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="truncate">
                        <p className="truncate font-medium">{d.name}</p>
                        <p className="text-[10px] text-slate-400">{d.target_company} • {d.deal_size}</p>
                      </div>
                      {currentDeal?.id === d.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenCreateDealModal();
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold border border-emerald-500/30 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create New Deal</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick System Metric Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="font-mono text-cyan-300 font-semibold">Qdrant 2048-dim</span>
          </div>
        </div>

      </div>
    </header>
  );
};
