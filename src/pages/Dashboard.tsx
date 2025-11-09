import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Users } from "lucide-react";
import { admissionsAPI, libraryAPI } from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import DashboardWidgets from "../components/dashboard/DashboardWidgets";
import StudentProfileWidget from "../components/dashboard/StudentProfileWidget";
import type { Widget } from "../components/dashboard/DashboardWidgets";
import {
  QuickStatsWidget,
  RecentActivityWidget,
  CalendarWidget,
  PerformanceWidget,
  AdmissionControlWidget,
  QuickActionsWidget,
  SystemStatusWidget,
} from "../components/dashboard/widgets";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [admissionSettings, setAdmissionSettings] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [libraryStats, setLibraryStats] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Double-check localStorage before redirecting (helps with race conditions)
      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        console.log("⚠️ No auth data found, redirecting to login");
        navigate("/login");
      } else {
        console.log(
          "✅ Auth data found in localStorage, waiting for context to sync..."
        );
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user?.role === "admissions_admin" || user?.role === "admin") {
      loadAdminData();
    } else if (user?.role === "library_admin") {
      loadLibraryData();
    } else if (user?.role === "student") {
      loadStudentProfile();
    }
  }, [user]);

  const loadStudentProfile = async () => {
    try {
      setLoadingData(true);
      // Since we already have most student data in the user object from login
      // Just set it to state. If you have a separate profile endpoint, call it here.
      setStudentProfile(user);
    } catch (error) {
      console.error("Failed to load student profile:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const [settingsResponse, noticesResponse] = await Promise.all([
        admissionsAPI.getSettings(),
        admissionsAPI.getNotices(),
      ]);
      setAdmissionSettings(settingsResponse);
      setNotices(noticesResponse);
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadLibraryData = async () => {
    console.log("🔄 Loading library data for:", user?.email, user?.role);
    setLoadingData(true);
    try {
      console.log("📡 Making API call to /api/library/dashboard-stats");
      const libraryResponse = await libraryAPI.getDashboardStats();
      console.log("✅ Library Stats API Response:", libraryResponse);
      setLibraryStats(libraryResponse);
      console.log("📚 Library Stats State Updated:", libraryResponse);
    } catch (error) {
      console.error("❌ Failed to load library data:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      // Set fallback data structure for better error handling
      setLibraryStats({
        overview: {
          totalBooks: 0,
          availableBooks: 0,
          borrowedBooks: 0,
          overdueBooks: 0,
        },
        departments: [],
        fines: { total: 0, collected: 0, pending: 0 },
        noc: { pending: 0, approved: 0 },
        recentOverdue: [],
      });
    } finally {
      setLoadingData(false);
    }
  };

  const toggleAdmissions = async () => {
    if (!admissionSettings) return;

    try {
      const updated = await admissionsAPI.updateSettings({
        isOpen: !admissionSettings.isOpen,
        feeAmount: admissionSettings.feeAmount,
      });
      setAdmissionSettings(updated);
    } catch (error) {
      console.error("Failed to toggle admissions:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if user data is corrupted (missing role)
  if (!user.role) {
    console.error("❌ User data is corrupted (missing role). Logging out...");
    localStorage.clear();
    navigate("/login");
    return null;
  }

  // Define widgets based on user role
  const getWidgetsForRole = (role: string): Widget[] => {
    const commonWidgets: Widget[] = [
      {
        id: "quick-stats",
        title: "Quick Stats",
        component: QuickStatsWidget,
        size: "large",
        removable: false,
      },
      {
        id: "recent-activity",
        title: "Recent Activity",
        component: RecentActivityWidget,
        size: "medium",
        removable: true,
      },
      {
        id: "calendar",
        title: "Calendar",
        component: CalendarWidget,
        size: "medium",
        removable: true,
      },
      {
        id: "quick-actions",
        title: "Quick Actions",
        component: QuickActionsWidget,
        size: "medium",
        removable: true,
      },
    ];

    const roleSpecificWidgets: Record<string, Widget[]> = {
      admissions_admin: [
        {
          id: "admission-control",
          title: "Admission Control",
          component: AdmissionControlWidget,
          size: "medium",
          removable: false,
          data: {
            admissionSettings,
            onToggle: toggleAdmissions,
          },
        },
        {
          id: "system-status",
          title: "System Status",
          component: SystemStatusWidget,
          size: "medium",
          removable: true,
        },
      ],
      admin: [
        {
          id: "admission-control",
          title: "Admission Control",
          component: AdmissionControlWidget,
          size: "medium",
          removable: false,
          data: {
            admissionSettings,
            onToggle: toggleAdmissions,
          },
        },
        {
          id: "performance",
          title: "Performance Overview",
          component: PerformanceWidget,
          size: "medium",
          removable: true,
        },
        {
          id: "system-status",
          title: "System Status",
          component: SystemStatusWidget,
          size: "medium",
          removable: true,
        },
      ],
      teacher: [
        {
          id: "performance",
          title: "Class Performance",
          component: PerformanceWidget,
          size: "medium",
          removable: true,
        },
      ],
      student: [
        // Students get personalized profile widget
      ],
      library_admin: [
        {
          id: "library-overview",
          title: "Library Statistics",
          component: QuickStatsWidget,
          size: "large",
          removable: false,
          data: {
            libraryStats: libraryStats,
            isLibraryView: true,
          },
        },
        {
          id: "library-activity",
          title: "Recent Library Activity",
          component: RecentActivityWidget,
          size: "medium",
          removable: true,
          data: {
            libraryStats: libraryStats,
            isLibraryView: true,
          },
        },
        {
          id: "library-calendar",
          title: "Library Schedule",
          component: CalendarWidget,
          size: "medium",
          removable: true,
        },
        {
          id: "library-status",
          title: "System Status",
          component: SystemStatusWidget,
          size: "medium",
          removable: true,
        },
      ],
    };

    // Library admin gets ONLY library-specific widgets (no common widgets to avoid conflicts)
    if (role === "library_admin") {
      return roleSpecificWidgets[role] || [];
    }

    return [...commonWidgets, ...(roleSpecificWidgets[role] || [])];
  };

  const widgets = getWidgetsForRole(user?.role || "student");

  return (
    <DashboardLayout
      title={`${(user?.role || "student")
        .replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())} Dashboard`}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user?.name || 'User'}!
              </h2>
              <p className="text-blue-100">
                Here's what's happening with your {(user?.role || 'student').replace("_", " ")}{" "}
                account today.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State for Admin/Library Data */}
        {loadingData &&
          (user?.role === "admissions_admin" ||
            user?.role === "admin" ||
            user?.role === "library_admin") && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-600">
                  Loading{" "}
                  {user?.role === "library_admin" ? "library" : "dashboard"}{" "}
                  data...
                </span>
              </div>
            </div>
          )}

        {/* Student Profile Section */}
        {user?.role === "student" && (
          <StudentProfileWidget user={studentProfile || user} />
        )}

        {/* Dashboard Widgets */}
        <DashboardWidgets widgets={widgets} className="min-h-96" />

        {/* Additional Info for New Users */}
        {widgets.length === 0 && user?.role !== "student" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 text-2xl">👋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to your dashboard!
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Your personalized dashboard will show relevant information based
              on your role. Some features may take a moment to load.
            </p>
          </div>
        )}
      </div>

      {/* Floating Social Hub Button - Positioned above AI Chat */}
      <button
        onClick={() => navigate("/social")}
        className="fixed bottom-28 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 z-40 group"
        title="Open Social Hub"
      >
        <Users className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          GCET Social Hub
        </span>
      </button>
    </DashboardLayout>
  );
};

export default Dashboard;
