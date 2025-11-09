import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  GraduationCap,
  AlertCircle,
  Library,
} from "lucide-react";
import { registrationAPI } from "../../services/api";

interface RegistrationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: any;
  onStatusUpdated: (registration: any) => void;
}

const RegistrationDetailsModal: React.FC<RegistrationDetailsModalProps> = ({
  isOpen,
  onClose,
  registration,
  onStatusUpdated,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusUpdate = async (newStatus: string, actionName: string) => {
    setActionLoading(actionName);
    setError(null);

    try {
      const updated = await registrationAPI.updateRegistrationStatus(
        registration._id,
        newStatus
      );
      onStatusUpdated(updated);
      onClose();
    } catch (err: any) {
      console.error("Error updating status:", err);
      setError(`Failed to ${actionName}. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
            <CheckCircle className="w-4 h-4" />
            Completed
          </span>
        );
      case "library_pending":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200">
            <Library className="w-4 h-4" />
            Library Pending
          </span>
        );
      case "payment_pending":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <DollarSign className="w-4 h-4" />
            Payment Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
    }
  };

  const getFeeStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
            <CheckCircle className="w-4 h-4" />
            Paid
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-4 h-4" />
            Overdue
          </span>
        );
      case "partial":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200">
            <Clock className="w-4 h-4" />
            Partial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
    }
  };

  if (!registration) return null;

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
                <div>
                  <h1 className="text-2xl font-bold">Registration Details</h1>
                  <p className="text-blue-100 mt-1">
                    {registration.registrationId}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-6 space-y-6">
              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Registration Status
                  </h3>
                  {getStatusBadge(registration.status)}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Fee Status
                  </h3>
                  {getFeeStatusBadge(registration.feeStatus)}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Library Clearance
                  </h3>
                  <div className="flex items-center gap-2">
                    {registration.libraryCleared ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Cleared
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-700">
                          Not Cleared
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <p className="text-gray-900 font-medium mt-1">
                      {registration.studentName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Student ID
                    </label>
                    <p className="text-gray-900 font-medium mt-1">
                      {registration.studentId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      University Reg. Number
                    </label>
                    <p className="text-gray-900 font-medium mt-1">
                      {registration.universityRegNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <p className="text-gray-900 font-medium mt-1">
                      {registration.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <p className="text-gray-900 font-medium mt-1">
                      {registration.phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Registered On
                    </label>
                    <p className="text-gray-900 font-medium mt-1">
                      {formatDate(registration.registeredAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Semester Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Semester Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Current Semester
                    </label>
                    <p className="text-gray-900 font-medium mt-1">
                      Semester {registration.currentSemester}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Registering For
                    </label>
                    <p className="text-gray-900 font-medium mt-1">
                      Semester {registration.registeringForSemester}
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Courses */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Selected Courses
                </h2>
                <div className="space-y-2">
                  {registration.selectedCourses.map(
                    (course: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <span className="text-gray-900 font-medium">
                          {course}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Footer with Action Buttons */}
            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Admin Actions:</span> Manage
                  this registration
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                    disabled={actionLoading !== null}
                  >
                    Close
                  </button>

                  {registration.status === "library_pending" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate("payment_pending", "clear library")
                      }
                      disabled={actionLoading !== null}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                    >
                      <Library className="w-4 h-4" />
                      {actionLoading === "clear library"
                        ? "Processing..."
                        : "Clear Library"}
                    </button>
                  )}

                  {registration.status === "payment_pending" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate("completed", "mark as paid")
                      }
                      disabled={actionLoading !== null}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <DollarSign className="w-4 h-4" />
                      {actionLoading === "mark as paid"
                        ? "Processing..."
                        : "Mark as Paid"}
                    </button>
                  )}

                  {(registration.status === "pending" ||
                    registration.status === "library_pending" ||
                    registration.status === "payment_pending") && (
                    <button
                      onClick={() => handleStatusUpdate("completed", "approve")}
                      disabled={actionLoading !== null}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {actionLoading === "approve"
                        ? "Approving..."
                        : "Approve & Complete"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RegistrationDetailsModal;

