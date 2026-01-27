const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      const err: any = new Error(error.message || "API error");
      // Preserve additional error properties (like maxAttemptsReached)
      Object.assign(err, error);
      throw err;
    }

    return response.json();
  },

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "GET" });
  },

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  },
};

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: any; requiresOTP: boolean }>("/auth/login", {
      email,
      password,
    }),
  register: (name: string, email: string, password: string, rollNumber: string, inviteToken: string) =>
    apiClient.post<{ message: string }>("/auth/register", {
      name,
      email,
      password,
      rollNumber,
      inviteToken,
    }),
  verifyOTP: (email: string, code: string) =>
    apiClient.post<{ message: string; token: string; user: any }>("/auth/verify-otp", {
      email,
      code,
    }),
};

// Course endpoints
export const courseAPI = {
  createCourse: (courseCode: string, courseName: string, description: string, coursePlan: string) =>
    apiClient.post("/courses", {
      courseCode,
      courseName,
      description,
      coursePlan,
    }),
  updateCourse: (id: string, courseCode: string, courseName: string, description: string, coursePlan: string) =>
    apiClient.put(`/courses/${id}`, {
      courseCode,
      courseName,
      description,
      coursePlan,
    }),
  deleteCourse: (id: string) =>
    apiClient.delete(`/courses/${id}`),
  viewCourse: (id: string) =>
    apiClient.get(`/courses/${id}`),
  encodeCourse: (id: string) =>
    apiClient.get(`/courses/encode/${id}`),
  decodeCourse: (encodedData: string) =>
    apiClient.post("/courses/decode", { encodedData }),
};

// Admin endpoints
export const adminAPI = {
  createInvite: (email: string, role: string) =>
    apiClient.post<{ inviteToken: string; emailSent?: boolean; emailMessageId?: string }>("/admin/invite", {
      email,
      role,
    }),
  getAllApprovedEnrollments: () =>
    apiClient.get<any[]>("/enrollment/all-approved"),
  deleteEnrollment: (id: string) =>
    apiClient.delete(`/enrollment/${id}`),
  getAllStudents: () =>
    apiClient.get<any[]>("/users/students"),
  getAllFaculty: () =>
    apiClient.get<any[]>("/users/faculty"),
  deleteUser: (id: string) =>
    apiClient.delete(`/users/${id}`),
};

// Enrollment endpoints
export const enrollmentAPI = {
  getAllCourses: () =>
    apiClient.get<any[]>("/enrollment/courses"),
  getCourseDetail: (id: string) =>
    apiClient.get<any>(`/enrollment/courses/${id}`),
  enrollCourse: (courseId: string) =>
    apiClient.post("/enrollment/enroll", { courseId }),
  getMyEnrollments: () =>
    apiClient.get<any[]>("/enrollment/my-enrollments"),
  getMyPendingEnrollments: () =>
    apiClient.get<any[]>("/enrollment/my-pending"),
  getMyRejectedEnrollments: () =>
    apiClient.get<any[]>("/enrollment/my-rejected"),
  getPendingEnrollments: () =>
    apiClient.get<any[]>("/enrollment/pending"),
  getApprovedEnrollments: () =>
    apiClient.get<any[]>("/enrollment/approved"),
  updateEnrollmentStatus: (enrollmentId: string, status: string, rejectionReason?: string) =>
    apiClient.post("/enrollment/update-status", { enrollmentId, status, rejectionReason }),
};

// Logout helper
export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export default apiClient;
