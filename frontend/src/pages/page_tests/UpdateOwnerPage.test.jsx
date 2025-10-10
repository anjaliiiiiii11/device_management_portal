import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdateOwnerPage from '../UpdateOwnerPage';
import axios from 'axios';
import '@testing-library/jest-dom';

// Mock axios
jest.mock('axios');

describe('UpdateOwnerPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields and update button', () => {
    render(<UpdateOwnerPage />);
    expect(screen.getByPlaceholderText(/Owner ID/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Owner Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Contact Info/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update Owner/i })).toBeInTheDocument();
  });

  it('submits form and shows success message', async () => {
    axios.patch.mockResolvedValueOnce({ data: {} });

    render(<UpdateOwnerPage />);

    fireEvent.change(screen.getByPlaceholderText(/Owner ID/i), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Owner Name/i), {
      target: { value: 'Updated Name' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contact Info/i), {
      target: { value: '9876543210' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Update Owner/i }));

    await waitFor(() => {
      expect(screen.getByText(/Owner details updated successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error message on failed update', async () => {
    axios.patch.mockRejectedValueOnce(new Error('Network error'));

    render(<UpdateOwnerPage />);

    fireEvent.change(screen.getByPlaceholderText(/Owner ID/i), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Owner Name/i), {
      target: { value: 'Updated Name' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contact Info/i), {
      target: { value: '9876543210' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Update Owner/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to update owner details/i)).toBeInTheDocument();
    });
  });
});
