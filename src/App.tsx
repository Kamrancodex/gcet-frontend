import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SemesterRegistration from "./pages/dashboard/SemesterRegistration";
import Library from "./pages/dashboard/Library";
import StudentLibrary from "./pages/dashboard/StudentLibrary";
import LibraryBooks from "./pages/dashboard/LibraryBooks";
import OutstandingBooks from "./pages/dashboard/OutstandingBooks";
import SocialHub from "./pages/SocialHub";
import LostFound from "./pages/social/LostFound";
import LibraryStudents from "./pages/dashboard/LibraryStudents";
import LibraryNOC from "./pages/dashboard/LibraryNOC";
import Notices from "./pages/dashboard/Notices";
import StudentRegistrationForm from "./pages/StudentRegistrationForm";
import Programs from "./pages/Programs";
import Faculty from "./pages/Faculty";
import Campus from "./pages/Campus";
import ChatWidget from "./components/ai/ChatWidget";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div>
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Home />
                  <Footer />
                </>
              }
            />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/registration"
              element={
                <ProtectedRoute>
                  <SemesterRegistration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/library"
              element={
                <ProtectedRoute>
                  <StudentLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/library/admin"
              element={
                <ProtectedRoute>
                  <Library />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/library/books"
              element={
                <ProtectedRoute>
                  <LibraryBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/library/outstanding"
              element={
                <ProtectedRoute>
                  <OutstandingBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/library/students"
              element={
                <ProtectedRoute>
                  <LibraryStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/library/noc"
              element={
                <ProtectedRoute>
                  <LibraryNOC />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/notices"
              element={
                <ProtectedRoute>
                  <Notices />
                </ProtectedRoute>
              }
            />
            {/* Student Registration Form */}
            <Route
              path="/registration/apply/:sessionId"
              element={<StudentRegistrationForm />}
            />

            {/* Social Hub Routes */}
            <Route
              path="/social"
              element={
                <ProtectedRoute>
                  <SocialHub />
                </ProtectedRoute>
              }
            />
            <Route
              path="/social/lostfound"
              element={
                <ProtectedRoute>
                  <LostFound />
                </ProtectedRoute>
              }
            />

            {/* Public Pages */}
            <Route
              path="/programs"
              element={
                <>
                  <Programs />
                  <Footer />
                </>
              }
            />
            <Route
              path="/faculty"
              element={
                <>
                  <Faculty />
                  <Footer />
                </>
              }
            />
            <Route
              path="/campus"
              element={
                <>
                  <Campus />
                  <Footer />
                </>
              }
            />

            {/* Placeholder routes - will redirect to main dashboard for now */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        {/* ChatWidget is now rendered in Navbar */}
        <ChatWidget />
        <Toaster
          position="top-right"
          richColors
          closeButton
          expand={false}
          duration={4000}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
