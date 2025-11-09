import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  BookOpen,
  Search,
  Clock,
  AlertCircle,
  Calendar,
  CreditCard,
  CheckCircle,
  BookMarked,
  Filter,
  X,
  Package,
} from "lucide-react";
import { libraryAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

interface BorrowedBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  borrowDate: string;
  dueDate: string;
  status: "active" | "overdue" | "returned";
  lateFee?: number;
}

interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  subject: string;
  department: string;
  availableCopies: number;
  totalCopies: number;
  description?: string;
  category: string;
  dailyFine?: number;
  maxBorrowDays?: number;
}

const StudentLibrary: React.FC = () => {
  const { user } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [loading, setLoading] = useState(true);
  const [totalFines, setTotalFines] = useState(0);
  const [activeTab, setActiveTab] = useState<"borrowed" | "browse">("borrowed");
  
  // Borrow modal state
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.universityRegNumber]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load student's library info
      try {
        // Try the new endpoint first (uses auth token)
        const studentLibraryData = await libraryAPI.getMyLibraryInfo();
        console.log("Student library data:", studentLibraryData);

        // Map transactions to borrowed books
        const borrowedBooksData = (studentLibraryData.booksWithDetails || []).map(
          (item: any) => ({
            id: item.transaction._id,
            title: item.book?.title || "Unknown Book",
            author: item.book?.author || "Unknown Author",
            isbn: item.book?.isbn || "N/A",
            borrowDate: item.transaction.borrowDate,
            dueDate: item.transaction.dueDate,
            status: item.transaction.status,
            lateFee: item.currentFine || 0,
          })
        );

        setBorrowedBooks(borrowedBooksData);

        // Set total fines
        const totalFinesAmount =
          studentLibraryData.totalUnpaidFines + studentLibraryData.totalCurrentFines || 0;
        setTotalFines(totalFinesAmount);
      } catch (error) {
        console.error("Failed to load student library info:", error);
        // Continue to load books even if student data fails
        setBorrowedBooks([]);
        setTotalFines(0);
      }

      // Load all books from library
      const booksResponse = await libraryAPI.getBooks({ limit: 100 });
      setAllBooks(booksResponse.books || []);
    } catch (error) {
      console.error("Failed to load library data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = allBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || book.category === selectedCategory;

    const matchesDepartment =
      selectedDepartment === "all" || book.department === selectedDepartment;

    return matchesSearch && matchesCategory && matchesDepartment;
  });

  const activeBorrowedBooks = borrowedBooks.filter((b) => b.status !== "returned");
  const overdueBooks = borrowedBooks.filter((b) => b.status === "overdue");

  const handleBorrowClick = (book: Book) => {
    if (book.availableCopies <= 0) {
      toast.error("This book is currently out of stock");
      return;
    }
    setSelectedBook(book);
    setShowBorrowModal(true);
  };

  const handleConfirmBorrow = async () => {
    if (!selectedBook) return;

    try {
      setBorrowing(true);
      const response = await libraryAPI.borrowBook(selectedBook._id);
      
      toast.success("Book borrowed successfully!", {
        description: `Due date: ${new Date(response.transaction.dueDate).toLocaleDateString()}`,
      });

      // Refresh data
      await loadData();
      
      // Close modal
      setShowBorrowModal(false);
      setSelectedBook(null);
      
      // Switch to borrowed tab to show the new book
      setActiveTab("borrowed");
    } catch (error: any) {
      console.error("Borrow error:", error);
      const errorMessage = error.response?.data?.error || "Failed to borrow book. Please try again.";
      toast.error(errorMessage);
    } finally {
      setBorrowing(false);
    }
  };

  return (
    <DashboardLayout title="Library">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <BookMarked className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">
                {activeBorrowedBooks.length}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">Borrowed Books</h3>
            <p className="text-sm text-gray-600">Currently with you</p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">
                {overdueBooks.length}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">Overdue</h3>
            <p className="text-sm text-gray-600">Need to return</p>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between mb-3">
              <CreditCard className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold text-red-600">
                ₹{totalFines}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">Pending Fines</h3>
            <p className="text-sm text-gray-600">Late fees</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {allBooks.length}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">Available Books</h3>
            <p className="text-sm text-gray-600">In library</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("borrowed")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "borrowed"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              My Borrowed Books
            </button>
            <button
              onClick={() => setActiveTab("browse")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "browse"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Browse Library
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "borrowed" ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Borrowed Books ({activeBorrowedBooks.length})
                </h3>

                {activeBorrowedBooks.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      You haven't borrowed any books yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeBorrowedBooks.map((book) => {
                      const isOverdue = book.status === "overdue";
                      const daysUntilDue = Math.ceil(
                        (new Date(book.dueDate).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      );

                      return (
                        <div
                          key={book.id}
                          className={`border rounded-lg p-4 ${
                            isOverdue
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <BookOpen
                                  className={`w-10 h-10 ${
                                    isOverdue ? "text-red-600" : "text-blue-600"
                                  } flex-shrink-0 mt-1`}
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                    {book.title}
                                  </h4>
                                  <p className="text-gray-600 mb-2">{book.author}</p>
                                  <p className="text-sm text-gray-500">
                                    ISBN: {book.isbn}
                                  </p>

                                  <div className="mt-3 flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Calendar className="w-4 h-4 text-gray-500" />
                                      <span className="text-gray-700">
                                        Borrowed: {new Date(book.borrowDate).toLocaleDateString()}
                                      </span>
                                    </div>

                                    <div
                                      className={`flex items-center gap-2 text-sm ${
                                        isOverdue ? "text-red-600" : "text-gray-700"
                                      }`}
                                    >
                                      <Clock className="w-4 h-4" />
                                      <span>
                                        Due: {new Date(book.dueDate).toLocaleDateString()}
                                        {!isOverdue && daysUntilDue >= 0 && (
                                          <span className="ml-1 text-gray-500">
                                            ({daysUntilDue} days left)
                                          </span>
                                        )}
                                      </span>
                                    </div>

                                    {book.lateFee && (
                                      <div className="flex items-center gap-2 text-sm text-red-600 font-semibold">
                                        <CreditCard className="w-4 h-4" />
                                        <span>Late Fee: ₹{book.lateFee}</span>
                                      </div>
                                    )}
                                  </div>

                                  {isOverdue && (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-100 px-3 py-2 rounded-lg">
                                      <AlertCircle className="w-4 h-4" />
                                      <span>
                                        Overdue! Please return to the library immediately
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {totalFines > 0 && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-900 mb-1">
                          Outstanding Fines: ₹{totalFines}
                        </h4>
                        <p className="text-sm text-red-700">
                          Please visit the library office to clear your pending fines.
                          You won't be able to borrow new books until fines are paid.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by title, author, or subject..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Filters:
                      </span>
                    </div>

                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      <option value="academic">Academic</option>
                      <option value="reference">Reference</option>
                      <option value="fiction">Fiction</option>
                    </select>

                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Departments</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electrical Engineering">
                        Electrical Engineering
                      </option>
                      <option value="Mechanical Engineering">
                        Mechanical Engineering
                      </option>
                      <option value="Civil Engineering">Civil Engineering</option>
                    </select>
                  </div>
                </div>

                {/* Books Grid */}
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Showing {filteredBooks.length} books
                  </p>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading books...</p>
                    </div>
                  ) : filteredBooks.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No books found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredBooks.map((book) => (
                        <div
                          key={book._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
                        >
                          <div className="flex items-start gap-3">
                            <BookOpen className="w-10 h-10 text-blue-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {book.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {book.author}
                              </p>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                  {book.subject}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {book.department}
                                </span>
                              </div>
                              {book.description && (
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                  {book.description}
                                </p>
                              )}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm">
                                    {book.availableCopies > 0 ? (
                                      <span className="flex items-center gap-1 text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                        {book.availableCopies} available
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-red-600">
                                        <X className="w-4 h-4" />
                                        Out of stock
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Borrow Button */}
                                <button
                                  onClick={() => handleBorrowClick(book)}
                                  disabled={book.availableCopies <= 0 || totalFines > 0}
                                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                                    book.availableCopies <= 0 || totalFines > 0
                                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      : "bg-blue-600 text-white hover:bg-blue-700"
                                  }`}
                                  title={totalFines > 0 ? "Clear pending fines to borrow books" : ""}
                                >
                                  <Package className="w-4 h-4" />
                                  {book.availableCopies <= 0 ? "Out of Stock" : "Borrow Book"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Borrow Confirmation Modal */}
      {showBorrowModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Book Borrow
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {selectedBook.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  by {selectedBook.author}
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {selectedBook.subject}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {selectedBook.department}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Available Copies:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedBook.availableCopies}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Borrow Period:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedBook.maxBorrowDays || 30} days
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Daily Fine (if late):</span>
                  <span className="font-semibold text-red-600">
                    ₹{selectedBook.dailyFine || 10}/day
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important Notes:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>You can collect the book from the library after confirmation</li>
                      <li>Please return the book before the due date to avoid fines</li>
                      <li>Maximum {selectedBook.maxBorrowDays || 30} days borrow period</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBorrowModal(false);
                  setSelectedBook(null);
                }}
                disabled={borrowing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBorrow}
                disabled={borrowing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {borrowing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Borrowing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Borrow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentLibrary;

