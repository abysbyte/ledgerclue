'use client';

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Sparkles, Loader2, Table, PieChart, ShieldAlert, Cpu } from 'lucide-react';
import { Deal, DocumentMeta, IngestionResult } from '@/lib/types';

interface DocumentUploaderProps {
  currentDeal: Deal | null;
  documents: DocumentMeta[];
  onDocumentUploaded: () => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  currentDeal,
  documents,
  onDocumentUploaded,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [ingestionResult, setIngestionResult] = useState<IngestionResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (fileToUpload?: File, mockName?: string) => {
    if (!currentDeal) return;

    setIsUploading(true);
    setProgress(15);
    setStatusMessage('Layout-aware parsing document (LlamaParse / Unstructured)...');
    setIngestionResult(null);

    const formData = new FormData();
    formData.append('deal_id', currentDeal.id);
    
    if (fileToUpload) {
      formData.append('file', fileToUpload);
    } else {
      formData.append('file_name', mockName || 'Audited_Financial_Statement_FY2025.pdf');
    }

    // Step-by-step progress animation sequence
    const progressTimer1 = setTimeout(() => {
      setProgress(45);
      setStatusMessage('Extracting Markdown tables & generating Fast LLM summaries...');
    }, 1200);

    const progressTimer2 = setTimeout(() => {
      setProgress(75);
      setStatusMessage('Embedding summaries with 2048-dim Nemotron-3-embed-1b model & uploading chart images...');
    }, 2800);

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);

      if (json.success && json.data) {
        setProgress(100);
        setStatusMessage('Parent-Child Table Payload Ingestion Complete!');
        setIngestionResult(json.data);
        onDocumentUploaded();
      } else {
        setStatusMessage('Ingestion failed: ' + (json.error || 'Unknown error'));
      }
    } catch (err: any) {
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      setStatusMessage('Ingestion error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Parent-Child Layout Parser</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">
              Financial Document Ingestion Engine
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Extracts layout-aware Markdown tables and visual charts into Qdrant vector payloads using 2048-dimensional Nemotron embeddings. Raw tables are injected directly into vector payloads to bypass SQL join overhead.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-slate-400 block text-[10px]">VECTOR SPEC</span>
              <span className="font-mono text-slate-200 font-bold">2048-dim Nemotron</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Upload Dropzone & Quick Demo Ingestion Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dropzone Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Upload PDF Financial Package</span>
          </h3>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                setSelectedFile(file);
                handleFileUpload(file);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              isUploading
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-800 hover:border-emerald-500/40 bg-slate-950/50 cursor-pointer'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
              {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
            </div>

            <p className="text-xs font-semibold text-slate-200">
              {selectedFile ? selectedFile.name : 'Drag & drop financial PDF statements, debt agreements, or audit reports'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports Audited Statements, Debt Covenants, Credit Agreements, CapEx Schedules (Max 100MB)
            </p>

            <div className="mt-4 flex justify-center">
              <label className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl cursor-pointer transition-colors border border-slate-700">
                Browse Files
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Progress Tracker */}
          {isUploading && (
            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center space-x-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>{statusMessage}</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Ingestion Results Summary */}
          {ingestionResult && (
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>Document Successfully Vectorized in Qdrant</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Markdown Tables</span>
                  <span className="font-bold text-emerald-400 text-sm">{ingestionResult.tablesProcessed}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Visual Charts</span>
                  <span className="font-bold text-cyan-400 text-sm">{ingestionResult.chartsProcessed}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Vector Dimensions</span>
                  <span className="font-bold text-slate-200 text-sm">{ingestionResult.vectorDimensions}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Qdrant Points</span>
                  <span className="font-bold text-slate-200 text-sm">{ingestionResult.qdrantPointsCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Demo Ingestion Preset Cards */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Sample Financial Packages</span>
          </h3>
          <p className="text-xs text-slate-400">
            Click to simulate instant layout parsing & 2048-dim Qdrant vector payload ingestion:
          </p>

          <div className="space-y-2.5">
            <button
              disabled={isUploading}
              onClick={() => handleFileUpload(undefined, 'Apex_Robotics_FY2025_Audited_Financials.pdf')}
              className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all text-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 group-hover:text-emerald-300">Apex Robotics Audited Financials</span>
                <Table className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Contains EBITDA bridge, add-backs table, and customer concentration chart.</p>
            </button>

            <button
              disabled={isUploading}
              onClick={() => handleFileUpload(undefined, 'Credit_Agreement_Debt_Covenants_2025.pdf')}
              className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all text-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 group-hover:text-cyan-300">Credit Agreement & Debt Covenants</span>
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Contains Senior Debt Schedule, 3.50x leverage covenant, and default cures.</p>
            </button>

            <button
              disabled={isUploading}
              onClick={() => handleFileUpload(undefined, 'Working_Capital_Capex_Schedule_Q4.pdf')}
              className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900 transition-all text-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 group-hover:text-teal-300">Working Capital & CapEx Schedule</span>
                <PieChart className="w-4 h-4 text-teal-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Contains Accounts Receivable 90+ days aging table & software capitalization notes.</p>
            </button>
          </div>
        </div>

      </div>

      {/* Ingested Documents Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Ingested Documents in Deal Package ({documents.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Deal: <strong className="text-slate-200">{currentDeal?.name}</strong></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Document Name</th>
                <th className="py-2.5 px-3">Supabase Storage Path</th>
                <th className="py-2.5 px-3 text-center">Markdown Tables</th>
                <th className="py-2.5 px-3 text-center">Charts</th>
                <th className="py-2.5 px-3">Parsing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-200 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate max-w-xs">{doc.file_name}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400 truncate max-w-xs">{doc.storage_path}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold">
                      <Table className="w-3 h-3" />
                      <span>{doc.table_count || 4}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-bold">
                      <PieChart className="w-3 h-3" />
                      <span>{doc.chart_count || 2}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[10px] uppercase">
                      Vectorized (2048-dim)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
