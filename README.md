# 📊 LedgerClue — Financial Due Diligence & Multimodal RAG Engine

**LedgerClue** is an enterprise-grade financial Due Diligence copilot and forensic RAG (Retrieval-Augmented Generation) engine built for M&A deal team analysis, quality of earnings audits, debt covenant monitoring, and commercial risk assessment.

Powered by **Next.js 16**, **Qdrant Vector Database** (2048-dim vectors), **NVIDIA Nemotron-3-embed-1b**, and **Supabase**, LedgerClue eliminates relational SQL join bottlenecks by injecting parent markdown tables and visual chart assets directly into Qdrant vector payloads.

---

## 🚀 Key Features

- **📄 Layout-Aware Document Parsing & Nemotron OCR v2**  
  Extracts financial tables, debt schedules, income statements, and charts from complex PDFs, TXTs, CSVs, and Markdown files—even for custom-font or image-based financial disclosures.
  
- **🧩 Parent-Child Markdown Table Ingestion**  
  Summarizes complex tables via Fast LLM for semantic vector search, while embedding raw parent Markdown tables directly into Qdrant point payloads. Retrieval returns exact, un-truncated tables without database lookup latency.

- **🖼️ Multimodal Chart & Visual Asset Storage**  
  Parses visual financial diagrams (pie charts, trend graphs, segment breakdowns) with Vision LLMs, stores processed images in Supabase Storage, and embeds direct visual URLs in Qdrant payloads for instant user verification.

- **🎯 Deal-Scoped Vector Retrieval**  
  Restricts vector searches strictly by `deal_id` metadata payload filters to guarantee strict data isolation across target portfolio companies.

- **⚡ High-Precision 2048-Dim Embeddings**  
  Employs `nvidia/nemotron-3-embed-1b` (2048 vector dimensions) for high-density financial concept mapping.

- **🛡️ Forensic Risk Matrix & Automated Audit Response**  
  Generates executive summaries, risk severity scores (0–100), structured risk items (Financial Anomalies, Debt Covenants, Customer Concentration), page citations, and evidence snippets.

- **⚡ Sub-50ms Semantic Caching Engine**  
  Caches full synthesized due diligence audits via vector cosine similarity ($\ge 0.94$ threshold) in Qdrant (`deal_semantic_cache_2048`) and in-memory fast-paths. Scoped strictly by `deal_id` and automatically invalidated upon new document ingestion to ensure continuous audit freshness.

- **🔄 Zero-Config In-Memory Fallback Engines**  
  Includes instant fallbacks for Qdrant, semantic caching, and Supabase. The platform runs smoothly out of the box for demonstration and development without requiring external server dependencies.

- **🔍 Payload Inspector & SQL Schema Exporter**  
  Built-in UI tools to visually inspect raw Qdrant vector payloads, search scores, and export PostgreSQL schema scripts for Supabase.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Actions, React 19) |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons, Framer Motion |
| **Vector Engine** | [Qdrant](https://qdrant.tech/) REST Client (2048-dim Cosine distance) |
| **Relational Metadata** | [Supabase](https://supabase.com/) (PostgreSQL & Storage Buckets) |
| **Embedding Model** | NVIDIA Nemotron-3-embed-1b (2048 dimensions) |
| **LLM Reasoning** | NVIDIA NIM / OpenAI API (`moonshotai/kimi-k3`, `meta/llama-3.1-8b-instruct`, `gpt-4o-mini`) |
| **Semantic Cache** | Deal-scoped 2048-dim vector cosine similarity cache ($\ge 0.94$) with Qdrant & In-Memory backends |
| **Testing** | Vitest (Unit Testing), Playwright (E2E Testing) |

---

## 📁 Project Structure

```
ledgerclue/
├── app/
│   ├── api/
│   │   ├── cache/              # Semantic cache telemetry & invalidation API
│   │   ├── deals/              # Fetch & create M&A target deals
│   │   ├── documents/          # Document metadata & deal association
│   │   ├── ingest/             # Document ingestion endpoint
│   │   ├── qdrant-inspector/   # Inspection API for Qdrant points
│   │   └── query/              # RAG due diligence query execution
│   ├── favicon.ico
│   ├── globals.css             # Tailwind v4 theme & global styles
│   ├── layout.tsx              # Root HTML layout & font definitions
│   └── page.tsx                # Main SPA workspace (Audit, Ingest, Qdrant UI)
├── components/
│   ├── DealSelectorModal.tsx   # Target deal switcher & creator modal
│   ├── DocumentUploader.tsx    # Drag-and-drop file uploader & status logs
│   ├── Navbar.tsx              # Application header & tab navigation
│   ├── PayloadInspector.tsx    # Qdrant 2048-dim vector point payload viewer
│   ├── RagChat.tsx             # Interactive Due Diligence Audit & Risk Matrix UI
│   └── SqlSetupModal.tsx       # Supabase SQL table creation script generator
├── lib/
│   ├── embeddings.ts           # 2048-dim Nemotron embedding generator & fallback
│   ├── ingestion.ts            # Parent-child parsing & vector ingestion engine
│   ├── ocr.ts                  # Nemotron OCR v2 visual extraction pipeline
│   ├── parser.ts               # Layout-aware PDF/TXT parser & Markdown table formatter
│   ├── qdrant.ts               # Qdrant vector client & in-memory payload store
│   ├── rag.ts                  # Multimodal RAG query execution & audit synthesis
│   ├── semantic-cache.ts       # Deal-scoped vector semantic cache & cosine similarity engine
│   ├── supabase.ts             # Supabase DB client & in-memory database store
│   └── types.ts                # TypeScript interfaces (QdrantPayload, RiskItem, etc.)
├── e2e/                        # Playwright end-to-end test suites
├── public/                     # Static assets
├── .env.example                # Template for environment variables
├── package.json
└── tsconfig.json
```

---

## ⚙️ How Ingestion Works

```mermaid
flowchart TD
    A[Upload File: PDF / TXT / CSV] --> B[parseDocumentLayout Engine]
    B --> C{Detect Content Types}
    
    C -->|Markdown Tables| D[Fast LLM Table Summarization]
    D --> E[Generate 2048-dim Vector]
    E --> F[Payload Creation: Summary + Raw Markdown Table Injected]
    
    C -->|Visual Charts| G[Vision LLM Layout Analysis]
    G --> H[Upload Image to Supabase Storage]
    H --> I[Generate 2048-dim Vector]
    I --> J[Payload Creation: Summary + Image URL Injected]
    
    C -->|Text Paragraphs| K[Chunk Text]
    K --> L[Generate 2048-dim Vector]
    L --> M[Payload Creation: Text Content + Metadata]
    
    F --> N[Upsert Points into Qdrant Collection]
    J --> N
    M --> N
    N --> O[Sync Document Record in Supabase DB]
```

### Ingestion Steps Breakdown

1. **Layout-Aware Extraction & OCR**:
   - The document is parsed by `lib/parser.ts`.
   - Text streams are inspected for tabular rows (`|`, tab alignments, multi-column metrics) and converted into clean **Markdown tables**.
   - For custom-font or image-heavy PDFs, **Nemotron OCR v2** (`lib/ocr.ts`) or an AI layout restorer is automatically invoked.

2. **Parent-Child Table Indexing**:
   - Instead of losing structured table formatting, tables are summarized by a Fast LLM into semantic concepts for dense vector matching.
   - The original raw parent Markdown table is stored **directly inside the Qdrant payload** under `raw_markdown`.

3. **Multimodal Chart Indexing**:
   - Visual diagrams are analyzed via Vision LLMs (`meta/llama-3.2-11b-vision-instruct` / `neva-22b`).
   - The original chart image is uploaded to Supabase Storage (`financial-charts` bucket), and the `image_url` is added to the Qdrant payload.

4. **2048-Dim Vector Embedding**:
   - Semantic summaries and text chunks are converted to **2048-dimensional vectors** using `nvidia/nemotron-3-embed-1b` (with deterministic fallback).

5. **Qdrant Storage & Metadata Sync**:
   - Points are upserted into Qdrant with filters for `deal_id`, `document_id`, `page_number`, `financial_category`, and `section_heading`.

---

## 🔎 How Retrieval (RAG Engine) Works

```mermaid
flowchart TD
    A[User Query: e.g. 'What is the Net Debt covenant threshold?'] --> B[Embed Query via Nemotron 2048-dim]
    B --> C{Probe Semantic Cache<br/>deal_id + cosine sim >= 0.94}
    
    C -- Cache HIT <50ms --> H[Return Cached DueDiligenceResponse]
    
    C -- Cache MISS --> D[Qdrant Cosine Vector Search Filtered by deal_id]
    D --> E[Retrieve Top-K Matching Vector Points]
    
    E --> F[Extract Context directly from Qdrant Payloads]
    F -->|No SQL Joins Needed!| G[Extract Raw Markdown Tables & Chart Image URLs]
    
    G --> I[Synthesize Audit via LLM: moonshotai/kimi-k3 / Llama 3.1]
    I --> J[Save to Deal Semantic Cache Collection]
    J --> H
    
    H --> K[Render Executive Summary & Deal Risk Index]
    H --> L[Render Categorized Risk Matrix with Evidence Snippets]
    H --> M[Render Exact Markdown Tables & Citation Cards]
```

### Retrieval Steps Breakdown

1. **2048-Dim Query Embedding**:
   - The user's query is converted to a 2048-dimensional vector via `generateNemotronEmbedding()`.

2. **Sub-50ms Semantic Cache Probe**:
   - Before executing vector search or calling the LLM, the pre-computed query vector is checked against `lib/semantic-cache.ts` (`deal_semantic_cache_2048` Qdrant collection + in-memory store).
   - If a prior query for the same `deal_id` matches with cosine similarity $\ge 0.94$, the cached audit response is returned instantly (<50ms) with a `⚡ Semantic Cache Hit` indicator.

3. **Deal-Filtered Vector Search**:
   - On a cache miss, Qdrant searches the `financial_due_diligence_2048` collection filtered strictly by `deal_id`.

4. **Direct Context Extraction (No SQL Joins)**:
   - Retrieved payload items contain the text snippet, page number, section heading, **raw parent markdown tables**, and **chart image URLs**.
   - Context is assembled directly from vector payloads without database roundtrips.

5. **Forensic Audit Synthesis**:
   - Context is passed to the configured LLM (`moonshotai/kimi-k3`, `meta/llama-3.1-8b-instruct`, or fallback financial auditor).
   - The LLM returns a structured JSON payload:
     - `answer`: Full markdown audit report.
     - `executive_summary`: 2-sentence executive brief.
     - `risk_score`: Numeric score (0–100).
     - `risks`: Categorized risk items with `severity` (HIGH/MEDIUM/LOW), `title`, `description`, `evidence_snippet`, and `page_reference`.
     - `citations`: Exact source documents, pages, and relevance scores.
   - The newly generated audit response is stored in the semantic cache for instant future lookups.

---

## 🛞 Zero-Config Demo Mode (In-Memory Fallbacks)

LedgerClue is built to work seamlessly even without external services running:

- **Qdrant Offline Fallback**: If a Qdrant server is unreachable at `QDRANT_URL`, LedgerClue switches to an internal memory map and computes cosine vector similarity directly in Node.js.
- **Supabase Offline Fallback**: If Supabase credentials are not provided, deal states and document metadata are safely stored in memory during the active session.
- **NVIDIA / OpenAI Offline Fallback**: If API keys are missing, LedgerClue generates deterministic 2048-dimensional unit-norm vectors and provides forensic auditor reasoning logic.

---

## 🚦 Getting Started

### Prerequisites

- **Node.js**: v18.x or v20.x
- **npm** / **yarn** / **pnpm** / **bun**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/abysbyte/ledgerclue.git
   cd ledgerclue
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `KIMI_K3_API_KEY` | Primary API Key for Kimi-k3 / LLM synthesis (NVIDIA NIM or Moonshot) | `nvapi-...` / `sk-...` |
| `LLM_BASE_URL` | Base URL for OpenAI-compatible endpoint | `https://integrate.api.nvidia.com/v1` |
| `LLM_MODEL_NAME` | Primary LLM model identifier | `moonshotai/kimi-k3` |
| `NVIDIA_API_KEY` | Key for NVIDIA API (Nemotron embeddings & Vision OCR) | `nvapi-...` |
| `NEMOTRON_OCR_API_KEY` | Key for NVIDIA Nemotron OCR visual layout analysis | `nvapi-...` |
| `SEMANTIC_CACHE_THRESHOLD` | Cosine similarity threshold for cache hits (0.0–1.0) | `0.94` |
| `SEMANTIC_CACHE_TTL_MS` | Cache Time-To-Live duration in milliseconds | `86400000` (24h) |
| `QDRANT_URL` | URL of Qdrant vector database server | `http://localhost:6333` |
| `QDRANT_API_KEY` | API Key for authenticated Qdrant instances | `your_qdrant_key` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role API key | `ey...` |
| `OPENAI_API_KEY` | Optional fallback key for OpenAI API | `sk-...` |

---

## 🧪 Testing & Verification

- **Run Unit Tests (Vitest)**:
  ```bash
   npm test
  ```
- **Run End-to-End Tests (Playwright)**:
  ```bash
  npm run test:e2e
  ```
- **Build Production Bundle**:
  ```bash
  npm run build
  ```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
