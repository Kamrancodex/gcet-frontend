import React, { useRef } from "react";
import { CheckCircle, Download, Printer, X } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PaymentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: {
    paymentId: string;
    receiptNumber: string;
    timestamp: string;
    studentName: string;
    universityRegNumber: string;
    semester: number;
    amount: number;
    currency: string;
    status: string;
    last4: string;
    brand: string;
  };
  subjects: string[];
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  isOpen,
  onClose,
  paymentData,
  subjects,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`GCET_Receipt_${paymentData.receiptNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between p-4 border-b bg-green-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Payment Successful!
              </h2>
              <p className="text-sm text-gray-600">
                Your registration is confirmed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 print:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="p-8 bg-white">
          {/* College Header */}
          <div className="text-center border-b pb-6 mb-6">
            <h1 className="text-3xl font-bold text-blue-900">
              Government College of Engineering and Technology
            </h1>
            <p className="text-gray-600 mt-2">GCET Safapora, Kashmir</p>
            <p className="text-sm text-gray-500">www.gcetsrinagar.edu.in</p>
          </div>

          {/* Receipt Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              PAYMENT RECEIPT
            </h2>
            <p className="text-lg text-blue-600 font-semibold mt-2">
              Receipt No: {paymentData.receiptNumber}
            </p>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">
                Student Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{paymentData.studentName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Registration Number:</span>
                  <p className="font-medium">
                    {paymentData.universityRegNumber}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Semester:</span>
                  <p className="font-medium">Semester {paymentData.semester}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">
                Payment Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Payment ID:</span>
                  <p className="font-medium font-mono text-xs">
                    {paymentData.paymentId}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Date & Time:</span>
                  <p className="font-medium">
                    {new Date(paymentData.timestamp).toLocaleString("en-IN", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Payment Method:</span>
                  <p className="font-medium capitalize">
                    {paymentData.brand} ending in {paymentData.last4}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium text-green-600 capitalize">
                    {paymentData.status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects Enrolled */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">
              Enrolled Subjects (Semester {paymentData.semester})
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 gap-2">
                {subjects.map((subject, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span>{subject}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Amount Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Registration Fee</p>
                <p className="text-xs text-gray-500">
                  Semester {paymentData.semester} - Academic Year 2024-25
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-900">
                  ₹{paymentData.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">Amount Paid</p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              Important Notes:
            </h4>
            <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
              <li>
                This is a computer-generated receipt and does not require a
                signature
              </li>
              <li>Keep this receipt for your records and future reference</li>
              <li>
                This receipt serves as proof of payment for Semester{" "}
                {paymentData.semester} registration
              </li>
              <li>
                For any queries, contact the accounts office or email:
                accounts@gcet.edu
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t pt-4">
            <p>This is an official receipt issued by GCET Safapora</p>
            <p className="mt-1">
              Generated on {new Date().toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 bg-gray-50 border-t print:hidden">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          ${
            receiptRef.current
              ? `
            #receipt-content,
            #receipt-content * {
              visibility: visible;
            }
            #receipt-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          `
              : ""
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentReceipt;












