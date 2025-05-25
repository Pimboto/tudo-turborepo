// src/types/index.ts
import { UserRole } from '@prisma/client';
import { Request } from 'express';

// Extend Express Request with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    clerkId: string;
    role: UserRole;
    verified: boolean;
  };
}

// DTOs for API requests/responses
export interface CreateUserDto {
  email: string;
  clerkId: string;
  role?: UserRole;
  referralCode?: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  address?: string;
  preferences?: {
    amenities?: string[];
    classTypes?: string[];
    zones?: string[];
  };
}

export interface CreatePartnerDto {
  companyName: string;
  taxInfo?: string;
}

export interface CreateStudioDto {
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  amenities: string[];
  photos: string[];
}

export interface UpdateStudioDto extends Partial<CreateStudioDto> {
  isActive?: boolean;
}

export interface CreateClassDto {
  studioId: string;
  title: string;
  description: string;
  type: string;
  durationMinutes: number;
  maxCapacity: number;
  basePrice: number;
  photos: string[];
  amenities: string[];
}

export interface CreateSessionDto {
  startTime: string | Date;
  instructorName: string;
}

export interface CreateBookingDto {
  sessionId: string;
}

export interface SearchFilters {
  lat?: number;
  lng?: number;
  radius?: number; // km
  type?: string;
  amenities?: string[];
  minPrice?: number;
  maxPrice?: number;
  startDate?: Date;
  endDate?: Date;
  studioId?: string;
}

export interface AdminDashboardData {
  totalUsers: number;
  totalPartners: number;
  verifiedPartners: number;
  pendingPartners: number;
  totalStudios: number;
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  recentMetrics: Array<{
    date: Date;
    bookings: number;
    revenue: number;
    newUsers: number;
  }>;
}
