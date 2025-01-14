import React, { createContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type) => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      isRead: false,
    };
    setNotifications((prev) => [...prev, newNotification]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, deleteNotification  }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
