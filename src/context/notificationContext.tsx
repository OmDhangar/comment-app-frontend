import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'reply' | 'comment';
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  registerReplyHandler: (handler: (notification: Notification) => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to WebSocket
      const newSocket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
        auth: {
          token: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Listen for notifications
      newSocket.on('notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        if ((notification.type === 'reply' || notification.type === 'comment' )&& onNewReplyHandler) {
          onNewReplyHandler(notification);
        }
        
        // Show toast notification
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New {notification.type}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ));
      });

      setSocket(newSocket);

      // Load existing notifications
      fetchNotifications();

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
              },
            });
      const data = await response.json();
      console.log('Fetched notifications:', data);
      const notifs = Array.isArray(data) ? data : data.notifications || [];
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  const [onNewReplyHandler, setOnNewReplyHandler] = useState<((n: Notification) => void) | null>(null);
  const registerReplyHandler = (handler: (n: Notification) => void) => {
    setOnNewReplyHandler(() => handler);
  };


  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications,registerReplyHandler,unreadCount, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};