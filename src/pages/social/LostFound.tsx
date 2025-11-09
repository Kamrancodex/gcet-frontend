import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  User,
  ArrowUp,
  MessageCircle,
  Eye,
  Clock,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { lostFoundAPI } from "../../services/api";
import SocialSidebar from "../../components/social/SocialSidebar";
import CreateLostFoundModal from "../../components/social/CreateLostFoundModal";
import LostFoundCard from "../../components/social/LostFoundCard";

interface LostFoundItem {
  _id: string;
  author: string;
  authorName: string;
  authorContact: string;
  type: "lost" | "found";
  title: string;
  description: string;
  images: string[];
  category: string;
  location: string;
  dateOccurred: string;
  status: "active" | "claimed" | "resolved" | "expired";
  claimedBy?: string;
  claimedByName?: string;
  claimedAt?: string;
  claimVerified: boolean;
  tags: string[];
  upvotes: string[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  value: string;
  label: string;
  icon: string;
}

const LostFound: React.FC = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<"all" | "lost" | "found">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [searchTerm, setSearchTerm] = useState("");

  const loadItems = async (page = 1, reset = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const params: any = {
        page,
        limit: 20,
        status: statusFilter,
      };

      if (typeFilter !== "all") params.type = typeFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await lostFoundAPI.getItems(params);

      if (response.data.success) {
        const newItems = response.data.items;

        if (reset || page === 1) {
          setItems(newItems);
        } else {
          setItems((prev) => [...prev, ...newItems]);
        }

        setHasMore(response.data.pagination.hasMore);
        setCurrentPage(page);
      }
    } catch (error: any) {
      console.error("Error loading items:", error);
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await lostFoundAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error: any) {
      console.error("Error loading categories:", error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadItems(1, true);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [typeFilter, categoryFilter, statusFilter, searchTerm]);

  const handleCreateItem = async (itemData: any) => {
    try {
      const response = await lostFoundAPI.createItem(itemData);
      if (response.data.success) {
        toast.success(
          `${
            itemData.type === "lost" ? "Lost" : "Found"
          } item posted successfully! 🎉`
        );
        setShowCreateModal(false);
        // Add new item to the beginning of the list
        setItems((prev) => [response.data.item, ...prev]);
      }
    } catch (error: any) {
      console.error("Error creating item:", error);
      toast.error("Failed to create item");
    }
  };

  const handleUpvote = async (itemId: string) => {
    try {
      const response = await lostFoundAPI.upvoteItem(itemId);
      if (response.data.success) {
        // Update the item in the list
        setItems((prev) =>
          prev.map((item) => {
            if (item._id === itemId) {
              const isUpvoted = response.data.message === "Upvote removed";
              return {
                ...item,
                upvotes: isUpvoted
                  ? item.upvotes.filter((id) => id !== "current_user") // Simplified
                  : [...item.upvotes, "current_user"],
              };
            }
            return item;
          })
        );

        toast.success(response.data.message);
      }
    } catch (error: any) {
      console.error("Error upvoting item:", error);
      toast.error("Failed to upvote item");
    }
  };

  const handleClaim = async (itemId: string) => {
    try {
      const response = await lostFoundAPI.claimItem(itemId);
      if (response.data.success) {
        // Update the item status
        setItems((prev) =>
          prev.map((item) => (item._id === itemId ? response.data.item : item))
        );
        toast.success(response.data.message);
      }
    } catch (error: any) {
      console.error("Error claiming item:", error);
      toast.error(error.response?.data?.message || "Failed to claim item");
    }
  };

  const loadMoreItems = () => {
    if (hasMore && !loadingMore) {
      loadItems(currentPage + 1, false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "claimed":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "lost"
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-green-100 text-green-800 border-green-200";
  };

  const activeItems = items.filter((item) => item.status === "active").length;
  const lostItems = items.filter(
    (item) => item.type === "lost" && item.status === "active"
  ).length;
  const foundItems = items.filter(
    (item) => item.type === "found" && item.status === "active"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 flex pt-16">
      {/* Social Sidebar */}
      <SocialSidebar 
        onCreatePost={() => setShowCreateModal(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-16 z-10">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  Lost & Found
                </h1>
                <p className="text-gray-600 mt-1">
                  Help reunite lost items with their owners
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Report Item</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                <div className="text-2xl font-bold">{activeItems}</div>
                <div className="text-sm opacity-90">Active Items</div>
              </div>
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl">
                <div className="text-2xl font-bold">{lostItems}</div>
                <div className="text-sm opacity-90">Lost Items</div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
                <div className="text-2xl font-bold">{foundItems}</div>
                <div className="text-sm opacity-90">Found Items</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                <div className="text-2xl font-bold">
                  {items.filter((item) => item.status === "resolved").length}
                </div>
                <div className="text-sm opacity-90">Reunited</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="flex-1 min-w-64 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <div className="flex bg-gray-100 rounded-full p-1">
                {[
                  { value: "all", label: "All" },
                  { value: "lost", label: "Lost" },
                  { value: "found", label: "Found" },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setTypeFilter(type.value as any)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      typeFilter === type.value
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="active">Active</option>
                <option value="claimed">Claimed</option>
                <option value="resolved">Resolved</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm border p-6 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No items found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || categoryFilter || typeFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "Be the first to report a lost or found item!"}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
              >
                Report First Item
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((item) => (
                  <LostFoundCard
                    key={item._id}
                    item={item}
                    onUpvote={handleUpvote}
                    onClaim={handleClaim}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="text-center py-8">
                  <button
                    onClick={loadMoreItems}
                    disabled={loadingMore}
                    className="bg-white border border-gray-200 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Load More Items"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateLostFoundModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateItem}
        />
      )}
    </div>
  );
};

export default LostFound;
