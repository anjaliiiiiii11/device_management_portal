import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = jest.fn()
  .mockResolvedValueOnce({
    ok: true,
    text: () => Promise.resolve('CSV exported'),
  })
  .mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({
      charts: ['chart1.png'],
      folder: 'testFolder',
    }),
  });

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard title and analyze button', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Device Lifecycle Dashboard/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze/i })).toBeInTheDocument();
  });

  it('displays "No charts available" when charts array is empty', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ charts: [], folder: '' }),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/No charts available/i)).toBeInTheDocument();
    });
  });

  it('opens and closes enlarged chart on click and Escape key', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ charts: ['chart1.png'], folder: 'testFolder' }),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/chart1/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/chart1/i));
    expect(screen.getByAltText(/Enlarged Chart/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByAltText(/Enlarged Chart/i)).not.toBeInTheDocument();
    });
  });
});
