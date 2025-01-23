import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications', { params: { user_id: userId } });
        setNotifications(response.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    if (userId) fetchNotifications();
  }, [userId]);

  const addNotification = async (message, type, receiver) => {
    receiver = receiver || userId;

    try {
      const response = await api.post('/notifications', { user_id: receiver, message, type });
      if (receiver === userId) {
        const newNotification = { ...response.data, is_read: false, type, message };
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (err) {
      console.error('Error adding notification:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAsRead, deleteNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

