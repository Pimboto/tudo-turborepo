/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/api/src/types/index.ts - CORREGIDO
import { Request } from 'express';

// Define los enums localmente ya que Prisma puede tener problemas de importación
export enum UserRole {
  CLIENT = 'CLIENT',
  PARTNER = 'PARTNER',
  ADMIN = 'ADMIN'
}

export enum PurchaseStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

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

// ===== TIPOS PARA PAGOS Y STRIPE =====

export interface CreateCheckoutSessionDto {
  credits: number;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  amount: number;
  credits: number;
}

export interface PurchaseHistoryFilters {
  status?: PurchaseStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface UserPurchaseStats {
  totalPurchases: number;
  totalSpent: number;
  totalCredits: number;
  successfulPurchases: number;
  successRate: number;
  lastPurchase?: {
    createdAt: Date;
    status: PurchaseStatus;
    credits: number;
  };
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular: boolean;
  description: string;
  savings?: string;
}

export interface PaymentSessionVerification {
  purchase: {
    id: string;
    credits: number;
    amount: number;
    status: PurchaseStatus;
    stripeSessionId: string;
    createdAt: Date;
  };
  stripeSession: {
    id: string;
    payment_status: string;
    amount_total: number;
    expires_at: number;
  };
}

export interface PurchaseDetails {
  id: string;
  userId: string;
  amount: number;
  credits: number;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  status: PurchaseStatus;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  user: {
    email: string;
    profile?: {
      fullName: string;
    };
  };
  stripeDetails?: any;
}

export interface PaymentSuccessInfo {
  purchase: {
    id: string;
    credits: number;
    amount: number;
    status: PurchaseStatus;
    createdAt: Date;
  };
  stripeSession: {
    id: string;
    payment_status: string;
    amount_total: number;
    currency: string;
  };
  success: boolean;
}

export interface CurrentCreditsResponse {
  currentCredits: number;
  totalPurchases: number;
}

export interface StripeWebhookMetadata {
  userId?: string;
  credits?: string;
  type?: string;
  [key: string]: string | undefined;
}

export interface StripeConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  apiVersion: string;
}

export interface SimulatePurchaseDto {
  credits: number;
}

export interface ProcessedWebhookEvent {
  id: string;
  stripeEventId: string;
  eventType: string;
  processed: boolean;
  data: any;
  processingError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedPurchasesResponse {
  purchases: Array<{
    id: string;
    amount: number;
    credits: number;
    status: PurchaseStatus;
    createdAt: Date;
    updatedAt: Date;
    metadata: any;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const PAYMENT_CONSTANTS = {
  CREDIT_PRICE_CENTS: 100,
  MIN_CREDITS_PURCHASE: 1,
  MAX_CREDITS_PURCHASE: 10000,
  MAX_CREDITS_SIMULATION: 1000,
  DEFAULT_CURRENCY: 'usd',
  SUPPORTED_PAYMENT_METHODS: ['card'],
  WEBHOOK_EVENTS: [
    'checkout.session.completed',
    'checkout.session.expired',
    'payment_intent.payment_failed',
    'payment_intent.canceled',
  ] as const,
  NOTIFICATION_TYPES: {
    CREDITS_PURCHASED: 'CREDITS_PURCHASED',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
    REFUND_PROCESSED: 'REFUND_PROCESSED',
  } as const,
} as const;

export type SupportedWebhookEvent = typeof PAYMENT_CONSTANTS.WEBHOOK_EVENTS[number];
export type PaymentNotificationType = typeof PAYMENT_CONSTANTS.NOTIFICATION_TYPES[keyof typeof PAYMENT_CONSTANTS.NOTIFICATION_TYPES];