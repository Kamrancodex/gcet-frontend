import { Link, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PublicNoticesModal from "./PublicNoticesModal";

export default function Navbar() {
  const navigate = useNavigate();
  const [showNoticesModal, setShowNoticesModal] = useState(false);

  let authData;
  try {
    authData = useAuth();
  } catch (error) {
    console.error("🧭 Navbar: Failed to get auth context:", error);
    // Fallback for when auth context is not available
    return (
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="container-narrow">
          <div className="mt-4 rounded-full glass px-4 py-2 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-sky-500/10 ring-1 ring-sky-500/30 grid place-items-center text-sky-600 font-bold">
                G
              </span>
              <span className="text-slate-900 font-semibold tracking-wide">
                GCET
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden sm:inline text-slate-600 hover:text-slate-900 text-sm"
              >
                Login
              </Link>
              <a
                href="#apply"
                className="inline-flex items-center gap-2 rounded-full bg-sky-600 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-500 transition"
              >
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const { user, logout, isAuthenticated } = authData;

  const handleLogout = () => {
    logout();
  };

  // Get role-specific dashboard path
  const getDashboardPath = (role: string) => {
    switch (role) {
      case "library_admin":
        return "/dashboard/library";
      case "student":
      case "teacher":
        return "/dashboard";
      case "admin":
      case "admissions_admin":
      default:
        return "/dashboard";
    }
  };

  // Handle navigation with authentication check
  const handleAuthenticatedNavigation = (path: string) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  // Handle library click
  const handleLibraryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/dashboard/library" } });
    } else {
      // Route based on user role
      if (user?.role === "library_admin") {
        navigate("/dashboard/library/books");
      } else {
        navigate("/dashboard/library");
      }
    }
  };

  // Handle dashboard click
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      navigate("/login", { state: { from: "/dashboard" } });
    } else {
      navigate(getDashboardPath(user.role));
    }
  };

  // Handle social click
  const handleSocialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleAuthenticatedNavigation("/social");
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="container-narrow">
          <div className="mt-4 rounded-full glass px-4 py-2 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-sky-500/10 ring-1 ring-sky-500/30 grid place-items-center text-sky-600 font-bold">
                G
              </span>
              <span className="text-slate-900 font-semibold tracking-wide">
                GCET
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-slate-600 text-sm">
              <Link to="/programs" className="hover:text-slate-900">
                Programs
              </Link>
              <Link to="/faculty" className="hover:text-slate-900">
                Faculty
              </Link>
              <Link to="/campus" className="hover:text-slate-900">
                Campus
              </Link>
              <button
                onClick={() => setShowNoticesModal(true)}
                className="hover:text-slate-900"
              >
                Notices
              </button>
              <button onClick={handleLibraryClick} className="hover:text-slate-900">
                Library
              </button>
              <button onClick={handleSocialClick} className="hover:text-slate-900">
                Social
              </button>
              <button
                onClick={handleDashboardClick}
                className="hover:text-slate-900"
              >
                Dashboard
              </button>
            </nav>
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={getDashboardPath(user.role)}
                    className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden sm:flex items-center gap-1 text-slate-600 hover:text-slate-900 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline text-slate-600 hover:text-slate-900 text-sm"
                >
                  Login
                </Link>
              )}
              <a
                href="#apply"
                className="inline-flex items-center gap-2 rounded-full bg-sky-600 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-500 transition"
              >
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Notices Modal */}
      <PublicNoticesModal
        isOpen={showNoticesModal}
        onClose={() => setShowNoticesModal(false)}
      />
    </>
  );
}
