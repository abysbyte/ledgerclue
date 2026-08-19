export interface Deal {
  id: string;
  name: string;
  target_company?: string;
  sector?: string;
  deal_size?: string;
  status: 'active' | 'archived' | 'pending';
  created_at: string;
  document_count?: number;
}

export interface DocumentMeta {
  id: string;
  deal_id: string;
  file_name: string;
  storage_path: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  parsing_status?: 'pending' | 'processing' | 'completed' | 'failed';
  table_count?: number;
  chart_count?: number;
}

export type ChunkType = 'text' | 'table' | 'chart';

export interface QdrantPayload {
  deal_id: string;
  document_id: string;
  document_name: string;
  chunk_id: string;
  chunk_type: ChunkType;
  content: string; // Text content or LLM summary of table/chart
  raw_markdown?: string; // Direct Markdown table injected into Qdrant payload (No SQL joins!)
  image_url?: string; // Direct Supabase storage link to chart image
  page_number: number;
  confidence_score?: number;
  section_heading?: string;
  financial_category?: 'EBITDA' | 'Revenue' | 'Debt' | 'CapEx' | 'WorkingCapital' | 'Customer Concentration' | 'General';
  created_at: string;
}

export interface QdrantPoint {
  id: string;
  vector: number[]; // Exactly 2048 dimensions (Nemotron-3-embed-1b)
  payload: QdrantPayload;
}

export interface ParsedElement {
  id: string;
  type: ChunkType;
  page_number: number;
  raw_content: string; // Markdown table string or plain text or base64/image metadata
  section_heading?: string;
  bounding_box?: { top: number; left: number; width: number; height: number };
}

export interface IngestionStepStatus {
  step: 'parsing' | 'table_extraction' | 'chart_extraction' | 'summarization' | 'embedding' | 'qdrant_indexing' | 'supabase_sync';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message: string;
  progress: number;
  tablesFound?: number;
  chartsFound?: number;
}

export interface IngestionResult {
  success: boolean;
  documentId: string;
  dealId: string;
  tablesProcessed: number;
  chartsProcessed: number;
  textChunksProcessed: number;
  qdrantPointsCount: number;
  vectorDimensions: number;
  logs: string[];
}

export interface Citation {
  chunk_id: string;
  document_id: string;
  document_name: string;
  page_number: number;
  chunk_type: ChunkType;
  snippet: string;
  raw_markdown?: string;
  image_url?: string;
  relevance_score: number;
}

export interface RiskItem {
  id: string;
  category: 'Financial Anomaly' | 'Debt Covenant' | 'Customer Concentration' | 'ESG & Compliance' | 'Valuation Risk';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  evidence_snippet: string;
  page_reference: number;
}

export interface DueDiligenceResponse {
  answer: string;
  executive_summary: string;
  risk_score: number; // 0-100 (100 = high risk)
  risks: RiskItem[];
  citations: Citation[];
  financial_tables_analyzed: string[];
  charts_referenced: { title: string; image_url: string }[];
  query: string;
  deal_id: string;
}
