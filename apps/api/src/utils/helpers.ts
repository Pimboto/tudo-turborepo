// src/utils/constants.ts
export const CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Commission
  DEFAULT_COMMISSION_RATE: 0.15,
  
  // Credits
  REFERRAL_CREDITS: 50,
  
  // Session
  MIN_SESSION_DURATION: 15, // minutes
  MAX_SESSION_DURATION: 480, // 8 hours
  
  // Booking
  MIN_BOOKING_ADVANCE: 0, // Can book immediately
  MAX_BOOKING_ADVANCE: 30, // days
  
  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Amenities
  AMENITIES: [
    'showers',
    'lockers',
    'parking',
    'wifi',
    'changing_rooms',
    'towels',
    'water_fountain',
    'air_conditioning',
    'music',
    'mats_provided',
    'equipment_provided',
    'juice_bar',
    'sauna',
    'pool',
    'personal_training',
    'beginner_friendly',
    'advanced_level',
    'wheelchair_accessible',
  ],
  
  // Class types
  CLASS_TYPES: [
    'yoga',
    'pilates',
    'spinning',
    'crossfit',
    'boxing',
    'dance',
    'martial_arts',
    'swimming',
    'running',
    'strength_training',
    'hiit',
    'meditation',
    'stretching',
    'barre',
    'cycling',
    'bootcamp',
    'zumba',
    'kickboxing',
    'functional_training',
  ],
} as const;

// src/utils/helpers.ts
import { customAlphabet } from 'nanoid';

// Generate booking codes
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
export const generateBookingCode = () => nanoid();

// Generate referral codes
const referralNanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
export const generateReferralCode = () => `TUDO${referralNanoid()}`;

// Calculate end time based on start time and duration
export const calculateEndTime = (startTime: Date, durationMinutes: number): Date => {
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);
  return endTime;
};

// Check if a session can be booked
export const canBookSession = (session: any, currentBookings: number): boolean => {
  if (session.status !== 'SCHEDULED') return false;
  if (new Date(session.startTime) < new Date()) return false;
  if (currentBookings >= session.class.maxCapacity) return false;
  return true;
};

// Format price
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

// Pagination helper
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export const getPagination = (params: PaginationParams): PaginationResult => {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(
    CONSTANTS.MAX_PAGE_SIZE, 
    Math.max(1, params.limit ?? CONSTANTS.DEFAULT_PAGE_SIZE)
  );
  
  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
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
  pagination?: ApiResponse['pagination']
): ApiResponse<T> => ({
  success: true,
  data,
  message,
  pagination,
});

export const errorResponse = (error: string, message?: string): ApiResponse => ({
  success: false,
  error,
  message,
});
