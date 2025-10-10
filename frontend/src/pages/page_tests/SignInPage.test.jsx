import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignInPage from '../SignInPage';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('../api/axios');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Suppress alerts
window.alert = jest.fn();

describe('SignInPage Component', () => {
  const mockLogin = jest.fn();

  const renderWithContext = () =>
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <SignInPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('renders form inputs and submit button', () => {
    renderWithContext();

    expect(screen.getByPlaceholderText(/Enter your email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('submits form and logs in successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'mock-token' } });

    renderWithContext();

    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'securepassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8083/api/auth/login',
        { email: 'test@example.com', password: 'securepassword123' }
      );
      expect(mockLogin).toHaveBeenCalledWith('mock-token');
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(window.alert).toHaveBeenCalledWith('Login successful');
    });
  });

  it('shows alert on failed login', async () => {
    axios.post.mockRejectedValueOnce(new Error('Login failed'));

    renderWithContext();

    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Login failed');
    });
  });
});
