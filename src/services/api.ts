import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.error || "";
      const path = window.location.pathname;

      // Only force logout on explicit invalid token from auth middleware
      if (message === "Invalid token.") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        if (path !== "/login") {
          window.location.replace("/login");
        }
      } else {
        // For other 401s (e.g., protected data not available), don't hard-redirect.
        // Let the calling code handle gracefully without kicking the user back to login.
        console.warn("API 401 (non-token):", message || error.message);
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  requiresOTP: boolean;
  email?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface OTPVerifyRequest {
  email: string;
  otp: string;
}

export interface OTPVerifyResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface ResendOTPRequest {
  email: string;
}

export interface ResendOTPResponse {
  message: string;
  email: string;
}

// Auth API calls
export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // Check if this is a student login based on email domain
    const isStudent =
      data.email.includes("@student.gcet.edu") ||
      data.email.includes("@gcetsafapora.edu");
    const endpoint = isStudent ? "/api/students/login" : "/api/auth/login";

    console.log(
      `🌐 API: Making ${
        isStudent ? "STUDENT" : "STAFF"
      } login request to ${endpoint} with:`,
      data
    );
    console.log("🌐 API: Base URL:", API_BASE_URL);
    try {
      const response = await api.post(endpoint, data);
      console.log("🌐 API: Login response received:", response.data);

      // For student login, transform response to match expected format
      if (isStudent && response.data.token) {
        return {
          ...response.data,
          requiresOTP: false, // Students don't need OTP
        };
      }

      return response.data;
    } catch (error: any) {
      console.error("🌐 API: Login request failed:", error);
      if (error.code === "ERR_NETWORK") {
        console.error(
          "❌ Network Error: Backend server might not be running on " +
            API_BASE_URL
        );
        throw new Error(
          "Cannot connect to server. Please make sure the backend is running on " +
            API_BASE_URL
        );
      }
      throw error;
    }
  },

  verifyOTP: async (data: OTPVerifyRequest): Promise<OTPVerifyResponse> => {
    const response = await api.post("/api/auth/verify-otp", data);
    return response.data;
  },

  resendOTP: async (data: ResendOTPRequest): Promise<ResendOTPResponse> => {
    const response = await api.post("/api/auth/resend-otp", data);
    return response.data;
  },
};

// Registration API (renamed from admissions for semester registration)
// Branches API
export const branchesAPI = {
  getAll: async (params?: { isActive?: boolean }) => {
    const response = await api.get("/api/branches", { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/branches/${id}`);
    return response.data;
  },
  create: async (branchData: {
    name: string;
    shortCode: string;
    department: string;
    totalSemesters?: number;
  }) => {
    const response = await api.post("/api/branches", branchData);
    return response.data;
  },
  update: async (id: string, branchData: any) => {
    const response = await api.put(`/api/branches/${id}`, branchData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/branches/${id}`);
    return response.data;
  },
  getSemesterSubjects: async (branchId: string, semesterNo: number) => {
    const response = await api.get(
      `/api/branches/${branchId}/semester/${semesterNo}/subjects`
    );
    return response.data;
  },
  updateSemesterSubjects: async (
    branchId: string,
    semesterNo: number,
    subjects: any[]
  ) => {
    const response = await api.put(
      `/api/branches/${branchId}/semester/${semesterNo}/subjects`,
      { subjects }
    );
    return response.data;
  },
};

export const registrationAPI = {
  // Session management
  getSessions: async (params?: { semester?: number; isActive?: boolean }) => {
    const response = await api.get("/api/registration/sessions", { params });
    return response.data;
  },
  getSessionById: async (id: string) => {
    const response = await api.get(`/api/registration/sessions/${id}`);
    return response.data;
  },
  createSession: async (sessionData: {
    semester: number;
    academicYear: string;
    startDate: string;
    endDate: string;
    feeAmount: number;
    feeDeadline: string;
    availableCourses: string[];
    libraryRequirement: boolean;
  }) => {
    const response = await api.post("/api/registration/sessions", sessionData);
    return response.data;
  },
  updateSession: async (
    id: string,
    sessionData: Partial<{
      semester: number;
      academicYear: string;
      startDate: string;
      endDate: string;
      feeAmount: number;
      feeDeadline: string;
      availableCourses: string[];
      libraryRequirement: boolean;
      isActive: boolean;
    }>
  ) => {
    const response = await api.put(
      `/api/registration/sessions/${id}`,
      sessionData
    );
    return response.data;
  },
  deleteSession: async (id: string) => {
    const response = await api.delete(`/api/registration/sessions/${id}`);
    return response.data;
  },
  toggleSessionStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch(
      `/api/registration/sessions/${id}/toggle-status`,
      { isActive }
    );
    return response.data;
  },
  checkExpiry: async () => {
    const response = await api.post("/api/registration/sessions/check-expiry");
    return response.data;
  },

  // Registration management
  getRegistrations: async (params?: {
    sessionId?: string;
    semester?: number;
    status?: string;
    search?: string;
  }) => {
    const response = await api.get("/api/registration/registrations", {
      params,
    });
    return response.data;
  },
  getRegistrationById: async (id: string) => {
    const response = await api.get(`/api/registration/registrations/${id}`);
    return response.data;
  },
  updateRegistrationStatus: async (id: string, status: string) => {
    const response = await api.patch(
      `/api/registration/registrations/${id}/status`,
      { status }
    );
    return response.data;
  },

  // Student registration process
  lookupStudent: async (universityRegNumber: string) => {
    const response = await api.get(
      `/api/registration/lookup/${encodeURIComponent(universityRegNumber)}`
    );
    return response.data;
  },
  submitRegistration: async (registrationData: {
    universityRegNumber: string;
    sessionId: string;
    selectedCourses: string[];
    updatedInfo?: {
      phone?: string;
      address?: string;
    };
  }) => {
    const response = await api.post(
      "/api/registration/submit",
      registrationData
    );
    return response.data;
  },
  checkLibraryStatus: async (studentId: string) => {
    const response = await api.get(
      `/api/registration/library-status/${studentId}`
    );
    return response.data;
  },

  // Library NOC process
  verifyLibraryCard: async (
    libraryCard: string,
    universityRegNumber: string
  ) => {
    const response = await api.post("/api/registration/library-noc/verify", {
      libraryCard,
      universityRegNumber,
    });
    return response.data;
  },

  payLibraryFees: async (
    universityRegNumber: string,
    paymentType: string,
    amount: number
  ) => {
    const response = await api.post("/api/registration/library-noc/pay-fees", {
      universityRegNumber,
      paymentType,
      amount,
    });
    return response.data;
  },
};

// Admin API (students listing for eligibility checks)
export const adminAPI = {
  getStudents: async (params?: {
    page?: number;
    limit?: number;
    status?: string; // admission status
    course?: string;
    semester?: number;
    search?: string;
  }) => {
    const response = await api.get("/api/admin/students", { params });
    return response.data;
  },
};

// Legacy Admissions API (keeping for backward compatibility)
export const admissionsAPI = {
  // Legacy settings endpoints (keeping for backward compatibility)
  getSettings: async () => {
    const response = await api.get("/api/admissions/settings");
    return response.data;
  },
  updateSettings: async (data: { isOpen: boolean; feeAmount: number }) => {
    const response = await api.post("/api/admissions/settings", data);
    return response.data;
  },
  getNotices: async () => {
    const response = await api.get("/api/admissions/notices");
    return response.data;
  },
  createNotice: async (data: { title: string; body: string }) => {
    const response = await api.post("/api/admissions/notices", data);
    return response.data;
  },

  // New session management endpoints
  getSessions: async (params?: { semester?: number; isActive?: boolean }) => {
    const response = await api.get("/api/admissions/sessions", { params });
    return response.data;
  },
  getSessionById: async (id: string) => {
    const response = await api.get(`/api/admissions/sessions/${id}`);
    return response.data;
  },
  createSession: async (sessionData: {
    semester: number;
    academicYear: string;
    startDate: string;
    endDate: string;
    feeAmount: number;
    feeDeadline: string;
    courses: string[];
    eligibilityCriteria: string;
    requiredDocuments: string[];
  }) => {
    const response = await api.post("/api/admissions/sessions", sessionData);
    return response.data;
  },
  updateSession: async (
    id: string,
    sessionData: Partial<{
      semester: number;
      academicYear: string;
      startDate: string;
      endDate: string;
      feeAmount: number;
      feeDeadline: string;
      courses: string[];
      eligibilityCriteria: string;
      requiredDocuments: string[];
      isActive: boolean;
    }>
  ) => {
    const response = await api.put(
      `/api/admissions/sessions/${id}`,
      sessionData
    );
    return response.data;
  },
  deleteSession: async (id: string) => {
    const response = await api.delete(`/api/admissions/sessions/${id}`);
    return response.data;
  },
  getApplications: async (params?: {
    sessionId?: string;
    semester?: number;
    status?: string;
    search?: string;
  }) => {
    const response = await api.get("/api/admissions/applications", { params });
    return response.data;
  },
  getApplicationById: async (id: string) => {
    const response = await api.get(`/api/admissions/applications/${id}`);
    return response.data;
  },
  updateApplicationStatus: async (id: string, status: string) => {
    const response = await api.patch(
      `/api/admissions/applications/${id}/status`,
      { status }
    );
    return response.data;
  },
  submitApplication: async (applicationData: {
    name: string;
    email: string;
    phone: string;
    course: string;
    semester: number;
    sessionId: string;
  }) => {
    const response = await api.post(
      "/api/admissions/applications",
      applicationData
    );
    return response.data;
  },
};

// Notices API
export const noticesAPI = {
  getAll: async (params?: {
    type?: string;
    priority?: string;
    search?: string;
  }) => {
    const response = await api.get("/api/admin/notices", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/admin/notices/${id}`);
    return response.data;
  },

  create: async (notice: {
    title: string;
    content: string;
    type: string;
    priority: string;
    targetAudience: string;
    targetCourse?: string;
    targetSemester?: number;
    startDate: string;
    endDate: string;
    isActive?: boolean;
    links?: { title: string; url: string }[];
    signedBy?: string;
  }) => {
    const response = await api.post("/api/admin/notices", notice);
    return response.data;
  },

  update: async (
    id: string,
    notice: {
      title: string;
      content: string;
      type: string;
      priority: string;
      targetAudience: string;
      targetCourse?: string;
      targetSemester?: number;
      startDate: string;
      endDate: string;
      isActive?: boolean;
      links?: { title: string; url: string }[];
      signedBy?: string;
    }
  ) => {
    const response = await api.put(`/api/admin/notices/${id}`, notice);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/admin/notices/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string) => {
    const response = await api.patch(`/api/admin/notices/${id}/toggle`);
    return response.data;
  },

  getPublic: async (params?: { limit?: number; audience?: string }) => {
    const response = await api.get("/api/notices/public", { params });
    return response.data;
  },
};

// Library API
export const libraryAPI = {
  // Dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get("/api/library/dashboard-stats");
    return response.data;
  },

  // Books management
  getBooks: async (params?: {
    page?: number;
    limit?: number;
    department?: string;
    subBlock?: string;
    category?: string;
    search?: string;
  }) => {
    const response = await api.get("/api/library/books", { params });
    return response.data;
  },

  getBooksByDepartment: async (
    department: string,
    params?: {
      subBlock?: string;
      page?: number;
      limit?: number;
    }
  ) => {
    const response = await api.get(
      `/api/library/books/department/${department}`,
      { params }
    );
    return response.data;
  },

  addBook: async (bookData: any) => {
    const response = await api.post("/api/library/books", bookData);
    return response.data;
  },

  updateBook: async (bookId: string, bookData: any) => {
    const response = await api.put(`/api/library/books/${bookId}`, bookData);
    return response.data;
  },

  deleteBook: async (bookId: string) => {
    const response = await api.delete(`/api/library/books/${bookId}`);
    return response.data;
  },

  getOutstandingBooks: async (params?: {
    search?: string;
    status?: "active" | "overdue";
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get("/api/library/outstanding-books", {
      params,
    });
    return response.data;
  },

  // Student records
  getStudents: async (params?: {
    page?: number;
    limit?: number;
    department?: string;
    hasOverdueBooks?: boolean;
    hasPendingFines?: boolean;
    nocStatus?: string;
    search?: string;
  }) => {
    const response = await api.get("/api/library/students", { params });
    return response.data;
  },

  getStudentDetails: async (universityRegNumber: string) => {
    const response = await api.get(
      `/api/library/students/${encodeURIComponent(universityRegNumber)}/details`
    );
    return response.data;
  },

  // Get current user's library information (for students)
  getMyLibraryInfo: async () => {
    const response = await api.get("/api/library/my-info");
    return response.data;
  },

  // Student borrow book
  borrowBook: async (bookId: string) => {
    const response = await api.post(`/api/library/borrow-book/${bookId}`);
    return response.data;
  },

  // Return book
  returnBook: async (
    bookId: string,
    data: { studentId: string; returnDate: Date; condition: string }
  ) => {
    const response = await api.post(
      `/api/library/books/${bookId}/return`,
      data
    );
    return response.data;
  },

  // Pay fines
  payFines: async (data: {
    studentId: string;
    amount: number;
    paymentMethod: string;
  }) => {
    const response = await api.post(`/api/library/fines/pay`, data);
    return response.data;
  },

  // NOC Management
  checkNOC: async (universityRegNumber: string) => {
    const response = await api.get(
      `/api/library/noc/check/${encodeURIComponent(universityRegNumber)}`
    );
    return response.data;
  },

  generateNOC: async (data: {
    universityRegNumber: string;
    clearanceType: "full_clearance" | "conditional";
    notes?: string;
  }) => {
    const response = await api.post("/api/library/noc/generate", data);
    return response.data;
  },

  // Student NOC Requests
  getMyNOCRequest: async () => {
    const response = await api.get("/api/library/noc/my-request");
    return response.data;
  },

  createNOCRequest: async (data: { universityRegNumber: string }) => {
    const response = await api.post("/api/library/noc/request", data);
    return response.data;
  },

  getNOCRequests: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get("/api/library/noc/requests", { params });
    return response.data;
  },

  updateNOCRequest: async (
    requestId: string,
    data: {
      status?: string;
      actionRequired?: any;
      nocDocument?: string;
      rejectionReason?: string;
    }
  ) => {
    const response = await api.put(
      `/api/library/noc/requests/${requestId}`,
      data
    );
    return response.data;
  },

  // Collections
  getCollections: async () => {
    const response = await api.get("/api/library/collections");
    return response.data;
  },
};

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem("authToken", token);
};

export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

export const setUser = (user: {
  id: string;
  name: string;
  email: string;
  role: string;
}) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Social Hub API
export const socialAPI = {
  // Posts
  getPosts: (params?: { page?: number; limit?: number; sortBy?: string }) =>
    api.get("/api/social/posts", { params }),

  createPost: (data: {
    content: string;
    images?: string[];
    isAnonymous?: boolean;
    tags?: string[];
  }) => api.post("/api/social/posts", data),

  votePost: (postId: string, type: "upvote" | "downvote") =>
    api.post(`/api/social/posts/${postId}/vote`, { type }),

  // Comments
  getComments: (postId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/api/social/posts/${postId}/comments`, { params }),

  addComment: (
    postId: string,
    data: { content: string; isAnonymous?: boolean; parentComment?: string }
  ) => api.post(`/api/social/posts/${postId}/comments`, data),

  voteComment: (commentId: string, type: "upvote" | "downvote") =>
    api.post(`/api/social/comments/${commentId}/vote`, { type }),
};

// Lost & Found API
export const lostFoundAPI = {
  getItems: (params?: {
    page?: number;
    limit?: number;
    type?: "lost" | "found";
    category?: string;
    status?: string;
    search?: string;
  }) => api.get("/api/lostfound", { params }),

  getItem: (id: string) => api.get(`/api/lostfound/${id}`),

  createItem: (data: {
    type: "lost" | "found";
    title: string;
    description: string;
    category: string;
    location: string;
    dateOccurred: string;
    images?: string[];
    tags?: string[];
  }) => api.post("/api/lostfound", data),

  updateItem: (id: string, data: any) => api.put(`/api/lostfound/${id}`, data),

  claimItem: (id: string) => api.post(`/api/lostfound/${id}/claim`),

  verifyClaim: (id: string, verified: boolean) =>
    api.post(`/api/lostfound/${id}/verify-claim`, { verified }),

  upvoteItem: (id: string) => api.post(`/api/lostfound/${id}/upvote`),

  getCategories: () => api.get("/api/lostfound/meta/categories"),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) => api.get("/api/notifications", { params }),

  markAsRead: (id: string) => api.put(`/api/notifications/${id}/read`),

  markAllAsRead: () => api.put("/api/notifications/read-all"),

  deleteNotification: (id: string) => api.delete(`/api/notifications/${id}`),

  getStats: () => api.get("/api/notifications/stats"),
};

// Messaging API
export const messagingAPI = {
  getConversations: () => api.get("/api/messaging/conversations"),
  getConversation: (id: string) =>
    api.get(`/api/messaging/conversations/${id}`),
  getMessages: (conversationId: string) =>
    api.get(`/api/messaging/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, content: string) =>
    api.post(`/api/messaging/conversations/${conversationId}/messages`, {
      content,
    }),
  createConversation: (participantIds: string | string[]) =>
    api.post("/api/messaging/conversations", {
      participantIds: Array.isArray(participantIds)
        ? participantIds
        : [participantIds],
    }),
  deleteConversation: (conversationId: string) =>
    api.delete(`/api/messaging/conversations/${conversationId}`),
  markAsRead: (conversationId: string) =>
    api.put(`/api/messaging/conversations/${conversationId}/read`),
  searchUsers: (query: string) =>
    api.get("/api/messaging/users/search", { params: { q: query } }),
};

// AI Assistant API
export const aiAPI = {
  chat: async (
    message: string
  ): Promise<{ reply: string; source: string; confidence?: number }> => {
    const res = await api.post("/api/ai/chat", { message });
    return res.data;
  },
};

export default api;
