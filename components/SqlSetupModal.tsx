'use client';

import React, { useState } from 'react';
import { Code2, Copy, Check, Database, Sparkles } from 'lucide-react';

export const SqlSetupModal: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlQuery = `-- Execute this SQL script in Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Link to Supabase Storage bucket
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and Storage Bucket configuration
INSERT INTO storage.buckets (id, name, public) 
VALUES ('financial-charts', 'financial-charts', true)
ON CONFLICT (id) DO NOTHING;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Supabase Relational Database Schema</h3>
            <p className="text-xs text-slate-400">Execute this SQL snippet in your Supabase project SQL Editor.</p>
          </div>
        </div>

        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied SQL!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy SQL</span>
            </>
          )}
        </button>
      </div>

      <div className="relative">
        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
          {sqlQuery}
        </pre>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Note: In-Memory Database Fallback is currently active to ensure zero-friction testing.</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">Supabase SQL Schema v1.0</span>
      </div>
    </div>
  );
};
