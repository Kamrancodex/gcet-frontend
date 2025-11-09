import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PublicNoticesModal from "./PublicNoticesModal";

export default function Navbar() {
  const navigate = useNavigate();
  const [showNoticesModal, setShowNoticesModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
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
    setMobileMenuOpen(false);
  };

  // Handle social click
  const handleSocialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleAuthenticatedNavigation("/social");
    setMobileMenuOpen(false);
  };

  const handleNotices = () => {
    setShowNoticesModal(true);
    setMobileMenuOpen(false);
  };

  const authActionButton = (
    <>
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
          onClick={() => setMobileMenuOpen(false)}
        >
          Login
        </Link>
      )}
    </>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="container-narrow">
          <div className="mt-4 rounded-full glass px-4 py-2 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
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
                onClick={handleNotices}
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
              <button
                className="inline-flex items-center justify-center p-2 rounded-full bg-white text-slate-600 hover:text-slate-900 md:hidden"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              {authActionButton}
              <a
                href="#apply"
                className="inline-flex items-center gap-2 rounded-full bg-sky-600 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-500 transition"
              >
                Apply Now
              </a>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div
              className="fixed inset-0 bg-slate-900/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-x-4 top-20 z-50 rounded-3xl bg-white shadow-xl p-6 space-y-4 max-h-[70vh] overflow-y-auto border border-slate-100">
              <nav className="flex flex-col gap-3 text-slate-700 text-base">
                <Link
                  to="/programs"
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Programs</span>
                </Link>
                <Link
                  to="/faculty"
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Faculty</span>
                </Link>
                <Link
                  to="/campus"
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Campus</span>
                </Link>
                <button
                  onClick={handleNotices}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 text-left"
                >
                  <span>Notices</span>
                </button>
                <button
                  onClick={handleLibraryClick}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 text-left"
                >
                  <span>Library</span>
                </button>
                <button
                  onClick={handleSocialClick}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 text-left"
                >
                  <span>Social</span>
                </button>
                <button
                  onClick={handleDashboardClick}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 text-left"
                >
                  <span>Dashboard</span>
                </button>
              </nav>

              <div className="border-t border-slate-200 pt-4 space-y-3">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-3 px-3">
                      <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-white font-semibold hover:bg-sky-500 transition"
                  >
                    <User className="w-4 h-4" />
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Notices Modal */}
      <PublicNoticesModal
        isOpen={showNoticesModal}
        onClose={() => setShowNoticesModal(false)}
      />
    </>
  );
}
