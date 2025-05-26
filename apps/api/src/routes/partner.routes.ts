// src/routes/partner.routes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { PartnerController } from '../controllers/partner.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router: Router = Router();


// Public route - register as partner (requires auth but not partner role)
router.post(
  '/register',
  authenticate,
  authorize('CLIENT'),
  validate(schemas.createPartner),
  asyncHandler(PartnerController.register)
);

// All routes below require partner role
router.use(authenticate);
router.use(authorize('PARTNER'));

// Profile
router.get(
  '/profile',
  asyncHandler(PartnerController.getProfile)
);

router.put(
  '/profile',
  validate(schemas.createPartner),
  asyncHandler(PartnerController.updateProfile)
);

// Dashboard
router.get(
  '/dashboard',
  asyncHandler(PartnerController.getDashboard)
);

// Analytics
router.get(
  '/analytics',
  validate(schemas.dateRange),
  asyncHandler(PartnerController.getAnalytics)
);

// Studios
router.get(
  '/studios',
  validate(schemas.partnerStudios),
  asyncHandler(PartnerController.getStudios)
);

// Verification
router.post(
  '/request-verification',
  asyncHandler(PartnerController.requestVerification)
);

// Earnings
router.get(
  '/earnings',
  validate(schemas.paginationWithDateRange),
  asyncHandler(PartnerController.getEarnings)
);

// Bookings
router.get(
  '/bookings',
  validate(schemas.partnerBookings),
  asyncHandler(PartnerController.getBookings)
);

export default router;
