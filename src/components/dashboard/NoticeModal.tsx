import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Link as LinkIcon,
  Plus,
  Trash2,
  Calendar,
  Users,
  AlertCircle,
  FileText,
} from "lucide-react";

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notice: NoticeFormData) => Promise<void>;
  notice?: Notice | null;
  mode: "create" | "edit";
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
  signedBy: string;
}

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
  attachments: string[];
  links?: { title: string; url: string }[];
  signedBy?: string;
}

const NoticeModal: React.FC<NoticeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  notice,
  mode,
}) => {
  const [formData, setFormData] = useState<NoticeFormData>({
    title: "",
    content: "",
    type: "announcement",
    priority: "medium",
    targetAudience: "all",
    targetCourse: "",
    targetSemester: undefined,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    attachments: [],
    links: [],
    signedBy: "Principal, GCET Safapora",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (notice && mode === "edit") {
      setFormData({
        title: notice.title,
        content: notice.content,
        type: notice.type,
        priority: notice.priority,
        targetAudience: notice.targetAudience,
        targetCourse: notice.targetCourse || "",
        targetSemester: notice.targetSemester,
        startDate: notice.startDate.split("T")[0],
        endDate: notice.endDate.split("T")[0],
        attachments: notice.attachments || [],
        links: notice.links || [],
        signedBy: notice.signedBy || "Principal, GCET Safapora",
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: "",
        content: "",
        type: "announcement",
        priority: "medium",
        targetAudience: "all",
        targetCourse: "",
        targetSemester: undefined,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        attachments: [],
        links: [],
        signedBy: "Principal, GCET Safapora",
      });
    }
    setErrors({});
  }, [notice, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.length < 10) {
      newErrors.content = "Content must be at least 10 characters";
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving notice:", error);
    } finally {
      setLoading(false);
    }
  };

  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, { title: "", url: "" }],
    }));
  };

  const updateLink = (index: number, field: "title" | "url", value: string) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const typeOptions = [
    { value: "announcement", label: "General Announcement", icon: "📢" },
    { value: "exam_form", label: "Exam Form", icon: "📝" },
    { value: "fee_notice", label: "Fee Notice", icon: "💰" },
    { value: "academic", label: "Academic Notice", icon: "🎓" },
    { value: "event", label: "Event Notice", icon: "📅" },
    { value: "maintenance", label: "Maintenance Notice", icon: "🔧" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low", color: "text-green-600 bg-green-50" },
    { value: "medium", label: "Medium", color: "text-yellow-600 bg-yellow-50" },
    { value: "high", label: "High", color: "text-orange-600 bg-orange-50" },
    { value: "urgent", label: "Urgent", color: "text-red-600 bg-red-50" },
  ];

  const audienceOptions = [
    { value: "all", label: "All Students & Staff" },
    { value: "students", label: "All Students" },
    { value: "staff", label: "All Staff" },
    { value: "specific_course", label: "Specific Course" },
    { value: "specific_semester", label: "Specific Semester" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === "create" ? "Create New Notice" : "Edit Notice"}
                </h2>
                <p className="text-gray-600 mt-1">
                  Govt College of Engineering and Technology Safapora
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto max-h-[calc(90vh-140px)]"
            >
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter notice title..."
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Type and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notice Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          type: e.target.value as NoticeType,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {typeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          priority: e.target.value as Priority,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      errors.content ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter detailed notice content..."
                  />
                  {errors.content && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.content}
                    </p>
                  )}
                </div>

                {/* Links Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Links
                    </label>
                    <button
                      type="button"
                      onClick={addLink}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Link
                    </button>
                  </div>

                  {formData.links.map((link, index) => (
                    <div key={index} className="flex gap-3 mb-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) =>
                            updateLink(index, "title", e.target.value)
                          }
                          placeholder="Link title..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) =>
                            updateLink(index, "url", e.target.value)
                          }
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        targetAudience: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {audienceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conditional Course/Semester Fields */}
                {formData.targetAudience === "specific_course" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course
                    </label>
                    <input
                      type="text"
                      value={formData.targetCourse}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          targetCourse: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Computer Science Engineering"
                    />
                  </div>
                )}

                {formData.targetAudience === "specific_semester" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester
                    </label>
                    <select
                      value={formData.targetSemester || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          targetSemester: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.endDate ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Signature Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signed By
                  </label>
                  <input
                    type="text"
                    value={formData.signedBy}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        signedBy: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Principal, GCET Safapora"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will appear as the official signature on the notice
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Preview:</span> —{" "}
                  {formData.signedBy} —
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {loading
                      ? "Saving..."
                      : mode === "create"
                      ? "Create Notice"
                      : "Update Notice"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NoticeModal;
