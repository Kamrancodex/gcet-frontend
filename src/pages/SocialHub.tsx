import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { socialAPI, getUser } from "../services/api";
import SocialSidebar from "../components/social/SocialSidebar";
import CreatePostModal from "../components/social/CreatePostModal";
import PostCard from "../components/social/PostCard";
import PostDetailModal from "../components/social/PostDetailModal";

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

const SocialHub: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "trending">(
    "recent"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const user = getUser();
    if (user && user.userId) {
      setCurrentUserId(user.userId);
    }
  }, []);

  const loadPosts = async (page = 1, sort = sortBy, reset = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await socialAPI.getPosts({
        page,
        limit: 10,
        sortBy: sort,
      });

      if (response.data.success) {
        const newPosts = response.data.posts;

        if (reset || page === 1) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }

        setHasMore(response.data.pagination.hasMore);
        setCurrentPage(page);
      }
    } catch (error: any) {
      console.error("Error loading posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts(1, sortBy, true);
  }, [sortBy]);

  const handleCreatePost = async (postData: {
    content: string;
    images?: string[];
    isAnonymous?: boolean;
    tags?: string[];
  }) => {
    try {
      const response = await socialAPI.createPost(postData);
      if (response.data.success) {
        toast.success("Post created successfully! 🎉");
        setShowCreatePost(false);
        // Add new post to the beginning of the list
        setPosts((prev) => [response.data.post, ...prev]);
      }
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  const handleVote = async (postId: string, type: "upvote" | "downvote") => {
    try {
      const response = await socialAPI.votePost(postId, type);
      if (response.data.success) {
        // Update the post in the list with real data from backend
        setPosts((prev) =>
          prev.map((post) => {
            if (post._id === postId) {
              const updatedPost = { ...post };
              
              // Remove user from both arrays first
              updatedPost.upvotes = updatedPost.upvotes.filter(id => id !== currentUserId);
              updatedPost.downvotes = updatedPost.downvotes.filter(id => id !== currentUserId);
              
              // Add user to appropriate array
              if (type === "upvote") {
                updatedPost.upvotes = [...updatedPost.upvotes, currentUserId];
              } else {
                updatedPost.downvotes = [...updatedPost.downvotes, currentUserId];
              }
              
              // Update total score
              updatedPost.totalScore = response.data.totalScore;
              return updatedPost;
            }
            return post;
          })
        );

        // Update selected post if it's open
        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost((prev) => {
            if (!prev) return prev;
            const updated = { ...prev };
            updated.upvotes = updated.upvotes.filter(id => id !== currentUserId);
            updated.downvotes = updated.downvotes.filter(id => id !== currentUserId);
            if (type === "upvote") {
              updated.upvotes = [...updated.upvotes, currentUserId];
            } else {
              updated.downvotes = [...updated.downvotes, currentUserId];
            }
            updated.totalScore = response.data.totalScore;
            return updated;
          });
        }
      }
    } catch (error: any) {
      console.error("Error voting on post:", error);
      toast.error("Failed to vote on post");
    }
  };

  const handleViewComments = (post: Post) => {
    setSelectedPost(post);
  };

  const loadMorePosts = () => {
    if (hasMore && !loadingMore) {
      loadPosts(currentPage + 1, sortBy, false);
    }
  };

  const getSortIcon = (sort: string) => {
    switch (sort) {
      case "recent":
        return <Clock className="w-4 h-4" />;
      case "popular":
        return <Heart className="w-4 h-4" />;
      case "trending":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex pt-16">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Social Sidebar */}
      <SocialSidebar
        onCreatePost={() => setShowCreatePost(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Feed Section */}
        <div className="max-w-4xl mx-auto">
          {/* Simple Header with Sort */}
          <div className="bg-white shadow-sm border-b sticky top-16 z-10">
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">Feed</h2>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "recent" | "popular" | "trending"
                    )
                  }
                  className="appearance-none bg-white border border-gray-200 rounded-lg pl-10 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
                >
                  <option value="recent">Recent</option>
                  <option value="popular">Popular</option>
                  <option value="trending">Trending</option>
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {getSortIcon(sortBy)}
                </div>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Feed */}
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm border p-6 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="h-40 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Be the first to share something with the community!
                </p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard 
                    key={post._id} 
                    post={post} 
                    onVote={handleVote}
                    onViewComments={handleViewComments}
                    currentUserId={currentUserId}
                  />
                ))}

                {hasMore && (
                  <div className="text-center py-8">
                    <button
                      onClick={loadMorePosts}
                      disabled={loadingMore}
                      className="bg-white border border-gray-200 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {loadingMore ? "Loading..." : "Load More Posts"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onVote={handleVote}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default SocialHub;
