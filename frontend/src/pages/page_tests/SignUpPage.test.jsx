import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUpPage from '../SignUpPage';
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

describe('SignUpPage Component', () => {
  const mockLogin = jest.fn();

  const renderWithContext = () =>
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <SignUpPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('renders all input fields and submit button', () => {
    renderWithContext();

    expect(screen.getByPlaceholderText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Create your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('submits form and logs in on successful registration', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'mock-token' } });

    renderWithContext();

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Create your password/i), {
      target: { value: 'securepassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8083/api/auth/register',
        {
          username: 'John',
          surname: 'Doe',
          email: 'john@example.com',
          password: 'securepassword123',
        }
      );
      expect(mockLogin).toHaveBeenCalledWith('mock-token');
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(window.alert).toHaveBeenCalledWith('Registration successful');
    });
  });

  it('shows alert if registration succeeds but no token is returned', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    renderWithContext();

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Create your password/i), {
      target: { value: 'securepassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Registration succeeded, but no token received.');
    });
  });

  it('shows alert on failed registration', async () => {
    axios.post.mockRejectedValueOnce(new Error('Registration failed'));

    renderWithContext();

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Create your password/i), {
      target: { value: 'securepassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Registration failed');
    });
  });
});
