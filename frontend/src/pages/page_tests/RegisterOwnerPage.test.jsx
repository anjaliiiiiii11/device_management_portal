import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterOwnerPage from '../RegisterOwnerPage';
import axios from 'axios';
import '@testing-library/jest-dom';

// Mock axios
jest.mock('axios');

describe('RegisterOwnerPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields and submit button', () => {
    render(<RegisterOwnerPage />);
    expect(screen.getByPlaceholderText(/Owner Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Contact Info/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register Owner/i })).toBeInTheDocument();
  });

  it('submits form and shows success message', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    render(<RegisterOwnerPage />);

    fireEvent.change(screen.getByPlaceholderText(/Owner Name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contact Info/i), {
      target: { value: '9876543210' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Register Owner/i }));

    await waitFor(() => {
      expect(screen.getByText(/Owner registered successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error message on failed registration', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'));

    render(<RegisterOwnerPage />);

    fireEvent.change(screen.getByPlaceholderText(/Owner Name/i), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contact Info/i), {
      target: { value: '1234567890' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Register Owner/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to register owner/i)).toBeInTheDocument();
    });
  });
});
