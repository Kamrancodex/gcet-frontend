import { useState, useEffect } from 'react';
import { MessageCircle, Search, Plus, X, Trash2, Circle } from 'lucide-react';
import { messagingAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import ChatWindow from '../../components/ChatWindow';
import UserSearchModal from '../../components/UserSearchModal';
import SocialSidebar from '../../components/social/SocialSidebar';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface LastMessage {
  content: string;
  sender: User;
  timestamp: string;
}

interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: LastMessage;
  updatedAt: string;
  unreadCount?: number;
}

export default function Messaging() {
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const { user } = useAuth();
  const { onNewMessage, offNewMessage, onlineUsers } = useSocket();

  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-select conversation if passed from another page (e.g., Lost & Found)
  useEffect(() => {
    const state = location.state as { conversationId?: string };
    if (state?.conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c._id === state.conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [location.state, conversations]);

  useEffect(() => {
    const handleNewMessage = (data: any) => {
      // Update conversation list
      loadConversations();
      
      // If message is from current conversation, don't show notification
      if (selectedConversation?._id === data.conversationId) {
        return;
      }
      
      // Show notification for new message
      const sender = data.message.sender;
      const currentUserId = (user as any)?._id || (user as any)?.id;
      if (sender._id !== currentUserId) {
        toast.info(`New message from ${sender.name}`);
      }
    };

    onNewMessage(handleNewMessage);

    return () => {
      offNewMessage(handleNewMessage);
    };
  }, [onNewMessage, offNewMessage, selectedConversation, user]);

  const loadConversations = async () => {
    try {
      const response = await messagingAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await messagingAPI.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c._id !== conversationId));
      
      if (selectedConversation?._id === conversationId) {
        setSelectedConversation(null);
      }
      
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const handleUserSelect = async (selectedUser: User) => {
    try {
      const response = await messagingAPI.createConversation(selectedUser._id);
      const conversation = response.data;
      
      // Check if conversation already exists in list
      const existingIndex = conversations.findIndex(c => c._id === conversation._id);
      
      if (existingIndex === -1) {
        setConversations(prev => [conversation, ...prev]);
      }
      
      setSelectedConversation(conversation);
      setShowUserSearch(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  const getOtherParticipant = (conversation: Conversation): User | undefined => {
    // User from AuthContext has 'id', participants have '_id'
    const currentUserId = (user as any)?._id || (user as any)?.id;
    return conversation.participants.find(p => p._id !== currentUserId);
  };

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.includes(userId);
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherParticipant(conv);
    if (!otherUser) return false;
    
    const query = searchQuery.toLowerCase();
    return (
      otherUser.name.toLowerCase().includes(query) ||
      otherUser.email.toLowerCase().includes(query) ||
      conv.lastMessage?.content.toLowerCase().includes(query)
    );
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex pt-16">
      {/* Social Sidebar */}
      <SocialSidebar 
        onCreatePost={() => {}}
        searchTerm=""
        onSearchChange={() => {}}
      />
      
      {/* Conversations List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2" />
              Messages
            </h1>
            <button
              onClick={() => setShowUserSearch(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              title="New conversation"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-center">
                {searchQuery
                  ? 'No conversations found'
                  : 'No conversations yet. Start a new one!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation) => {
                const otherUser = getOtherParticipant(conversation);
                if (!otherUser) return null;
                
                const isOnline = isUserOnline(otherUser._id);
                const isSelected = selectedConversation?._id === conversation._id;
                
                return (
                  <div
                    key={conversation._id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                      isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center flex-1 min-w-0 mr-2">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {otherUser.name.charAt(0).toUpperCase()}
                          </div>
                          {isOnline && (
                            <Circle
                              className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-current"
                            />
                          )}
                        </div>
                        
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {otherUser.name}
                            </h3>
                            {conversation.lastMessage && (
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                {formatTimestamp(conversation.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-500 capitalize">
                            {otherUser.role.replace('_', ' ')}
                          </p>
                          
                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {conversation.lastMessage.sender?._id === ((user as any)?._id || (user as any)?.id) && 'You: '}
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDeleteConversation(conversation._id, e)}
                          className="text-gray-400 hover:text-red-600 transition"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onClose={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-24 h-24 mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
            <p>Choose a conversation from the list to start messaging</p>
          </div>
        )}
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <UserSearchModal
          onClose={() => setShowUserSearch(false)}
          onSelectUser={handleUserSelect}
        />
      )}
    </div>
  );
}

