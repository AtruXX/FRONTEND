// services/leaveService.js - Leave Management Service
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';
// Helper function to transform backend field names to frontend expectations
const transformLeaveRequest = (request) => {
  if (!request) return request;
  return {
    ...request,
    id: request.idCerere || request.id,
    start_date: request.dataStart || request.start_date,
    end_date: request.dataFinal || request.end_date,
    user_id: request.idSofer || request.user_id,
    driver_id: request.idSofer || request.driver_id,
    rejection_reason: request.motivRespingere || request.rejection_reason,
  };
};
// Helper function to transform paginated response
const transformLeaveRequestsResponse = (response) => {
  if (!response) return response;
  // Handle both possible response structures
  const requests = response.requests || response.results || [];
  const totalCount = response.total_requests || response.count || requests.length;
  return {
    ...response,
    results: requests.map(transformLeaveRequest),
    count: totalCount,
    // Keep original fields for compatibility
    requests: requests.map(transformLeaveRequest),
    total_requests: totalCount
  };
};
// Helper function to transform calendar response
const transformLeaveCalendarResponse = (response) => {
  if (!response) return response;
  return {
    ...response,
    leave_calendar: response.leave_calendar ? response.leave_calendar.map(transformLeaveRequest) : []
  };
};
// Helper function to wait for auth token
const waitForAuthToken = async () => {
  for (let i = 0; i < 10; i++) {
    const token = await AsyncStorage.getItem('authToken');
    if (token) return token;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('No auth token found');
};
// Custom hook for getting leave calendar
export const useGetLeaveCalendarQuery = (options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const fetchLeaveCalendar = useCallback(async () => {
    if (options.skip) return;
    setIsFetching(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      // Build query parameters
      const params = new URLSearchParams();
      if (options.start_date) params.append('start_date', options.start_date);
      if (options.end_date) params.append('end_date', options.end_date);
      if (options.status) params.append('status', options.status);
      if (options.driver_id) params.append('driver_id', options.driver_id);
      const queryString = params.toString();
      const url = `${BASE_URL}leave-calendar/${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      const calendarData = await response.json();
      const transformedData = transformLeaveCalendarResponse(calendarData);
      setData(transformedData);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options.skip, options.start_date, options.end_date, options.status, options.driver_id]);
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaveCalendar();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchLeaveCalendar]);
  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchLeaveCalendar,
  };
};
// Custom hook for getting leave requests
export const useGetLeaveRequestsQuery = (options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const fetchLeaveRequests = useCallback(async () => {
    if (options.skip) return;
    setIsFetching(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      // Build query parameters
      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.user_id) params.append('user_id', options.user_id);
      if (options.start_date) params.append('start_date', options.start_date);
      if (options.end_date) params.append('end_date', options.end_date);
      if (options.page) params.append('page', options.page);
      const queryString = params.toString();
      const url = `${BASE_URL}leave-requests/${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      const requestsData = await response.json();
      const transformedData = transformLeaveRequestsResponse(requestsData);
      setData(transformedData);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options.skip, options.status, options.user_id, options.start_date, options.end_date, options.page]);
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaveRequests();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchLeaveRequests]);
  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchLeaveRequests,
  };
};
// Custom hook for creating leave request
export const useCreateLeaveRequestMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const createLeaveRequest = useCallback(async (requestData) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      const response = await fetch(`${BASE_URL}leave-requests/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      const data = await response.json();
      const transformedData = transformLeaveRequest(data);
      setIsLoading(false);
      return transformedData;
    } catch (err) {
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);
  const createLeaveRequestMutation = useCallback((variables) => {
    const promise = createLeaveRequest(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [createLeaveRequest]);
  return [createLeaveRequestMutation, { isLoading, error }];
};
// Custom hook for updating leave request
export const useUpdateLeaveRequestMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const updateLeaveRequest = useCallback(async ({ id, ...requestData }) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      const response = await fetch(`${BASE_URL}leave-requests/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      const data = await response.json();
      const transformedData = transformLeaveRequest(data);
      setIsLoading(false);
      return transformedData;
    } catch (err) {
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);
  const updateLeaveRequestMutation = useCallback((variables) => {
    const promise = updateLeaveRequest(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [updateLeaveRequest]);
  return [updateLeaveRequestMutation, { isLoading, error }];
};
// Custom hook for deleting leave request
export const useDeleteLeaveRequestMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const deleteLeaveRequest = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      const response = await fetch(`${BASE_URL}leave-requests/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);
  const deleteLeaveRequestMutation = useCallback((id) => {
    const promise = deleteLeaveRequest(id);
    promise.unwrap = () => promise;
    return promise;
  }, [deleteLeaveRequest]);
  return [deleteLeaveRequestMutation, { isLoading, error }];
};
// Custom hook for approving leave request (dispatcher only)
export const useApproveLeaveRequestMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const approveLeaveRequest = useCallback(async ({ id, approval_notes }) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      const response = await fetch(`${BASE_URL}leave-requests/${id}/approve/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approval_notes }),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);
  const approveLeaveRequestMutation = useCallback((variables) => {
    const promise = approveLeaveRequest(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [approveLeaveRequest]);
  return [approveLeaveRequestMutation, { isLoading, error }];
};
// Custom hook for rejecting leave request (dispatcher only)
export const useRejectLeaveRequestMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const rejectLeaveRequest = useCallback(async ({ id, rejection_reason }) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      const response = await fetch(`${BASE_URL}leave-requests/${id}/reject/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejection_reason }),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);
  const rejectLeaveRequestMutation = useCallback((variables) => {
    const promise = rejectLeaveRequest(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [rejectLeaveRequest]);
  return [rejectLeaveRequestMutation, { isLoading, error }];
};
// Custom hook for getting monthly leave reports (dispatcher only)
export const useGetMonthlyLeaveReportsQuery = (options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const fetchMonthlyReports = useCallback(async () => {
    if (options.skip) return;
    setIsFetching(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      // Build query parameters
      const params = new URLSearchParams();
      if (options.year) params.append('year', options.year);
      if (options.month) params.append('month', options.month);
      if (options.include_details) params.append('include_details', options.include_details);
      const queryString = params.toString();
      const url = `${BASE_URL}leave-reports/monthly/${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      const reportsData = await response.json();
      setData(reportsData);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options.skip, options.year, options.month, options.include_details]);
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMonthlyReports();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchMonthlyReports]);
  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchMonthlyReports,
  };
};