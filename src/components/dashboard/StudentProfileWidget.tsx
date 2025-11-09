import React from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  BookOpen,
  CreditCard,
  MapPin,
} from "lucide-react";

interface StudentProfileWidgetProps {
  user: any;
}

const StudentProfileWidget: React.FC<StudentProfileWidgetProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
            {user?.name?.charAt(0).toUpperCase() || "S"}
          </div>
          <div>
            <h3 className="text-2xl font-bold">{user?.name || "Student"}</h3>
            <p className="text-blue-100">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Student Information Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Student ID */}
          {user?.studentId && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Student ID</p>
                <p className="font-semibold text-gray-900">{user.studentId}</p>
              </div>
            </div>
          )}

          {/* University Reg Number */}
          {user?.universityRegNumber && (
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Registration No.</p>
                <p className="font-semibold text-gray-900">
                  {user.universityRegNumber}
                </p>
              </div>
            </div>
          )}

          {/* Course */}
          {user?.course?.name && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Course</p>
                <p className="font-semibold text-gray-900">{user.course.name}</p>
                <p className="text-xs text-gray-500">
                  {user.course.code} - Semester {user?.currentSemester || user.course.semester}
                </p>
              </div>
            </div>
          )}

          {/* Fee Status */}
          {user?.feeStatus && (
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Fee Status</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {user.feeStatus}
                </p>
                {user.feeAmount && (
                  <p className="text-xs text-gray-500">
                    ₹{user.feePaid || 0} / ₹{user.feeAmount}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Library ID */}
          {user?.libraryId && (
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Library ID</p>
                <p className="font-semibold text-gray-900">{user.libraryId}</p>
              </div>
            </div>
          )}

          {/* Admission Status */}
          {user?.admissionStatus && (
            <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Admission Status</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {user.admissionStatus}
                </p>
              </div>
            </div>
          )}

          {/* Contact Email */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600">Email</p>
              <p className="font-semibold text-gray-900 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Phone */}
          {user?.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{user.phone}</p>
              </div>
            </div>
          )}
        </div>

        {/* Address if available */}
        {user?.address && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Address</p>
                <p className="text-sm text-gray-900">
                  {user.address.street}
                  {user.address.street && <br />}
                  {user.address.city}, {user.address.state} - {user.address.pincode}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfileWidget;








