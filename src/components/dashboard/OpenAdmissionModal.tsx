import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  GraduationCap,
  FileText,
  Bell,
  School,
  AlertCircle,
} from "lucide-react";
import { admissionsAPI, noticesAPI } from "../../services/api";

interface OpenAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdmissionCreated: (admission: any) => void;
}

interface AdmissionFormData {
  semester: number;
  academicYear: string;
  startDate: string;
  endDate: string;
  feeAmount: number;
  feeDeadline: string;
  courses: string[];
  eligibilityCriteria: string;
  requiredDocuments: string[];
  createNotice: boolean;
  noticeTitle: string;
  noticeContent: string;
  signedBy: string;
}

const OpenAdmissionModal: React.FC<OpenAdmissionModalProps> = ({
  isOpen,
  onClose,
  onAdmissionCreated,
}) => {
  const [formData, setFormData] = useState<AdmissionFormData>({
    semester: 1,
    academicYear: "2024-25",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    feeAmount: 50000,
    feeDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    courses: [
      "Computer Science Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Electrical Engineering",
    ],
    eligibilityCriteria: "Minimum 60% marks in 12th standard with PCM subjects",
    requiredDocuments: [
      "10th Mark Sheet",
      "12th Mark Sheet",
      "Transfer Certificate",
      "Character Certificate",
      "Passport Size Photos (4 copies)",
      "Aadhar Card Copy",
      "Category Certificate (if applicable)",
    ],
    createNotice: true,
    noticeTitle: "",
    noticeContent: "",
    signedBy: "Principal, GCET Safapora",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate notice content when form data changes
  React.useEffect(() => {
    if (formData.createNotice) {
      const title = `Admission Open for Semester ${formData.semester} - Academic Year ${formData.academicYear}`;
      const content = `
We are pleased to announce that admissions are now open for Semester ${
        formData.semester
      } for the Academic Year ${formData.academicYear}.

📅 IMPORTANT DATES:
• Application Start Date: ${formatDate(formData.startDate)}
• Application End Date: ${formatDate(formData.endDate)}
• Fee Payment Deadline: ${formatDate(formData.feeDeadline)}

💰 FEE STRUCTURE:
• Semester Fee: ₹${formData.feeAmount.toLocaleString()}

🎓 AVAILABLE COURSES:
${formData.courses.map((course) => `• ${course}`).join("\n")}

📋 ELIGIBILITY CRITERIA:
${formData.eligibilityCriteria}

📄 REQUIRED DOCUMENTS:
${formData.requiredDocuments.map((doc) => `• ${doc}`).join("\n")}

⚠️ IMPORTANT INSTRUCTIONS:
• Applications submitted after the deadline will not be accepted
• Ensure all documents are properly attested
• Fee payment must be completed within the specified deadline
• Incomplete applications will be rejected

For any queries, please contact the Admissions Office.

Apply now and secure your future at GCET Safapora!
      `.trim();

      setFormData((prev) => ({
        ...prev,
        noticeTitle: title,
        noticeContent: content,
      }));
    }
  }, [
    formData.semester,
    formData.academicYear,
    formData.startDate,
    formData.endDate,
    formData.feeDeadline,
    formData.feeAmount,
    formData.courses,
    formData.eligibilityCriteria,
    formData.requiredDocuments,
    formData.createNotice,
  ]);

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
        "Fee deadline should be after application end date";
    }

    if (formData.feeAmount <= 0) {
      newErrors.feeAmount = "Fee amount must be greater than 0";
    }

    if (formData.courses.length === 0) {
      newErrors.courses = "At least one course must be selected";
    }

    if (formData.createNotice && !formData.noticeTitle.trim()) {
      newErrors.noticeTitle = "Notice title is required when creating notice";
    }

    if (formData.createNotice && !formData.noticeContent.trim()) {
      newErrors.noticeContent =
        "Notice content is required when creating notice";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create admission session
      const admissionSession = await admissionsAPI.createSession({
        semester: formData.semester,
        academicYear: formData.academicYear,
        startDate: formData.startDate,
        endDate: formData.endDate,
        feeAmount: formData.feeAmount,
        feeDeadline: formData.feeDeadline,
        courses: formData.courses,
        eligibilityCriteria: formData.eligibilityCriteria,
        requiredDocuments: formData.requiredDocuments,
      });

      // Create notice if requested
      if (formData.createNotice) {
        await noticesAPI.create({
          title: formData.noticeTitle,
          content: formData.noticeContent,
          type: "announcement",
          priority: "high",
          targetAudience: "all",
          startDate: formData.startDate,
          endDate: formData.endDate,
          links: [
            {
              title: "Apply Now",
              url: `/admissions/apply/${admissionSession._id || "new"}`,
            },
          ],
          signedBy: formData.signedBy,
        });
      }

      onAdmissionCreated(admissionSession);
      onClose();
    } catch (error) {
      console.error("Error creating admission session:", error);
      setErrors({
        general: "Failed to create admission session. Please try again.",
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
        courses: [...prev.courses, newCourse.trim()],
      }));
    }
  };

  const removeCourse = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index),
    }));
  };

  const addDocument = () => {
    const newDoc = prompt("Enter required document:");
    if (newDoc && newDoc.trim()) {
      setFormData((prev) => ({
        ...prev,
        requiredDocuments: [...prev.requiredDocuments, newDoc.trim()],
      }));
    }
  };

  const removeDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((_, i) => i !== index),
    }));
  };

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
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <School className="w-8 h-8" />
                  <div>
                    <h1 className="text-xl font-bold">
                      Open New Admission Session
                    </h1>
                    <p className="text-blue-100">
                      Govt College of Engineering and Technology Safapora
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
                      Application Start Date *
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
                      Application End Date *
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
                    placeholder="50000"
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
                    {formData.courses.map((course, index) => (
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

                {/* Eligibility Criteria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eligibility Criteria
                  </label>
                  <textarea
                    value={formData.eligibilityCriteria}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        eligibilityCriteria: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter eligibility criteria..."
                  />
                </div>

                {/* Required Documents */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Required Documents
                    </label>
                    <button
                      type="button"
                      onClick={addDocument}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Document
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.requiredDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="flex-1">{doc}</span>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auto-Create Notice */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="createNotice"
                      checked={formData.createNotice}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          createNotice: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="createNotice"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      Auto-create admission notice
                    </label>
                  </div>

                  {formData.createNotice && (
                    <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notice Title
                        </label>
                        <input
                          type="text"
                          value={formData.noticeTitle}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              noticeTitle: e.target.value,
                            }))
                          }
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.noticeTitle
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.noticeTitle && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.noticeTitle}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notice Content
                        </label>
                        <textarea
                          value={formData.noticeContent}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              noticeContent: e.target.value,
                            }))
                          }
                          rows={8}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                            errors.noticeContent
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.noticeContent && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.noticeContent}
                          </p>
                        )}
                      </div>

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
                          placeholder="Principal, GCET Safapora"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Note:</span> This will open
                  admissions and optionally create a public notice
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
                    {loading ? "Opening..." : "Open Admission"}
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

export default OpenAdmissionModal;
