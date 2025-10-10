import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';  
import Footer from '../Footer';

describe('Footer', () => {
  it('renders the footer text correctly', () => {
    render(<Footer />);
    const footerText = screen.getByText(/© 2025 DeviceManager\. All rights reserved\./i);
    expect(footerText).toBeInTheDocument();
  });
});
