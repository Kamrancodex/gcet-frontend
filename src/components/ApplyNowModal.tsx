import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  GraduationCap,
  Calendar,
  Bell,
  BookOpen,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  DollarSign,
} from "lucide-react";
import { noticesAPI, registrationAPI } from "../services/api";

interface Application {
  id: string;
  title: string;
  description: string;
  type: "registration" | "admission" | "exam_form" | "fee_notice" | "academic";
  deadline: string;
  link: string;
  isActive?: boolean;
  isNew?: boolean;
  feeAmount?: number;
  priority?: "urgent" | "high" | "medium" | "low";
}

interface ApplyNowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApplyNowModal: React.FC<ApplyNowModalProps> = ({ isOpen, onClose }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      console.log("🔍 Loading applications and notices...");

      // Fetch active registration sessions and relevant notices in parallel
      const [registrationSessions, publicNotices] = await Promise.all([
        registrationAPI.getSessions({ isActive: true }).catch((e) => {
          console.log("Registration API not available:", e);
          return [];
        }),
        noticesAPI
          .getPublic({
            limit: 10,
            type: undefined, // Get all types
            audience: "students",
          })
          .catch((e) => {
            console.log("Notices API not available:", e);
            return [];
          }),
      ]);

      console.log("✅ Raw data loaded:", {
        registrationSessions,
        publicNotices,
      });

      const apps: Application[] = [];

      // Add active semester registrations
      if (registrationSessions && Array.isArray(registrationSessions)) {
        registrationSessions.forEach((session: any) => {
          if (session.isActive) {
            const deadline = new Date(session.feeDeadline || session.endDate);
            const isDeadlineSoon =
              deadline.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // Within 7 days

            apps.push({
              id: `reg-${session._id}`,
              title: `Semester ${session.semester} Registration`,
              description: `Course registration for ${session.academicYear} academic year. Select your courses and complete fee payment.`,
              type: "registration",
              deadline: deadline.toLocaleDateString(),
              link: `/registration/apply/${session._id}`,
              feeAmount: session.feeAmount,
              isActive: true,
              isNew: true,
              priority: isDeadlineSoon ? "urgent" : "high",
            });
          }
        });
      }

      // Process notices into actionable applications
      if (publicNotices && Array.isArray(publicNotices)) {
        publicNotices.forEach((notice: any) => {
          // Only include notices that are actionable (exam forms, fee notices, etc.)
          if (["exam_form", "fee_notice", "academic"].includes(notice.type)) {
            const deadline = new Date(notice.endDate);
            const isActive = deadline > new Date();

            if (isActive) {
              apps.push({
                id: `notice-${notice._id}`,
                title: notice.title,
                description: notice.content,
                type: notice.type,
                deadline: deadline.toLocaleDateString(),
                link: `/login?redirect=dashboard/notices`,
                isActive: true,
                priority: notice.priority || "medium",
                isNew:
                  new Date(notice.publishedAt) >
                  new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Published within 3 days
              });
            }
          }
        });
      }

      // Add admission applications (if in admission period)
      const currentMonth = new Date().getMonth(); // 0-based
      const isAdmissionPeriod = currentMonth >= 10 || currentMonth <= 2; // Nov-Feb

      if (isAdmissionPeriod) {
        apps.push({
          id: "admission-2025",
          title: "New Admissions 2025",
          description:
            "Applications open for undergraduate programs. Submit your application with required documents and pay application fee.",
          type: "admission",
          deadline: "March 15, 2025",
          link: "/login?redirect=dashboard",
          isActive: true,
          isNew: false,
          priority: "high",
        });
      }

      // Sort by priority and deadline
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      apps.sort((a, b) => {
        const aPriority =
          priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
        const bPriority =
          priorityOrder[b.priority as keyof typeof priorityOrder] || 2;

        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }

        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime(); // Earlier deadline first
      });

      console.log("📋 Processed applications:", apps);
      setApplications(apps);
    } catch (error) {
      console.error("❌ Failed to load applications:", error);
      // Fallback to minimal applications
      setApplications([
        {
          id: "fallback",
          title: "Student Portal Login",
          description:
            "Access your dashboard to check for available registrations, exam forms, and notices.",
          type: "academic",
          deadline: "Always Available",
          link: "/login",
          isActive: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getApplicationIcon = (type: Application["type"]) => {
    switch (type) {
      case "registration":
        return <GraduationCap className="w-5 h-5" />;
      case "admission":
        return <BookOpen className="w-5 h-5" />;
      case "exam_form":
        return <Calendar className="w-5 h-5" />;
      case "fee_notice":
        return <DollarSign className="w-5 h-5" />;
      case "academic":
        return <FileText className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getApplicationColors = (priority?: Application["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-50 text-red-700 border-red-200";
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "medium":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "low":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-green-50 text-green-700 border-green-200";
    }
  };

  const handleApplicationClick = (link: string) => {
    onClose(); // Close modal before navigation
    window.location.href = link;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Available Applications
                    </h2>
                    <p className="text-sm text-gray-600">
                      Current registrations, forms, and applications you can
                      apply for
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-96 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-gray-600">
                      Loading available applications...
                    </span>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Applications Currently Available
                    </h3>
                    <p className="text-sm text-gray-600">
                      Check back later for new registrations, exam forms, and
                      other applications.
                    </p>
                    <button
                      onClick={() =>
                        handleApplicationClick("/login?redirect=dashboard")
                      }
                      className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer ${getApplicationColors(
                          app.priority
                        )}`}
                        onClick={() => handleApplicationClick(app.link)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0 mt-0.5">
                              {getApplicationIcon(app.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <h3 className="font-medium text-gray-900">
                                  {app.title}
                                </h3>
                                {app.isNew && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    New
                                  </span>
                                )}
                                {app.priority === "urgent" && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Urgent
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                {app.description}
                              </p>
                              <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <span className="text-xs text-gray-500">
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    Deadline: {app.deadline}
                                  </span>
                                  {app.feeAmount && (
                                    <span className="text-xs text-gray-500">
                                      <DollarSign className="w-3 h-3 inline mr-1" />
                                      Fee: ₹{app.feeAmount.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center text-xs text-blue-600">
                                  <span>Apply Now</span>
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Need help with applications? Contact the administration
                    office
                  </div>
                  <button
                    onClick={() =>
                      handleApplicationClick("/login?redirect=dashboard")
                    }
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Go to Dashboard →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplyNowModal;
