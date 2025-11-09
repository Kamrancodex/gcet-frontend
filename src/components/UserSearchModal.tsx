import { useState, useEffect } from 'react';
import { Search, X, Circle } from 'lucide-react';
import { messagingAPI } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isOnline?: boolean;
}

interface UserSearchModalProps {
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export default function UserSearchModal({ onClose, onSelectUser }: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const { onlineUsers } = useSocket();

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const debounce = setTimeout(() => {
        searchUsers();
      }, 300);

      return () => clearTimeout(debounce);
    } else {
      setUsers([]);
      setSearchPerformed(false);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      const response = await messagingAPI.searchUsers(searchQuery);
      const usersData = response.data.map((user: User) => ({
        ...user,
        isOnline: onlineUsers.includes(user._id)
      }));
      setUsers(usersData);
      setSearchPerformed(true);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'teacher':
      case 'faculty':
        return 'bg-purple-100 text-purple-800';
      case 'principal':
        return 'bg-yellow-100 text-yellow-800';
      case 'library_admin':
        return 'bg-green-100 text-green-800';
      case 'student':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">New Message</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Search for students, teachers, or staff members to send a message
          </p>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : searchQuery.trim().length < 2 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Enter at least 2 characters to search</p>
            </div>
          ) : users.length === 0 && searchPerformed ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No users found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user._id}
                  onClick={() => onSelectUser(user)}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left group"
                >
                  <div className="flex items-center">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {user.isOnline && (
                        <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-current" />
                      )}
                    </div>
                    
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition">
                          {user.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {formatRole(user.role)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      
                      {user.isOnline && (
                        <p className="text-xs text-green-600 mt-1">Online</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {users.length > 0 && `${users.length} user${users.length !== 1 ? 's' : ''} found`}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}






