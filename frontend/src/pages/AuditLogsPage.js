import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/AuditLogsPage.css';

const AuditLogsPage = () => {
  const [deviceId, setDeviceId] = useState('');
  const { deviceId: routeDeviceId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (routeDeviceId) {
      setDeviceId(routeDeviceId);
      fetchLogs(routeDeviceId);
    }
  }, [routeDeviceId]);

  const fetchLogs = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8083/devices/${id}/audit`);
      const logs = response.data;
      navigate('/audit-logs-result', { state: { deviceId: id, logs } });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      navigate('/audit-logs-result', {
        state: {
          deviceId: id,
          logs: [],
          error: 'Failed to fetch audit logs.',
        },
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (deviceId) fetchLogs(deviceId);
  };

  return (
    <div className="auditlogs-bg">
      <div className="auditlogs-container">
        <h2 className="auditlogs-title">Enter Device ID for Audit Logs</h2>
        <form className="auditlogs-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Device ID"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="auditlogs-input"
            required
          />
          <button type="submit" className="auditlogs-btn">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default AuditLogsPage;

