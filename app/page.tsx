'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { DealSelectorModal } from '@/components/DealSelectorModal';
import { DocumentUploader } from '@/components/DocumentUploader';
import { RagChat } from '@/components/RagChat';
import { PayloadInspector } from '@/components/PayloadInspector';
import { SqlSetupModal } from '@/components/SqlSetupModal';
import { Deal, DocumentMeta } from '@/lib/types';
import { Sparkles, Database, ShieldCheck, Activity } from 'lucide-react';

export default function Home() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [activeTab, setActiveTab] = useState<'audit' | 'ingest' | 'qdrant' | 'sql'>('audit');
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);

  // Fetch initial deals list
  const loadDeals = async () => {
    try {
      const res = await fetch('/api/deals');
      const json = await res.json();
      if (json.success && json.data) {
        setDeals(json.data);
        if (json.data.length > 0 && !currentDeal) {
          setCurrentDeal(json.data[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching deals:', e);
    }
  };

  // Fetch documents for active deal
  const loadDocuments = async (dealId: string) => {
    try {
      const res = await fetch(`/api/documents?deal_id=${dealId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setDocuments(json.data);
      }
    } catch (e) {
      console.error('Error fetching documents:', e);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  useEffect(() => {
    if (currentDeal) {
      loadDocuments(currentDeal.id);
    }
  }, [currentDeal]);

  const handleCreateDeal = async (name: string, target_company?: string, sector?: string, deal_size?: string): Promise<Deal> => {
    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, target_company, sector, deal_size }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      const newDeal = json.data;
      setDeals((prev) => [newDeal, ...prev]);
      setCurrentDeal(newDeal);
      return newDeal;
    }
    throw new Error(json.error || 'Failed to create deal');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentDeal={currentDeal}
        deals={deals}
        onSelectDeal={(deal) => setCurrentDeal(deal)}
        onOpenCreateDealModal={() => setIsDealModalOpen(true)}
        onOpenSqlModal={() => setActiveTab('sql')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Deal Header Overview */}
        {currentDeal && (
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base font-bold text-slate-100">{currentDeal.name}</h1>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase">
                    {currentDeal.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Target: <strong className="text-slate-200">{currentDeal.target_company || 'Apex Corp'}</strong> • Sector: {currentDeal.sector || 'Tech'} • Enterprise Value: <span className="text-emerald-400 font-semibold">{currentDeal.deal_size || '$450M'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => setIsDealModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition-colors"
              >
                Switch Target Deal
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: AI Due Diligence Copilot */}
        {activeTab === 'audit' && (
          <RagChat currentDeal={currentDeal} />
        )}

        {/* Tab 2: Layout-Aware Document Ingestion Engine */}
        {activeTab === 'ingest' && (
          <DocumentUploader
            currentDeal={currentDeal}
            documents={documents}
            onDocumentUploaded={() => currentDeal && loadDocuments(currentDeal.id)}
          />
        )}

        {/* Tab 3: Qdrant Point Payload Inspector */}
        {activeTab === 'qdrant' && (
          <PayloadInspector currentDeal={currentDeal} />
        )}

        {/* Tab 4: Supabase SQL Setup Schema */}
        {activeTab === 'sql' && (
          <SqlSetupModal />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">LedgerClue AI Due Diligence Platform</span>
            <span>• Hybrid RAG Architecture</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Qdrant 2048-dim Vectors</span>
            <span>Nemotron 3 Embed 1B</span>
            <span>Supabase Metadata Engine</span>
          </div>
        </div>
      </footer>

      {/* Deal Selector / Creator Modal */}
      <DealSelectorModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        onCreateDeal={handleCreateDeal}
        onSelectDeal={(deal) => setCurrentDeal(deal)}
        deals={deals}
        currentDeal={currentDeal}
      />
    </div>
  );
}
