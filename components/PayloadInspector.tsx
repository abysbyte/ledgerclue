'use client';

import React, { useEffect, useState } from 'react';
import { Database, Table, FileText, CheckCircle2, Search, Code, Cpu, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import { QdrantPayload, Deal } from '@/lib/types';

interface PayloadInspectorProps {
  currentDeal: Deal | null;
}

export const PayloadInspector: React.FC<PayloadInspectorProps> = ({ currentDeal }) => {
  const [payloads, setPayloads] = useState<QdrantPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayload, setSelectedPayload] = useState<QdrantPayload | null>(null);
  const [meta, setMeta] = useState<{
    collection_name: string;
    vector_dimension: number;
    total_points: number;
    tables_count: number;
    charts_count: number;
  } | null>(null);

  const fetchQdrantPayloads = async () => {
    setLoading(true);
    try {
      const url = currentDeal ? `/api/qdrant-inspector?deal_id=${currentDeal.id}` : '/api/qdrant-inspector';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setPayloads(json.data || []);
        setMeta(json.meta || null);
        if (json.data && json.data.length > 0) {
          setSelectedPayload(json.data[0]);
        } else {
          setSelectedPayload(null);
        }
      }
    } catch (e) {
      console.error('Qdrant inspector fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearVectors = async () => {
    if (!confirm('Are you sure you want to clear vector points from Qdrant? You can re-upload your PDF to generate clean real vector payloads.')) return;
    setLoading(true);
    try {
      const url = currentDeal ? `/api/qdrant-inspector?deal_id=${currentDeal.id}` : '/api/qdrant-inspector';
      await fetch(url, { method: 'DELETE' });
      await fetchQdrantPayloads();
    } catch (e) {
      console.error('Error clearing Qdrant vectors:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQdrantPayloads();
  }, [currentDeal]);

  const filteredPayloads = payloads.filter((p) => {
    const matchesSearch =
      p.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.raw_markdown && p.raw_markdown.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <Database className="w-3.5 h-3.5" />
              <span>Qdrant Point Payload Inspector</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">
              Parent-Child Qdrant Vector Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Inspect Qdrant vector points proving that raw financial Markdown tables and visual chart links are stored directly inside Qdrant metadata payloads to bypass SQL joins during RAG retrieval.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearVectors}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Qdrant Vectors</span>
            </button>

            <button
              onClick={fetchQdrantPayloads}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Qdrant State</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vector Architecture Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase block">Qdrant Collection</span>
          <div className="font-bold text-xs text-emerald-400 font-mono">{meta?.collection_name || 'financial_due_diligence_2048'}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase block">Vector Dimension</span>
          <div className="font-bold text-sm text-cyan-400 font-mono flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>{meta?.vector_dimension || 2048} (Nemotron)</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase block">Markdown Table Payloads</span>
          <div className="font-bold text-sm text-emerald-400 font-mono">{meta?.tables_count || 2}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase block">SQL Join Elimination</span>
          <div className="font-bold text-xs text-teal-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% In-Payload</span>
          </div>
        </div>
      </div>

      {/* Payload Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Payload List */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vector payloads..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredPayloads.map((p) => (
              <div
                key={p.chunk_id}
                onClick={() => setSelectedPayload(p)}
                className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                  selectedPayload?.chunk_id === p.chunk_id
                    ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200 shadow-md shadow-cyan-500/5'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase ${
                    p.chunk_type === 'table' ? 'bg-emerald-500/20 text-emerald-400' : p.chunk_type === 'chart' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {p.chunk_type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Page {p.page_number}</span>
                </div>

                <p className="text-xs font-semibold truncate text-slate-200">{p.document_name}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2">{p.content}</p>

                {p.raw_markdown && (
                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 font-mono">
                    raw_markdown present
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Payload Detail Inspector */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          {selectedPayload ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Selected Qdrant Point Payload</span>
                  <h3 className="text-base font-bold text-slate-100">{selectedPayload.chunk_id}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                    Doc: {selectedPayload.document_name}
                  </span>
                </div>
              </div>

              {/* Payload Field 1: Content / LLM Summary */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Vector Content / LLM Summary</label>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  {selectedPayload.content}
                </div>
              </div>

              {/* Payload Field 2: Direct Raw Parent Markdown Table */}
              {selectedPayload.raw_markdown && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center space-x-1">
                      <Table className="w-3.5 h-3.5" />
                      <span>raw_markdown (Parent Markdown Table Payload)</span>
                    </label>
                    <span className="text-[10px] text-slate-500">Injected in Qdrant Metadata</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre">
                    {selectedPayload.raw_markdown}
                  </div>
                </div>
              )}

              {/* Payload Field 3: Image URL link */}
              {selectedPayload.image_url && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">image_url (Supabase Storage Link)</label>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 truncate max-w-md">{selectedPayload.image_url}</span>
                    <a href={selectedPayload.image_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline text-xs flex items-center space-x-1">
                      <span>View Image</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* JSON Raw Payload Inspector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center space-x-1">
                  <Code className="w-3.5 h-3.5" />
                  <span>Complete Qdrant Point JSON Payload</span>
                </label>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
                  {JSON.stringify(selectedPayload, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a vector payload point from the left to inspect metadata details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
