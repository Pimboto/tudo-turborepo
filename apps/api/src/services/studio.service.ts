// src/services/studio.service.ts
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { CreateStudioDto, UpdateStudioDto, SearchFilters } from '../types';

export class StudioService {
  // Create studio
  static async createStudio(partnerId: string, data: CreateStudioDto) {
    const studio = await prisma.studio.create({
      data: {
        partnerId,
        name: data.name,
        description: data.description,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        amenities: data.amenities,
        photos: data.photos,
      },
    });

    return studio;
  }

  // Get studio by ID
  static async getStudioById(studioId: string) {
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: {
        partner: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        classes: {
          where: { status: 'PUBLISHED' },
          include: {
            _count: {
              select: {
                sessions: true,
              },
            },
          },
        },
        _count: {
          select: {
            classes: true,
          },
        },
      },
    });

    if (!studio) {
      throw new AppError(404, 'Studio not found');
    }

    return studio;
  }

  // Update studio
  static async updateStudio(studioId: string, partnerId: string, data: UpdateStudioDto) {
    // Verify ownership
    const studio = await prisma.studio.findFirst({
      where: { id: studioId, partnerId },
    });

    if (!studio) {
      throw new AppError(404, 'Studio not found or access denied');
    }

    const updated = await prisma.studio.update({
      where: { id: studioId },
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        amenities: data.amenities,
        photos: data.photos,
        isActive: data.isActive,
      },
    });

    return updated;
  }

  // Delete studio (soft delete by setting isActive to false)
  static async deleteStudio(studioId: string, partnerId: string) {
    const studio = await prisma.studio.findFirst({
      where: { id: studioId, partnerId },
    });

    if (!studio) {
      throw new AppError(404, 'Studio not found or access denied');
    }

    await prisma.studio.update({
      where: { id: studioId },
      data: { isActive: false },
    });

    return { message: 'Studio deleted successfully' };
  }

  // Search studios
  static async searchStudios(filters: SearchFilters, pagination: { page: number; limit: number }) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    // Location-based search
    if (filters.lat && filters.lng && filters.radius) {
      // For simplicity, we'll use a basic bounding box
      // In production, you'd want to use PostGIS or similar
      const latDiff = filters.radius / 111; // 1 degree ≈ 111 km
      const lngDiff = filters.radius / (111 * Math.cos(filters.lat * Math.PI / 180));

      where.lat = {
        gte: filters.lat - latDiff,
        lte: filters.lat + latDiff,
      };
      where.lng = {
        gte: filters.lng - lngDiff,
        lte: filters.lng + lngDiff,
      };
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      where.amenities = {
        hasEvery: filters.amenities,
      };
    }

    // Get studios with active classes
    const [studios, total] = await Promise.all([
      prisma.studio.findMany({
        where,
        include: {
          partner: {
            select: {
              isVerified: true,
            },
          },
          classes: {
            where: {
              status: 'PUBLISHED',
              ...(filters.type && { type: filters.type }),
              ...(filters.minPrice !== undefined && {
                basePrice: { gte: filters.minPrice },
              }),
              ...(filters.maxPrice !== undefined && {
                basePrice: { lte: filters.maxPrice },
              }),
            },
            include: {
              sessions: {
                where: {
                  status: 'SCHEDULED',
                  startTime: {
                    gte: filters.startDate || new Date(),
                    ...(filters.endDate && { lte: filters.endDate }),
                  },
                },
                orderBy: { startTime: 'asc' },
                take: 5,
              },
            },
          },
          _count: {
            select: {
              classes: true,
            },
          },
        },
        orderBy: [
          { rating: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.studio.count({ where }),
    ]);

    // Calculate distance if searching by location
    if (filters.lat && filters.lng) {
      studios.forEach((studio: any) => {
        studio.distance = calculateDistance(
          filters.lat!,
          filters.lng!,
          studio.lat,
          studio.lng
        );
      });
      // Sort by distance
      studios.sort((a: any, b: any) => a.distance - b.distance);
    }

    return {
      studios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get studio classes
  static async getStudioClasses(studioId: string, options?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      studioId,
      ...(options?.status && { status: options.status }),
      ...(options?.type && { type: options.type }),
    };

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: {
          sessions: {
            where: {
              status: 'SCHEDULED',
              startTime: { gte: new Date() },
            },
            orderBy: { startTime: 'asc' },
            take: 3,
          },
          _count: {
            select: {
              sessions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.class.count({ where }),
    ]);

    return {
      classes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get studio schedule
  static async getStudioSchedule(studioId: string, startDate: Date, endDate: Date) {
    const sessions = await prisma.session.findMany({
      where: {
        class: {
          studioId,
        },
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        class: true,
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ['CONFIRMED', 'COMPLETED'] },
              },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Group by date
    const schedule: Record<string, typeof sessions> = {};
    sessions.forEach(session => {
      const date = session.startTime.toISOString().split('T')[0];
      if (!schedule[date]) {
        schedule[date] = [];
      }
      schedule[date].push(session);
    });

    return schedule;
  }

  // Get studio reviews (for future implementation)
  static async getStudioReviews(studioId: string, options?: {
    page?: number;
    limit?: number;
  }) {
    // Placeholder for when reviews are implemented
    return {
      reviews: [],
      pagination: {
        page: options?.page ?? 1,
        limit: options?.limit ?? 20,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
