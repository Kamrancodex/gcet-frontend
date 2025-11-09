import React, { useState, useEffect } from "react";
import {
  X,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share2,
  Clock,
  User,
  Send,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { socialAPI } from "../../services/api";

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

interface Comment {
  _id: string;
  author: string;
  authorName: string;
  authorRole: string;
  content: string;
  upvotes: string[];
  downvotes: string[];
  totalScore: number;
  isAnonymous: boolean;
  createdAt: string;
  replies: Comment[];
}

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
  onVote: (postId: string, type: "upvote" | "downvote") => void;
  currentUserId?: string;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  onVote,
  currentUserId,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);

  useEffect(() => {
    loadComments();
    
    // Set user's vote state
    if (currentUserId) {
      if (post.upvotes.includes(currentUserId)) {
        setUserVote("upvote");
      } else if (post.downvotes.includes(currentUserId)) {
        setUserVote("downvote");
      }
    }
  }, [post._id, currentUserId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await socialAPI.getComments(post._id);
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setSubmitting(true);
      const response = await socialAPI.addComment(post._id, {
        content: commentContent,
        isAnonymous,
      });

      if (response.data.success) {
        toast.success("Comment added!");
        setCommentContent("");
        setIsAnonymous(false);
        loadComments(); // Reload comments
        
        // Update post comment count
        post.commentsCount += 1;
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Post Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Post */}
          <div className="p-6 border-b">
            {/* Author */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {post.isAnonymous ? (
                  <User className="w-6 h-6 text-white" />
                ) : (
                  <span className="text-white font-semibold text-lg">
                    {post.authorName?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {post.isAnonymous ? "Anonymous" : post.authorName || "User"}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(post.authorRole)}`}>
                    {post.authorRole}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <p className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap mb-4">
              {post.content}
            </p>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onVote(post._id, "upvote")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                    userVote === "upvote"
                      ? "bg-green-100 text-green-600"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <ArrowUp className={`w-5 h-5 ${userVote === "upvote" ? "fill-current" : ""}`} />
                  <span className="font-medium">{post.upvotes.length}</span>
                </button>

                <button
                  onClick={() => onVote(post._id, "downvote")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                    userVote === "downvote"
                      ? "bg-red-100 text-red-600"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <ArrowDown className={`w-5 h-5 ${userVote === "downvote" ? "fill-current" : ""}`} />
                  <span className="font-medium">{post.downvotes.length}</span>
                </button>

                <div className="px-3 py-2">
                  <span className={`font-semibold ${
                    post.totalScore > 0 ? "text-green-600" : post.totalScore < 0 ? "text-red-600" : "text-gray-600"
                  }`}>
                    {post.totalScore > 0 ? "+" : ""}{post.totalScore}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-600">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{post.commentsCount}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comments ({comments.length})
            </h3>

            {/* Add Comment */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Post anonymously
                </label>
                <button
                  onClick={handleSubmitComment}
                  disabled={submitting || !commentContent.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? "Posting..." : "Post Comment"}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Comments List */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        {comment.isAnonymous ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {comment.authorName?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {comment.isAnonymous ? "Anonymous" : comment.authorName}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleColor(comment.authorRole)}`}>
                            {comment.authorRole}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap mb-2">{comment.content}</p>
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 text-gray-600 text-sm">
                            <ArrowUp className="w-4 h-4" />
                            <span>{comment.upvotes.length}</span>
                          </button>
                          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 text-gray-600 text-sm">
                            <ArrowDown className="w-4 h-4" />
                            <span>{comment.downvotes.length}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;

