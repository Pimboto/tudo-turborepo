// src/routes/admin.routes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router: Router = Router();


// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Dashboard
router.get(
  '/dashboard',
  asyncHandler(AdminController.getDashboard)
);

// Metrics
router.get(
  '/metrics',
  validate(schemas.dateRange),
  asyncHandler(AdminController.getMetrics)
);

// Partner verification
router.get(
  '/partners/pending',
  validate(schemas.pagination),
  asyncHandler(AdminController.getPendingVerifications)
);

router.put(
  '/partners/:id/verify',
  validate(schemas.idParam),
  asyncHandler(AdminController.verifyPartner)
);

router.put(
  '/partners/:id/reject',
  validate(schemas.rejectPartner),
  asyncHandler(AdminController.rejectPartner)
);

// Users management
router.get(
  '/users',
  validate(schemas.adminUsers),
  asyncHandler(AdminController.getUsers)
);

router.put(
  '/users/:id/status',
  validate(schemas.updateUserStatus),
  asyncHandler(AdminController.updateUserStatus)
);

// Revenue reports
router.get(
  '/reports/revenue',
  validate(schemas.revenueReport),
  asyncHandler(AdminController.getRevenueReport)
);

// Bookings management
router.get(
  '/bookings',
  validate(schemas.adminBookings),
  asyncHandler(AdminController.getBookings)
);

// Studios management
router.get(
  '/studios',
  validate(schemas.adminStudios),
  asyncHandler(AdminController.getStudios)
);

router.put(
  '/studios/:id/toggle-status',
  validate(schemas.idParam),
  asyncHandler(AdminController.toggleStudioStatus)
);

export default router;
