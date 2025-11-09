import React from "react";
import {
  Home,
  Package,
  Plus,
  Search,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

interface SocialSidebarProps {
  onCreatePost: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SocialSidebar: React.FC<SocialSidebarProps> = ({ 
  onCreatePost, 
  searchTerm, 
  onSearchChange 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const sidebarItems: SidebarItem[] = [
    {
      id: "feed",
      label: "Feed",
      icon: <Home className="w-5 h-5" />,
      path: "/social",
    },
    {
      id: "lostfound",
      label: "Lost & Found",
      icon: <Package className="w-5 h-5" />,
      path: "/social/lostfound",
    },
  ];


  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      (path === "/social" && location.pathname === "/social")
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen sticky top-16 flex flex-col overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">GCET Social</h1>
            <p className="text-sm text-gray-600">Campus Community</p>
          </div>
        </div>

        {/* Create Post Button */}
        <button
          onClick={onCreatePost}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl font-semibold mb-4"
        >
          <Plus className="w-5 h-5" />
          <span>Create Post</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors
                ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              <span
                className={
                  isActive(item.path) ? "text-blue-600" : "text-gray-500"
                }
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Navigation - Dashboard Link */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors text-gray-700 hover:bg-gray-50"
        >
          <span className="text-gray-500">
            <Home className="w-5 h-5" />
          </span>
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* User Info */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 text-sm">{user?.name || "User"}</p>
            <p className="text-xs text-gray-600 capitalize">{user?.role || "Member"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialSidebar;
