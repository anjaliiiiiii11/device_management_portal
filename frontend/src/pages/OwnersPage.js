import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/OwnersPage.css';

const OwnersPage = () => {
  return (
    <div className="owners-page-container">
      <h2 className="owners-page-title">Ownership</h2>
      <div className="owners-page-section">
        
        <Link to="/register-owner">
          <button className="owners-page-btn" style={{ marginTop: '16px' }}>
           Register an Owner
          </button>
        </Link>
      </div>
      <div className="owners-page-section">
        
        <Link to="/assign-owner">
          <button className="owners-page-btn" style={{ marginTop: '16px' }}>
            Assign an Owner 
          </button>
        </Link>
      </div>
    </div>
  );
};

export default OwnersPage;