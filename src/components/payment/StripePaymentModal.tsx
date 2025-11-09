import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CreditCard, Loader2, X } from "lucide-react";

const stripePromise = loadStripe(
  "pk_test_51SAWHnEVDjJpw1ZUjwZeJnrq3KlLWILZCBFXklIZFGx00xz7fsONTuIMLy6kSVa9ysqTidqMXRANJ4ZKoB2jkwCE000ZHtT5bH"
);

interface PaymentFormProps {
  amount: number;
  studentName: string;
  universityRegNumber: string;
  semester: number;
  onSuccess: (paymentData: any) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  studentName,
  universityRegNumber,
  semester,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Create payment method
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            name: studentName,
          },
        });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Simulate payment success (in production, you'd call your backend)
      const paymentData = {
        paymentId: `pay_${Date.now()}`,
        paymentMethodId: paymentMethod.id,
        amount: amount,
        currency: "INR",
        status: "succeeded",
        receiptNumber: `GCET-${Date.now()}`,
        timestamp: new Date().toISOString(),
        studentName,
        universityRegNumber,
        semester,
        last4: paymentMethod.card?.last4 || "****",
        brand: paymentMethod.card?.brand || "card",
      };

      onSuccess(paymentData);
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
              <span className="font-semibold text-gray-900">Total Amount:</span>
              <span className="text-xl font-bold text-blue-600">
                ₹{amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <CreditCard className="w-4 h-4 inline mr-2" />
          Card Details
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💳 Test Card: 4242 4242 4242 4242 | Exp: Any future date | CVC: Any 3
          digits
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>Pay ₹{amount.toLocaleString()}</>
          )}
        </button>
      </div>
    </form>
  );
};

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  studentName: string;
  universityRegNumber: string;
  semester: number;
  onPaymentSuccess: (paymentData: any) => void;
}

const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  studentName,
  universityRegNumber,
  semester,
  onPaymentSuccess,
}) => {
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
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <p className="text-gray-600 text-sm mt-1">
            Secure payment powered by Stripe
          </p>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm
            amount={amount}
            studentName={studentName}
            universityRegNumber={universityRegNumber}
            semester={semester}
            onSuccess={onPaymentSuccess}
            onCancel={onClose}
          />
        </Elements>
      </div>
    </div>
  );
};

export default StripePaymentModal;












