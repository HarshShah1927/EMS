const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AttendanceRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'work-from-home';
  workingHours: number;
  breakTime?: number;
  overtime?: number;
  notes?: string;
  location: 'office' | 'home' | 'client-site' | 'other';
  isManualEntry?: boolean;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceStats {
  present: number;
  late: number;
  absent: number;
  total: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

interface PaginatedResponse<T> {
  attendance: T[];
  stats?: AttendanceStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class AttendanceService {
  private getAuthToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/attendance${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Employee Self-Service Methods
  async checkIn(location: string = 'office', notes?: string): Promise<AttendanceRecord> {
    const response = await this.makeRequest<AttendanceRecord>('/check-in', {
      method: 'POST',
      body: JSON.stringify({ location, notes }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Check-in failed');
    }

    return response.data;
  }

  async checkOut(notes?: string, breakTime?: number): Promise<AttendanceRecord> {
    const response = await this.makeRequest<AttendanceRecord>('/check-out', {
      method: 'PUT',
      body: JSON.stringify({ notes, breakTime }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Check-out failed');
    }

    return response.data;
  }

  async getTodayStatus(): Promise<{
    hasCheckedIn: boolean;
    hasCheckedOut: boolean;
    attendance: AttendanceRecord | null;
  }> {
    const response = await this.makeRequest<{
      hasCheckedIn: boolean;
      hasCheckedOut: boolean;
      attendance: AttendanceRecord | null;
    }>('/today-status');

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get today\'s status');
    }

    return response.data;
  }

  async getMyRecords(
    page: number = 1,
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<PaginatedResponse<AttendanceRecord>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await this.makeRequest<PaginatedResponse<AttendanceRecord>>(
      `/my-records?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch attendance records');
    }

    return response.data;
  }

  // Admin/HR Methods
  async getAllAttendance(
    page: number = 1,
    limit: number = 50,
    date?: string,
    employeeId?: string,
    status?: string
  ): Promise<PaginatedResponse<AttendanceRecord>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (date) params.append('date', date);
    if (employeeId) params.append('employeeId', employeeId);
    if (status) params.append('status', status);

    const response = await this.makeRequest<PaginatedResponse<AttendanceRecord>>(
      `/all?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch attendance records');
    }

    return response.data;
  }

  async createManualEntry(attendanceData: {
    employeeId: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: string;
    workingHours?: number;
    breakTime?: number;
    notes?: string;
    location?: string;
  }): Promise<AttendanceRecord> {
    const response = await this.makeRequest<AttendanceRecord>('/manual-entry', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create manual entry');
    }

    return response.data;
  }

  async updateAttendance(
    id: string,
    updates: Partial<{
      checkIn: string;
      checkOut: string;
      status: string;
      workingHours: number;
      breakTime: number;
      notes: string;
      location: string;
    }>
  ): Promise<AttendanceRecord> {
    const response = await this.makeRequest<AttendanceRecord>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update attendance record');
    }

    return response.data;
  }

  async deleteAttendance(id: string): Promise<void> {
    const response = await this.makeRequest(`/${id}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete attendance record');
    }
  }

  async getAttendanceSummary(
    employeeId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    summary: any[];
    recentAttendance: AttendanceRecord[];
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const endpoint = `/summary/${employeeId}${queryString ? `?${queryString}` : ''}`;

    const response = await this.makeRequest<{
      summary: any[];
      recentAttendance: AttendanceRecord[];
    }>(endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch attendance summary');
    }

    return response.data;
  }

  // Utility methods
  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US');
  }

  calculateWorkingHours(checkIn: string, checkOut: string, breakTime: number = 0): number {
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffInMs = checkOutTime.getTime() - checkInTime.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return Math.max(0, diffInHours - (breakTime / 60));
  }

  isLate(checkInTime: string, standardStartTime: string = '09:00'): boolean {
    const checkIn = new Date(`1970-01-01T${this.formatTime(checkInTime)}`);
    const standard = new Date(`1970-01-01T${standardStartTime}:00`);
    return checkIn > standard;
  }
}

export const attendanceService = new AttendanceService();
export type { AttendanceRecord, AttendanceStats };