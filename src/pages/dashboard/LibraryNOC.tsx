import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  UserSearch,
  BookOpen,
  CreditCard,
  Download,
  Calendar,
  Check,
  IndianRupee,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { libraryAPI } from "../../services/api";
import { toast } from "sonner";

const LibraryNOC = () => {
  // States for Generate NOC
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [searchedStudent, setSearchedStudent] = useState<any>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [returningBook, setReturningBook] = useState<string | null>(null);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [generatingNOC, setGeneratingNOC] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  // New functions for Generate NOC tab
  const handleStudentSearch = async () => {
    if (!studentSearch.trim()) {
      toast.error("Please enter student name or email");
      return;
    }

    setSearchingStudent(true);
    try {
      console.log("🔍 Searching for student:", studentSearch);
      
      // Search students by name or email
      const response = await libraryAPI.getStudents({
        search: studentSearch.trim(),
        limit: 1,
      });

      if (response.students && response.students.length > 0) {
        const student = response.students[0];
        setSearchedStudent(student);
        
        // Fetch detailed student information
        const details = await libraryAPI.getStudentDetails(student.universityRegNumber);
        setStudentDetails(details);
        
        toast.success("Student found!");
        console.log("✅ Student details loaded:", details);
      } else {
        toast.error("Student not found");
        setSearchedStudent(null);
        setStudentDetails(null);
      }
    } catch (error) {
      console.error("❌ Student search error:", error);
      toast.error("Failed to search student");
      setSearchedStudent(null);
      setStudentDetails(null);
    } finally {
      setSearchingStudent(false);
    }
  };

  const handleReturnBook = async (transaction: any, book: any) => {
    setReturningBook(book.bookId);
    try {
      console.log("📚 Returning book:", {
        bookId: transaction.bookId,
        studentId: transaction.studentId,
        returnDate,
        transaction
      });
      
      // Use the transaction's bookId and studentId (not the book object's _id)
      await libraryAPI.returnBook(transaction.bookId, {
        studentId: transaction.studentId,
        returnDate: new Date(returnDate),
        condition: "good",
      });

      toast.success("Book marked as returned successfully!");
      
      // Refresh student details
      const details = await libraryAPI.getStudentDetails(searchedStudent.universityRegNumber);
      setStudentDetails(details);
      
      console.log("✅ Book returned, student details refreshed");
    } catch (error: any) {
      console.error("❌ Return book error:", error);
      toast.error(error.response?.data?.error || "Failed to return book");
    } finally {
      setReturningBook(null);
    }
  };

  const handleCreatePayment = async () => {
    if (!studentDetails) return;

    const totalFines = studentDetails.libraryRecord.summary.grandTotalFines;
    if (totalFines === 0) {
      toast.info("No outstanding fines to pay");
      return;
    }

    setProcessingPayment(true);
    try {
      // Use the studentId from the first active transaction to ensure consistency
      const studentId = studentDetails.libraryRecord.activeBooks[0]?.transaction?.studentId 
        || studentDetails.student.studentId 
        || searchedStudent.studentId;

      console.log("💳 Processing payment:", {
        studentId,
        totalFines,
        student: searchedStudent
      });
      
      await libraryAPI.payFines({
        studentId: studentId,
        amount: totalFines,
        paymentMethod: "cash",
      });

      toast.success(`Payment of ₹${totalFines} processed successfully!`);
      
      // Refresh student details
      const details = await libraryAPI.getStudentDetails(searchedStudent.universityRegNumber);
      setStudentDetails(details);
      
      console.log("✅ Payment processed, student details refreshed");
    } catch (error: any) {
      console.error("❌ Payment error:", error);
      toast.error(error.response?.data?.error || "Failed to process payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  const canGenerateNOC = () => {
    if (!studentDetails) return false;
    
    const { currentlyBorrowed, grandTotalFines } = studentDetails.libraryRecord.summary;
    return currentlyBorrowed === 0 && grandTotalFines === 0;
  };

  const handleGenerateNOC = async () => {
    if (!canGenerateNOC()) {
      toast.error("Student must return all books and clear all fines first");
      return;
    }

    setGeneratingNOC(true);
    try {
      console.log("📄 Generating NOC for:", searchedStudent.universityRegNumber);
      
      // Generate NOC document
      const nocData = {
        studentName: searchedStudent.name,
        universityRegNumber: searchedStudent.universityRegNumber,
        course: studentDetails.student.course?.name || "N/A",
        department: searchedStudent.course?.code || "N/A",
        issueDate: new Date().toLocaleDateString("en-IN"),
        libraryId: studentDetails.student.libraryId || "N/A",
      };

      // Create and download NOC document
      generateNOCDocument(nocData);
      
      // Update backend NOC status
      await libraryAPI.generateNOC({
        universityRegNumber: searchedStudent.universityRegNumber,
        clearanceType: "full_clearance",
        notes: "NOC generated after full clearance",
      });

      toast.success("NOC generated and downloaded successfully!");
      console.log("✅ NOC generated");
      
      // Reset search
      setSearchedStudent(null);
      setStudentDetails(null);
      setStudentSearch("");
    } catch (error: any) {
      console.error("❌ NOC generation error:", error);
      toast.error(error.response?.data?.error || "Failed to generate NOC");
    } finally {
      setGeneratingNOC(false);
    }
  };

  const generateNOCDocument = (data: any) => {
    // Create NOC document HTML
    const nocHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Library No Objection Certificate</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #000;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
          }
          .college-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .address {
            font-size: 14px;
            color: #555;
          }
          .title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            text-decoration: underline;
            margin: 30px 0;
          }
          .content {
            text-align: justify;
            font-size: 16px;
            margin: 30px 0;
          }
          .details {
            margin: 20px 0;
            padding-left: 40px;
          }
          .details-row {
            margin: 10px 0;
            display: flex;
          }
          .details-label {
            font-weight: bold;
            width: 200px;
          }
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            text-align: center;
          }
          .seal-box {
            width: 150px;
            height: 150px;
            border: 2px solid #000;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #1e40af;
            margin: 0 auto 20px;
          }
          .date {
            margin-top: 40px;
            font-weight: bold;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">GCET</div>
          <div class="college-name">GOVERNMENT COLLEGE OF ENGINEERING AND TECHNOLOGY</div>
          <div class="address">Safapora, Ganderbal, Jammu & Kashmir - 191201</div>
          <div class="address">Phone: +91-XXXXXXXXXX | Email: library@gcet.edu</div>
        </div>

        <div class="title">LIBRARY NO OBJECTION CERTIFICATE</div>

        <div class="date">Date: ${data.issueDate}</div>

        <div class="content">
          <p>This is to certify that the following student has returned all library books and cleared all pending dues. There are no objections from the Library Department.</p>
        </div>

        <div class="details">
          <div class="details-row">
            <span class="details-label">Student Name:</span>
            <span>${data.studentName}</span>
          </div>
          <div class="details-row">
            <span class="details-label">University Reg. No.:</span>
            <span>${data.universityRegNumber}</span>
          </div>
          <div class="details-row">
            <span class="details-label">Course:</span>
            <span>${data.course}</span>
          </div>
          <div class="details-row">
            <span class="details-label">Department:</span>
            <span>${data.department}</span>
          </div>
          <div class="details-row">
            <span class="details-label">Library ID:</span>
            <span>${data.libraryId}</span>
          </div>
        </div>

        <div class="content">
          <p>The student has fulfilled all library obligations and is hereby granted clearance for all academic and administrative purposes.</p>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div>
              <div class="seal-box">OFFICIAL<br/>SEAL</div>
              <div>_______________________</div>
              <div style="margin-top: 10px;">Librarian's Signature</div>
              <div>GCET Library</div>
            </div>
          </div>
          <div class="signature-box">
            <div>
              <div style="height: 150px;"></div>
              <div>_______________________</div>
              <div style="margin-top: 10px;">Head of Department</div>
              <div>${data.department}</div>
            </div>
          </div>
        </div>

        <div style="margin-top: 60px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 20px;">
          This is a computer-generated certificate and is valid without signature. For verification, contact GCET Library.
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([nocHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NOC_${data.universityRegNumber}_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Also open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(nocHTML);
      printWindow.document.close();
    }
  };

  return (
    <DashboardLayout title="NOC Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Library NOC Management
            </h1>
            <p className="text-gray-600 mt-1">
              Generate and manage library clearance certificates
            </p>
          </div>
          <FileText className="w-12 h-12 text-blue-600" />
        </div>

        {/* Generate NOC Section */}
        {(
          <div className="space-y-6">
            {/* Student Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserSearch className="w-5 h-5" />
                Search Student
              </h3>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter student name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleStudentSearch()}
                  />
                </div>
                <button
                  onClick={handleStudentSearch}
                  disabled={searchingStudent || !studentSearch.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {searchingStudent ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Student Details Section */}
            {searchedStudent && studentDetails && (
              <div className="space-y-6">
                {/* Student Info Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Student Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-base font-medium text-gray-900">{searchedStudent.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Registration Number</p>
                      <p className="text-base font-medium text-gray-900">{searchedStudent.universityRegNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-base font-medium text-gray-900">{searchedStudent.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Course</p>
                      <p className="text-base font-medium text-gray-900">
                        {studentDetails.student.course?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Library Status Cards */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-600">
                        {studentDetails.libraryRecord.summary.currentlyBorrowed}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">Currently Borrowed</h4>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                      <span className="text-2xl font-bold text-red-600">
                        {studentDetails.libraryRecord.summary.overdueBooks}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">Overdue Books</h4>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <IndianRupee className="w-8 h-8 text-yellow-600" />
                      <span className="text-2xl font-bold text-yellow-600">
                        ₹{studentDetails.libraryRecord.summary.grandTotalFines}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">Outstanding Fines</h4>
                  </div>
                </div>

                {/* Borrowed Books List */}
                {studentDetails.libraryRecord.activeBooks.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Books to Return ({studentDetails.libraryRecord.activeBooks.length})
                      </h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {studentDetails.libraryRecord.activeBooks.map((item: any, index: number) => (
                        <div
                          key={index}
                          className={`border rounded-lg p-4 ${
                            item.daysOverdue > 0 ? "border-red-300 bg-red-50" : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">
                                {item.book?.title || "Unknown Book"}
                              </h5>
                              <p className="text-sm text-gray-600">
                                by {item.book?.author || "Unknown Author"}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                                <span>Due: {new Date(item.transaction.dueDate).toLocaleDateString()}</span>
                                {item.daysOverdue > 0 && (
                                  <span className="text-red-600 font-medium">
                                    {item.daysOverdue} days overdue - Fine: ₹{item.currentFine}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleReturnBook(item.transaction, item.book)}
                              disabled={returningBook === item.book?.bookId || returningBook === item.transaction?.bookId}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              {(returningBook === item.book?.bookId || returningBook === item.transaction?.bookId) ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Returning...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>Mark Returned</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Section */}
                {studentDetails.libraryRecord.summary.grandTotalFines > 0 && (
                  <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Outstanding Fines
                        </h3>
                        <p className="text-3xl font-bold text-yellow-600">
                          ₹{studentDetails.libraryRecord.summary.grandTotalFines}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Student must clear all fines before NOC generation
                        </p>
                      </div>
                      <button
                        onClick={handleCreatePayment}
                        disabled={processingPayment}
                        className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {processingPayment ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            <span>Process Payment</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* NOC Generation Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    NOC Generation Status
                  </h3>
                  {canGenerateNOC() ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900">
                            Student is eligible for NOC
                          </p>
                          <p className="text-sm text-green-700">
                            All books returned and fines cleared
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleGenerateNOC}
                        disabled={generatingNOC}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {generatingNOC ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5" />
                            <span>Generate & Download NOC</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-900">
                            Student is NOT eligible for NOC
                          </p>
                          <p className="text-sm text-red-700 mt-1">
                            Please complete the following actions:
                          </p>
                          <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                            {studentDetails.libraryRecord.summary.currentlyBorrowed > 0 && (
                              <li>Return {studentDetails.libraryRecord.summary.currentlyBorrowed} borrowed book(s)</li>
                            )}
                            {studentDetails.libraryRecord.summary.grandTotalFines > 0 && (
                              <li>Clear ₹{studentDetails.libraryRecord.summary.grandTotalFines} in outstanding fines</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!searchedStudent && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <UserSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Student Selected
                </h3>
                <p className="text-gray-600">
                  Search for a student by name or email to generate their NOC
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LibraryNOC;




