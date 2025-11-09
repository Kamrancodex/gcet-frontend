import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  Settings,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Home,
  Megaphone,
  BookPlus,
  UserCheck,
  Receipt,
  Clock,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  roles?: string[];
  badge?: string;
  color?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  collapsed,
  onToggle,
  isMobile,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const sidebarItems: SidebarItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      path: "/dashboard",
      color: "blue",
    },
    {
      id: "registration",
      label: "Registration",
      icon: GraduationCap,
      path: "/dashboard/registration",
      roles: ["admin", "admissions_admin"], // Only for admissions staff and admin
      color: "blue",
    },
    {
      id: "library",
      label: "Library",
      icon: BookOpen,
      path: "/dashboard/library",
      roles: ["student", "teacher"], // Only for students and teachers (general library access)
      color: "green",
    },
    {
      id: "books",
      label: "Manage Books",
      icon: BookPlus,
      path: "/dashboard/library/books",
      roles: ["library_admin"],
      color: "green",
    },
    {
      id: "outstanding-books",
      label: "Outstanding Books",
      icon: Clock,
      path: "/dashboard/library/outstanding",
      roles: ["library_admin"],
      color: "yellow",
    },
    {
      id: "library-students",
      label: "Student Records",
      icon: UserCheck,
      path: "/dashboard/library/students",
      roles: ["library_admin"],
      color: "green",
    },
    {
      id: "library-noc",
      label: "NOC Management",
      icon: Receipt,
      path: "/dashboard/library/noc",
      roles: ["library_admin"],
      color: "green",
    },
    {
      id: "notices",
      label: "Notices",
      icon: Megaphone,
      path: "/dashboard/notices",
      roles: ["admin", "admissions_admin"],
      color: "purple",
    },
    {
      id: "students",
      label: "Students",
      icon: Users,
      path: "/dashboard/students",
      roles: ["teacher", "admin", "admissions_admin"],
      color: "orange",
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      path: "/dashboard/reports",
      roles: ["admin", "admissions_admin", "teacher"],
      color: "gray",
    },
    {
      id: "finances",
      label: "Finances",
      icon: DollarSign,
      path: "/dashboard/finances",
      roles: ["admin", "admissions_admin"],
      color: "yellow",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
      color: "gray",
    },
  ];

  const filteredItems = sidebarItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || "");
  });

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive
        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
        : "text-gray-600 hover:bg-blue-50 hover:text-blue-700",
      green: isActive
        ? "bg-green-50 text-green-700 border-r-2 border-green-700"
        : "text-gray-600 hover:bg-green-50 hover:text-green-700",
      purple: isActive
        ? "bg-purple-50 text-purple-700 border-r-2 border-purple-700"
        : "text-gray-600 hover:bg-purple-50 hover:text-purple-700",
      orange: isActive
        ? "bg-orange-50 text-orange-700 border-r-2 border-orange-700"
        : "text-gray-600 hover:bg-orange-50 hover:text-orange-700",
      indigo: isActive
        ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700"
        : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700",
      pink: isActive
        ? "bg-pink-50 text-pink-700 border-r-2 border-pink-700"
        : "text-gray-600 hover:bg-pink-50 hover:text-pink-700",
      emerald: isActive
        ? "bg-emerald-50 text-emerald-700 border-r-2 border-emerald-700"
        : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700",
      yellow: isActive
        ? "bg-yellow-50 text-yellow-700 border-r-2 border-yellow-700"
        : "text-gray-600 hover:bg-yellow-50 hover:text-yellow-700",
      gray: isActive
        ? "bg-gray-50 text-gray-700 border-r-2 border-gray-700"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-700",
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">GCET Portal</h2>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
            </div>
          )}

          {!isMobile && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {/* Back to Home */}
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-700`}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || isMobile) && (
            <span className="font-medium">Back to Home</span>
          )}
        </Link>

        <div className="h-px bg-gray-200 my-2" />

        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative ${getColorClasses(
                item.color || "gray",
                isActive
              )}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || isMobile) && (
                <>
                  <span className="font-medium flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {collapsed && !isMobile && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded shadow-lg whitespace-nowrap z-50"
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      {(!collapsed || isMobile) && user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSidebar;
