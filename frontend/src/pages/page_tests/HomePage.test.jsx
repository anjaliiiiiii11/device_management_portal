import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../HomePage';
import '@testing-library/jest-dom';

// Mock localStorage
beforeEach(() => {
  Storage.prototype.getItem = jest.fn();
  Storage.prototype.setItem = jest.fn();
  Storage.prototype.removeItem = jest.fn();
});

describe('HomePage Component', () => {
  it('renders welcome message and description', () => {
    render(<HomePage />);
    expect(screen.getByText(/Welcome to Device Management Portal/i)).toBeInTheDocument();
    expect(
      screen.getByText(/One stop destination for effective Device Management/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Sign in to get started/i)).toBeInTheDocument();
  });

  it('renders homepage image with correct alt text', () => {
    render(<HomePage />);
    const image = screen.getByAltText(/Device Management/i);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/homepage.png');
  });

  it('sets isLoggedIn to true if token exists in localStorage', () => {
    Storage.prototype.getItem.mockReturnValue('mock-token');
    render(<HomePage />);
    // confirm that getItem was called
    expect(localStorage.getItem).toHaveBeenCalledWith('token');
  });

  it('sets isLoggedIn to false if no token in localStorage', () => {
    Storage.prototype.getItem.mockReturnValue(null);
    render(<HomePage />);
    expect(localStorage.getItem).toHaveBeenCalledWith('token');
  });
});
