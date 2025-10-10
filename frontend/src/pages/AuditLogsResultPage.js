import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/AuditLogsPage.css';
import Pagination from '@mui/material/Pagination';
import Button from '@mui/material/Button';

const AuditLogsResultPage = () => {
  const { state } = useLocation();
  const deviceId = state?.deviceId || '';
  const logs = state?.logs || [];
  const error = state?.error || null;

  const LOGS_PER_PAGE = 5;
  const [page, setPage] = useState(1);
  const [sortDescending, setSortDescending] = useState(true);

  useEffect(() => {
    console.log('Audit Logs:', logs);
  }, [logs]);

  const parseLog = (logStr) => {
    const logIdMatch = logStr.match(/\[LogID: (.*?)\]/);
    const deviceIdMatch = logStr.match(/\[DeviceID: (.*?)\]/);
    const timestampMatch = logStr.match(/\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?)]/);

    const rawTimestamp = timestampMatch?.[1] || '';
    const formattedTimestamp = rawTimestamp.replace('T', ' ').split('.')[0];

    const actionText = logStr
      .replace(/\[LogID: .*?\]/, '')
      .replace(/\[DeviceID: .*?\]/, '')
      .replace(/\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?)]/, '')
      .trim();

    return {
      logId: logIdMatch?.[1] || '',
      deviceId: deviceIdMatch?.[1] || '',
      timestamp: formattedTimestamp,
      rawTimestamp,
      action: actionText,
    };
  };

  const getActionColor = (action) => {
    const lower = action.toLowerCase();
    if (lower.includes('update') || lower.includes('register')) return 'green';
    if (lower.includes('delete')) return 'red';
    if (lower.includes('restore')) return 'goldenrod';
    if (lower.includes('assign')) return 'purple';
    return 'black';
  };

  const parsedLogs = logs.map(parseLog);

  const sortedLogs = [...parsedLogs].sort((a, b) => {
    const timeA = new Date(a.rawTimestamp);
    const timeB = new Date(b.rawTimestamp);
    return sortDescending ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="auditlogs-bg">
      <div className="auditlogs-container">
        <h2 className="auditlogs-title">Audit Logs Result</h2>
        <h3 className="auditlogs-result-title">Device ID: {deviceId}</h3>

        <Button
          variant="outlined"
          onClick={() => setSortDescending(!sortDescending)}
          style={{ marginBottom: '20px' }}
        >
          Sort by {sortDescending ? 'Oldest First' : 'Latest First'}
        </Button>

        {error ? (
          <div style={{ color: 'red', fontWeight: 'bold' }}>{error}</div>
        ) : logs.length === 0 ? (
          <div>No audit logs found.</div>
        ) : (
          <>
            <table className="auditlogs-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  {/* <th>Device ID</th> */}
                  <th>Timestamp</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedLogs
                  .slice((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE)
                  .map((parsed, index) => (
                    <tr key={index}>
                      <td>{parsed.logId}</td>
                      {/* <td>{parsed.deviceId}</td> */}
                      <td>{parsed.timestamp}</td>
                      <td
                        style={{
                          color: getActionColor(parsed.action),
                          fontWeight: 'bold',
                        }}
                      >
                        {parsed.action}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {logs.length > LOGS_PER_PAGE && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Pagination
                  count={Math.ceil(logs.length / LOGS_PER_PAGE)}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuditLogsResultPage;
