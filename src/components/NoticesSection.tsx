import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell, Calendar, Users, ChevronRight, Megaphone, GraduationCap, CreditCard,
  FileText, Settings, AlertCircle, School, ExternalLink, Clock, ClipboardList,
} from "lucide-react";
import { noticesAPI, registrationAPI } from "../services/api";
import NoticeViewModal from "./NoticeViewModal";

interface Notice {
  _id: string;
  title: string;
  content: string;
  type: "announcement" | "exam_form" | "fee_notice" | "academic" | "event" | "maintenance" | "registration";
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience: string;
  targetCourse?: string;
  targetSemester?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  publishedBy: string;
  publishedAt: string;
  links?: { title: string; url: string }[];
}

interface RegistrationSession {
  _id: string;
  semester: number;
  academicYear: string;
  startDate: string;
  endDate: string;
  feeAmount: number;
  feeDeadline: string;
  availableCourses: string[];
  libraryRequirement: boolean;
  isActive: boolean;
}

const NoticeTypeIcons = {
  announcement: Megaphone,
  exam_form: GraduationCap,
  fee_notice: CreditCard,
  academic: FileText,
  event: Calendar,
  maintenance: Settings,
  registration: ClipboardList,
};

const PriorityColors = {
  low: "text-green-600",
  medium: "text-yellow-600", 
  high: "text-orange-600",
  urgent: "text-red-600",
};

const NoticesSection = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      
      // Fetch both notices and registration sessions
      const [noticesResponse, registrationSessions] = await Promise.all([
        noticesAPI.getPublic({ limit: 10 }),
        registrationAPI.getSessions({ isActive: true }).catch(() => []),
      ]);

      // Convert registration sessions to notice format
      const registrationNotices: Notice[] = (registrationSessions || []).map((session: RegistrationSession) => ({
        _id: `reg-${session._id}`,
        title: `Semester ${session.semester} Registration Open - ${session.academicYear}`,
        content: `Registration for Semester ${session.semester} (${session.academicYear}) is now open. Fee: ₹${session.feeAmount}. Fee deadline: ${new Date(session.feeDeadline).toLocaleDateString()}. ${session.libraryRequirement ? "Library clearance required." : ""}`,
        type: "registration" as const,
        priority: "high" as const,
        targetAudience: "specific_semester",
        targetSemester: session.semester,
        startDate: session.startDate,
        endDate: session.endDate,
        isActive: session.isActive,
        publishedBy: "Admissions Admin",
        publishedAt: session.startDate,
        links: [
          {
            title: "Apply for Registration",
            url: `/registration/apply/${session._id}`,
          },
        ],
      }));

      // Combine and sort by date
      const allItems = [...(noticesResponse || []), ...registrationNotices].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      setNotices(allItems);
    } catch (error) {
      console.error("Failed to load notices:", error);
      // Fallback mock data
      setNotices([
        {
          _id: "1",
          title: "Semester 3 Exam Forms Available - Submit by August 31st",
          content: "Exam forms for Semester 3 students are now available. Please submit your forms by the end of this month along with the required fee. Late submissions will not be accepted and may result in academic delays.",
          type: "exam_form",
          priority: "high",
          targetAudience: "specific_semester",
          targetSemester: 3,
          startDate: "2024-08-01T00:00:00Z",
          endDate: "2024-08-31T23:59:59Z",
          isActive: true,
          publishedBy: "Admissions Admin",
          publishedAt: "2024-08-01T10:00:00Z",
          links: [
            { title: "Download Exam Form", url: "https://gcet.edu/forms/exam-form.pdf" },
            { title: "Fee Payment Guidelines", url: "https://gcet.edu/fees/guidelines" }
          ]
        },
        {
          _id: "2", 
          title: "Library Maintenance Notice - Closed on August 15th",
          content: "The library will be closed for maintenance and system upgrades on August 15th, 2024. We apologize for any inconvenience caused.",
          type: "maintenance",
          priority: "medium",
          targetAudience: "all",
          startDate: "2024-08-10T00:00:00Z",
          endDate: "2024-08-20T23:59:59Z",
          isActive: true,
          publishedBy: "Library Admin",
          publishedAt: "2024-08-10T09:00:00Z",
        },
        {
          _id: "3",
          title: "Fee Payment Deadline Extended to September 15th",
          content: "Due to technical issues with the payment portal, the deadline for semester fee payment has been extended to September 15th, 2024. Students are advised to complete their payments before the new deadline to avoid late fees.",
          type: "fee_notice", 
          priority: "urgent",
          targetAudience: "students",
          startDate: "2024-08-01T00:00:00Z",
          endDate: "2024-09-15T23:59:59Z",
          isActive: true,
          publishedBy: "Admissions Admin",
          publishedAt: "2024-08-01T12:00:00Z",
          links: [
            { title: "Payment Portal", url: "https://gcet.edu/payments" },
            { title: "Fee Structure", url: "https://gcet.edu/fees/structure" }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeClick = (notice: Notice) => {
    // If it's a registration notice with a link, navigate to the form
    if (notice.type === "registration" && notice.links && notice.links[0]) {
      window.location.href = notice.links[0].url;
      return;
    }
    
    setSelectedNotice(notice);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getNoticeIcon = (type: Notice["type"]) => {
    const IconComponent = NoticeTypeIcons[type];
    return <IconComponent className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading latest notices...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <School className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                Latest Notices & Announcements
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Stay updated with notices, registrations, and important college notifications - Click to view details
            </p>
          </div>

          {notices.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active notices</h3>
              <p className="text-gray-600">Check back later for updates and announcements.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Auto-scrolling Ticker */}
              <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5" />
                    <span className="font-semibold">IMPORTANT NOTICES</span>
                    <div className="flex-1 border-t border-blue-300"></div>
                    <span className="text-blue-200 text-sm">Click to view details</span>
                  </div>
                </div>
                
                <div className="relative h-80 overflow-hidden">
                  <motion.div
                    className="flex flex-col absolute"
                    animate={{
                      y: notices.length > 1 ? [0, -80 * notices.length] : 0,
                    }}
                    transition={{
                      duration: notices.length * 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    {/* Duplicate notices for seamless loop */}
                    {[...notices, ...notices].map((notice, index) => (
                      <motion.div
                        key={`${notice._id}-${index}`}
                        className="h-20 flex items-center px-6 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                        onClick={() => handleNoticeClick(notice)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center gap-4 w-full">
                          {/* Notice Icon & Priority */}
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${
                              notice.type === "registration" ? "bg-indigo-100 text-indigo-600" :
                              notice.type === "exam_form" ? "bg-blue-100 text-blue-600" :
                              notice.type === "fee_notice" ? "bg-green-100 text-green-600" :
                              notice.type === "maintenance" ? "bg-orange-100 text-orange-600" :
                              "bg-purple-100 text-purple-600"
                            }`}>
                              {getNoticeIcon(notice.type)}
                            </div>
                            <div className={`w-2 h-2 rounded-full ${
                              notice.priority === "urgent" ? "bg-red-500" :
                              notice.priority === "high" ? "bg-orange-500" :
                              notice.priority === "medium" ? "bg-yellow-500" :
                              "bg-green-500"
                            }`}></div>
                          </div>

                          {/* Notice Title */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {notice.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(notice.publishedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Valid until {formatDate(notice.endDate)}
                              </span>
                            </div>
                          </div>

                          {/* Action Indicator */}
                          <div className="flex items-center gap-2 text-blue-600">
                            <span className="text-sm font-medium">
                              {notice.type === "registration" ? "Apply Now" : "View Details"}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{notices.length}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {notices.filter(n => n.priority === "urgent" || n.priority === "high").length}
                  </div>
                  <div className="text-sm text-gray-600">High Priority</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-indigo-200 p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {notices.filter(n => n.type === "registration").length}
                  </div>
                  <div className="text-sm text-gray-600">Open Registrations</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {notices.filter(n => n.type === "exam_form").length}
                  </div>
                  <div className="text-sm text-gray-600">Exam Related</div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="inline-block bg-white rounded-lg shadow-sm border border-blue-200 px-6 py-3">
              <p className="text-sm text-gray-600 font-medium">
                — Govt College of Engineering and Technology Safapora —
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Notice View Modal */}
      <NoticeViewModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotice(null);
        }}
        notice={selectedNotice}
      />
    </>
  );
};

export default NoticesSection;