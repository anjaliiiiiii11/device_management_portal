import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdatePage from '../UpdatePage';
import axios from 'axios';
import '@testing-library/jest-dom';

// Mock axios
jest.mock('axios');

describe('UpdatePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields and submit button', () => {
    render(<UpdatePage />);
    expect(screen.getByPlaceholderText(/Enter Device ID/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Name/i)).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')).toHaveLength(3); // Type, Manufacturer, Status
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  it('submits form and shows success message', async () => {
    axios.patch.mockResolvedValueOnce({ data: {} });

    render(<UpdatePage />);

    fireEvent.change(screen.getByPlaceholderText(/Enter Device ID/i), {
      target: { value: 'TEL123456' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Name/i), {
      target: { value: 'Updated Device' },
    });
    fireEvent.change(screen.getByDisplayValue('Select Type'), {
      target: { value: 'Laptop' },
    });
    fireEvent.change(screen.getByDisplayValue('Select Manufacturer'), {
      target: { value: 'Apple' },
    });
    fireEvent.change(screen.getByDisplayValue('Select Status'), {
      target: { value: 'Active' },
    });

    // Ensure label is linked to input via htmlFor="purchaseDate" and input has id="purchaseDate"
    fireEvent.change(screen.getByLabelText(/Purchase Date/i), {
      target: { value: '2025-09-06' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/Device updated successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error message on failed update', async () => {
    axios.patch.mockRejectedValueOnce(new Error('Network error'));

    render(<UpdatePage />);

    fireEvent.change(screen.getByPlaceholderText(/Enter Device ID/i), {
      target: { value: 'TEL123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to update device.')).toBeInTheDocument();
    });
  });
});
