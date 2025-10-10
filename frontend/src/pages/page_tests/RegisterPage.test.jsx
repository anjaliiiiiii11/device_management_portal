import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../RegisterPage';
import axios from 'axios';
import '@testing-library/jest-dom';

// Mock axios
jest.mock('axios');

describe('RegisterPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields and submit button', () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText(/Device ID/i)).toBeDisabled();
    expect(screen.getByPlaceholderText(/Name/i)).toBeInTheDocument();
   expect(screen.getAllByRole('combobox')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  it('submits form and shows success message', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText(/Name/i), {
      target: { value: 'Test Device' },
    });
    fireEvent.change(screen.getByDisplayValue('Type'), {
      target: { value: 'Laptop' },
    });
    fireEvent.change(screen.getByDisplayValue('Manufacturer'), {
      target: { value: 'Apple' },
    });
    fireEvent.change(screen.getByDisplayValue('Status'), {
      target: { value: 'Active' },
    });
    fireEvent.change(screen.getByLabelText(/Purchase Date/i), {
      target: { value: '2025-09-06' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/Device successfully registered/i)).toBeInTheDocument();
    });
  });

  it('shows error message on failed registration', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'));

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText(/Name/i), {
      target: { value: 'Test Device' },
    });
    fireEvent.change(screen.getByDisplayValue('Type'), {
      target: { value: 'Laptop' },
    });
    fireEvent.change(screen.getByDisplayValue('Manufacturer'), {
      target: { value: 'Apple' },
    });
    fireEvent.change(screen.getByDisplayValue('Status'), {
      target: { value: 'Active' },
    });
    fireEvent.change(screen.getByLabelText(/Purchase Date/i), {
  target: { value: '2025-09-06' },
});

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to register the device/i)).toBeInTheDocument();
    });
  });
});
