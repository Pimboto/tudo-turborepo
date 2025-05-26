// src/controllers/class.controller.ts
import { Response, Request } from "express";
import { AuthenticatedRequest } from "../types";
import { ClassService } from "../services/class.service";
import { successResponse, getPagination } from "../utils/helpers";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../prisma/client";

export class ClassController {
  // Create class (Partner only)
  static async create(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { studioId } = req.body;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const classData = await ClassService.createClass(
      studioId,
      partner.id,
      req.body
    );

    res
      .status(201)
      .json(successResponse(classData, "Class created successfully"));
  }

  // Get class by ID (Public)
  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    const classData = await ClassService.getClassById(id);

    res.json(successResponse(classData));
  }

  // Update class (Partner only)
  static async update(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const updated = await ClassService.updateClass(id, partner.id, req.body);

    res.json(successResponse(updated, "Class updated successfully"));
  }

  // Delete class (Partner only)
  static async delete(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const result = await ClassService.deleteClass(id, partner.id);

    res.json(successResponse(result));
  }

  // Update class status (Partner only)
  static async updateStatus(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const updated = await ClassService.updateClassStatus(
      id,
      partner.id,
      status
    );

    res.json(successResponse(updated, "Class status updated successfully"));
  }

  // Create session (Partner only)
  static async createSession(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const session = await ClassService.createSession(id, partner.id, req.body);

    res
      .status(201)
      .json(successResponse(session, "Session created successfully"));
  }

  // Get class sessions (Public)
  static async getSessions(req: Request, res: Response) {
    const { id } = req.params;
    const { page, limit } = getPagination(req.query);
    const { status, fromDate, toDate } = req.query;

    const options: {
      page: number;
      limit: number;
      status?: string;
      fromDate?: Date;
      toDate?: Date;
    } = { page, limit };

    if (status) options.status = status as string;
    if (fromDate) options.fromDate = new Date(fromDate as string);
    if (toDate) options.toDate = new Date(toDate as string);

    const result = await ClassService.getClassSessions(id, options);

    res.json(successResponse(result.sessions, undefined, result.pagination));
  }

  // Cancel session (Partner only)
  static async cancelSession(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id, sessionId } = req.params;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const cancelled = await ClassService.cancelSession(sessionId, partner.id);

    res.json(successResponse(cancelled, "Session cancelled successfully"));
  }

  // Duplicate class (Partner only)
  static async duplicate(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const duplicate = await ClassService.duplicateClass(id, partner.id);

    res
      .status(201)
      .json(successResponse(duplicate, "Class duplicated successfully"));
  }

  // Get session attendees (Partner only)
  static async getSessionAttendees(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id, sessionId } = req.params;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const attendees = await ClassService.getSessionAttendees(
      sessionId,
      partner.id
    );

    res.json(successResponse(attendees));
  }

  // Get upcoming sessions (Public)
  static async getUpcomingSessions(req: Request, res: Response) {
    const { page, limit } = getPagination(req.query);
    const { type, studioId } = req.query;

    const where: any = {
      status: "SCHEDULED" as const,
      startTime: { gte: new Date() },
      class: {
        status: "PUBLISHED" as const,
        ...(type && { type: type as string }),
        ...(studioId && { studioId: studioId as string }),
      },
    };

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        include: {
          class: {
            include: {
              studio: true,
            },
          },
          _count: {
            select: {
              bookings: {
                where: {
                  status: { in: ["CONFIRMED", "COMPLETED"] },
                },
              },
            },
          },
        },
        orderBy: { startTime: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.session.count({ where }),
    ]);

    res.json(
      successResponse(sessions, undefined, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    );
  }
}
