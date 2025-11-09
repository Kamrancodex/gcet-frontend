import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardTopbarProps {
  title: string;
  onMobileMenuToggle: () => void;
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
}

const DashboardTopbar: React.FC<DashboardTopbarProps> = ({
  title,
  onMobileMenuToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        {/* Left Section */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMobileMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Page Title */}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              Welcome back, {user?.name}
            </p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Icon for Mobile */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      </header>
      {/* Mobile search drawer */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-gray-200 bg-white px-4 pb-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardTopbar;
