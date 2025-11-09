import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { registrationAPI } from "../../services/api";

interface DeleteSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  onSessionDeleted: (sessionId: string) => void;
}

const DeleteSessionModal: React.FC<DeleteSessionModalProps> = ({
  isOpen,
  onClose,
  session,
  onSessionDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await registrationAPI.deleteSession(session._id);
      onSessionDeleted(session._id);
      onClose();
    } catch (err: any) {
      console.error("Error deleting session:", err);
      setError("Failed to delete session. Please try again.");
    } finally {
      setLoading(false);
    }
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
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200"
          >
            {/* Header */}
            <div className="bg-red-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-700 rounded-lg">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Delete Session</h1>
                    <p className="text-red-100 text-sm">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Are you absolutely sure?
                </h3>
                <p className="text-sm text-amber-800">
                  You are about to delete the registration session:
                </p>
                <div className="mt-3 p-3 bg-white border border-amber-200 rounded">
                  <p className="font-medium text-gray-900">
                    Semester {session?.semester} - {session?.academicYear}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {session?.totalRegistrations || 0} students registered
                  </p>
                </div>
              </div>

              {/* Impact Information */}
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  This will permanently:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Remove the registration session from the system</li>
                  <li>Make the session unavailable for new registrations</li>
                  <li>
                    Existing registrations will remain (but won't be linked to
                    this session)
                  </li>
                </ul>
              </div>

              {/* Confirmation */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Alternative:</span> Consider
                  making the session{" "}
                  <span className="font-medium text-blue-600">inactive</span>{" "}
                  instead of deleting it. This preserves historical data and can
                  be reactivated later.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {loading ? "Deleting..." : "Delete Session"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteSessionModal;












