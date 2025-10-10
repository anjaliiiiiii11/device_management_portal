import React from 'react';
import '../styles/Footer.css';

const Footer = ({ addMarginTop }) => {
  return (
    <footer className={`footer ${addMarginTop ? 'margin-top' : ''}`}>
      <p>&copy; 2025 DeviceManager. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
