import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  content: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

interface TypingUser {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  onlineUsers: string[];
  typingUsers: TypingUser[];
  sendMessage: (conversationId: string, content: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  markMessagesAsRead: (messageIds: string[]) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  onNewMessage: (callback: (data: { message: Message; conversationId: string }) => void) => void;
  offNewMessage: (callback: (data: { message: Message; conversationId: string }) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    newSocket.on('user:online', (data: { userId: string }) => {
      setOnlineUsers(prev => [...new Set([...prev, data.userId])]);
    });

    newSocket.on('user:offline', (data: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    });

    newSocket.on('typing:user', (data: TypingUser) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(
          t => !(t.userId === data.userId && t.conversationId === data.conversationId)
        );
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (socket && connected) {
      socket.emit('message:send', { conversationId, content });
    }
  }, [socket, connected]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socket && connected) {
      socket.emit('conversation:join', { conversationId });
    }
  }, [socket, connected]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socket && connected) {
      socket.emit('conversation:leave', { conversationId });
    }
  }, [socket, connected]);

  const markMessagesAsRead = useCallback((messageIds: string[]) => {
    if (socket && connected) {
      socket.emit('message:read', { messageIds });
    }
  }, [socket, connected]);

  const startTyping = useCallback((conversationId: string) => {
    if (socket && connected) {
      socket.emit('typing:start', { conversationId });
    }
  }, [socket, connected]);

  const stopTyping = useCallback((conversationId: string) => {
    if (socket && connected) {
      socket.emit('typing:stop', { conversationId });
    }
  }, [socket, connected]);

  const onNewMessage = useCallback((callback: (data: { message: Message; conversationId: string }) => void) => {
    if (socket) {
      socket.on('message:new', callback);
    }
  }, [socket]);

  const offNewMessage = useCallback((callback: (data: { message: Message; conversationId: string }) => void) => {
    if (socket) {
      socket.off('message:new', callback);
    }
  }, [socket]);

  const value: SocketContextType = {
    socket,
    connected,
    onlineUsers,
    typingUsers,
    sendMessage,
    joinConversation,
    leaveConversation,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    onNewMessage,
    offNewMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

