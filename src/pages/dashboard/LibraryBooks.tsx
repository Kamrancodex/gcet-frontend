import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  BookOpen,
  Edit,
  Trash2,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { libraryAPI } from "../../services/api";
import { toast } from "sonner";

const LibraryBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSubBlock, setSelectedSubBlock] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "academic",
    subject: "",
    department: "CSE",
    subBlock: "",
    academicLevel: "undergraduate",
    semester: [1],
    price: 0,
    publisher: "",
    publicationYear: new Date().getFullYear(),
    pages: 0,
    description: "",
    totalCopies: 1,
    location: "",
    shelfNumber: "",
    dailyFine: 10,
    maxBorrowDays: 30,
  });

  const departments = ["CSE", "EEE", "CIVIL", "MECH", "ECE", "GENERAL"];

  useEffect(() => {
    loadBooks();
  }, [selectedDepartment, selectedSubBlock, searchTerm]);

  const loadBooks = async () => {
    try {
      console.log("📚 Loading books with filters:", {
        selectedDepartment,
        selectedSubBlock,
        searchTerm,
      });
      const response = await libraryAPI.getBooks({
        department: selectedDepartment || undefined,
        subBlock: selectedSubBlock || undefined,
        search: searchTerm || undefined,
        limit: 50,
      });
      console.log("✅ Books loaded:", response);
      setBooks(response.books || []);
    } catch (error) {
      console.error("❌ Failed to load books:", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      isbn: "",
      category: "academic",
      subject: "",
      department: "CSE",
      subBlock: "",
      academicLevel: "undergraduate",
      semester: [1],
      price: 0,
      publisher: "",
      publicationYear: new Date().getFullYear(),
      pages: 0,
      description: "",
      totalCopies: 1,
      location: "",
      shelfNumber: "",
      dailyFine: 10,
      maxBorrowDays: 30,
    });
  };

  const handleAddBook = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditBook = (book: any) => {
    setEditingBook(book);
    setFormData({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      category: book.category || "academic",
      subject: book.subject || "",
      department: book.department || "CSE",
      subBlock: book.subBlock || "",
      academicLevel: book.academicLevel || "undergraduate",
      semester: book.semester || [1],
      price: book.price || 0,
      publisher: book.publisher || "",
      publicationYear: book.publicationYear || new Date().getFullYear(),
      pages: book.pages || 0,
      description: book.description || "",
      totalCopies: book.totalCopies || 1,
      location: book.location || "",
      shelfNumber: book.shelfNumber || "",
      dailyFine: book.dailyFine || 10,
      maxBorrowDays: book.maxBorrowDays || 30,
    });
    setShowEditModal(true);
  };

  const handleDeleteBook = (book: any) => {
    setDeletingBook(book);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingBook) return;

    setIsSubmitting(true);
    try {
      console.log("🗑️ Deleting book ID:", deletingBook._id);
      console.log("🗑️ Deleting book title:", deletingBook.title);
      console.log("🗑️ Full book object:", deletingBook);

      // Call the real delete API
      await libraryAPI.deleteBook(deletingBook._id);

      // Reload the books list
      await loadBooks();

      toast.success(`Book "${deletingBook.title}" deleted successfully`, {
        description: "The book has been permanently removed from the library",
      });

      setShowDeleteModal(false);
      setDeletingBook(null);
    } catch (error: any) {
      console.error("❌ Failed to delete book:", error);

      if (error.response?.data?.error) {
        toast.error("Failed to delete book", {
          description: error.response.data.error,
        });
      } else {
        toast.error("Failed to delete book", {
          description: error.message || "An unexpected error occurred",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.author || !formData.isbn) {
        toast.error("Please fill in all required fields", {
          description: "Title, Author, and ISBN are required",
        });
        return;
      }

      // Validate field lengths and formats
      if (formData.isbn.length < 10) {
        toast.error("Invalid ISBN", {
          description: "ISBN must be at least 10 characters long",
        });
        return;
      }

      if (formData.description.length < 10) {
        toast.error("Description too short", {
          description: "Description must be at least 10 characters long",
        });
        return;
      }

      if (formData.semester.length === 0) {
        toast.error("Semester selection required", {
          description: "Please select at least one semester",
        });
        return;
      }

      if (showEditModal && editingBook) {
        // Update existing book
        console.log("Updating book:", editingBook._id, formData);
        await libraryAPI.updateBook(editingBook._id, formData);
        toast.success(`Book "${formData.title}" updated successfully`, {
          description: "The book information has been updated",
        });
      } else {
        // Add new book
        console.log("Adding new book:", formData);
        await libraryAPI.addBook(formData);
        toast.success(`Book "${formData.title}" added successfully`, {
          description: "The book has been added to the library",
        });
        await loadBooks();
      }

      setShowAddModal(false);
      setShowEditModal(false);
      setEditingBook(null);
      resetForm();
    } catch (error: any) {
      console.error("❌ Failed to save book:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err: any) => err.msg)
          .join(", ");
        toast.error("Validation Error", {
          description: errorMessages,
        });
      } else if (error.response?.data?.error) {
        toast.error("Failed to save book", {
          description: error.response.data.error,
        });
      } else {
        toast.error("Failed to save book", {
          description: error.message || "An unexpected error occurred",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Manage Books">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Library Book Management
          </h1>
          <button
            onClick={handleAddBook}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Book
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search books..."
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

            {/* Sub-Block Filter */}
            <div>
              <input
                type="text"
                placeholder="Sub-block (e.g., Block-A)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedSubBlock}
                onChange={(e) => setSelectedSubBlock(e.target.value)}
              />
            </div>

            {/* Reset Filters */}
            <div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDepartment("");
                  setSelectedSubBlock("");
                }}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-600">Loading books...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Copies
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No books found</p>
                        <p className="text-sm">
                          Try adjusting your search filters or add some books to
                          get started.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    books.map((book: any) => (
                      <tr key={book._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <BookOpen className="w-10 h-10 text-blue-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {book.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {book.author} • {book.isbn}
                              </div>
                              <div className="text-xs text-gray-400">
                                {book.subBlock}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              book.department === "CSE"
                                ? "bg-blue-100 text-blue-800"
                                : book.department === "EEE"
                                ? "bg-yellow-100 text-yellow-800"
                                : book.department === "CIVIL"
                                ? "bg-green-100 text-green-800"
                                : book.department === "MECH"
                                ? "bg-purple-100 text-purple-800"
                                : book.department === "ECE"
                                ? "bg-pink-100 text-pink-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {book.department}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {book.availableCopies}/{book.totalCopies}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              book.status === "available"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {book.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleEditBook(book)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Edit book"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete book"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
        {books.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Collection Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {books.length}
                </div>
                <div className="text-sm text-gray-600">Total Books</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {books.filter((b: any) => b.status === "available").length}
                </div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {books.filter((b: any) => b.status === "borrowed").length}
                </div>
                <div className="text-sm text-gray-600">Borrowed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {books.reduce(
                    (sum: number, book: any) => sum + book.totalCopies,
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Copies</div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Book Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {showEditModal ? "Edit Book" : "Add New Book"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingBook(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter book title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter author name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ISBN *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.isbn}
                      onChange={(e) =>
                        setFormData({ ...formData, isbn: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter ISBN (minimum 10 digits)"
                      minLength={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publisher *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.publisher}
                      onChange={(e) =>
                        setFormData({ ...formData, publisher: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter publisher"
                    />
                  </div>
                </div>

                {/* Category and Department */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="fiction">Fiction</option>
                      <option value="non-fiction">Non-Fiction</option>
                      <option value="academic">Academic</option>
                      <option value="reference">Reference</option>
                      <option value="magazine">Magazine</option>
                      <option value="journal">Journal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Level *
                    </label>
                    <select
                      required
                      value={formData.academicLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academicLevel: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="undergraduate">Undergraduate</option>
                      <option value="postgraduate">Postgraduate</option>
                      <option value="reference">Reference</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  {/* Relevant Semesters */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relevant Semesters *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <label key={sem} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.semester.includes(sem)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  semester: [...formData.semester, sem].sort(),
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  semester: formData.semester.filter(
                                    (s) => s !== sem
                                  ),
                                });
                              }
                            }}
                            className="mr-2"
                          />
                          Sem {sem}
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Select which semesters this book is relevant for
                    </p>
                  </div>
                </div>

                {/* Subject and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter subject"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub-Block *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subBlock}
                      onChange={(e) =>
                        setFormData({ ...formData, subBlock: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Block-A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Library location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shelf Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.shelfNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shelfNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Shelf number"
                    />
                  </div>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publication Year *
                    </label>
                    <input
                      type="number"
                      required
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.publicationYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          publicationYear: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pages *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.pages}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pages: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Copies *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.totalCopies}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalCopies: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter book description (minimum 10 characters)"
                    minLength={10}
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingBook(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {showEditModal ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {showEditModal ? "Update Book" : "Add Book"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Book
                  </h3>
                </div>

                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete this book?
                </p>

                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="font-medium text-gray-900">
                    {deletingBook.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    by {deletingBook.author}
                  </p>
                  <p className="text-xs text-gray-500">
                    ISBN: {deletingBook.isbn}
                  </p>
                </div>

                <p className="text-sm text-red-600 mb-6">
                  This action cannot be undone. The book will be permanently
                  removed from the library system.
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingBook(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Book
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LibraryBooks;
