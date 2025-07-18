import { ApiResponse, PaginationResponse, AuthUser, LoginCredentials, AdvanceSalary } from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server response is not JSON');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      console.error('Request details:', { url, method: options.method || 'GET' });
      
      // Re-throw with more context
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
      }
      
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
    const response = await this.request<{ user: AuthUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    department: string;
    phone: string;
    employeeId?: string;
  }): Promise<ApiResponse<{ user: AuthUser }>> {
    return this.request<{ user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await this.request<null>('/auth/logout', {
      method: 'POST',
    });

    this.clearToken();
    return response;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    return this.request<null>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async resetPassword(userId: string, newPassword: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/auth/reset-password/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  }

  async getProfile(): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>('/auth/profile');
  }

  async updateProfile(data: Partial<AuthUser>): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Advance Salary endpoints
  async getAdvanceSalaries(params?: {
    status?: string;
    employeeId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginationResponse<AdvanceSalary>> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/advance-salary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<PaginationResponse<AdvanceSalary>>(endpoint) as Promise<PaginationResponse<AdvanceSalary>>;
  }

  async getAdvanceSalary(id: string): Promise<ApiResponse<AdvanceSalary>> {
    return this.request<AdvanceSalary>(`/advance-salary/${id}`);
  }

  async createAdvanceSalary(data: {
    employeeId: string;
    amount: number;
    reason: string;
    deductionSchedule: string;
    monthlyDeduction?: number;
    notes?: string;
  }): Promise<ApiResponse<AdvanceSalary>> {
    return this.request<AdvanceSalary>('/advance-salary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdvanceSalary(id: string, data: {
    amount?: number;
    reason?: string;
    deductionSchedule?: string;
    monthlyDeduction?: number;
    notes?: string;
  }): Promise<ApiResponse<AdvanceSalary>> {
    return this.request<AdvanceSalary>(`/advance-salary/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveAdvanceSalary(id: string): Promise<ApiResponse<AdvanceSalary>> {
    return this.request<AdvanceSalary>(`/advance-salary/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectAdvanceSalary(id: string, rejectionReason: string): Promise<ApiResponse<AdvanceSalary>> {
    return this.request<AdvanceSalary>(`/advance-salary/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason }),
    });
  }

  async markAdvanceSalaryAsPaid(id: string, data: {
    paymentMethod: string;
    deductionStartMonth: string;
    notes?: string;
  }): Promise<ApiResponse<AdvanceSalary>> {
    return this.request<AdvanceSalary>(`/advance-salary/${id}/pay`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdvanceSalarySummary(employeeId: string): Promise<ApiResponse<{
    totalAdvanceAmount: number;
    pendingAdvances: AdvanceSalary[];
    advanceHistory: AdvanceSalary[];
  }>> {
    return this.request<{
      totalAdvanceAmount: number;
      pendingAdvances: AdvanceSalary[];
      advanceHistory: AdvanceSalary[];
    }>(`/advance-salary/employee/${employeeId}/summary`);
  }

  async deleteAdvanceSalary(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/advance-salary/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{
    message: string;
    timestamp: string;
    version: string;
  }>> {
    return this.request<{
      message: string;
      timestamp: string;
      version: string;
    }>('/health');
  }
}

export const apiService = new ApiService();
export default apiService;