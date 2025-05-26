// src/utils/helpers.ts
import { customAlphabet } from "nanoid";
import { CONSTANTS } from "./constants";

// Generate booking codes
const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);
export const generateBookingCode = () => nanoid();

// Generate referral codes
const referralNanoid = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  6
);
export const generateReferralCode = () => `TUDO${referralNanoid()}`;

// Calculate end time based on start time and duration
export const calculateEndTime = (
  startTime: Date,
  durationMinutes: number
): Date => {
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);
  return endTime;
};

// Check if a session can be booked
export const canBookSession = (
  session: any,
  currentBookings: number
): boolean => {
  if (session.status !== "SCHEDULED") return false;
  if (new Date(session.startTime) < new Date()) return false;
  if (currentBookings >= session.class.maxCapacity) return false;
  return true;
};

// Format price
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

// Pagination helper
export interface PaginationParams {
  page?: string | number;
  limit?: string | number;
}

export const getPagination = (query: any): { page: number; limit: number } => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(
    CONSTANTS.MAX_PAGE_SIZE,
    Math.max(1, parseInt(query.limit) || CONSTANTS.DEFAULT_PAGE_SIZE)
  );

  return { page, limit };
};

// Response formatter
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const successResponse = <T>(
  data: T,
  message?: string,
  pagination?: ApiResponse["pagination"]
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (message !== undefined) response.message = message;
  if (pagination !== undefined) response.pagination = pagination;

  return response;
};

export const errorResponse = (error: string, message?: string): ApiResponse => {
  const response: ApiResponse = {
    success: false,
    error,
  };

  if (message !== undefined) response.message = message;

  return response;
};
