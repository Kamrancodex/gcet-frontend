import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "../services/api";

interface OTPVerificationProps {
  email: string;
  maskedEmail: string;
  onVerified: (token: string, user: any) => void;
  onBack: () => void;
  devOtp?: string;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  maskedEmail,
  onVerified,
  onBack,
  devOtp,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [latestDevOtp, setLatestDevOtp] = useState<string | undefined>(devOtp);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (devOtp) {
      setLatestDevOtp(devOtp);
      toast.info(
        `Test Mode: Use OTP ${devOtp}. We're students without SMTP access, so enter this code to continue.`,
        { duration: 6000 }
      );
    } else {
      toast.info(
        "Test Mode: OTP sent. Check backend logs if no email arrives (SMTP disabled for students).",
        { duration: 6000 }
      );
    }
  }, [devOtp]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every((digit) => digit !== "") && !isLoading) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authAPI.verifyOTP({ email, otp: code });
      onVerified(response.token, response.user);
    } catch (err: any) {
      setError(err.response?.data?.error || "Verification failed");
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      const firstInput = document.getElementById("otp-0");
      firstInput?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authAPI.resendOTP({ email });
      setTimeLeft(600); // Reset timer
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      const firstInput = document.getElementById("otp-0");
      firstInput?.focus();

      if (response.devOtp) {
        setLatestDevOtp(response.devOtp);
        toast.success(
          `New OTP generated: ${response.devOtp}. Remember we're in test mode without SMTP.`,
          { duration: 6000 }
        );
      } else {
        toast.success(
          "New OTP generated. Check backend logs since email delivery is disabled in test mode.",
          { duration: 6000 }
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to resend OTP");
      toast.error(
        err.response?.data?.error ||
          "Could not resend OTP. Please try again or contact the admin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Check your email
        </h2>
        <p className="text-gray-600">
          We've sent a 6-digit verification code to
          <br />
          <span className="font-semibold">{maskedEmail}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg p-3 text-center">
          {latestDevOtp ? (
            <>
              Test Phase: Use OTP{" "}
              <span className="font-semibold">{latestDevOtp}</span>. We're
              students without SMTP access yet, so codes appear here instead of
              email.
            </>
          ) : (
            <>Test Phase: SMTP is disabled. Check backend logs for your OTP.</>
          )}
        </div>

        {/* OTP Input */}
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              disabled={isLoading}
            />
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Code expires in {formatTime(timeLeft)}</span>
        </div>

        {/* Resend Button */}
        <div className="text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Resend code
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Didn't receive the code? You can resend in {formatTime(timeLeft)}
            </p>
          )}
        </div>

        {/* Manual Verify Button */}
        <button
          onClick={() => handleVerify()}
          disabled={isLoading || otp.some((digit) => digit === "")}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>

        {/* Back Button */}
        <button
          onClick={onBack}
          disabled={isLoading}
          className="w-full text-gray-600 hover:text-gray-800 py-2 font-medium transition-colors"
        >
          Back to login
        </button>
      </div>
    </motion.div>
  );
};

export default OTPVerification;
