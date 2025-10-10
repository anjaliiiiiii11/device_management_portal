import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthPage from '../AuthPage';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock child components
jest.mock('./SignInPage', () => () => <div>Sign In Form</div>);
jest.mock('./SignUpPage', () => () => <div>Sign Up Form</div>);

const renderWithRouteState = (mode = 'signin') => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/auth', state: { mode } }]}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('AuthPage Component', () => {
  it('renders Sign In form by default', () => {
    renderWithRouteState('signin');

    expect(screen.getByText(/Sign In Form/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Toggle Sign In\/Sign Up/i })).toBeInTheDocument();
    expect(screen.getByAltText(/Tech Devices/i)).toBeInTheDocument();
  });

  it('renders Sign Up form when mode is signup', () => {
    renderWithRouteState('signup');

    expect(screen.getByText(/Sign Up Form/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Toggle Sign In\/Sign Up/i })).toBeInTheDocument();
  });

  it('toggles between Sign In and Sign Up forms', () => {
    renderWithRouteState('signin');

    expect(screen.getByText(/Sign In Form/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Toggle Sign In\/Sign Up/i }));

    expect(screen.getByText(/Sign Up Form/i)).toBeInTheDocument();
  });

  it('applies correct layout class based on mode', () => {
    const { container } = renderWithRouteState('signup');
    expect(container.firstChild).toHaveClass('auth-wrapper row-reverse');

    const { container: container2 } = renderWithRouteState('signin');
    expect(container2.firstChild).toHaveClass('auth-wrapper row-normal');
  });
});
