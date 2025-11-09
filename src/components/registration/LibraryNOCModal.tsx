import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  Scan,
} from "lucide-react";
import { registrationAPI } from "../../services/api";

interface LibraryNOCModalProps {
  isOpen: boolean;
  onClose: () => void;
  universityRegNumber: string;
  studentName: string;
  onNOCReceived: (nocData: any) => void;
}

interface LibraryStatus {
  nocStatus: string;
  nocDate?: string;
  nocIssuedBy?: string;
  pendingBooks: Array<{
    bookId: string;
    bookTitle: string;
    issueDate: string;
    dueDate: string;
    lateFee: number;
    status: string;
  }>;
  totalLateFee: number;
  totalBookCost: number;
  totalAmount: number;
  hasPendingBooks: boolean;
}

const LibraryNOCModal: React.FC<LibraryNOCModalProps> = ({
  isOpen,
  onClose,
  universityRegNumber,
  studentName,
  onNOCReceived,
}) => {
  const [step, setStep] = useState<"verify" | "status" | "payment">("verify");
  const [libraryCard, setLibraryCard] = useState("");
  const [libraryStatus, setLibraryStatus] = useState<LibraryStatus | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentType, setPaymentType] = useState<
    "late_fee" | "book_cost" | "both"
  >("late_fee");

  const handleVerifyCard = async () => {
    if (!libraryCard.trim()) {
      setError("Please enter your library card number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await registrationAPI.verifyLibraryCard(
        libraryCard,
        universityRegNumber
      );
      setLibraryStatus(response.libraryStatus);
      setStep("status");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to verify library card");
    } finally {
      setLoading(false);
    }
  };

  const handlePayFees = async () => {
    if (!libraryStatus) return;

    setLoading(true);
    setError("");

    try {
      const amount =
        paymentType === "late_fee"
          ? libraryStatus.totalLateFee
          : paymentType === "book_cost"
          ? libraryStatus.totalBookCost
          : libraryStatus.totalAmount;

      const response = await registrationAPI.payLibraryFees(
        universityRegNumber,
        paymentType,
        amount
      );

      if (response.nocIssued) {
        onNOCReceived(response.libraryStatus);
        onClose();
      } else {
        setLibraryStatus(response.libraryStatus);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <BookOpen className="w-8 h-8" />
                  <div>
                    <h1 className="text-xl font-bold">
                      Library NOC Verification
                    </h1>
                    <p className="text-orange-100">
                      {studentName} ({universityRegNumber})
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

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Step 1: Verify Library Card */}
              {step === "verify" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Scan className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Verify Library Card
                    </h2>
                    <p className="text-gray-600">
                      Enter your library card number to check your library
                      status
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-red-600">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Library Card Number *
                    </label>
                    <input
                      type="text"
                      value={libraryCard}
                      onChange={(e) => setLibraryCard(e.target.value)}
                      placeholder="e.g., LIB000001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      You can find this number on your library card or student
                      ID
                    </p>
                  </div>

                  <button
                    onClick={handleVerifyCard}
                    disabled={loading}
                    className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Verifying..." : "Verify Library Card"}
                  </button>
                </div>
              )}

              {/* Step 2: Library Status */}
              {step === "status" && libraryStatus && (
                <div className="space-y-6">
                  {/* NOC Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">
                        NOC Status
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {libraryStatus.nocStatus === "approved" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      )}
                      <span
                        className={`font-medium ${
                          libraryStatus.nocStatus === "approved"
                            ? "text-green-700"
                            : "text-orange-700"
                        }`}
                      >
                        {libraryStatus.nocStatus === "approved"
                          ? "NOC Approved"
                          : "NOC Pending"}
                      </span>
                    </div>
                    {libraryStatus.nocDate && (
                      <p className="text-sm text-gray-600 mt-1">
                        Issued on {formatDate(libraryStatus.nocDate)} by{" "}
                        {libraryStatus.nocIssuedBy}
                      </p>
                    )}
                  </div>

                  {/* Pending Books */}
                  {libraryStatus.hasPendingBooks && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <h3 className="font-semibold text-red-900">
                          Pending Books
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {libraryStatus.pendingBooks.map((book, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-3 border border-red-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {book.bookTitle}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Book ID: {book.bookId}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>
                                      Issued: {formatDate(book.issueDate)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>Due: {formatDate(book.dueDate)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    book.status === "overdue"
                                      ? "bg-red-100 text-red-800"
                                      : book.status === "lost"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {book.status === "overdue"
                                    ? `${getDaysOverdue(
                                        book.dueDate
                                      )} days overdue`
                                    : book.status.toUpperCase()}
                                </span>
                                {book.lateFee > 0 && (
                                  <p className="text-sm text-red-600 mt-1">
                                    Late Fee: ₹{book.lateFee}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Payment Summary */}
                      <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Payment Summary
                        </h4>
                        <div className="space-y-1 text-sm">
                          {libraryStatus.totalLateFee > 0 && (
                            <div className="flex justify-between">
                              <span>Late Fees:</span>
                              <span>₹{libraryStatus.totalLateFee}</span>
                            </div>
                          )}
                          {libraryStatus.totalBookCost > 0 && (
                            <div className="flex justify-between">
                              <span>Lost Book Cost:</span>
                              <span>₹{libraryStatus.totalBookCost}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-medium text-lg border-t pt-1">
                            <span>Total Amount:</span>
                            <span>₹{libraryStatus.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Options */}
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Payment Options
                        </h4>
                        <div className="space-y-2">
                          {libraryStatus.totalLateFee > 0 && (
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                              <input
                                type="radio"
                                name="paymentType"
                                value="late_fee"
                                checked={paymentType === "late_fee"}
                                onChange={(e) =>
                                  setPaymentType(e.target.value as any)
                                }
                                className="text-orange-600"
                              />
                              <div className="flex-1">
                                <span className="font-medium">
                                  Pay Late Fees Only
                                </span>
                                <p className="text-sm text-gray-600">
                                  ₹{libraryStatus.totalLateFee} - Return books
                                  after payment
                                </p>
                              </div>
                            </label>
                          )}
                          {libraryStatus.totalBookCost > 0 && (
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                              <input
                                type="radio"
                                name="paymentType"
                                value="book_cost"
                                checked={paymentType === "book_cost"}
                                onChange={(e) =>
                                  setPaymentType(e.target.value as any)
                                }
                                className="text-orange-600"
                              />
                              <div className="flex-1">
                                <span className="font-medium">
                                  Pay for Lost Books
                                </span>
                                <p className="text-sm text-gray-600">
                                  ₹{libraryStatus.totalBookCost} - Books marked
                                  as paid
                                </p>
                              </div>
                            </label>
                          )}
                          {libraryStatus.totalLateFee > 0 &&
                            libraryStatus.totalBookCost > 0 && (
                              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                  type="radio"
                                  name="paymentType"
                                  value="both"
                                  checked={paymentType === "both"}
                                  onChange={(e) =>
                                    setPaymentType(e.target.value as any)
                                  }
                                  className="text-orange-600"
                                />
                                <div className="flex-1">
                                  <span className="font-medium">
                                    Pay All Fees
                                  </span>
                                  <p className="text-sm text-gray-600">
                                    ₹{libraryStatus.totalAmount} - Clear all
                                    pending amounts
                                  </p>
                                </div>
                              </label>
                            )}
                        </div>
                      </div>

                      <button
                        onClick={handlePayFees}
                        disabled={loading}
                        className="w-full mt-4 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-5 h-5" />
                        {loading
                          ? "Processing Payment..."
                          : `Pay ₹${
                              paymentType === "late_fee"
                                ? libraryStatus.totalLateFee
                                : paymentType === "book_cost"
                                ? libraryStatus.totalBookCost
                                : libraryStatus.totalAmount
                            }`}
                      </button>
                    </div>
                  )}

                  {/* No Pending Books */}
                  {!libraryStatus.hasPendingBooks &&
                    libraryStatus.nocStatus === "approved" && (
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-green-900 mb-2">
                          Library NOC Approved!
                        </h3>
                        <p className="text-green-700">
                          You have no pending books and your NOC has been
                          approved. You can proceed with your registration.
                        </p>
                        <button
                          onClick={() => {
                            onNOCReceived(libraryStatus);
                            onClose();
                          }}
                          className="mt-4 bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Continue Registration
                        </button>
                      </div>
                    )}
                </div>
              )}

              {error && step === "status" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-600">{error}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LibraryNOCModal;
