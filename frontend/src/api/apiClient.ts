import axios, { AxiosError } from "axios";

import type { ApiErrorResponse } from "@/types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

export const AUTH_TOKEN_STORAGE_KEY = "saarthi-auth-token";
export const UNAUTHORIZED_EVENT = "saarthi:unauthorized";

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Storage may be unavailable (private mode); auth simply won't persist.
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export class ApiRequestError extends Error {
  errorCode: string | null;
  statusCode: number | null;

  constructor(
    message: string,
    options: {
      cause?: unknown;
      errorCode?: string | null;
      statusCode?: number | null;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiRequestError";
    this.errorCode = options.errorCode ?? null;
    this.statusCode = options.statusCode ?? null;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const responseData = error.response?.data as ApiErrorResponse | undefined;
    const message =
      responseData && typeof responseData === "object" && "message" in responseData
        ? responseData.message
        : error.message || "Unexpected API error";

    if (error.response?.status === 401) {
      setStoredAuthToken(null);
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }

    return Promise.reject(
      new ApiRequestError(`API request failed: ${message}`, {
        cause: error,
        errorCode: responseData?.error_code ?? null,
        statusCode: error.response?.status ?? null,
      })
    );
  }
);
