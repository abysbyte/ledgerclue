# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> LedgerClue Web Interface E2E Tests >> loads homepage and displays branding & navigation
- Location: e2e\home.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('LedgerClue')
Expected: visible
Error: strict mode violation: getByText('LedgerClue') resolved to 2 elements:
    1) <span class="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">LedgerClue</span> aka getByText('LedgerClue', { exact: true })
    2) <span class="font-semibold text-slate-300">LedgerClue AI Due Diligence Platform</span> aka getByText('LedgerClue AI Due Diligence')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('LedgerClue')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e12] [cursor=pointer]:
          - generic [ref=e13]:
            - generic [ref=e14]: LedgerClue
            - generic [ref=e15]: AI Due Diligence
          - generic [ref=e16]: Hybrid RAG • 2048-dim Nemotron • Qdrant Payload
        - navigation [ref=e17]:
          - button "Due Diligence Copilot" [ref=e18]
          - button "Document Ingestion" [ref=e23]
          - button "Qdrant Payload Inspector" [ref=e29]
          - button "SQL Schema" [ref=e35]
        - generic [ref=e41]:
          - button "Select Deal ▼" [ref=e43]:
            - generic [ref=e46]: Select Deal
            - generic [ref=e48]: ▼
          - generic [ref=e49]: Qdrant 2048-dim
    - main [ref=e52]:
      - generic [ref=e53]:
        - generic [ref=e55]:
          - generic [ref=e56]:
            - generic [ref=e57]: Multi-Modal Due Diligence Audit Engine
            - heading "AI Financial Due Diligence Copilot" [level=2] [ref=e62]
            - paragraph [ref=e63]: Ask deep financial audit questions across target deal documents. Answers dynamically pull raw Markdown tables from Qdrant vector payloads and link visual charts to verify claims.
          - generic [ref=e64]:
            - generic [ref=e65]: CURRENT TARGET DEAL
            - text: Default Deal
        - generic [ref=e66]:
          - generic [ref=e67]: Recommended Forensic Scenarios
          - generic [ref=e72]:
            - button "EBITDA Quality & Add-Back Audit Audit reported FY2025 Adjusted EBITDA. Identify all non-recurring add-backs, personal expenses, and R&D capitalization anomalies." [ref=e73]:
              - generic [ref=e74]: EBITDA Quality & Add-Back Audit
              - paragraph [ref=e79]: Audit reported FY2025 Adjusted EBITDA. Identify all non-recurring add-backs, personal expenses, and R&D capitalization anomalies.
            - button "Debt Covenant Headroom Analysis Analyze senior debt covenants, Net Debt to EBITDA ratio threshold versus actual compliance, and default cure periods." [ref=e80]:
              - generic [ref=e81]: Debt Covenant Headroom Analysis
              - paragraph [ref=e86]: Analyze senior debt covenants, Net Debt to EBITDA ratio threshold versus actual compliance, and default cure periods.
            - button "Customer Concentration Risk What percentage of annual revenue is concentrated in the top 3 customers? Are there long-term contracts?" [ref=e87]:
              - generic [ref=e88]: Customer Concentration Risk
              - paragraph [ref=e93]: What percentage of annual revenue is concentrated in the top 3 customers? Are there long-term contracts?
            - button "Working Capital & Overdue A/R Review Accounts Receivable aging schedule, bad debt allowance, and overdue balances over 90 days." [ref=e94]:
              - generic [ref=e95]: Working Capital & Overdue A/R
              - paragraph [ref=e100]: Review Accounts Receivable aging schedule, bad debt allowance, and overdue balances over 90 days.
        - generic [ref=e101]:
          - textbox "Ask about EBITDA adjustments, debt covenants, revenue concentration, working capital..." [ref=e102]
          - button "Execute Audit" [disabled] [ref=e103]
    - contentinfo [ref=e108]:
      - generic [ref=e109]:
        - generic [ref=e110]:
          - generic [ref=e114]: LedgerClue AI Due Diligence Platform
          - generic [ref=e115]: • Hybrid RAG Architecture
        - generic [ref=e116]:
          - generic [ref=e117]: Qdrant 2048-dim Vectors
          - generic [ref=e118]: Nemotron 3 Embed 1B
          - generic [ref=e119]: Supabase Metadata Engine
  - button "Open Next.js Dev Tools" [ref=e125] [cursor=pointer]
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
> 8  |     await expect(page.getByText('LedgerClue', { exact: false })).toBeVisible();
     |                                                                  ^ Error: expect(locator).toBeVisible() failed
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
  24 |     await expect(page.getByText('Multi-Modal Document Parser & Ingestion Pipeline', { exact: false })).toBeVisible();
  25 | 
  26 |     // Click Vector Inspector tab
  27 |     await page.getByText('Qdrant Payload Inspector').click();
  28 |     await expect(page.getByText('Qdrant Hybrid Vector Inspector', { exact: false })).toBeVisible();
  29 |   });
  30 | });
  31 | 
```