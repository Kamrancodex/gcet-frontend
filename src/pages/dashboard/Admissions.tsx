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
} from "lucide-react";

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
  availableCourses?: string[];
  libraryRequirement?: boolean; // true for 5th & 7th semester
  totalRegistrations?: number;
  completedRegistrations?: number;
  pendingRegistrations?: number;
  totalApplications?: number;
  approvedApplications?: number;
  rejectedApplications?: number;
  pendingApplications?: number;
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
  course?: string;
  semester?: number;
  appliedAt?: string;
}

const Admissions: React.FC = () => {
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
      console.error("Failed to load admissions data:", err);
      setError("Failed to load admissions data. Please try again.");

      // Mock data fallback
      setRegistrationSessions([
        {
          _id: "1",
          sessionId: "ADM2024-SEM3",
          semester: 3,
          academicYear: "2024-25",
          startDate: "2024-08-01T00:00:00Z",
          endDate: "2024-08-31T23:59:59Z",
          feeAmount: 45000,
          feeDeadline: "2024-09-15T23:59:59Z",
          isActive: true,
          totalApplications: 156,
          approvedApplications: 89,
          rejectedApplications: 12,
          pendingApplications: 55,
          createdBy: "Admissions Admin",
          createdAt: "2024-07-15T10:00:00Z",
          updatedAt: "2024-08-01T10:00:00Z",
        },
        {
          _id: "2",
          sessionId: "ADM2024-SEM1",
          semester: 1,
          academicYear: "2024-25",
          startDate: "2024-06-01T00:00:00Z",
          endDate: "2024-06-30T23:59:59Z",
          feeAmount: 50000,
          feeDeadline: "2024-07-15T23:59:59Z",
          isActive: false,
          totalApplications: 234,
          approvedApplications: 178,
          rejectedApplications: 23,
          pendingApplications: 33,
          createdBy: "Admissions Admin",
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
          currentSemester: 2,
          registeringForSemester: 3,
          selectedCourses: ["Data Structures", "Digital Logic"],
          status: "pending",
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
          selectedCourses: ["Engineering Mechanics", "Thermodynamics"],
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
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "enrolled":
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

  const filteredRegistrations = registrations.filter((app) => {
    const matchesSemester =
      selectedSemester === "all" ||
      app.registeringForSemester.toString() === selectedSemester;
    const matchesStatus =
      selectedStatus === "all" || app.status === selectedStatus;
    const matchesSearch =
      searchTerm === "" ||
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.registrationId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSemester && matchesStatus && matchesSearch;
  });

  return (
    <>
      <DashboardLayout title="Admissions Management">
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
                  Admissions Management
                </h2>
                <p className="text-gray-600">
                  Manage admission sessions, applications, and student
                  enrollment.
                </p>
              </div>
              <button
                onClick={handleOpenRegistration}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Open New Admission
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("sessions")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "sessions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Admission Sessions
              </button>
              <button
                onClick={() => setActiveTab("registrations")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "registrations"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Applications
              </button>
            </nav>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Loading admissions data...
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-3">
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
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${
                            session.isActive
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {session.isActive ? "ACTIVE" : "CLOSED"}
                        </span>
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

                      {/* Statistics */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {session.totalApplications}
                          </div>
                          <div className="text-xs text-blue-600">Total</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {session.approvedApplications}
                          </div>
                          <div className="text-xs text-green-600">Approved</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded-lg">
                          <div className="text-lg font-bold text-yellow-600">
                            {session.pendingApplications}
                          </div>
                          <div className="text-xs text-yellow-600">Pending</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded-lg">
                          <div className="text-lg font-bold text-red-600">
                            {session.rejectedApplications}
                          </div>
                          <div className="text-xs text-red-600">Rejected</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Created by {session.createdBy}
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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
                    No admission sessions found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first admission session to get started.
                  </p>
                  <button
                    onClick={handleOpenRegistration}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Open New Admission
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {!loading && !error && activeTab === "registrations" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        placeholder="Search applications..."
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
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="enrolled">Enrolled</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Applications Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course & Semester
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fee Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRegistrations.map((application) => (
                        <tr key={application._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {application.studentName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {application.email}
                              </div>
                              <div className="text-sm text-gray-500">
                                {application.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {application.course}
                            </div>
                            <div className="text-sm text-gray-500">
                              Semester {application.semester}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                application.status
                              )}`}
                            >
                              {application.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getFeeStatusColor(
                                application.feeStatus
                              )}`}
                            >
                              {application.feeStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(
                              application.appliedAt || application.registeredAt
                            )}
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

                {filteredRegistrations.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No applications found
                    </h3>
                    <p className="text-gray-600">
                      No applications match your current filters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Open Admission Modal */}
      <OpenRegistrationModal
        isOpen={isOpenRegistrationModalOpen}
        onClose={() => setIsOpenRegistrationModalOpen(false)}
        onRegistrationCreated={handleRegistrationCreated}
      />
    </>
  );
};

export default Admissions;
