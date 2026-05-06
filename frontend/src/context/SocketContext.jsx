import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setSocket((currentSocket) => {
        if (currentSocket) {
          currentSocket.disconnect();
        }

        return null;
      });
      setStatus('disconnected');
      return undefined;
    }

    const nextSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    setSocket(nextSocket);
    setStatus('connecting');

    nextSocket.on('connect', () => {
      setStatus('connected');
    });

    nextSocket.on('connect_error', (error) => {
      console.warn('Socket connection failed:', error.message);
      setStatus('error');
    });

    nextSocket.on('disconnect', () => {
      setStatus('disconnected');
    });

    return () => {
      nextSocket.disconnect();
      setSocket(null);
      setStatus('disconnected');
    };
  }, [isAuthenticated, token]);

  const value = useMemo(() => ({
    socket,
    status,
    isConnected: status === 'connected',
  }), [socket, status]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }

  return context;
}
