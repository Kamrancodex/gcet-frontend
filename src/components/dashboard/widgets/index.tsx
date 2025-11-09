import React from "react";
import {
  GraduationCap,
  BookOpen,
  Bell,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

// Quick Stats Widget
export const QuickStatsWidget: React.FC<{
  stats?: any;
  libraryStats?: any;
  isLibraryView?: boolean;
}> = ({ stats, libraryStats, isLibraryView = false }) => {
  const defaultStats = [
    { label: "Total Students", value: "1,234", icon: Users, color: "blue" },
    {
      label: "Active Applications",
      value: "45",
      icon: GraduationCap,
      color: "green",
    },
    {
      label: "Library Books",
      value: "15,678",
      icon: BookOpen,
      color: "purple",
    },
    { label: "Notices", value: "12", icon: Bell, color: "orange" },
  ];

  // Show library statistics for library admin
  const libraryStatsData = libraryStats
    ? [
        {
          label: "Total Books",
          value: libraryStats.overview?.totalBooks?.toLocaleString() || "0",
          icon: BookOpen,
          color: "blue",
        },
        {
          label: "Available Books",
          value: libraryStats.overview?.availableBooks?.toLocaleString() || "0",
          icon: CheckCircle,
          color: "green",
        },
        {
          label: "Overdue Books",
          value: libraryStats.overview?.overdueBooks?.toLocaleString() || "0",
          icon: AlertTriangle,
          color: "red",
        },
        {
          label: "Pending Fines",
          value: `₹${libraryStats.fines?.pending?.toLocaleString() || "0"}`,
          icon: DollarSign,
          color: "orange",
        },
      ]
    : null;

  const statsList =
    isLibraryView && libraryStatsData
      ? libraryStatsData
      : stats || defaultStats;

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {statsList.map((stat: any, index: number) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div
              className={`w-12 h-12 mx-auto mb-2 rounded-full bg-${stat.color}-100 flex items-center justify-center`}
            >
              <Icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
};

// Recent Activity Widget
export const RecentActivityWidget: React.FC<{
  activities?: any[];
  libraryStats?: any;
  isLibraryView?: boolean;
}> = ({ activities, libraryStats, isLibraryView = false }) => {
  const defaultActivities = [
    {
      id: 1,
      type: "admission",
      title: "New Application Submitted",
      description: "John Doe submitted admission application",
      time: "5 minutes ago",
      icon: GraduationCap,
      color: "blue",
    },
    {
      id: 2,
      type: "library",
      title: "Book Returned",
      description: "Advanced Mathematics returned by Jane Smith",
      time: "1 hour ago",
      icon: BookOpen,
      color: "green",
    },
    {
      id: 3,
      type: "notice",
      title: "New Notice Published",
      description: "Exam schedule for December 2024",
      time: "2 hours ago",
      icon: Bell,
      color: "purple",
    },
  ];

  // Generate library activity from overdue books data
  const libraryActivities = libraryStats?.recentOverdue
    ? libraryStats.recentOverdue
        .slice(0, 5)
        .map((overdue: any, index: number) => ({
          id: `overdue-${index}`,
          type: "library",
          title: "Overdue Book",
          description: `${overdue.bookTitle || "Unknown Book"} - ${
            overdue.studentName || "Student"
          }`,
          time: `${Math.floor(
            (new Date().getTime() - new Date(overdue.dueDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )} days overdue`,
          icon: AlertTriangle,
          color: "red",
        }))
    : [
        {
          id: "lib-1",
          type: "library",
          title: "No Recent Activity",
          description: "All books returned on time",
          time: "Current status",
          icon: CheckCircle,
          color: "green",
        },
      ];

  const activityList = isLibraryView
    ? libraryActivities
    : activities || defaultActivities;

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {activityList.map((activity) => {
        const Icon = activity.icon;
        return (
          <div key={activity.id} className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-full bg-${activity.color}-100 flex items-center justify-center flex-shrink-0`}
            >
              <Icon className={`w-4 h-4 text-${activity.color}-600`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">
                {activity.title}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Calendar Widget
export const CalendarWidget: React.FC<{ events?: any[] }> = ({ events }) => {
  const today = new Date();
  const defaultEvents = [
    {
      id: 1,
      title: "Admission Deadline",
      date: "Dec 15",
      type: "deadline",
      color: "red",
    },
    {
      id: 2,
      title: "Faculty Meeting",
      date: "Dec 18",
      type: "meeting",
      color: "blue",
    },
    {
      id: 3,
      title: "Exam Schedule",
      date: "Dec 20",
      type: "exam",
      color: "purple",
    },
  ];

  const eventList = events || defaultEvents;

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Upcoming Events</h4>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {eventList.map((event) => (
          <div key={event.id} className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full bg-${event.color}-500 flex-shrink-0`}
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">{event.title}</p>
              <p className="text-xs text-gray-500">{event.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Performance Chart Widget
export const PerformanceWidget: React.FC<{ data?: any }> = ({ data }) => {
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Performance</h4>
        <TrendingUp className="w-5 h-5 text-green-500" />
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Applications</span>
            <span className="text-gray-900">85%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: "85%" }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Library Usage</span>
            <span className="text-gray-900">72%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: "72%" }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Attendance</span>
            <span className="text-gray-900">91%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: "91%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Admission Control Widget (Admin only)
export const AdmissionControlWidget: React.FC<{
  admissionSettings?: any;
  onToggle?: () => void;
}> = ({ admissionSettings, onToggle }) => {
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Admission Control</h4>
        {admissionSettings?.isOpen ? (
          <ToggleRight className="w-6 h-6 text-green-600" />
        ) : (
          <ToggleLeft className="w-6 h-6 text-gray-400" />
        )}
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Admissions are currently</p>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              admissionSettings?.isOpen
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {admissionSettings?.isOpen ? "OPEN" : "CLOSED"}
          </span>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            ₹{admissionSettings?.feeAmount || 0}
          </p>
          <p className="text-sm text-gray-600">Admission Fee</p>
        </div>

        {onToggle && (
          <button
            onClick={onToggle}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              admissionSettings?.isOpen
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {admissionSettings?.isOpen ? "Close Admissions" : "Open Admissions"}
          </button>
        )}
      </div>
    </div>
  );
};

// Quick Actions Widget
export const QuickActionsWidget: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const actions = [
    {
      label: "Social Hub",
      icon: MessageSquare,
      color: "blue",
      path: "/social",
      roles: ["student", "faculty", "admin", "staff", "library_admin", "admissions_admin"],
    },
    {
      label: "Add Notice",
      icon: Bell,
      color: "purple",
      path: "/dashboard/notices",
      roles: ["admin", "library_admin", "admissions_admin"],
    },
    {
      label: "Library",
      icon: BookOpen,
      color: "green",
      path: "/dashboard/library",
      roles: ["student", "faculty", "admin", "staff", "library_admin"],
    },
    {
      label: "Registration",
      icon: GraduationCap,
      color: "orange",
      path: "/dashboard/registration",
      roles: ["student", "admin"],
    },
  ];

  // Filter actions based on user role
  const visibleActions = actions.filter((action) =>
    action.roles.includes(user?.role || "")
  );

  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {visibleActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-${action.color}-400 hover:bg-${action.color}-50 transition-all group cursor-pointer`}
          >
            <Icon
              className={`w-6 h-6 text-gray-400 group-hover:text-${action.color}-600 mb-2 transition-colors`}
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 text-center">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// System Status Widget
export const SystemStatusWidget: React.FC = () => {
  const services = [
    { name: "Database", status: "online", icon: CheckCircle, color: "green" },
    {
      name: "Email Service",
      status: "online",
      icon: CheckCircle,
      color: "green",
    },
    {
      name: "File Storage",
      status: "warning",
      icon: AlertTriangle,
      color: "yellow",
    },
    {
      name: "Payment Gateway",
      status: "online",
      icon: CheckCircle,
      color: "green",
    },
  ];

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">System Status</h4>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-600">All Systems Operational</span>
        </div>
      </div>
      <div className="space-y-3">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.name}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-gray-700">{service.name}</span>
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 text-${service.color}-500`} />
                <span
                  className={`text-xs capitalize text-${service.color}-600`}
                >
                  {service.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
