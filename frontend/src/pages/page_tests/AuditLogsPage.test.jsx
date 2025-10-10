import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuditLogsPage from '../AuditLogsPage';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios/dist/node/axios.cjs';
import '@testing-library/jest-dom';

// ✅ Mock react-router-dom hooks
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ deviceId: undefined }),
}));

// ✅ Mock axios
jest.mock('axios/dist/node/axios.cjs', () => ({
  get: jest.fn(),
}));

describe('AuditLogsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input and submit button', () => {
    render(
      <MemoryRouter>
        <AuditLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/Enter Device ID/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  it('submits form and navigates on successful fetch', async () => {
    const mockLogs = [{ id: 1, action: 'login' }];
    axios.get.mockResolvedValueOnce({ data: mockLogs });

    render(
      <MemoryRouter>
        <AuditLogsPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter Device ID/i), {
      target: { value: 'device123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8083/devices/device123/audit');
      expect(mockNavigate).toHaveBeenCalledWith('/audit-logs-result', {
        state: { deviceId: 'device123', logs: mockLogs },
      });
    });
  });

  it('navigates with error state on failed fetch', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <AuditLogsPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter Device ID/i), {
      target: { value: 'device123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/audit-logs-result', {
        state: {
          deviceId: 'device123',
          logs: [],
          error: 'Failed to fetch audit logs.',
        },
      });
    });
  });
});
