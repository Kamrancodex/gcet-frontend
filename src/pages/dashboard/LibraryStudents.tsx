import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  User,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  X,
  Calendar,
  Mail,
  Phone,
  GraduationCap,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { libraryAPI } from "../../services/api";

const LibraryStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [filterType, setFilterType] = useState("");
  
  // Student details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const departments = ["CSE", "EEE", "CIVIL", "MECH", "ECE"];
  const filterOptions = [
    { value: "", label: "All Students" },
    { value: "hasOverdueBooks", label: "Has Overdue Books" },
    { value: "hasPendingFines", label: "Has Pending Fines" },
    { value: "nocPending", label: "NOC Pending" },
    { value: "nocApproved", label: "NOC Approved" },
  ];

  useEffect(() => {
    loadStudents();
  }, [selectedDepartment, filterType, searchTerm]);

  const loadStudents = async () => {
    try {
      console.log("👥 Loading students with filters:", {
        selectedDepartment,
        filterType,
        searchTerm,
      });
      const params: any = {
        search: searchTerm || undefined,
        department: selectedDepartment || undefined,
        limit: 100,
      };

      // Add specific filters
      if (filterType === "hasOverdueBooks") params.hasOverdueBooks = true;
      if (filterType === "hasPendingFines") params.hasPendingFines = true;
      if (filterType === "nocPending") params.nocStatus = "pending";
      if (filterType === "nocApproved") params.nocStatus = "approved";

      const response = await libraryAPI.getStudents(params);
      console.log("✅ Students loaded:", response);
      setStudents(response.students || []);
    } catch (error) {
      console.error("❌ Failed to load students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = async (student: any) => {
    try {
      setSelectedStudent(student);
      setShowDetailsModal(true);
      setLoadingDetails(true);
      
      console.log("📊 Fetching details for student:", student.universityRegNumber);
      
      // Fetch detailed student library record
      const details = await libraryAPI.getStudentDetails(student.universityRegNumber);
      console.log("✅ Student details loaded:", details);
      
      setStudentDetails(details);
    } catch (error) {
      console.error("❌ Failed to load student details:", error);
      alert("Failed to load student details. Please try again.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedStudent(null);
    setStudentDetails(null);
  };

  return (
    <DashboardLayout title="Student Records">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Library Student Records
          </h1>
          <div className="text-sm text-gray-600">
            Total Students: {students.length}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            <div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDepartment("");
                  setFilterType("");
                }}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-600">
                  Loading student records...
                </span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Books Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fines
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NOC Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No students found</p>
                        <p className="text-sm">
                          Try adjusting your search filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    students.map((student: any) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <User className="w-10 h-10 text-blue-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.universityRegNumber}
                              </div>
                              <div className="text-xs text-gray-400">
                                {student.department} • Semester{" "}
                                {student.currentSemester}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                              <span className="text-sm text-gray-900">
                                {student.pendingBooks?.length || 0} books
                              </span>
                            </div>
                            {student.pendingBooks?.some(
                              (book: any) => book.status === "overdue"
                            ) && (
                              <div className="flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                                <span className="text-xs text-red-600">
                                  {
                                    student.pendingBooks.filter(
                                      (book: any) => book.status === "overdue"
                                    ).length
                                  }{" "}
                                  overdue
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.pendingBooks?.reduce(
                            (total: number, book: any) =>
                              total + (book.lateFee || 0),
                            0
                          ) > 0 ? (
                            <div className="text-sm text-red-600 font-medium">
                              ₹
                              {student.pendingBooks.reduce(
                                (total: number, book: any) =>
                                  total + (book.lateFee || 0),
                                0
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-green-600">₹0</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              student.libraryNOCStatus || "pending"
                            )}`}
                          >
                            {student.libraryNOCStatus === "approved" && (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {student.libraryNOCStatus === "pending" && (
                              <AlertTriangle className="w-3 h-3 mr-1" />
                            )}
                            {student.libraryNOCStatus || "pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleViewDetails(student)}
                              className="text-blue-600 hover:text-blue-900 text-sm hover:underline"
                            >
                              View Details
                            </button>
                            {student.pendingBooks?.length > 0 && (
                              <button className="text-green-600 hover:text-green-900 text-sm hover:underline">
                                Process Return
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {students.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Student Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {students.length}
                </div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {
                    students.filter((s: any) =>
                      s.pendingBooks?.some(
                        (book: any) => book.status === "overdue"
                      )
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">With Overdue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    students.filter(
                      (s: any) =>
                        s.pendingBooks?.reduce(
                          (total: number, book: any) =>
                            total + (book.lateFee || 0),
                          0
                        ) > 0
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">With Fines</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {
                    students.filter(
                      (s: any) => s.libraryNOCStatus === "approved"
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">NOC Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ₹
                  {students.reduce(
                    (total: number, student: any) =>
                      total +
                      (student.pendingBooks?.reduce(
                        (bookTotal: number, book: any) =>
                          bookTotal + (book.lateFee || 0),
                        0
                      ) || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Fines</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-white" />
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {selectedStudent.universityRegNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDetailsModal}
                className="text-white hover:bg-blue-800 rounded-lg p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : studentDetails ? (
                <div className="space-y-6">
                  {/* Student Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Student Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {studentDetails.student.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {studentDetails.student.course?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Library ID: {studentDetails.student.libraryId || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            studentDetails.student.libraryNOCStatus || "pending"
                          )}`}
                        >
                          NOC: {studentDetails.student.libraryNOCStatus || "pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Library Summary */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {studentDetails.libraryRecord.summary.totalBooksIssued}
                      </div>
                      <div className="text-xs text-blue-800">Total Issued</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        {studentDetails.libraryRecord.summary.currentlyBorrowed}
                      </div>
                      <div className="text-xs text-yellow-800">Currently Borrowed</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">
                        {studentDetails.libraryRecord.summary.overdueBooks}
                      </div>
                      <div className="text-xs text-red-800">Overdue</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        ₹{studentDetails.libraryRecord.summary.grandTotalFines}
                      </div>
                      <div className="text-xs text-green-800">Total Fines</div>
                    </div>
                  </div>

                  {/* Currently Borrowed Books */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Currently Borrowed Books ({studentDetails.libraryRecord.activeBooks.length})
                    </h4>
                    {studentDetails.libraryRecord.activeBooks.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No books currently borrowed
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {studentDetails.libraryRecord.activeBooks.map((item: any, index: number) => (
                          <div
                            key={index}
                            className={`border rounded-lg p-4 ${
                              item.daysOverdue > 0
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900">
                                  {item.book?.title || "Unknown Book"}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  by {item.book?.author || "Unknown Author"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  ISBN: {item.book?.isbn || "N/A"}
                                </p>
                              </div>
                              {item.daysOverdue > 0 && (
                                <div className="text-right">
                                  <div className="text-sm font-bold text-red-600">
                                    {item.daysOverdue} days overdue
                                  </div>
                                  <div className="text-xs text-red-600">
                                    Fine: ₹{item.currentFine}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Borrowed: {new Date(item.transaction.borrowDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Due: {new Date(item.transaction.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Transaction History */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Recent Transaction History
                    </h4>
                    {studentDetails.libraryRecord.allTransactions.slice(0, 5).length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No transaction history
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {studentDetails.libraryRecord.allTransactions.slice(0, 5).map((tx: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between border-b border-gray-200 pb-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {tx.bookId}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(tx.borrowDate).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                tx.status === "returned"
                                  ? "bg-green-100 text-green-800"
                                  : tx.status === "overdue"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Failed to load student details
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LibraryStudents;




