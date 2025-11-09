import React from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { BookOpen, Search, Clock, Star } from "lucide-react";

const Library = () => {
  return (
    <DashboardLayout title="Library">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Library Dashboard
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <BookOpen className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  15,678
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">Total Books</h3>
              <p className="text-sm text-gray-600">Available collection</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Search className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">234</span>
              </div>
              <h3 className="font-semibold text-gray-900">Borrowed</h3>
              <p className="text-sm text-gray-600">Currently issued</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-600">12</span>
              </div>
              <h3 className="font-semibold text-gray-900">Overdue</h3>
              <p className="text-sm text-gray-600">Need attention</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Star className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">45</span>
              </div>
              <h3 className="font-semibold text-gray-900">Reserved</h3>
              <p className="text-sm text-gray-600">Waiting list</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Popular Books
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "Advanced Mathematics",
                  author: "Dr. Smith",
                  borrowed: 45,
                },
                {
                  title: "Computer Networks",
                  author: "Prof. Johnson",
                  borrowed: 38,
                },
                {
                  title: "Physics Fundamentals",
                  author: "Dr. Brown",
                  borrowed: 32,
                },
                {
                  title: "Database Systems",
                  author: "Prof. Wilson",
                  borrowed: 29,
                },
              ].map((book, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{book.title}</p>
                    <p className="text-sm text-gray-600">{book.author}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {book.borrowed} borrowed
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                {
                  action: "Book returned",
                  book: "Advanced Mathematics",
                  user: "John Doe",
                  time: "5 min ago",
                },
                {
                  action: "New reservation",
                  book: "Computer Networks",
                  user: "Jane Smith",
                  time: "1 hour ago",
                },
                {
                  action: "Book issued",
                  book: "Physics Fundamentals",
                  user: "Mike Johnson",
                  time: "2 hours ago",
                },
                {
                  action: "Overdue reminder",
                  book: "Database Systems",
                  user: "Sarah Wilson",
                  time: "3 hours ago",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600">
                      "{activity.book}" by {activity.user}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Library;
