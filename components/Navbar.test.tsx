// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Navbar } from './Navbar';
import { Deal } from '@/lib/types';

const mockDeal: Deal = {
  id: 'deal-1',
  name: 'Project Apex Buyout',
  target_company: 'Apex Logistics Inc.',
  sector: 'Logistics',
  status: 'active',
  created_at: new Date().toISOString(),
};

describe('Navbar Component', () => {
  it('renders brand name and tagline', () => {
    render(
      <Navbar
        currentDeal={mockDeal}
        deals={[mockDeal]}
        onSelectDeal={() => {}}
        onOpenCreateDealModal={() => {}}
        onOpenSqlModal={() => {}}
        activeTab="audit"
        setActiveTab={() => {}}
      />
    );

    expect(screen.getByText('LedgerClue')).toBeInTheDocument();
    expect(screen.getByText('AI Due Diligence')).toBeInTheDocument();
  });

  it('triggers tab switching on click', () => {
    const setActiveTabMock = vi.fn();
    const { container } = render(
      <Navbar
        currentDeal={mockDeal}
        deals={[mockDeal]}
        onSelectDeal={() => {}}
        onOpenCreateDealModal={() => {}}
        onOpenSqlModal={() => {}}
        activeTab="audit"
        setActiveTab={setActiveTabMock}
      />
    );

    const buttons = container.querySelectorAll('nav button');
    expect(buttons.length).toBeGreaterThan(1);
    
    // Index 1 is Document Ingestion tab button
    fireEvent.click(buttons[1]);

    expect(setActiveTabMock).toHaveBeenCalledWith('ingest');
  });
});
