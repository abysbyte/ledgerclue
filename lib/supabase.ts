import { createClient } from '@supabase/supabase-js';
import { Deal, DocumentMeta } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-project.supabase.co' &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder-key'
  );
};

export const supabase = createClient(supabaseUrl, supabaseKey);

// In-Memory Fallback Database Store (for seamless testing & instant deployment)
let memoryDeals: Deal[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    name: 'Project Titan M&A Acquisition',
    target_company: 'Apex Robotics Corp',
    sector: 'Industrial Tech & Automation',
    deal_size: '$450M',
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    document_count: 4,
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    name: 'Project Horizon Buyout',
    target_company: 'Solaris Energy Solutions',
    sector: 'Clean Energy & Utilities',
    deal_size: '$1.2B',
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    document_count: 2,
  },
];

let memoryDocuments: DocumentMeta[] = [
  {
    id: 'doc-101',
    deal_id: 'd1111111-1111-1111-1111-111111111111',
    file_name: 'Apex_Robotics_FY2025_Audited_Financials.pdf',
    storage_path: 'deals/d1111111/Apex_Robotics_FY2025_Audited_Financials.pdf',
    file_size: 4850000,
    mime_type: 'application/pdf',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    parsing_status: 'completed',
    table_count: 14,
    chart_count: 6,
  },
  {
    id: 'doc-102',
    deal_id: 'd1111111-1111-1111-1111-111111111111',
    file_name: 'Credit_Agreement_Debt_Covenants_2025.pdf',
    storage_path: 'deals/d1111111/Credit_Agreement_Debt_Covenants_2025.pdf',
    file_size: 2310000,
    mime_type: 'application/pdf',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    parsing_status: 'completed',
    table_count: 8,
    chart_count: 2,
  },
];

// Memory Chart Storage Map (data URLs / standard mock images)
const memoryStorage = new Map<string, string>();

export async function fetchDeals(): Promise<Deal[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Deal[];
    } catch (e) {
      console.warn('Supabase fetchDeals failed, falling back to memory store:', e);
    }
  }
  return memoryDeals;
}

export async function createDeal(name: string, target_company?: string, sector?: string, deal_size?: string): Promise<Deal> {
  const newDeal: Deal = {
    id: crypto.randomUUID(),
    name,
    target_company: target_company || 'Target Enterprise',
    sector: sector || 'Technology & Financial Services',
    deal_size: deal_size || '$250M',
    status: 'active',
    created_at: new Date().toISOString(),
    document_count: 0,
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('deals').insert([{
        id: newDeal.id,
        name: newDeal.name,
        status: newDeal.status,
        created_at: newDeal.created_at
      }]).select().single();
      if (!error && data) return data as Deal;
    } catch (e) {
      console.warn('Supabase createDeal error, saving to memory store:', e);
    }
  }

  memoryDeals.unshift(newDeal);
  return newDeal;
}

export async function fetchDocumentsByDeal(dealId: string): Promise<DocumentMeta[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('documents').select('*').eq('deal_id', dealId).order('created_at', { ascending: false });
      if (!error && data) return data as DocumentMeta[];
    } catch (e) {
      console.warn('Supabase fetchDocuments error, fallback to memory store:', e);
    }
  }
  return memoryDocuments.filter(doc => doc.deal_id === dealId);
}

export async function createDocumentRecord(doc: Omit<DocumentMeta, 'id' | 'created_at'>): Promise<DocumentMeta> {
  const newDoc: DocumentMeta = {
    ...doc,
    id: 'doc-' + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
    parsing_status: 'completed',
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('documents').insert([{
        id: newDoc.id,
        deal_id: newDoc.deal_id,
        file_name: newDoc.file_name,
        storage_path: newDoc.storage_path,
        created_at: newDoc.created_at
      }]).select().single();
      if (!error && data) return data as DocumentMeta;
    } catch (e) {
      console.warn('Supabase createDocument error, fallback to memory store:', e);
    }
  }

  memoryDocuments.unshift(newDoc);
  
  // Update deal document count
  const deal = memoryDeals.find(d => d.id === doc.deal_id);
  if (deal) {
    deal.document_count = (deal.document_count || 0) + 1;
  }

  return newDoc;
}

export async function uploadChartImage(path: string, imageBufferOrDataUrl: string): Promise<string> {
  if (isSupabaseConfigured()) {
    try {
      // In production, upload to Supabase storage bucket 'financial-charts'
      const { data, error } = await supabase.storage.from('financial-charts').upload(path, imageBufferOrDataUrl, {
        contentType: 'image/png',
        upsert: true,
      });
      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('financial-charts').getPublicUrl(path);
        return publicUrlData.publicUrl;
      }
    } catch (e) {
      console.warn('Supabase image upload warning:', e);
    }
  }

  memoryStorage.set(path, imageBufferOrDataUrl);
  return imageBufferOrDataUrl.startsWith('data:') 
    ? imageBufferOrDataUrl 
    : `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80`;
}
