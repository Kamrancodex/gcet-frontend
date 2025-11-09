import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Share2,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Clock,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Post {
  _id: string;
  author: string;
  authorName: string;
  authorRole: string;
  content: string;
  images: string[];
  type: "text" | "image" | "mixed";
  upvotes: string[];
  downvotes: string[];
  totalScore: number;
  commentsCount: number;
  isAnonymous: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface PostCardProps {
  post: Post;
  onVote: (postId: string, type: "upvote" | "downvote") => void;
  onViewComments: (post: Post) => void;
  currentUserId?: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, onVote, onViewComments, currentUserId }) => {
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);

  // Check if user has already voted on this post
  useEffect(() => {
    if (currentUserId) {
      if (post.upvotes.includes(currentUserId)) {
        setUserVote("upvote");
      } else if (post.downvotes.includes(currentUserId)) {
        setUserVote("downvote");
      } else {
        setUserVote(null);
      }
    }
  }, [post.upvotes, post.downvotes, currentUserId]);

  const handleVote = (type: "upvote" | "downvote") => {
    onVote(post._id, type);
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/social/post/${post._id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.authorName}`,
          text: post.content.substring(0, 100) + "...",
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share post");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800";
      case "faculty":
        return "bg-green-100 text-green-800";
      case "staff":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return "🎓";
      case "faculty":
        return "👨‍🏫";
      case "staff":
        return "👔";
      case "admin":
        return "⚡";
      default:
        return "👤";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {post.isAnonymous ? (
                <User className="w-6 h-6 text-white" />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {post.authorName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {post.isAnonymous ? "Anonymous" : (post.authorName || "User")}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                    post.authorRole
                  )}`}
                >
                  {getRoleIcon(post.authorRole)} {post.authorRole}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Clock className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {post.type !== "text" && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{post.type} post</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <p className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="px-6 pb-4">
          <div
            className={`grid gap-2 rounded-lg overflow-hidden ${
              post.images.length === 1
                ? "grid-cols-1"
                : post.images.length === 2
                ? "grid-cols-2"
                : post.images.length === 3
                ? "grid-cols-3"
                : "grid-cols-2"
            }`}
          >
            {post.images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className={`relative ${
                  post.images.length > 4 && index === 3 ? "relative" : ""
                }`}
              >
                <img
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-48 object-cover hover:opacity-95 cursor-pointer transition-opacity"
                  onClick={() => {
                    /* TODO: Open image modal */
                  }}
                />
                {post.images.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      +{post.images.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Upvote */}
            <button
              onClick={() => handleVote("upvote")}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                userVote === "upvote"
                  ? "bg-green-100 text-green-600"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <ArrowUp
                className={`w-5 h-5 ${
                  userVote === "upvote" ? "fill-current" : ""
                }`}
              />
              <span className="font-medium">{post.upvotes.length}</span>
            </button>

            {/* Downvote */}
            <button
              onClick={() => handleVote("downvote")}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                userVote === "downvote"
                  ? "bg-red-100 text-red-600"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <ArrowDown
                className={`w-5 h-5 ${
                  userVote === "downvote" ? "fill-current" : ""
                }`}
              />
              <span className="font-medium">{post.downvotes.length}</span>
            </button>

            {/* Score */}
            <div className="px-3 py-2">
              <span
                className={`font-semibold ${
                  post.totalScore > 0
                    ? "text-green-600"
                    : post.totalScore < 0
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {post.totalScore > 0 ? "+" : ""}
                {post.totalScore}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Comments */}
            <button
              onClick={() => onViewComments(post)}
              className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{post.commentsCount}</span>
            </button>

            {/* Share */}
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
