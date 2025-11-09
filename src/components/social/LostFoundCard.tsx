import React from "react";
import {
  MapPin,
  Calendar,
  ArrowUp,
  MessageCircle,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Phone,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LostFoundItem {
  _id: string;
  author: string;
  authorName: string;
  authorContact: string;
  contactInfo?: string;
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
}

interface LostFoundCardProps {
  item: LostFoundItem;
  onUpvote: (itemId: string) => void;
  onClaim: (itemId: string) => void;
}

const LostFoundCard: React.FC<LostFoundCardProps> = ({
  item,
  onUpvote,
  onClaim,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "claimed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "lost"
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-green-100 text-green-800 border-green-200";
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      electronics: "📱",
      books: "📚",
      clothing: "👕",
      accessories: "👜",
      documents: "📄",
      keys: "🗝️",
      bags: "🎒",
      jewelry: "💍",
      sports: "⚽",
      other: "❓",
    };
    return icons[category] || "❓";
  };

  const canClaim = item.status === "active" && item.type === "found";
  const isUserUpvoted = false; // You'd check if current user has upvoted

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {getCategoryIcon(item.category)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(
                    item.type
                  )}`}
                >
                  {item.type.toUpperCase()}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <User className="w-3 h-3" />
                {item.authorName}
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {item.title}
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {item.description}
        </p>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              {item.type === "lost" ? "Lost on" : "Found on"}{" "}
              {new Date(item.dateOccurred).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>
              Posted{" "}
              {formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Contact Info */}
        {item.contactInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Contact Information
              </span>
            </div>
            <div
              className={`${
                item.status === "claimed" || item.status === "resolved"
                  ? "blur-sm select-none"
                  : ""
              }`}
            >
              <p className="text-sm text-gray-900 font-medium">
                {item.contactInfo}
              </p>
            </div>
            {(item.status === "claimed" || item.status === "resolved") && (
              <p className="text-xs text-gray-500 mt-2 italic">
                Contact hidden because item is {item.status}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Images */}
      {item.images.length > 0 && (
        <div className="px-6 pb-4">
          <div
            className={`grid gap-2 rounded-lg overflow-hidden ${
              item.images.length === 1
                ? "grid-cols-1"
                : item.images.length === 2
                ? "grid-cols-2"
                : "grid-cols-2"
            }`}
          >
            {item.images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className={`relative ${
                  item.images.length > 4 && index === 3 ? "relative" : ""
                }`}
              >
                <img
                  src={image}
                  alt={`${item.type} item ${index + 1}`}
                  className="w-full h-32 object-cover hover:opacity-95 cursor-pointer transition-opacity rounded-lg"
                  onClick={() => {
                    /* TODO: Open image modal */
                  }}
                />
                {item.images.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                    <span className="text-white font-semibold text-sm">
                      +{item.images.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claim Status */}
      {item.status === "claimed" && (
        <div className="px-6 pb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Claimed by {item.claimedByName}
              </span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              Waiting for owner verification
            </p>
          </div>
        </div>
      )}

      {item.status === "resolved" && (
        <div className="px-6 pb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Successfully reunited! 🎉
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              This item has been returned to its owner
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Upvote */}
            <button
              onClick={() => onUpvote(item._id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                isUserUpvoted
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <ArrowUp
                className={`w-4 h-4 ${isUserUpvoted ? "fill-current" : ""}`}
              />
              <span className="font-medium text-sm">{item.upvotes.length}</span>
            </button>

            {/* Comments */}
            <button className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium text-sm">{item.commentsCount}</span>
            </button>
          </div>

          {/* Claim Button */}
          {canClaim && (
            <button
              onClick={() => onClaim(item._id)}
              className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors text-sm font-medium"
            >
              I Found This!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LostFoundCard;
