import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Megaphone,
  GraduationCap,
  CreditCard,
  FileText,
  Calendar,
  Settings,
  Clock,
  AlertCircle,
} from "lucide-react";
import { noticesAPI } from "../services/api";
import NoticeViewModal from "./NoticeViewModal";

interface PublicNoticesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notice {
  _id: string;
  title: string;
  content: string;
  type: "announcement" | "exam_form" | "fee_notice" | "academic" | "event" | "maintenance";
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
  signedBy?: string;
}

const NoticeTypeIcons: Record<Notice["type"], React.ElementType> = {
  announcement: Megaphone,
  exam_form: GraduationCap,
  fee_notice: CreditCard,
  academic: FileText,
  event: Calendar,
  maintenance: Settings,
};

const PriorityColors: Record<Notice["priority"], string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
};

const PublicNoticesModal: React.FC<PublicNoticesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotices();
    }
  }, [isOpen]);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const response = await noticesAPI.getPublic({ limit: 20 });
      setNotices(response || []);
    } catch (error) {
      console.error("Failed to load notices:", error);
      // Fallback mock data
      setNotices([
        {
          _id: "1",
          title: "Semester 3 Exam Forms Available - Submit by August 31st",
          content:
            "Exam forms for Semester 3 students are now available. Please submit your forms by the end of this month along with the required fee. Late submissions will not be accepted and may result in academic delays.",
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
            {
              title: "Download Exam Form",
              url: "https://gcet.edu/forms/exam-form.pdf",
            },
            {
              title: "Fee Payment Guidelines",
              url: "https://gcet.edu/fees/guidelines",
            },
          ],
        },
        {
          _id: "2",
          title: "Library Maintenance Notice - Closed on August 15th",
          content:
            "The library will be closed for maintenance and system upgrades on August 15th, 2024. We apologize for any inconvenience caused.",
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
          content:
            "Due to technical issues with the payment portal, the deadline for semester fee payment has been extended to September 15th, 2024. Students are advised to complete their payments before the new deadline to avoid late fees.",
          type: "fee_notice",
          priority: "urgent",
          targetAudience: "students",
          startDate: "2024-08-01T00:00:00Z",
          endDate: "2024-09-15T23:59:59Z",
          isActive: true,
          publishedBy: "Accounts Department",
          publishedAt: "2024-08-05T11:00:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getExcerpt = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-8 h-8" />
                    <div>
                      <h2 className="text-2xl font-bold">College Notices</h2>
                      <p className="text-blue-100 text-sm">
                        Latest announcements and updates
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading notices...</p>
                  </div>
                ) : notices.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      No notices available at the moment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notices.map((notice) => {
                      const IconComponent = NoticeTypeIcons[notice.type];
                      return (
                        <button
                          key={notice._id}
                          onClick={() => handleNoticeClick(notice)}
                          className="w-full text-left bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 overflow-hidden group"
                        >
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="bg-blue-100 rounded-lg p-2 group-hover:bg-blue-200 transition-colors">
                                  <IconComponent className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                    {notice.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {getExcerpt(notice.content)}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full border ${
                                  PriorityColors[notice.priority]
                                }`}
                              >
                                {notice.priority.toUpperCase()}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(notice.publishedAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {notice.type.replace("_", " ").toUpperCase()}
                              </div>
                              {notice.targetSemester && (
                                <div className="flex items-center gap-1">
                                  <GraduationCap className="w-3 h-3" />
                                  Semester {notice.targetSemester}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                            <span className="text-sm text-blue-600 font-medium">
                              Click to view full notice →
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <p className="text-center text-sm text-gray-600">
                  For more information, contact the college administration
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notice View Modal */}
      <NoticeViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedNotice(null);
        }}
        notice={selectedNotice}
      />
    </>
  );
};

export default PublicNoticesModal;








