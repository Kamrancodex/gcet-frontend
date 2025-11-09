import React, { useState, useEffect } from "react";
import { Loader2, X, CreditCard, Shield } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  studentName: string;
  universityRegNumber: string;
  semester: number;
  onPaymentSuccess: (paymentData: any) => void;
}

const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  studentName,
  universityRegNumber,
  semester,
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      setError("Payment gateway is loading. Please wait...");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const options = {
        key: "rzp_test_RPRutOcmpgY1IM", // Razorpay test key
        amount: amount * 100, // Amount in paise (multiply by 100)
        currency: "INR",
        name: "GCET Safapora",
        description: `Semester ${semester} Registration Fee`,
        image: "https://gcetsrinagar.edu.in/images/logo.png", // College logo
        prefill: {
          name: studentName,
          email: `${universityRegNumber
            .toLowerCase()
            .replace(/\//g, "_")}@student.gcet.edu`,
          contact: "",
        },
        notes: {
          student_name: studentName,
          university_reg_number: universityRegNumber,
          semester: semester.toString(),
          purpose: "Semester Registration",
        },
        theme: {
          color: "#2563eb", // Blue color
        },
        handler: function (response: any) {
          // Payment success
          const paymentData = {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id || `order_${Date.now()}`,
            signature: response.razorpay_signature || "",
            amount: amount,
            currency: "INR",
            status: "succeeded",
            receiptNumber: `GCET-RZP-${Date.now()}`,
            timestamp: new Date().toISOString(),
            studentName,
            universityRegNumber,
            semester,
            last4: "****", // Razorpay doesn't expose card details
            brand: "razorpay",
            method: response.method || "card",
          };

          onPaymentSuccess(paymentData);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response: any) {
        setError(
          response.error.description || "Payment failed. Please try again."
        );
        setLoading(false);
      });

      razorpay.open();
    } catch (err: any) {
      setError(
        err.message || "Failed to initialize payment. Please try again."
      );
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Complete Payment
            </h2>
          </div>
          <p className="text-gray-600 text-sm">
            Secure payment powered by Razorpay
          </p>
        </div>

        {/* Payment Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Student Name:</span>
              <span className="font-medium">{studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Registration Number:</span>
              <span className="font-medium">{universityRegNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Semester:</span>
              <span className="font-medium">Semester {semester}</span>
            </div>
            <div className="border-t border-blue-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">
                  Total Amount:
                </span>
                <span className="text-xl font-bold text-blue-600">
                  ₹{amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-gray-700">
              Accepted Payment Methods
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            <span className="px-2 py-1 bg-white rounded border">
              💳 Credit Card
            </span>
            <span className="px-2 py-1 bg-white rounded border">
              💳 Debit Card
            </span>
            <span className="px-2 py-1 bg-white rounded border">
              🏦 Net Banking
            </span>
            <span className="px-2 py-1 bg-white rounded border">📱 UPI</span>
            <span className="px-2 py-1 bg-white rounded border">
              💰 Wallets
            </span>
          </div>
        </div>

        {/* Test Mode Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-yellow-800">
            <strong>Test Mode:</strong> This is a test transaction. No real
            money will be charged.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading || !scriptLoaded}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay ₹{amount.toLocaleString()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RazorpayPaymentModal;












