// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { DealSelectorModal } from './DealSelectorModal';
import { Deal } from '@/lib/types';

const mockDeal: Deal = {
  id: 'deal-1',
  name: 'Project Apex Buyout',
  target_company: 'Apex Logistics Inc.',
  sector: 'Logistics',
  status: 'active',
  created_at: new Date().toISOString(),
};

describe('DealSelectorModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DealSelectorModal
        isOpen={false}
        onClose={() => {}}
        onCreateDeal={vi.fn()}
        onSelectDeal={() => {}}
        deals={[mockDeal]}
        currentDeal={mockDeal}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders existing deals list when isOpen is true', () => {
    render(
      <DealSelectorModal
        isOpen={true}
        onClose={() => {}}
        onCreateDeal={vi.fn()}
        onSelectDeal={() => {}}
        deals={[mockDeal]}
        currentDeal={mockDeal}
      />
    );

    expect(screen.getByText('Financial Deal Workspace')).toBeInTheDocument();
    expect(screen.getByText('Project Apex Buyout')).toBeInTheDocument();
  });

  it('handles creation of new deal', async () => {
    const onCreateDealMock = vi.fn().mockResolvedValue({
      id: 'deal-2',
      name: 'New Acquisition Deal',
      status: 'active',
      created_at: new Date().toISOString(),
    });
    const onSelectDealMock = vi.fn();
    const onCloseMock = vi.fn();

    const { container } = render(
      <DealSelectorModal
        isOpen={true}
        onClose={onCloseMock}
        onCreateDeal={onCreateDealMock}
        onSelectDeal={onSelectDealMock}
        deals={[mockDeal]}
        currentDeal={mockDeal}
      />
    );

    const input = container.querySelector('input[placeholder*="Project Apollo"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    fireEvent.change(input, { target: { value: 'New Acquisition Deal' } });

    const form = container.querySelector('form') as HTMLFormElement;
    expect(form).not.toBeNull();
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onCreateDealMock).toHaveBeenCalledWith('New Acquisition Deal', '', 'Enterprise Software & Tech', '$350M');
      expect(onSelectDealMock).toHaveBeenCalled();
      expect(onCloseMock).toHaveBeenCalled();
    });
  });
});
