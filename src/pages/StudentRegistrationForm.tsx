import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  BookOpen,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Phone,
  MapPin,
  GraduationCap,
  FileText,
} from "lucide-react";
import { registrationAPI } from "../services/api";
import LibraryNOCModal from "../components/registration/LibraryNOCModal";
import PaymentMethodSelector from "../components/payment/PaymentMethodSelector";
import PaymentReceipt from "../components/payment/PaymentReceipt";

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

interface Student {
  studentId: string;
  universityRegNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  currentSemester: number;
  department: string;
  course?: {
    name: string;
    code: string;
    semester: number;
    year: number;
  };
  totalBooksIssuedAllSemesters?: number;
  totalBooksReturnedAllSemesters?: number;
  pendingBooks?: Array<{
    bookId: string;
    title: string;
    issuedDate: string;
    dueDate: string;
    fine: number;
  }>;
}

interface RegistrationFormData {
  universityRegNumber: string;
  selectedCourses: string[];
  updatedInfo: {
    phone: string;
    address: string;
  };
}

const StudentRegistrationForm: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<RegistrationSession | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<RegistrationFormData>({
    universityRegNumber: "",
    selectedCourses: [],
    updatedInfo: {
      phone: "",
      address: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"lookup" | "form" | "payment" | "success">(
    "lookup"
  );
  const [libraryInfo, setLibraryInfo] = useState<any>(null);
  const [showLibraryNOCModal, setShowLibraryNOCModal] = useState(false);
  const [libraryNOCReceived, setLibraryNOCReceived] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Load registration session
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) {
        setErrors({ general: "Invalid session ID" });
        setLoading(false);
        return;
      }

      try {
        // Pass student's branch to get filtered subjects
        const branch = student?.course?.code || "";
        const url = branch ? `${sessionId}?branch=${branch}` : sessionId;
        const sessionData = await registrationAPI.getSessionById(url);
        setSession(sessionData);

        // Check if session is active
        const now = new Date();
        const endDate = new Date(sessionData.endDate);
        if (!sessionData.isActive || now > endDate) {
          setErrors({
            general: "This registration session is no longer active.",
          });
        }
      } catch (error) {
        console.error("Error loading session:", error);
        setErrors({ general: "Failed to load registration session." });
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, student]);

  const handleStudentLookup = async () => {
    if (!formData.universityRegNumber.trim()) {
      setErrors({
        universityRegNumber: "University registration number is required",
      });
      return;
    }

    setLookupLoading(true);
    setErrors({});

    try {
      const studentData = await registrationAPI.lookupStudent(
        formData.universityRegNumber
      );
      setStudent(studentData);

      // Format address from object to string
      const addressString = studentData.address
        ? typeof studentData.address === "string"
          ? studentData.address
          : `${studentData.address.street}, ${studentData.address.city}, ${studentData.address.state} - ${studentData.address.pincode}`
        : "";

      setFormData((prev) => ({
        ...prev,
        updatedInfo: {
          phone: studentData.phone || "",
          address: addressString,
        },
      }));

      // Eligibility check: student must be registering for currentSemester + 1
      if (session) {
        const requiredSemester = (studentData.currentSemester || 0) + 1;
        if (session.semester !== requiredSemester) {
          setErrors({
            general: `You are not eligible for Semester ${
              session.semester
            }. Only students currently in Semester ${
              session.semester - 1
            } can apply.`,
          });
          return; // stop here; do not advance to form
        }
      }

      // Check library status automatically if session requires it
      if (session?.libraryRequirement) {
        try {
          const libStatus = await registrationAPI.checkLibraryStatus(
            studentData.universityRegNumber
          );
          if (!libStatus.libraryCleared && libStatus.pendingBooks?.length > 0) {
            setLibraryInfo(libStatus);
            // Auto-show library NOC modal for students with pending books
            setShowLibraryNOCModal(true);
          }
        } catch (libError) {
          console.error("Error checking library status:", libError);
          // Continue anyway - don't block registration for library check errors
        }
      }

      setStep("form");
    } catch (error: any) {
      console.error("Error looking up student:", error);
      if (error.response?.status === 404) {
        setErrors({
          universityRegNumber:
            "Student not found with this registration number",
        });
      } else {
        setErrors({
          general: "Failed to lookup student information. Please try again.",
        });
      }
    } finally {
      setLookupLoading(false);
    }
  };

  // Auto-select all courses when session loads
  useEffect(() => {
    if (session && session.availableCourses) {
      setFormData((prev) => ({
        ...prev,
        selectedCourses: session.availableCourses,
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for library issues first
    if (libraryInfo && !libraryNOCReceived) {
      setShowLibraryNOCModal(true);
      return;
    }

    // Proceed to payment
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (payment: any) => {
    setPaymentData(payment);
    setShowPaymentModal(false);
    setSubmitting(true);

    try {
      // Submit registration after successful payment
      await registrationAPI.submitRegistration({
        universityRegNumber: formData.universityRegNumber,
        sessionId: sessionId!,
        selectedCourses: formData.selectedCourses,
        updatedInfo: formData.updatedInfo,
        ...(payment.paymentId && { paymentId: payment.paymentId }),
        paymentStatus: "paid",
      } as any);

      // Persisted in DB; no local caching needed

      // Show receipt
      setShowReceipt(true);
      setStep("success");
    } catch (error: any) {
      console.error("Error submitting registration:", error);
      setErrors({
        general:
          error.response?.data?.error ||
          "Registration submitted but there was an error. Please contact admin with your payment ID: " +
            payment.paymentId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNOCReceived = () => {
    setLibraryNOCReceived(true);
    setShowLibraryNOCModal(false);
    setLibraryInfo(null);
    setErrors({});

    // Show success message and allow user to retry registration
    alert("Library NOC received! You can now complete your registration.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registration session...</p>
        </div>
      </div>
    );
  }

  if (errors.general && !session) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Registration Unavailable
          </h2>
          <p className="text-gray-600 mb-4">{errors.general}</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header + Back */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Semester Registration
            </h1>
            <p className="text-sm text-gray-600">
              Follow the guided steps to complete your registration.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        {/* Student Lookup Step - Two Column Layout */}
        {step === "lookup" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Session Information */}
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white rounded-lg shadow-md p-5 sm:p-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Semester {session?.semester} Registration
                </h1>
                <p className="text-gray-600 mt-1">
                  Academic Year: {session?.academicYear}
                </p>
              </div>

              {/* Deadline Cards */}
              {session && (
                <div className="space-y-4">
                  {/* Registration Deadline Card */}
                  {(() => {
                    const endDate = new Date(session.endDate);
                    const now = new Date();
                    const isPast = now > endDate;
                    return (
                  <div className="bg-white rounded-lg shadow-md">
                        <div
                      className={`flex flex-col gap-3 sm:flex-row sm:items-center p-4 rounded-lg border ${
                            isPast
                              ? "bg-gray-50 border-gray-300"
                              : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <Calendar
                            className={`w-5 h-5 ${
                              isPast ? "text-gray-400" : "text-blue-600"
                            }`}
                          />
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                isPast ? "text-gray-600" : "text-blue-900"
                              }`}
                            >
                              Registration Deadline
                            </p>
                            <p
                              className={`text-sm ${
                                isPast ? "text-gray-500" : "text-blue-700"
                              }`}
                            >
                              {endDate.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                            {isPast && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded">
                                Expired
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Registration Fee Card */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div
                      className={`flex flex-col gap-3 sm:flex-row sm:items-center p-4 rounded-lg border ${
                        !session.isActive
                          ? "bg-gray-50 border-gray-300"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                      <DollarSign
                        className={`w-5 h-5 ${
                          !session.isActive ? "text-gray-400" : "text-green-600"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            !session.isActive ? "text-gray-600" : "text-green-900"
                          }`}
                        >
                          Registration Fee
                        </p>
                        <p
                          className={`text-sm ${
                            !session.isActive ? "text-gray-500" : "text-green-700"
                          }`}
                        >
                          ₹{session.feeAmount.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fee Deadline Card */}
                  {(() => {
                    const feeDeadline = new Date(session.feeDeadline);
                    const now = new Date();
                    const isPast = now > feeDeadline;
                    return (
                  <div className="bg-white rounded-lg shadow-md">
                        <div
                      className={`flex flex-col gap-3 sm:flex-row sm:items-center p-4 rounded-lg border ${
                            isPast
                              ? "bg-gray-50 border-gray-300"
                              : "bg-purple-50 border-purple-200"
                          }`}
                        >
                          <Clock
                            className={`w-5 h-5 ${
                              isPast ? "text-gray-400" : "text-purple-600"
                            }`}
                          />
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                isPast ? "text-gray-600" : "text-purple-900"
                              }`}
                            >
                              Fee Deadline
                            </p>
                            <p
                              className={`text-sm ${
                                isPast ? "text-gray-500" : "text-purple-700"
                              }`}
                            >
                              {feeDeadline.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                            {isPast && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded">
                                Expired
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Library Requirement */}
              {session?.libraryRequirement && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-md">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-600" />
                    <p className="text-amber-800 font-medium">
                      Library Clearance Required
                    </p>
                  </div>
                  <p className="text-amber-700 text-sm mt-1">
                    This semester requires library clearance. You must have returned
                    at least 80% of all books issued and have no pending dues.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Student Verification Form */}
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
              {/* Session Expired Warning - Show prominently if session is inactive */}
              {errors.general && (
                <div className="mb-6 p-5 bg-red-50 border-2 border-red-300 rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-7 h-7 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Registration Session Closed
                      </h3>
                      <p className="text-red-700 mb-3">{errors.general}</p>
                      <p className="text-sm text-red-600">
                        Please check the notice board or contact the academic
                        office for information about upcoming registration
                        sessions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                    errors.general ? "bg-gray-100" : "bg-blue-100"
                  }`}
                >
                  <User
                    className={`w-10 h-10 ${
                      errors.general ? "text-gray-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Student Verification
                </h2>
                <p className="text-gray-600">
                  Enter your university registration number to begin
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!errors.general) {
                    handleStudentLookup();
                  }
                }}
              >
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University Registration Number *
                  </label>
                  <input
                    type="text"
                    value={formData.universityRegNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        universityRegNumber: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g., GCET2021001"
                    disabled={!!errors.general}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.universityRegNumber
                        ? "border-red-300 bg-red-50"
                        : errors.general
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                        : "border-gray-300 bg-white"
                    }`}
                  />
                  {errors.universityRegNumber && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-500 text-sm">
                        {errors.universityRegNumber}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={lookupLoading || !!errors.general}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    errors.general
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {lookupLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Looking up...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </button>

                {errors.general && (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Return to Home
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Registration Form Step */}
        {step === "form" && student && session && (
          <div className="space-y-6">
            {/* Student Information */}
            <div className="bg-white rounded-lg shadow-md p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Student Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-gray-400 mt-1 sm:mt-0" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{student.name}</p>
                  </div>
                </div>
                <div className="flex items-start sm:items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-1 sm:mt-0" />
                  <div>
                    <p className="text-sm text-gray-500">Registration Number</p>
                    <p className="font-medium">{student.universityRegNumber}</p>
                  </div>
                </div>
                <div className="flex items-start sm:items-center gap-3">
                  <BookOpen className="w-5 h-5 text-gray-400 mt-1 sm:mt-0" />
                  <div>
                    <p className="text-sm text-gray-500">Current Semester</p>
                    <p className="font-medium">{student.currentSemester}</p>
                  </div>
                </div>
                <div className="flex items-start sm:items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-gray-400 mt-1 sm:mt-0" />
                  <div>
                    <p className="text-sm text-gray-500">Branch</p>
                    <p className="font-medium">
                      {student.course?.code || "N/A"} -{" "}
                      {student.course?.name || student.department || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Library Clearance Info */}
            {libraryInfo && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">
                    Library Clearance Required
                  </h3>
                </div>

                {libraryInfo.clearanceInfo && (
                  <div className="mb-4">
                    <p className="text-red-800 mb-2">
                      <strong>Book Return Requirement:</strong>
                    </p>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm">
                        Books Issued: {libraryInfo.clearanceInfo.totalIssued}
                      </p>
                      <p className="text-sm">
                        Books Returned:{" "}
                        {libraryInfo.clearanceInfo.totalReturned}
                      </p>
                      <p className="text-sm">
                        Return Rate:{" "}
                        {libraryInfo.clearanceInfo.returnPercentage}%
                      </p>
                      <p className="text-sm text-red-600">
                        Required: 80% (Need to return{" "}
                        {libraryInfo.clearanceInfo.shortfall} more books)
                      </p>
                    </div>
                  </div>
                )}

                {libraryInfo.feeInfo?.pendingBooks?.length > 0 && (
                  <div>
                    <p className="text-red-800 mb-2">
                      <strong>Pending Books:</strong>
                    </p>
                    <div className="bg-white p-3 rounded border">
                      {libraryInfo.feeInfo.pendingBooks.map(
                        (book: any, index: number) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-1"
                          >
                            <span className="text-sm">{book.title}</span>
                            <span className="text-sm text-red-600">
                              ₹{book.fine}
                            </span>
                          </div>
                        )
                      )}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-medium">
                          <span>Total Fine:</span>
                          <span className="text-red-600">
                            ₹{libraryInfo.feeInfo.totalFine}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <p className="text-red-800 flex-1">
                    Please clear your library dues before registering for this
                    semester.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowLibraryNOCModal(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Clear Library Dues
                  </button>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-md p-5 sm:p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Registration Details
              </h3>

              {/* Contact Information Update */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Update Contact Information (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.updatedInfo.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          updatedInfo: {
                            ...prev.updatedInfo,
                            phone: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.updatedInfo.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          updatedInfo: {
                            ...prev.updatedInfo,
                            address: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Subjects for Your Branch */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-2">
                  Subjects for Your Branch
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  You will be registered for the following subjects in Semester{" "}
                  {session.semester}
                </p>
                <div className="space-y-2">
                  {session.availableCourses.map((course, index) => (
                    <div
                      key={index}
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border ${
                        course.includes("(Theory)")
                          ? "bg-blue-50 border-blue-200"
                          : course.includes("(Practical)") ||
                            course.includes("(Lab)")
                          ? "bg-green-50 border-green-200"
                          : course.includes("(Project)")
                          ? "bg-purple-50 border-purple-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border-2 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <GraduationCap className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900 flex-1 text-left">
                        {course}
                      </span>
                      <CheckCircle className="w-5 h-5 text-green-600 self-start sm:self-auto" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> All subjects are mandatory for your
                    branch ({student?.course?.code}). You will be automatically
                    enrolled in all listed subjects.
                  </p>
                </div>
              </div>

              {errors.general && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}

              {errors.library && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-red-600 text-sm">{errors.library}</p>
                  <button
                    type="button"
                    onClick={() => setShowLibraryNOCModal(true)}
                    className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors flex items-center gap-1"
                  >
                    <BookOpen className="w-3 h-3" />
                    Clear Now
                  </button>
                </div>
              )}

              {/* Library Clearance Check for Required Semesters */}
              {session?.libraryRequirement &&
                !libraryInfo &&
                !libraryNOCReceived && (
                  <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-medium text-orange-900 mb-1">
                          Library Clearance Required
                        </h4>
                        <p className="text-orange-700 text-sm">
                          Semester {session.semester} requires library
                          clearance. Check your library status before
                          submitting.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowLibraryNOCModal(true)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        Check Library Status
                      </button>
                    </div>
                  </div>
                )}

              {/* Library NOC Received Confirmation */}
              {libraryNOCReceived && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-700 text-sm font-medium">
                      Library NOC received! You can now complete your
                      registration.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setStep("lookup")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium w-full sm:w-auto"
                >
                  <ArrowLeft className="w-5 h-5 inline mr-2" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.selectedCourses.length === 0}
                  className="w-full sm:flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  <DollarSign className="w-5 h-5" />
                  Pay Now - ₹{session?.feeAmount.toLocaleString()}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && paymentData && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Registration Successful!
            </h2>
            <p className="text-gray-600 mb-8">
              Your payment has been processed and registration is confirmed.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setShowReceipt(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                View Receipt
              </button>
              <br />
              <button
                onClick={() => navigate("/dashboard")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Library NOC Modal */}
      {showLibraryNOCModal && student && (
        <LibraryNOCModal
          isOpen={showLibraryNOCModal}
          onClose={() => setShowLibraryNOCModal(false)}
          universityRegNumber={student.universityRegNumber}
          studentName={student.name}
          onNOCReceived={handleNOCReceived}
        />
      )}

      {/* Payment Method Selector */}
      {showPaymentModal && student && session && (
        <PaymentMethodSelector
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={session.feeAmount}
          studentName={student.name}
          universityRegNumber={student.universityRegNumber}
          semester={session.semester}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Payment Receipt */}
      {showReceipt && paymentData && session && (
        <PaymentReceipt
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          paymentData={paymentData}
          subjects={formData.selectedCourses}
        />
      )}
    </div>
  );
};

export default StudentRegistrationForm;
