import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, User, AlertCircle } from "lucide-react";
import { authAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import OTPVerification from "../components/OTPVerification";

const Login = () => {
  const [selectedRole, setSelectedRole] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  // If already authenticated, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    if (token && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const roles = [
    { value: "student", label: "Student", icon: GraduationCap },
    { value: "teacher", label: "Teacher", icon: User },
    { value: "admin", label: "Admin", icon: User },
    { value: "library_admin", label: "Librarian", icon: User },
    { value: "staff", label: "Staff", icon: User },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log("🚀 Login form submitted with:", formData);

    try {
      console.log("📡 Making login API call...");
      const response = await authAPI.login(formData);
      console.log("✅ Login API response:", response);

      if (response.requiresOTP) {
        console.log("🔐 OTP required, showing OTP screen");
        setOtpEmail(formData.email);
        setMaskedEmail(response.email || formData.email);
        setShowOTP(true);
      } else if (response.token && response.user) {
        // Direct login (fallback)
        console.log("✅ Direct login successful, navigating to dashboard");
        login(response.token, response.user);

        // Small delay to ensure state updates before navigation
        await new Promise((resolve) => setTimeout(resolve, 100));

        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      console.error("❌ Login error:", err);
      console.error("❌ Error response:", err.response?.data);

      let errorMessage = "Login failed. Please try again.";

      if (err.message && err.message.includes("Cannot connect to server")) {
        errorMessage =
          "Cannot connect to server. Please make sure the backend is running.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.code === "ERR_NETWORK") {
        errorMessage =
          "Network error. Please check if the backend server is running on http://localhost:5000";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = async (token: string, user: any) => {
    console.log("✅ OTP Verified, logging in user:", user);
    login(token, user);

    // Small delay to ensure state updates before navigation
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("🚀 Navigating to dashboard...");
    navigate("/dashboard", { replace: true });
  };

  const handleBackToLogin = () => {
    setShowOTP(false);
    setOtpEmail("");
    setMaskedEmail("");
    setError("");
  };

  if (showOTP) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 pt-20">
        <OTPVerification
          email={otpEmail}
          maskedEmail={maskedEmail}
          onVerified={handleOTPVerified}
          onBack={handleBackToLogin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">
              Sign in to GCET Admissions Portal
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select your role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedRole === role.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Test Credentials Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Test Credentials:
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                <strong>Student:</strong> kamran@gcetsafapora.edu / password123
              </div>
              <div>
                <strong>Teacher:</strong> teacher@gcet.edu / teacher123
              </div>
              <div>
                <strong>Admin:</strong> admissions@gcet.edu / admissions123
              </div>
              <div>
                <strong>Librarian:</strong> library@gcet.edu / library123
              </div>
              <div>
                <strong>Principal:</strong> admin@gcet.edu / admin123
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Contact Admin
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
