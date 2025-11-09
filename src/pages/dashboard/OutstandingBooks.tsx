import { useState, useEffect } from "react";
import {
  Search,
  BookOpen,
  User,
  Calendar,
  AlertTriangle,
  Clock,
  Mail,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { libraryAPI } from "../../services/api";
import { toast } from "sonner";

interface OutstandingBook {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  isbn: string;
  studentId: string;
  studentName: string;
  universityRegNumber: string;
  email: string;
  phone?: string;
  course: string;
  currentSemester: number;
  borrowDate: string;
  dueDate: string;
  status: "active" | "overdue";
  daysOverdue: number;
  fineAmount: number;
  dailyFine: number;
}

const OutstandingBooks = () => {
  const [outstandingBooks, setOutstandingBooks] = useState<OutstandingBook[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "overdue"
  >("all");
  const [sortBy, setSortBy] = useState<
    "dueDate" | "borrowDate" | "studentName" | "daysOverdue"
  >("dueDate");

  const loadOutstandingBooks = async () => {
    try {
      setLoading(true);
      console.log("📚 Loading outstanding books...");

      // This will call the backend API to get all borrowed books
      const response = await libraryAPI.getOutstandingBooks({
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        sortBy,
      });

      console.log("✅ Outstanding books loaded:", response);
      setOutstandingBooks(response.books || []);
    } catch (error) {
      console.error("❌ Failed to load outstanding books:", error);
      toast.error("Failed to load outstanding books", {
        description: "Please check if the backend server is running",
      });
      setOutstandingBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOutstandingBooks();
  }, [searchTerm, statusFilter, sortBy]);

  const filteredBooks = outstandingBooks.filter((book) => {
    const matchesSearch =
      book.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.universityRegNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (book: OutstandingBook) => {
    if (book.status === "overdue") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Overdue ({book.daysOverdue} days)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Clock className="w-3 h-3 mr-1" />
        Active
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDaysUntilDue = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <DashboardLayout title="Outstanding Books">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Outstanding Books Management
            </h1>
            <p className="text-gray-600 mt-1">
              Track all books currently borrowed by students
            </p>
          </div>
          <button
            onClick={loadOutstandingBooks}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search books, students, or reg numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="dueDate">Sort by Due Date</option>
                <option value="borrowDate">Sort by Borrow Date</option>
                <option value="studentName">Sort by Student Name</option>
                <option value="daysOverdue">Sort by Days Overdue</option>
              </select>
            </div>

            {/* Summary */}
            <div className="text-sm text-gray-600">
              <div>Total: {filteredBooks.length} books</div>
              <div className="text-red-600">
                Overdue:{" "}
                {filteredBooks.filter((b) => b.status === "overdue").length}
              </div>
            </div>
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Loading outstanding books...
              </span>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No outstanding books
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "No books match your search criteria."
                  : "All books have been returned."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Borrow Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fine Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBooks.map((book) => (
                    <tr key={book._id} className="hover:bg-gray-50">
                      {/* Book Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {book.bookTitle}
                            </div>
                            <div className="text-sm text-gray-500">
                              by {book.bookAuthor}
                            </div>
                            <div className="text-xs text-gray-400">
                              ISBN: {book.isbn}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Student Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-6 w-6 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {book.studentName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {book.universityRegNumber}
                            </div>
                            <div className="text-xs text-gray-400">
                              {book.course} - Sem {book.currentSemester}
                            </div>
                            {book.email && (
                              <div className="flex items-center mt-1">
                                <Mail className="w-3 h-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500">
                                  {book.email}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Borrow Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">
                              Borrowed: {formatDate(book.borrowDate)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Due: {formatDate(book.dueDate)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {book.status === "overdue"
                                ? `${book.daysOverdue} days overdue`
                                : `${Math.max(
                                    0,
                                    calculateDaysUntilDue(book.dueDate)
                                  )} days remaining`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(book)}
                      </td>

                      {/* Fine Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {book.fineAmount > 0 ? (
                            <div className="text-red-600 font-medium">
                              ₹{book.fineAmount}
                              <div className="text-xs text-gray-500">
                                (₹{book.dailyFine}/day)
                              </div>
                            </div>
                          ) : (
                            <div className="text-green-600">
                              No Fine
                              <div className="text-xs text-gray-500">
                                (₹{book.dailyFine}/day)
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {!loading && filteredBooks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredBooks.length}
              </div>
              <div className="text-sm text-blue-800">Total Outstanding</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {filteredBooks.filter((b) => b.status === "overdue").length}
              </div>
              <div className="text-sm text-red-800">Overdue Books</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                ₹{filteredBooks.reduce((sum, book) => sum + book.fineAmount, 0)}
              </div>
              <div className="text-sm text-yellow-800">Total Fines</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredBooks.filter((b) => b.status === "active").length}
              </div>
              <div className="text-sm text-green-800">Active Borrowings</div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OutstandingBooks;
