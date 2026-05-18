import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

describe('Inventory MF', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 'i-1', productId: 'p-1', warehouseId: 'w-1', quantity: 50 },
      ],
    }));
  });

  it('renders Stock / Inventory heading', () => {
    render(<App />);
    expect(screen.getByText(/Stock \/ Inventory/i)).toBeInTheDocument();
  });

  it('fetches and shows inventory items', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('p-1')).toBeInTheDocument());
  });

  it('calls /api/inventory on mount', async () => {
    render(<App />);
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/inventory', expect.any(Object)));
  });
});
