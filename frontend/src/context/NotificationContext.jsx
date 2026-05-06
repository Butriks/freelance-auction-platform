import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../api/notificationApi.js';
import { useAuth } from './AuthContext.jsx';
import { useSocket } from './SocketContext.jsx';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return 0;
    }

    const { data } = await getUnreadCount();
    const nextCount = Number(data.unreadCount || 0);
    setUnreadCount(nextCount);
    return nextCount;
  }, [isAuthenticated]);

  useEffect(() => {
    refreshUnreadCount().catch(() => {
      setUnreadCount(0);
    });
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleNotificationCreated = (notification) => {
      setLatestNotification(notification);

      if (!notification?.isRead) {
        setUnreadCount((current) => current + 1);
      }
    };

    socket.on('notification_created', handleNotificationCreated);

    return () => {
      socket.off('notification_created', handleNotificationCreated);
    };
  }, [socket]);

  const markAsRead = async (id) => {
    const { data } = await markNotificationAsRead(id);

    if (!data.notification?.isRead) {
      return data.notification;
    }

    setUnreadCount((current) => Math.max(0, current - 1));
    return data.notification;
  };

  const markAllAsRead = async () => {
    const { data } = await markAllNotificationsAsRead();
    setUnreadCount(0);
    return data;
  };

  const value = useMemo(() => ({
    unreadCount,
    latestNotification,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
  }), [latestNotification, unreadCount, refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }

  return context;
}
