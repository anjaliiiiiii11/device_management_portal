import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import '../styles/ResultsPage.css';

const ResultsPage = () => {
  const { state } = useLocation();
  const device = state?.device;
  const owner = state?.owner;

  // If no device data is available, show "No device found"
  if (!device) {
    return (
      <div className="results-bg">
        <div className="results-container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <FaTimesCircle size={48} color="red" style={{ marginBottom: '16px' }} />
          <h2 style={{ color: 'red', fontWeight: 600 }}>No device found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="results-bg">
      <div className="results-container">
        <h2 className="results-title">Device Results</h2>
        <table className="results-table">
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Type</th>
              <th>Model</th>
              <th>Serial Number</th>
              <th>Status</th>
              <th>Owner ID</th>
              <th>Name</th>
              <th>Contact Info</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{device.deviceID || 'Not applicable'}</td>
              <td>{device.type || 'Not applicable'}</td>
              <td>{device.model || 'Not applicable'}</td>
              <td>{device.serialNumber || 'Not applicable'}</td>
              <td>{device.status || 'Not applicable'}</td>
              <td>{owner?.ownerID || 'Not applicable'}</td>
              <td>{owner?.name || 'Not applicable'}</td>
              <td>{owner?.contactInfo || 'Not applicable'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsPage;
