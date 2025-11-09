import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import NoticeModal from "../../components/dashboard/NoticeModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { noticesAPI } from "../../services/api";
import {
  Plus,
  Calendar,
  Users,
  Megaphone,
  GraduationCap,
  CreditCard,
  FileText,
  Settings,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  School,
} from "lucide-react";

type NoticeType =
  | "announcement"
  | "exam_form"
  | "fee_notice"
  | "academic"
  | "event"
  | "maintenance";
type Priority = "low" | "medium" | "high" | "urgent";

interface Notice {
  _id: string;
  noticeId?: string;
  title: string;
  content: string;
  type: NoticeType;
  priority: Priority;
  targetAudience: string;
  targetCourse?: string;
  targetSemester?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  publishedBy: string;
  publishedAt: string;
  attachments?: string[];
  links?: { title: string; url: string }[];
  readBy?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface NoticeFormData {
  title: string;
  content: string;
  type: NoticeType;
  priority: Priority;
  targetAudience: string;
  targetCourse?: string;
  targetSemester?: number;
  startDate: string;
  endDate: string;
  attachments: string[];
  links: { title: string; url: string }[];
}

const TypeIcon: Record<NoticeType, React.ElementType> = {
  announcement: Megaphone,
  exam_form: GraduationCap,
  fee_notice: CreditCard,
  academic: FileText,
  event: Calendar,
  maintenance: Settings,
};

const priorityBadge: Record<Priority, string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
};

const Notices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await noticesAPI.getAll();

      // Handle both array response and object with notices property
      const noticesData = Array.isArray(response)
        ? response
        : response.notices || [];
      setNotices(noticesData);
    } catch (err) {
      console.error("Failed to load notices:", err);
      setError("Failed to load notices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = () => {
    setEditingNotice(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSaveNotice = async (formData: NoticeFormData) => {
    try {
      if (modalMode === "create") {
        const newNotice = await noticesAPI.create(formData);
        setNotices((prev) => [newNotice, ...prev]);
      } else if (editingNotice) {
        const updatedNotice = await noticesAPI.update(
          editingNotice._id,
          formData
        );
        setNotices((prev) =>
          prev.map((n) => (n._id === editingNotice._id ? updatedNotice : n))
        );
      }
      setIsModalOpen(false);
      setEditingNotice(null);
    } catch (error) {
      console.error("Error saving notice:", error);
      throw error; // Let the modal handle the error
    }
  };

  const handleDeleteNotice = (notice: Notice) => {
    setNoticeToDelete(notice);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteNotice = async () => {
    if (!noticeToDelete) return;

    try {
      setActionLoading(noticeToDelete._id);
      await noticesAPI.delete(noticeToDelete._id);
      setNotices((prev) => prev.filter((n) => n._id !== noticeToDelete._id));
      setDeleteConfirmOpen(false);
      setNoticeToDelete(null);
    } catch (error) {
      console.error("Error deleting notice:", error);
      alert("Failed to delete notice. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const cancelDeleteNotice = () => {
    setDeleteConfirmOpen(false);
    setNoticeToDelete(null);
  };

  const handleToggleStatus = async (noticeId: string) => {
    try {
      setActionLoading(noticeId);
      const updatedNotice = await noticesAPI.toggleStatus(noticeId);
      setNotices((prev) =>
        prev.map((n) => (n._id === noticeId ? updatedNotice : n))
      );
    } catch (error) {
      console.error("Error toggling notice status:", error);
      alert("Failed to update notice status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportPDF = (notice: Notice) => {
    // Create a simple PDF-like content for download
    const content = `
GOVT COLLEGE OF ENGINEERING AND TECHNOLOGY SAFAPORA
OFFICIAL NOTICE

Title: ${notice.title}
Type: ${notice.type.toUpperCase()}
Priority: ${notice.priority.toUpperCase()}
Published: ${formatDate(notice.publishedAt)}
Valid Until: ${formatDate(notice.endDate)}

Content:
${notice.content}

${
  notice.links && notice.links.length > 0
    ? `
Additional Links:
${notice.links.map((link) => `• ${link.title}: ${link.url}`).join("\n")}
`
    : ""
}

---
Signed by: Principal, GCET Safapora
Published by: ${notice.publishedBy}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notice-${notice.title
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getAudienceDisplay = (notice: Notice) => {
    if (notice.targetAudience === "specific_course" && notice.targetCourse) {
      return notice.targetCourse;
    }
    if (
      notice.targetAudience === "specific_semester" &&
      notice.targetSemester
    ) {
      return `Semester ${notice.targetSemester}`;
    }
    return notice.targetAudience.replace("_", " ").toUpperCase();
  };

  return (
    <>
      <DashboardLayout title="Notices Management">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <School className="w-8 h-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    Govt College of Engineering and Technology Safapora
                  </h1>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  Notices Management
                </h2>
                <p className="text-gray-600">
                  Create, edit and manage college notices and announcements.
                </p>
              </div>
              <button
                onClick={handleCreateNotice}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Add New Notice
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading notices...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">
                  Error Loading Notices
                </h3>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadNotices}
                  className="mt-2 text-sm text-red-700 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && notices.length === 0 && (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notices found
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first notice.
              </p>
              <button
                onClick={handleCreateNotice}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Notice
              </button>
            </div>
          )}

          {/* Notices Grid */}
          {!loading && !error && notices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notices.map((notice) => {
                const IconComponent = TypeIcon[notice.type];
                const isExpired = new Date(notice.endDate) < new Date();

                return (
                  <div
                    key={notice._id}
                    className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-lg ${
                      !notice.isActive ? "opacity-60" : ""
                    } ${isExpired ? "border-red-200" : "border-gray-200"}`}
                  >
                    {/* Notice Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              notice.type === "exam_form"
                                ? "bg-blue-100 text-blue-600"
                                : notice.type === "fee_notice"
                                ? "bg-green-100 text-green-600"
                                : notice.type === "maintenance"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-purple-100 text-purple-600"
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(notice.isActive)}
                            {isExpired && (
                              <Clock className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${
                            priorityBadge[notice.priority]
                          }`}
                        >
                          {notice.priority.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {notice.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {notice.content}
                      </p>

                      {/* Links */}
                      {notice.links && notice.links.length > 0 && (
                        <div className="mb-4">
                          {notice.links.slice(0, 2).map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mr-3 mb-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {link.title}
                            </a>
                          ))}
                          {notice.links.length > 2 && (
                            <span className="text-gray-500 text-sm">
                              +{notice.links.length - 2} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Meta Information */}
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDate(notice.startDate)} -{" "}
                            {formatDate(notice.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          <span>{getAudienceDisplay(notice)}</span>
                        </div>
                        <div className="text-gray-400">
                          By {notice.publishedBy}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditNotice(notice)}
                            disabled={actionLoading === notice._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>

                          <button
                            onClick={() => handleToggleStatus(notice._id)}
                            disabled={actionLoading === notice._id}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-50 ${
                              notice.isActive
                                ? "text-orange-600 hover:bg-orange-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {notice.isActive ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                            {notice.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleExportPDF(notice)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Export
                          </button>

                          <button
                            onClick={() => handleDeleteNotice(notice)}
                            disabled={actionLoading === notice._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Notice Modal */}
      <NoticeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNotice(null);
        }}
        onSave={handleSaveNotice}
        notice={editingNotice as any}
        mode={modalMode}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={cancelDeleteNotice}
        onConfirm={confirmDeleteNotice}
        title="Delete Notice"
        message={`Are you sure you want to delete "${noticeToDelete?.title}"? This action cannot be undone and the notice will be permanently removed from the system.`}
        confirmText="Delete Notice"
        cancelText="Keep Notice"
        type="danger"
        loading={actionLoading === noticeToDelete?._id}
      />
    </>
  );
};

export default Notices;
