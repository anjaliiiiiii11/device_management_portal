import React, { useContext, useState } from "react";
import { NotificationContext } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import "../styles/NotificationBell.css";

const NotificationBell = () => {
  const { notifications, acknowledgeNotification } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.acknowledged).length;
  const topNotifications = notifications.slice(0, 3);

  return (
    <div className="notification-container">
      <button className="notification-button" onClick={() => setOpen(!open)}>
        🔔
        {unreadCount > 0 && <span className="notification-bubble">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <h3 className="dropdown-title">Notifications</h3>
          {notifications.length === 0 && <p>No notifications</p>}
          <ul className="notification-list">
            {topNotifications.map((n) => (
              <li
                key={n.id}
                className={`notification-item ${n.acknowledged ? "acknowledged" : "unacknowledged"}`}
              >
                <p>
                  Device <strong>{n.deviceId}</strong> changed from <strong>{n.oldStatus}</strong> to <strong>{n.newStatus}</strong>
                </p>
                <p className="meta">
                  Changed by: {n.changedBy} | Reason: {n.reason} | {new Date(n.timestamp).toLocaleString()}
                </p>
                {n.acknowledged ? (
                  <p className="ack-info">
                    ✅ Acknowledged by {n.acknowledgedBy} at{" "}
                    {new Date(n.acknowledgedAt).toLocaleString()}
                  </p>
                ) : (
                  <button
                    onClick={() => acknowledgeNotification(n.id, "frontendUser")}
                    className="ack-button"
                  >
                    Acknowledge
                  </button>
                )}
              </li>
            ))}
          </ul>
          <button className="view-all-button" onClick={() => navigate("/notifications")}>
            View All
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

