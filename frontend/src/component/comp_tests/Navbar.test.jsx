// Navbar.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
//import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import * as ReactRouterDom from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Navbar Component', () => {
  const mockLogout = jest.fn();

  const renderNavbar = (isLoggedIn = false) => {
    return render(
      <AuthContext.Provider value={{ isLoggedIn, logout: mockLogout }}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  test('renders logo and login/signup when not logged in', () => {
    renderNavbar(false);

    expect(screen.getByAltText(/DeviceManager Logo/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Signup/i)).toBeInTheDocument();
  });

  test('renders dashboard and dropdowns when logged in', () => {
    renderNavbar(true);

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Devices ▾/i)).toBeInTheDocument();
    expect(screen.getByText(/Owners ▾/i)).toBeInTheDocument();
  });

  test('shows user menu and handles logout', () => {
    renderNavbar(true);

    const userIcon = screen.getByTitle(/User Menu/i);
    fireEvent.click(userIcon);

    const logoutButton = screen.getByText(/Logout/i);
    expect(logoutButton).toBeInTheDocument();

    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
  });
});
