import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Calendar,
  DollarSign,
  Clock,
  GraduationCap,
  AlertCircle,
  BookOpen,
  School,
} from "lucide-react";
import { registrationAPI } from "../../services/api";

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  onSessionUpdated: (session: any) => void;
}

interface EditFormData {
  semester: number;
  academicYear: string;
  startDate: string;
  endDate: string;
  feeAmount: number;
  feeDeadline: string;
  availableCourses: string[];
  isActive: boolean;
}

const EditSessionModal: React.FC<EditSessionModalProps> = ({
  isOpen,
  onClose,
  session,
  onSessionUpdated,
}) => {
  const [formData, setFormData] = useState<EditFormData>({
    semester: 1,
    academicYear: "",
    startDate: "",
    endDate: "",
    feeAmount: 0,
    feeDeadline: "",
    availableCourses: [],
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (session) {
      setFormData({
        semester: session.semester,
        academicYear: session.academicYear,
        startDate: session.startDate.split("T")[0],
        endDate: session.endDate.split("T")[0],
        feeAmount: session.feeAmount,
        feeDeadline: session.feeDeadline.split("T")[0],
        availableCourses: session.availableCourses || [],
        isActive: session.isActive,
      });
    }
  }, [session]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.semester < 1 || formData.semester > 8) {
      newErrors.semester = "Semester must be between 1 and 8";
    }

    if (!formData.academicYear.trim()) {
      newErrors.academicYear = "Academic year is required";
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    if (new Date(formData.feeDeadline) <= new Date(formData.endDate)) {
      newErrors.feeDeadline =
        "Fee deadline should be after registration end date";
    }

    if (formData.feeAmount <= 0) {
      newErrors.feeAmount = "Fee amount must be greater than 0";
    }

    if (formData.availableCourses.length === 0) {
      newErrors.courses = "At least one course must be available";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const updatedSession = await registrationAPI.updateSession(session._id, {
        semester: formData.semester,
        academicYear: formData.academicYear,
        startDate: formData.startDate,
        endDate: formData.endDate,
        feeAmount: formData.feeAmount,
        feeDeadline: formData.feeDeadline,
        availableCourses: formData.availableCourses,
        libraryRequirement: formData.semester === 5 || formData.semester === 7,
        isActive: formData.isActive,
      });

      onSessionUpdated(updatedSession);
      onClose();
    } catch (error) {
      console.error("Error updating session:", error);
      setErrors({
        general: "Failed to update session. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCourse = () => {
    const newCourse = prompt("Enter course name:");
    if (newCourse && newCourse.trim()) {
      setFormData((prev) => ({
        ...prev,
        availableCourses: [...prev.availableCourses, newCourse.trim()],
      }));
    }
  };

  const removeCourse = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      availableCourses: prev.availableCourses.filter((_, i) => i !== index),
    }));
  };

  const requiresLibraryClearance =
    formData.semester === 5 || formData.semester === 7;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <School className="w-8 h-8" />
                  <div>
                    <h1 className="text-xl font-bold">
                      Edit Registration Session
                    </h1>
                    <p className="text-blue-100">
                      Update session details and settings
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto max-h-[calc(90vh-140px)]"
            >
              <div className="p-6 space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-600">{errors.general}</p>
                  </div>
                )}

                {/* Active Status Toggle */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Session Status
                      </h3>
                      <p className="text-sm text-gray-600">
                        Control whether this session is active or inactive
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      <span className="ms-3 text-sm font-medium text-gray-900">
                        {formData.isActive ? "Active" : "Inactive"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester *
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          semester: parseInt(e.target.value),
                        }))
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.semester ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                    {errors.semester && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.semester}
                      </p>
                    )}
                    {requiresLibraryClearance && (
                      <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-orange-600" />
                          <p className="text-sm font-medium text-orange-700">
                            Library Clearance Required (80%)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Year *
                    </label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          academicYear: e.target.value,
                        }))
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.academicYear
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., 2024-25"
                    />
                    {errors.academicYear && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.academicYear}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dates and Fee */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Start Date *
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
                      Registration End Date *
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fee Payment Deadline *
                    </label>
                    <input
                      type="date"
                      value={formData.feeDeadline}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          feeDeadline: e.target.value,
                        }))
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.feeDeadline
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.feeDeadline && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.feeDeadline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fee Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester Fee Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.feeAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        feeAmount: parseInt(e.target.value) || 0,
                      }))
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.feeAmount ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="45000"
                  />
                  {errors.feeAmount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.feeAmount}
                    </p>
                  )}
                </div>

                {/* Available Courses */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Available Courses *
                    </label>
                    <button
                      type="button"
                      onClick={addCourse}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Course
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.availableCourses.map((course, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <GraduationCap className="w-4 h-4 text-gray-500" />
                        <span className="flex-1">{course}</span>
                        <button
                          type="button"
                          onClick={() => removeCourse(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {errors.courses && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.courses}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Note:</span> Changes will be
                  applied immediately
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
                    {loading ? "Saving..." : "Save Changes"}
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

export default EditSessionModal;
