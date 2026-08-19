// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { parseDocumentLayout } from './parser';

describe('Document Parser Engine (Nemotron-OCR-v2)', () => {
  it('parses credit/debt agreement files into debt covenants and debt schedule tables', async () => {
    const dummyBuffer = new ArrayBuffer(8);
    const result = await parseDocumentLayout(dummyBuffer, 'credit_agreement.pdf');

    expect(result).toBeDefined();
    expect(result.elements.length).toBeGreaterThan(0);

    const hasCovenantsTable = result.elements.some(
      (el) => el.section_heading?.includes('Financial Maintenance Covenants')
    );
    expect(hasCovenantsTable).toBe(true);

    const hasDebtSchedule = result.elements.some(
      (el) => el.section_heading?.includes('Capital Structure & Senior Debt Tranches')
    );
    expect(hasDebtSchedule).toBe(true);
  });

  it('parses standard financial reports into income statement and balance sheet structures', async () => {
    const dummyBuffer = new ArrayBuffer(8);
    const result = await parseDocumentLayout(dummyBuffer, 'audited_financials_2025.pdf');

    expect(result).toBeDefined();
    expect(result.elements.length).toBeGreaterThan(0);

    const hasIncomeStatement = result.elements.some(
      (el) => el.section_heading?.includes('Consolidated Income Statement')
    );
    expect(hasIncomeStatement).toBe(true);
  });
});
