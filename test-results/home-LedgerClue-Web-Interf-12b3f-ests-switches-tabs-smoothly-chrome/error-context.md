# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> LedgerClue Web Interface E2E Tests >> switches tabs smoothly
- Location: e2e\home.spec.ts:17:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Multi-Modal Document Parser & Ingestion Pipeline')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Multi-Modal Document Parser & Ingestion Pipeline')

```

```yaml
- banner:
  - text: LedgerClue AI Due Diligence Hybrid RAG • 2048-dim Nemotron • Qdrant Payload
  - navigation:
    - button "Due Diligence Copilot"
    - button "Document Ingestion"
    - button "Qdrant Payload Inspector"
    - button "SQL Schema"
  - button "sunblue deal ▼"
  - text: Qdrant 2048-dim
- main:
  - heading "sunblue deal" [level=1]
  - text: active
  - paragraph:
    - text: "Target:"
    - strong: Apex Corp
    - text: "• Sector: Tech • Enterprise Value: $450M"
  - button "Switch Target Deal"
  - text: Parent-Child Layout Parser
  - heading "Financial Document Ingestion Engine" [level=2]
  - paragraph: Extracts layout-aware Markdown tables and visual charts into Qdrant vector payloads using 2048-dimensional Nemotron embeddings. Raw tables are injected directly into vector payloads to bypass SQL join overhead.
  - text: VECTOR SPEC 2048-dim Nemotron
  - heading "Upload PDF Financial Package" [level=3]
  - paragraph: Drag & drop financial PDF statements, debt agreements, or audit reports
  - paragraph: Supports Audited Statements, Debt Covenants, Credit Agreements, CapEx Schedules (Max 100MB)
  - text: Browse Files
  - heading "Sample Financial Packages" [level=3]
  - paragraph: "Click to simulate instant layout parsing & 2048-dim Qdrant vector payload ingestion:"
  - button "Apex Robotics Audited Financials Contains EBITDA bridge, add-backs table, and customer concentration chart.":
    - text: Apex Robotics Audited Financials
    - paragraph: Contains EBITDA bridge, add-backs table, and customer concentration chart.
  - button "Credit Agreement & Debt Covenants Contains Senior Debt Schedule, 3.50x leverage covenant, and default cures.":
    - text: Credit Agreement & Debt Covenants
    - paragraph: Contains Senior Debt Schedule, 3.50x leverage covenant, and default cures.
  - button "Working Capital & CapEx Schedule Contains Accounts Receivable 90+ days aging table & software capitalization notes.":
    - text: Working Capital & CapEx Schedule
    - paragraph: Contains Accounts Receivable 90+ days aging table & software capitalization notes.
  - heading "Ingested Documents in Deal Package (0)" [level=3]
  - text: "Deal:"
  - strong: sunblue deal
  - table:
    - rowgroup:
      - row "Document Name Supabase Storage Path Markdown Tables Charts Parsing Status":
        - columnheader "Document Name"
        - columnheader "Supabase Storage Path"
        - columnheader "Markdown Tables"
        - columnheader "Charts"
        - columnheader "Parsing Status"
    - rowgroup
- contentinfo: LedgerClue AI Due Diligence Platform • Hybrid RAG Architecture Qdrant 2048-dim Vectors Nemotron 3 Embed 1B Supabase Metadata Engine
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('LedgerClue Web Interface E2E Tests', () => {
  4  |   test('loads homepage and displays branding & navigation', async ({ page }) => {
  5  |     await page.goto('http://localhost:3000');
  6  | 
  7  |     // Verify title and brand element
  8  |     await expect(page.getByText('LedgerClue', { exact: false })).toBeVisible();
  9  |     await expect(page.getByText('AI Due Diligence')).toBeVisible();
  10 | 
  11 |     // Verify main navigation tabs are visible
  12 |     await expect(page.getByText('Due Diligence Copilot')).toBeVisible();
  13 |     await expect(page.getByText('Document Ingestion')).toBeVisible();
  14 |     await expect(page.getByText('Qdrant Payload Inspector')).toBeVisible();
  15 |   });
  16 | 
  17 |   test('switches tabs smoothly', async ({ page }) => {
  18 |     await page.goto('http://localhost:3000');
  19 | 
  20 |     // Click Document Ingestion tab
  21 |     await page.getByText('Document Ingestion').click();
  22 | 
  23 |     // Verify ingestion view title or elements
> 24 |     await expect(page.getByText('Multi-Modal Document Parser & Ingestion Pipeline', { exact: false })).toBeVisible();
     |                                                                                                        ^ Error: expect(locator).toBeVisible() failed
  25 | 
  26 |     // Click Vector Inspector tab
  27 |     await page.getByText('Qdrant Payload Inspector').click();
  28 |     await expect(page.getByText('Qdrant Hybrid Vector Inspector', { exact: false })).toBeVisible();
  29 |   });
  30 | });
  31 | 
```