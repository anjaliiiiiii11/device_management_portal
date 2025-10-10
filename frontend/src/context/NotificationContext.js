import React, { createContext, useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const [notifications, setNotifications] = useState(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // STOMP client with SockJS
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8082/ws-notifications"),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to WebSocket");

        client.subscribe("/topic/notifications", (message) => {
          if (message.body) {
            const notif = JSON.parse(message.body);

            // Update existing notification or add new one
            setNotifications((prev) => {
              const index = prev.findIndex((n) => n.id === notif.id);
              const updated = index !== -1
                ? prev.map((n) => (n.id === notif.id ? notif : n))
                : [notif, ...prev];

              // Save updated notifications to localStorage
              localStorage.setItem("notifications", JSON.stringify(updated));
              return updated;
            });
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker error:", frame.headers["message"]);
        console.error("Details:", frame.body);
      },
    });

    client.activate();
    setStompClient(client);

    // Fetch recent notifications on mount
    axios
      .get("http://localhost:8082/notifications/recent")
      .then((res) => {
        setNotifications((prev) => {
          // Merge backend notifications with localStorage
          const merged = [...res.data, ...prev.filter(n => !res.data.some(r => r.id === n.id))];
          localStorage.setItem("notifications", JSON.stringify(merged));
          return merged;
        });
      })
      .catch((err) => console.error("Failed to fetch notifications", err));

    return () => {
      client.deactivate();
    };
  }, []);

  // Acknowledge notification
  const acknowledgeNotification = async (id, user = "User") => {
    try {
      const res = await axios.post(
        `http://localhost:8082/notifications/${id}/acknowledge?user=${user}`
      );
      const updatedNotif = res.data;

      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n));
        localStorage.setItem("notifications", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error("Failed to acknowledge notification", err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, acknowledgeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
