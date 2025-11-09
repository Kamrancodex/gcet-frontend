import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import OpenRegistrationModal from "../../components/dashboard/OpenRegistrationModal";
import { registrationAPI } from "../../services/api";
import {
  Plus,
  Search,
  Calendar,
  Users,
  GraduationCap,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  School,
  Download,
  BookOpen,
} from "lucide-react";
import SessionDetailsDrawer from "../../components/dashboard/SessionDetailsDrawer";

interface RegistrationSession {
  _id: string;
  sessionId: string;
  semester: number;
  academicYear: string;
  startDate: string;
  endDate: string;
  feeAmount: number;
  feeDeadline: string;
  isActive: boolean;
  availableCourses: string[];
  libraryRequirement: boolean; // true for 5th & 7th semester
  totalRegistrations: number;
  completedRegistrations: number;
  pendingRegistrations: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Registration {
  _id: string;
  registrationId: string;
  studentId: string;
  universityRegNumber: string;
  studentName: string;
  email: string;
  phone: string;
  currentSemester: number;
  registeringForSemester: number;
  selectedCourses: string[];
  status: "pending" | "completed" | "payment_pending" | "library_pending";
  feeStatus: "pending" | "paid" | "partial" | "overdue";
  libraryCleared: boolean;
  registeredAt: string;
  sessionId: string;
}

const SemesterRegistration: React.FC = () => {
  const [registrationSessions, setRegistrationSessions] = useState<
    RegistrationSession[]
  >([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpenRegistrationModalOpen, setIsOpenRegistrationModalOpen] =
    useState(false);

  // Filters
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"sessions" | "registrations">(
    "sessions"
  );
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const [openSessionSemester, setOpenSessionSemester] = useState<number>(0);
  const [editingSession, setEditingSession] = useState<RegistrationSession | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load registration sessions and registrations
      const [sessionsResponse, registrationsResponse] = await Promise.all([
        registrationAPI.getSessions(),
        registrationAPI.getRegistrations(),
      ]);

      setRegistrationSessions(sessionsResponse || []);
      setRegistrations(registrationsResponse || []);
    } catch (err) {
      console.error("Failed to load registration data:", err);
      setError("Failed to load registration data. Please try again.");

      // Mock data fallback
      setRegistrationSessions([
        {
          _id: "1",
          sessionId: "REG2024-SEM5",
          semester: 5,
          academicYear: "2024-25",
          startDate: "2024-08-01T00:00:00Z",
          endDate: "2024-08-31T23:59:59Z",
          feeAmount: 45000,
          feeDeadline: "2024-09-15T23:59:59Z",
          isActive: true,
          availableCourses: [
            "Computer Networks",
            "Database Management",
            "Software Engineering",
            "Operating Systems",
          ],
          libraryRequirement: true, // 5th semester requires library clearance
          totalRegistrations: 156,
          completedRegistrations: 89,
          pendingRegistrations: 67,
          createdBy: "Registration Admin",
          createdAt: "2024-07-15T10:00:00Z",
          updatedAt: "2024-08-01T10:00:00Z",
        },
        {
          _id: "2",
          sessionId: "REG2024-SEM3",
          semester: 3,
          academicYear: "2024-25",
          startDate: "2024-06-01T00:00:00Z",
          endDate: "2024-06-30T23:59:59Z",
          feeAmount: 42000,
          feeDeadline: "2024-07-15T23:59:59Z",
          isActive: false,
          availableCourses: [
            "Data Structures",
            "Digital Logic",
            "Mathematics III",
            "Physics II",
          ],
          libraryRequirement: false, // 3rd semester doesn't require library clearance
          totalRegistrations: 234,
          completedRegistrations: 201,
          pendingRegistrations: 33,
          createdBy: "Registration Admin",
          createdAt: "2024-05-15T10:00:00Z",
          updatedAt: "2024-06-30T10:00:00Z",
        },
      ]);

      setRegistrations([
        {
          _id: "1",
          registrationId: "REG2024001",
          studentId: "GCET20240001",
          universityRegNumber: "GCET/2022/CSE/001",
          studentName: "Rahul Sharma",
          email: "rahul.sharma@student.gcet.edu",
          phone: "+91 9876543210",
          currentSemester: 4,
          registeringForSemester: 5,
          selectedCourses: ["Computer Networks", "Database Management"],
          status: "library_pending",
          feeStatus: "pending",
          libraryCleared: false,
          registeredAt: "2024-08-15T14:30:00Z",
          sessionId: "1",
        },
        {
          _id: "2",
          registrationId: "REG2024002",
          studentId: "GCET20240002",
          universityRegNumber: "GCET/2022/ME/002",
          studentName: "Priya Patel",
          email: "priya.patel@student.gcet.edu",
          phone: "+91 9876543211",
          currentSemester: 2,
          registeringForSemester: 3,
          selectedCourses: ["Data Structures", "Digital Logic"],
          status: "completed",
          feeStatus: "paid",
          libraryCleared: true,
          registeredAt: "2024-08-12T09:15:00Z",
          sessionId: "2",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRegistration = () => {
    setIsOpenRegistrationModalOpen(true);
  };

  const handleRegistrationCreated = (newSession: RegistrationSession) => {
    setRegistrationSessions((prev) => [newSession, ...prev]);
    setIsOpenRegistrationModalOpen(false);
  };

  const handleEditSession = (session: RegistrationSession) => {
    setEditingSession(session);
    setIsOpenRegistrationModalOpen(true);
  };

  const handleSessionUpdated = (updatedSession: RegistrationSession) => {
    setRegistrationSessions((prev) =>
      prev.map((session) =>
        session._id === updatedSession._id ? updatedSession : session
      )
    );
    setIsOpenRegistrationModalOpen(false);
    setEditingSession(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "library_pending":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "payment_pending":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-50 border-green-200";
      case "overdue":
        return "text-red-600 bg-red-50 border-red-200";
      case "partial":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSemester =
      selectedSemester === "all" ||
      reg.registeringForSemester.toString() === selectedSemester;
    const matchesStatus =
      selectedStatus === "all" || reg.status === selectedStatus;
    const matchesSearch =
      searchTerm === "" ||
      reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.universityRegNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reg.registrationId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSemester && matchesStatus && matchesSearch;
  });

  return (
    <>
      <DashboardLayout title="Semester Registration Management">
        <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <School className="w-8 h-8 text-blue-600" />
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                    Govt College of Engineering and Technology Safapora
                  </h1>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Semester Registration Management
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Manage semester registrations for existing students.
                </p>
              </div>
              <button
                onClick={handleOpenRegistration}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl w-full lg:w-auto"
              >
                <Plus className="w-5 h-5" />
                Open Registration
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex gap-6 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab("sessions")}
                className={`py-2 px-1 whitespace-nowrap border-b-2 font-medium text-sm ${
                  activeTab === "sessions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Registration Sessions
              </button>
              <button
                onClick={() => setActiveTab("registrations")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "registrations"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Student Registrations
              </button>
            </nav>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Loading registration data...
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">Error Loading Data</h3>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-2 text-sm text-red-700 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {!loading && !error && activeTab === "sessions" && (
            <div className="space-y-6">
              {/* Sessions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {registrationSessions.map((session) => (
                  <div
                    key={session._id}
                    className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-lg ${
                      session.isActive
                        ? "border-green-200 bg-green-50/30"
                        : "border-gray-200"
                    }`}
                  >
                    {/* Session Header */}
                    <div className="p-5 sm:p-6 pb-4 sm:pb-5">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              session.isActive
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Semester {session.semester}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {session.academicYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${
                              session.isActive
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            {session.isActive ? "ACTIVE" : "CLOSED"}
                          </span>
                          {session.libraryRequirement && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              Library Required
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Session Details */}
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(session.startDate)} -{" "}
                            {formatDate(session.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>Fee: {formatCurrency(session.feeAmount)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            Fee Deadline: {formatDate(session.feeDeadline)}
                          </span>
                        </div>
                      </div>

                      {/* Available Courses */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Available Courses:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {session.availableCourses
                            .slice(0, 2)
                            .map((course, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                              >
                                {course}
                              </span>
                            ))}
                          {session.availableCourses.length > 2 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{session.availableCourses.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {session.totalRegistrations}
                          </div>
                          <div className="text-xs text-blue-600">Total</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {session.completedRegistrations}
                          </div>
                          <div className="text-xs text-green-600">
                            Completed
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-gray-500">
                          Created by {session.createdBy}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              setOpenSessionId(session._id);
                              setOpenSessionSemester(session.semester);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditSession(session)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {registrationSessions.length === 0 && (
                <div className="text-center py-12">
                  <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No registration sessions found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first registration session to get started.
                  </p>
                  <button
                    onClick={handleOpenRegistration}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Open Registration
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Registrations Tab */}
          {!loading && !error && activeTab === "registrations" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search registrations..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Semesters</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem.toString()}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="payment_pending">Payment Pending</option>
                      <option value="library_pending">Library Pending</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Registrations Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registration Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fee Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Library Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRegistrations.map((registration) => (
                        <tr key={registration._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {registration.studentName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {registration.universityRegNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                {registration.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Semester {registration.currentSemester} →{" "}
                              {registration.registeringForSemester}
                            </div>
                            <div className="text-sm text-gray-500">
                              {registration.selectedCourses.length} courses
                              selected
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(registration.registeredAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                registration.status
                              )}`}
                            >
                              {registration.status
                                .replace("_", " ")
                                .toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getFeeStatusColor(
                                registration.feeStatus
                              )}`}
                            >
                              {registration.feeStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {registration.libraryCleared ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                              <span className="ml-2 text-sm text-gray-600">
                                {registration.libraryCleared
                                  ? "Cleared"
                                  : "Pending"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {filteredRegistrations.map((registration) => (
                    <div key={registration._id} className="p-4 space-y-3">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {registration.studentName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {registration.universityRegNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {registration.email}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                        <div>
                          <p className="font-medium text-gray-700">Semester</p>
                          <p>
                            {registration.currentSemester} →{" "}
                            {registration.registeringForSemester}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Registered</p>
                          <p>{formatDate(registration.registeredAt)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Status</p>
                          <span
                            className={`inline-flex mt-1 px-2 py-1 text-[11px] font-medium rounded-full border ${getStatusColor(
                              registration.status
                            )}`}
                          >
                            {registration.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Fee Status</p>
                          <span
                            className={`inline-flex mt-1 px-2 py-1 text-[11px] font-medium rounded-full border ${getFeeStatusColor(
                              registration.feeStatus
                            )}`}
                          >
                            {registration.feeStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {registration.libraryCleared ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span>
                            {registration.libraryCleared ? "Cleared" : "Pending"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredRegistrations.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No registrations found
                    </h3>
                    <p className="text-gray-600">
                      No registrations match your current filters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Open Registration Modal */}
      <OpenRegistrationModal
        isOpen={isOpenRegistrationModalOpen}
        onClose={() => {
          setIsOpenRegistrationModalOpen(false);
          setEditingSession(null);
        }}
        onRegistrationCreated={editingSession ? handleSessionUpdated : handleRegistrationCreated}
        editSession={editingSession || undefined}
      />

      {/* Session Details Drawer */}
      {openSessionId && (
        <SessionDetailsDrawer
          isOpen={!!openSessionId}
          onClose={() => setOpenSessionId(null)}
          sessionId={openSessionId}
          semester={openSessionSemester}
        />
      )}
    </>
  );
};

export default SemesterRegistration;
