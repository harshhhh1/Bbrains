"use client";

import axios, { AxiosInstance } from "axios";

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};

export const API_BASE_URL = getBaseUrl();

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  [key: string]: unknown;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

export async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      return cookieStore.get("token")?.value || null;
    } catch {
      return null;
    }
  }

  const stored = localStorage.getItem("auth_token");
  if (stored && stored !== "null" && stored !== "undefined") {
    return stored;
  }
  return null;
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("auth_token", token);
    const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Lax${secure}`;
  } else {
    localStorage.removeItem("auth_token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

export async function makeRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const token = await getAuthToken();
  const impersonateCollegeId = getCookie("impersonateCollegeId");

  // Handle query parameters
  let url = `${API_BASE_URL}${endpoint}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(impersonateCollegeId ? { 'X-Impersonate-College-Id': impersonateCollegeId } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        error: data.error || data.message,
      };
    }

    return {
      ...data,
      success: true,
      data: (data.data !== undefined ? data.data : data) as T,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const api = {
  get: <T>(endpoint: string, options: RequestOptions = {}) => 
    makeRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options: RequestOptions = {}) => 
    makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown, options: RequestOptions = {}) => 
    makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: unknown, options: RequestOptions = {}) => 
    makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options: RequestOptions = {}) => 
    makeRequest<T>(endpoint, { ...options, method: 'DELETE' }),
  getAuthToken,
};

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getAuthedClient(): Promise<AxiosInstance> {
  const token = await getAuthToken();

  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
