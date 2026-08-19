'use client';

import React, { useState } from 'react';
import { X, Briefcase, Building, DollarSign, Tag, CheckCircle2 } from 'lucide-react';
import { Deal } from '@/lib/types';

interface DealSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDeal: (name: string, target_company?: string, sector?: string, deal_size?: string) => Promise<Deal>;
  onSelectDeal: (deal: Deal) => void;
  deals: Deal[];
  currentDeal: Deal | null;
}

export const DealSelectorModal: React.FC<DealSelectorModalProps> = ({
  isOpen,
  onClose,
  onCreateDeal,
  onSelectDeal,
  deals,
  currentDeal,
}) => {
  const [name, setName] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [sector, setSector] = useState('Enterprise Software & Tech');
  const [dealSize, setDealSize] = useState('$350M');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const newDeal = await onCreateDeal(name, targetCompany, sector, dealSize);
      onSelectDeal(newDeal);
      setName('');
      setTargetCompany('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Financial Deal Workspace</h3>
              <p className="text-xs text-slate-400">Create or select a target acquisition profile for due diligence.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Deals List */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Existing Target Deals ({deals.length})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {deals.map((d) => (
              <div
                key={d.id}
                onClick={() => {
                  onSelectDeal(d);
                  onClose();
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  currentDeal?.id === d.id
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/5'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-sm truncate block">{d.name}</span>
                  {currentDeal?.id === d.id && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />}
                </div>
                <div className="mt-1 text-[11px] text-slate-400 space-y-0.5">
                  <p className="truncate font-medium">{d.target_company || 'Target Corp'}</p>
                  <p className="text-[10px] text-slate-500">{d.sector} • {d.deal_size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-3 text-slate-500 font-semibold">Or Add New Deal</span></div>
        </div>

        {/* Create Deal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Deal Codename / Title *</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Project Apollo M&A Buyout"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Target Company</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="Apex Technologies"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Industry Sector</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  placeholder="Fintech & SaaS"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Deal Enterprise Value</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={dealSize}
                  onChange={(e) => setDealSize(e.target.value)}
                  placeholder="$500M"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all"
            >
              {loading ? 'Creating...' : 'Initialize Deal Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
