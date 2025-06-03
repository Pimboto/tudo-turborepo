// src/middleware/validation.ts - CORRECCIÓN CRÍTICA para fechas
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError, z } from "zod";

export const validate = (schema: AnyZodObject) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Validation error",
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  };
};

export const paymentSchemas = {
  // Crear sesión de checkout
  createCheckoutSession: z.object({
    body: z.object({
      credits: z
        .number()
        .int()
        .min(1, 'Minimum 1 credit required')
        .max(10000, 'Maximum 10,000 credits per purchase'),
    }),
  }),

  // Historial de compras
  purchaseHistory: z.object({
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      status: z
        .enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'])
        .optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  }),

  // Verificar sesión de pago
  sessionIdParam: z.object({
    params: z.object({
      sessionId: z.string().min(1, 'Session ID is required'),
    }),
  }),

  // Información de éxito de pago
  paymentSuccess: z.object({
    query: z.object({
      sessionId: z.string().min(1, 'Session ID is required'),
    }),
  }),

  // Simular compra (solo desarrollo)
  simulatePurchase: z.object({
    body: z.object({
      credits: z
        .number()
        .int()
        .min(1, 'Minimum 1 credit required')
        .max(1000, 'Maximum 1,000 credits for simulation'),
    }),
  }),
};

export const schemas = {
  // User schemas
  createUser: z.object({
    body: z.object({
      email: z.string().email(),
      clerkId: z.string(),
      role: z.enum(["CLIENT", "PARTNER", "ADMIN"]).optional(),
      referralCode: z.string().optional(),
    }),
  }),

  updateProfile: z.object({
    body: z.object({
      fullName: z.string().min(1).optional(),
      phone: z.string().optional(),
      avatarUrl: z.string().url().optional(),
      address: z.string().optional(),
      preferences: z
        .object({
          amenities: z.array(z.string()).optional(),
          classTypes: z.array(z.string()).optional(),
          zones: z.array(z.string()).optional(),
        })
        .optional(),
    }),
  }),

  updatePreferences: z.object({
    body: z.object({
      amenities: z.array(z.string()).optional(),
      classTypes: z.array(z.string()).optional(),
      zones: z.array(z.string()).optional(),
    }),
  }),

  userBookings: z.object({
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      status: z.string().optional(),
    }),
  }),

  userNotifications: z.object({
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      unreadOnly: z.string().optional(),
    }),
  }),

  // Partner schemas
  createPartner: z.object({
    body: z.object({
      companyName: z.string().min(1),
      taxInfo: z.string().optional(),
    }),
  }),

  partnerBookings: z.object({
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      status: z.string().optional(),
      studioId: z.string().optional(),
    }),
  }),

  partnerStudios: z.object({
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      isActive: z.string().optional(),
    }),
  }),

  // Studio schemas
  createStudio: z.object({
    body: z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      address: z.string().min(1),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      amenities: z.array(z.string()),
      photos: z.array(z.string().url()),
    }),
  }),

  updateStudio: z.object({
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      name: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      address: z.string().min(1).optional(),
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
      amenities: z.array(z.string()).optional(),
      photos: z.array(z.string().url()).optional(),
      isActive: z.boolean().optional(),
    }),
  }),

  studioClasses: z.object({
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      status: z.string().optional(),
      type: z.string().optional(),
    }),
  }),

  // Class schemas
  createClass: z.object({
    body: z.object({
      studioId: z.string(),
      title: z.string().min(1),
      description: z.string().min(1),
      type: z.string().min(1),
      durationMinutes: z.number().min(15).max(480),
      maxCapacity: z.number().min(1).max(500),
      basePrice: z.number().min(0),
      photos: z.array(z.string().url()),
      amenities: z.array(z.string()),
    }),
  }),

  updateClass: z.object({
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      type: z.string().min(1).optional(),
      durationMinutes: z.number().min(15).max(480).optional(),
      maxCapacity: z.number().min(1).max(500).optional(),
      basePrice: z.number().min(0).optional(),
      photos: z.array(z.string().url()).optional(),
      amenities: z.array(z.string()).optional(),
    }),
  }),

  updateClassStatus: z.object({
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "ARCHIVED"]),
    }),
  }),

  classSessions: z.object({
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      status: z.string().optional(),
      // CORRECCIÓN CRÍTICA: Cambiar de datetime() a string() para fechas ISO
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
    }),
  }),

  upcomingSessions: z.object({
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      type: z.string().optional(),
      studioId: z.string().optional(),
    }),
  }),

  classSession: z.object({
    params: z.object({
      id: z.string(),
      sessionId: z.string(),
    }),
  }),

  // Session schemas
  createSession: z.object({
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      // CORRECCIÓN CRÍTICA: Cambiar datetime() a string()
      startTime: z.string(),
      instructorName: z.string().min(1),
    }),
  }),

  // Booking schemas
  createBooking: z.object({
    body: z.object({
      sessionId: z.string(),
    }),
  }),

  availableSessions: z.object({
    query: z.object({
      studioId: z.string().optional(),
      classId: z.string().optional(),
      // CORRECCIÓN CRÍTICA: Cambiar datetime() a string()
      date: z.string().optional(),
    }),
  }),

  bookingCode: z.object({
    params: z.object({
      code: z.string(),
    }),
  }),

  sessionId: z.object({
    params: z.object({
      sessionId: z.string(),
    }),
  }),

  // Admin schemas
  rejectPartner: z.object({
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      reason: z.string().optional(),
    }),
  }),

  adminUsers: z.object({
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      role: z.string().optional(),
      search: z.string().optional(),
    }),
  }),

  updateUserStatus: z.object({
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      verified: z.boolean(),
    }),
  }),

  // CORRECCIÓN CRÍTICA: Reporte de revenue acepta fechas como strings ISO
  revenueReport: z.object({
    query: z.object({
      startDate: z.string(), // ISO string como "2025-05-01"
      endDate: z.string(),   // ISO string como "2025-05-31"
    }),
  }),

  adminBookings: z.object({
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      status: z.string().optional(),
      studioId: z.string().optional(),
      // CORRECCIÓN CRÍTICA: Cambiar datetime() a string()
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  }),

  adminStudios: z.object({
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      isActive: z.string().optional(),
      partnerId: z.string().optional(),
    }),
  }),

  // Common schemas
  pagination: z.object({
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
    }),
  }),

  // CORRECCIÓN CRÍTICA: DateRange con strings en lugar de datetime()
  dateRange: z.object({
    query: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  }),

  scheduleQuery: z.object({
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      // CORRECCIÓN CRÍTICA: Cambiar datetime() a string()
      startDate: z.string(),
      endDate: z.string(),
    }),
  }),

  analyticsQuery: z.object({
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      // CORRECCIÓN CRÍTICA: Cambiar datetime() a string()
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  }),

  studioReviews: z.object({
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
    }),
  }),

  paginationWithDateRange: z.object({
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      // CORRECCIÓN CRÍTICA: Cambiar datetime() a string()
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  }),

  idParam: z.object({
    params: z.object({
      id: z.string(),
    }),
  }),

  searchStudios: z.object({
    query: z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      lat: z.string().transform(Number).optional(),
      lng: z.string().transform(Number).optional(),
      radius: z.string().transform(Number).optional(),
      type: z.string().optional(),
      amenities: z.string().optional(),
      minPrice: z.string().transform(Number).optional(),
      maxPrice: z.string().transform(Number).optional(),
      // CORRECCIÓN CRÍTICA: Cambiar datetime() a string()
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  }),
};
