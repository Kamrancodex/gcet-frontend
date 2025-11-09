import React, { useState } from "react";
import { CreditCard, Shield, X } from "lucide-react";
import StripePaymentModal from "./StripePaymentModal";
import RazorpayPaymentModal from "./RazorpayPaymentModal";

interface PaymentMethodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  studentName: string;
  universityRegNumber: string;
  semester: number;
  onPaymentSuccess: (paymentData: any) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  isOpen,
  onClose,
  amount,
  studentName,
  universityRegNumber,
  semester,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<
    "stripe" | "razorpay" | null
  >(null);

  const handleMethodSelect = (method: "stripe" | "razorpay") => {
    setSelectedMethod(method);
  };

  const handleBack = () => {
    setSelectedMethod(null);
  };

  if (!isOpen) return null;

  // Show selected payment modal
  if (selectedMethod === "stripe") {
    return (
      <StripePaymentModal
        isOpen={true}
        onClose={() => {
          setSelectedMethod(null);
          onClose();
        }}
        amount={amount}
        studentName={studentName}
        universityRegNumber={universityRegNumber}
        semester={semester}
        onPaymentSuccess={onPaymentSuccess}
      />
    );
  }

  if (selectedMethod === "razorpay") {
    return (
      <RazorpayPaymentModal
        isOpen={true}
        onClose={() => {
          setSelectedMethod(null);
          onClose();
        }}
        amount={amount}
        studentName={studentName}
        universityRegNumber={universityRegNumber}
        semester={semester}
        onPaymentSuccess={onPaymentSuccess}
      />
    );
  }

  // Show payment method selection
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Choose Payment Method
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Select your preferred payment gateway
          </p>
        </div>

        {/* Payment Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Registration Fee</p>
              <p className="text-xs text-gray-500">Semester {semester}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-900">
                ₹{amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method Options */}
        <div className="space-y-4">
          {/* Razorpay Option */}
          <button
            onClick={() => handleMethodSelect("razorpay")}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 mb-1">Razorpay</h3>
                <p className="text-sm text-gray-600">
                  UPI, Cards, Net Banking, Wallets
                </p>
                <div className="flex gap-1 mt-2">
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                    💳 Cards
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                    📱 UPI
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                    🏦 Banking
                  </span>
                </div>
              </div>
              <Shield className="w-5 h-5 text-green-600" />
            </div>
          </button>

          {/* Stripe Option */}
          <button
            onClick={() => handleMethodSelect("stripe")}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 mb-1">Stripe</h3>
                <p className="text-sm text-gray-600">International Cards</p>
                <div className="flex gap-1 mt-2">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                    💳 Credit Card
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                    💳 Debit Card
                  </span>
                </div>
              </div>
              <Shield className="w-5 h-5 text-green-600" />
            </div>
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-green-600 mt-0.5" />
            <p className="text-xs text-gray-600">
              All payments are secure and encrypted. Your card details are never
              stored on our servers.
            </p>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;












