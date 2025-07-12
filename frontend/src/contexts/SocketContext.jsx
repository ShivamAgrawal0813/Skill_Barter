import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket server
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      // Join user's room
      newSocket.emit('join-user-room', user.id);

      // Listen for notifications
      newSocket.on('notification', (data) => {
        const notification = {
          id: Date.now(),
          ...data,
          timestamp: new Date(),
        };

        setNotifications(prev => [notification, ...prev]);

        // Show toast notification
        toast(data.message, {
          icon: getNotificationIcon(data.type),
          duration: 5000,
        });
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect if not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setNotifications([]);
    }
  }, [isAuthenticated, user]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_SWAP_REQUEST':
        return '🤝';
      case 'SWAP_ACCEPTED':
        return '✅';
      case 'SWAP_REJECTED':
        return '❌';
      case 'SWAP_CANCELLED':
        return '🚫';
      default:
        return '📢';
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const value = {
    socket,
    notifications,
    clearNotifications,
    removeNotification,
    isConnected: socket?.connected || false,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 