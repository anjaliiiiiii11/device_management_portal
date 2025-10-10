import React, { useContext, useState } from "react";
import { NotificationContext } from "../context/NotificationContext";
import "../styles/NotificationsPage.css";
import { Box, Typography } from '@mui/material';

const NotificationsPage = () => {
  const { notifications, acknowledgeNotification } = useContext(NotificationContext);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "acknowledged") return n.acknowledged;
    if (filter === "unacknowledged") return !n.acknowledged;
    return true;
  });

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="notifications-page">
     <Box sx={{ textAlign: 'center', mb: 3 }}>
  <Typography variant="h4" component="h2">
    All Notifications
  </Typography>
</Box>

      {/* Filter */}
      <div className="filter-controls">
        <label>Filter:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="unacknowledged">Unacknowledged</option>
        </select>
      </div>

      {/* Cards Layout */}
      <div className="notifications-grid">
        {paginatedNotifications.map((n) => (
          <div
            key={n.id}
            className={`notification-card ${n.acknowledged ? "acknowledged" : "unacknowledged"}`}
          >
            <div className="card-header">
              <strong>Device ID:</strong> {n.deviceId}
            </div>
            <div className="card-body">
              <p><strong>Old Status:</strong> {n.oldStatus}</p>
              <p><strong>New Status:</strong> {n.newStatus}</p>
              <p><strong>Changed By:</strong> {n.changedBy}</p>
              <p><strong>Reason:</strong> {n.reason}</p>
              <p><strong>Timestamp:</strong> {new Date(n.timestamp).toLocaleString()}</p>
            </div>
            <div className="card-footer">
              {n.acknowledged ? (
                <span className="badge success">✅ {n.acknowledgedBy}</span>
              ) : (
                <button
                  onClick={() => acknowledgeNotification(n.id, "User")}
                  className="ack-button"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination-controls">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default NotificationsPage;