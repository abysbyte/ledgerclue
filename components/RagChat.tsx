'use client';

import React, { useState } from 'react';
import { Sparkles, Send, ShieldAlert, AlertTriangle, CheckCircle, Table, Image as ImageIcon, ExternalLink, HelpCircle, Loader2, Info } from 'lucide-react';
import { Deal, DueDiligenceResponse, Citation, RiskItem } from '@/lib/types';

interface RagChatProps {
  currentDeal: Deal | null;
}

export const RagChat: React.FC<RagChatProps> = ({ currentDeal }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<DueDiligenceResponse | null>(null);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [activeChartModal, setActiveChartModal] = useState<string | null>(null);

  const samplePrompts = [
    {
      title: 'EBITDA Quality & Add-Back Audit',
      query: 'Audit reported FY2025 Adjusted EBITDA. Identify all non-recurring add-backs, personal expenses, and R&D capitalization anomalies.',
    },
    {
      title: 'Debt Covenant Headroom Analysis',
      query: 'Analyze senior debt covenants, Net Debt to EBITDA ratio threshold versus actual compliance, and default cure periods.',
    },
    {
      title: 'Customer Concentration Risk',
      query: 'What percentage of annual revenue is concentrated in the top 3 customers? Are there long-term contracts?',
    },
    {
      title: 'Working Capital & Overdue A/R',
      query: 'Review Accounts Receivable aging schedule, bad debt allowance, and overdue balances over 90 days.',
    },
  ];

  const handleQuery = async (queryText: string) => {
    if (!currentDeal || !queryText.trim()) return;

    setLoading(true);
    setResponse(null);
    setActiveCitation(null);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: currentDeal.id,
          query: queryText,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setResponse(json.data);
      }
    } catch (err) {
      console.error('Query execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Modal Due Diligence Audit Engine</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">
              AI Financial Due Diligence Copilot
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Ask deep financial audit questions across target deal documents. Answers dynamically pull raw Markdown tables from Qdrant vector payloads and link visual charts to verify claims.
            </p>
          </div>

          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px]">CURRENT TARGET DEAL</span>
            <span className="font-semibold text-emerald-300">{currentDeal?.name || 'Default Deal'}</span>
          </div>
        </div>
      </div>

      {/* Preset Audit Prompts Bar */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center space-x-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Recommended Forensic Scenarios</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => {
                setQuery(p.query);
                handleQuery(p.query);
              }}
              className="text-left p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all text-xs space-y-1 group"
            >
              <div className="font-semibold text-slate-200 group-hover:text-emerald-300 flex items-center justify-between">
                <span>{p.title}</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{p.query}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Control */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleQuery(query);
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about EBITDA adjustments, debt covenants, revenue concentration, working capital..."
          className="w-full pl-4 pr-28 py-3.5 text-xs bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-xl transition-all"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 px-4 py-2 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center space-x-1.5"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Auditing...</span>
            </>
          ) : (
            <>
              <span>Execute Audit</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-4 bg-slate-800 rounded w-1/3"></div>
          <div className="h-20 bg-slate-800/60 rounded"></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-slate-800/40 rounded"></div>
            <div className="h-16 bg-slate-800/40 rounded"></div>
            <div className="h-16 bg-slate-800/40 rounded"></div>
          </div>
        </div>
      )}

      {/* Audit Synthesis Output Card */}
      {response && (
        <div className="space-y-6 animate-in zoom-in-95 duration-200">
          
          {/* Executive Overview & Risk Score Dashboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Forensic Due Diligence Analysis</span>
                <h3 className="text-lg font-bold text-slate-100">{response.query}</h3>
              </div>

              {/* Risk Score Indicator */}
              <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Deal Risk Index</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {response.risk_score >= 70 ? 'High Financial Anomaly' : 'Moderate Covenant Risk'}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-base ${
                  response.risk_score >= 70
                    ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                    : 'border-amber-500 text-amber-400 bg-amber-500/10'
                }`}>
                  {response.risk_score}
                </div>
              </div>
            </div>

            {/* Executive Summary Alert */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Executive Summary</span>
              <p className="text-xs text-slate-200 leading-relaxed">{response.executive_summary}</p>
            </div>

            {/* Main Synthesis Markdown Body */}
            <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-300 space-y-3">
              {response.answer.split('\n\n').map((paragraph, idx) => (
                <div key={idx} className="whitespace-pre-line">
                  {paragraph}
                </div>
              ))}
            </div>

            {/* Identified Red Flags Matrix */}
            {response.risks.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Identified Financial & Covenant Red Flags ({response.risks.length})</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {response.risks.map((risk) => (
                    <div
                      key={risk.id}
                      className={`p-3.5 rounded-xl border space-y-2 ${
                        risk.severity === 'HIGH'
                          ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                          : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{risk.title}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                          risk.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {risk.severity} SEVERITY
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">{risk.description}</p>
                      <div className="bg-slate-950/80 p-2 rounded-lg text-[10px] font-mono text-slate-400 border border-slate-800">
                        Evidence: &quot;{risk.evidence_snippet}&quot; (Page {risk.page_reference})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Source Citations & Parent-Child Qdrant Payloads */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Table className="w-4 h-4 text-emerald-400" />
                <span>Source Citations & Retrieved Qdrant Vector Payloads ({response.citations.length})</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">No SQL Join Overhead</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {response.citations.map((citation, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveCitation(citation)}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 group-hover:text-emerald-300 flex items-center space-x-1.5">
                      <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                        #{idx + 1}
                      </span>
                      <span className="truncate max-w-[200px]">{citation.document_name}</span>
                    </span>
                    <span className="px-2 py-0.5 text-[10px] rounded-md bg-slate-900 text-slate-400 font-mono border border-slate-800">
                      Page {citation.page_number} • {citation.relevance_score * 100}% Match
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                    {citation.snippet}
                  </p>

                  {/* Badges for Raw Markdown Table & Chart Links */}
                  <div className="flex items-center space-x-2 pt-1">
                    {citation.raw_markdown && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 flex items-center space-x-1">
                        <Table className="w-3 h-3" />
                        <span>Embedded Markdown Table</span>
                      </span>
                    )}
                    {citation.image_url && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold border border-cyan-500/20 flex items-center space-x-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>Visual Chart Image</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Modal 1: Raw Markdown Table Citation Inspector */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span>Qdrant Payload Citation Inspector</span>
                </h4>
                <p className="text-xs text-slate-400">{activeCitation.document_name} (Page {activeCitation.page_number})</p>
              </div>
              <button onClick={() => setActiveCitation(null)} className="px-3 py-1 text-xs bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700">
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Semantic LLM Summary</span>
                <p className="text-xs text-slate-300">{activeCitation.snippet}</p>
              </div>

              {activeCitation.raw_markdown ? (
                <div className="space-y-2">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">
                    Raw Parent Markdown Table (Injected in Qdrant Payload without SQL Join)
                  </span>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-300 whitespace-pre">
                    {activeCitation.raw_markdown}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No direct markdown table attached to this text chunk.</p>
              )}

              {activeCitation.image_url && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">Visual Chart Link</span>
                  <img src={activeCitation.image_url} alt="Chart" className="rounded-xl border border-slate-800 max-h-64 object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
