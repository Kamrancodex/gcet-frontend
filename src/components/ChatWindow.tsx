import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Circle, MoreVertical } from 'lucide-react';
import { messagingAPI } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Message {
  _id: string;
  conversation: string;
  sender: User;
  content: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: {
    content: string;
    sender: User;
    timestamp: string;
  };
  updatedAt: string;
}

interface ChatWindowProps {
  conversation: Conversation;
  onClose?: () => void;
}

export default function ChatWindow({ conversation, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const {
    sendMessage,
    joinConversation,
    leaveConversation,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    onNewMessage,
    offNewMessage,
    typingUsers,
    onlineUsers
  } = useSocket();

  const currentUserId = (user as any)?._id || (user as any)?.id;
  const otherParticipant = conversation.participants.find(p => p._id !== currentUserId);
  const isOnline = otherParticipant && onlineUsers.includes(otherParticipant._id);

  useEffect(() => {
    loadMessages();
    joinConversation(conversation._id);

    return () => {
      leaveConversation(conversation._id);
    };
  }, [conversation._id]);

  useEffect(() => {
    const handleNewMessage = (data: { message: Message; conversationId: string }) => {
      if (data.conversationId === conversation._id) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
        
        // Mark as read if not sent by current user
        const currentUserId = (user as any)?._id || (user as any)?.id;
        if (data.message.sender?._id && data.message.sender._id !== currentUserId) {
          markMessagesAsRead([data.message._id]);
        }
      }
    };

    onNewMessage(handleNewMessage);

    return () => {
      offNewMessage(handleNewMessage);
    };
  }, [conversation._id, onNewMessage, offNewMessage, user, markMessagesAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark unread messages as read
    const currentUserId = (user as any)?._id || (user as any)?.id;
    const unreadMessages = messages.filter(
      m => m.sender?._id && m.sender._id !== currentUserId && !m.readBy.includes(currentUserId || '')
    );
    
    if (unreadMessages.length > 0) {
      const unreadIds = unreadMessages.map(m => m._id);
      markMessagesAsRead(unreadIds);
    }
  }, [messages, user, markMessagesAsRead]);

  useEffect(() => {
    // Check if other user is typing
    const currentUserId = (user as any)?._id || (user as any)?.id;
    const typing = typingUsers.find(
      t => t.conversationId === conversation._id && t.userId !== currentUserId && t.isTyping
    );
    setIsTyping(!!typing);
  }, [typingUsers, conversation._id, user]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messagingAPI.getMessages(conversation._id);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);
    stopTyping(conversation._id);

    try {
      sendMessage(conversation._id, messageContent);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing indicator
    startTyping(conversation._id);

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversation._id);
    }, 2000);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const shouldShowDateDivider = (currentMessage: Message, previousMessage: Message | null) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();
    
    return currentDate !== previousDate;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {onClose && (
              <button
                onClick={onClose}
                className="mr-3 md:hidden text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {otherParticipant?.name.charAt(0).toUpperCase()}
              </div>
              {isOnline && (
                <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-current" />
              )}
            </div>
            
            <div className="ml-3">
              <h2 className="font-semibold text-gray-900">{otherParticipant?.name}</h2>
              <p className="text-sm text-gray-500">
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const currentUserId = (user as any)?._id || (user as any)?.id;
              const isOwnMessage = message.sender?._id === currentUserId;
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const showDateDivider = shouldShowDateDivider(message, previousMessage);

              return (
                <div key={message._id}>
                  {showDateDivider && (
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {formatMessageDate(message.createdAt)}
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <div className={`flex items-center mt-1 space-x-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(message.createdAt)}
                        </span>
                        {isOwnMessage && message.readBy.length > 1 && (
                          <span className="text-xs text-gray-500">• Read</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

