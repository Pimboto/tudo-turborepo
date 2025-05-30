// apps/api/src/routes/partner.routes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { PartnerController } from '../controllers/partner.controller';
import { attachUserData, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { requireAuth } from '@clerk/express';

const router: Router = Router();

// The register route is special - CLIENT users can access it to become partners
router.post(
  '/register',
  requireAuth(),
  attachUserData,
  authorize('CLIENT'),
  validate(schemas.createPartner),
  asyncHandler(PartnerController.register)
);

// All other partner routes require authentication and PARTNER role
router.get(
  '/profile',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  asyncHandler(PartnerController.getProfile)
);

router.put(
  '/profile',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  validate(schemas.createPartner),
  asyncHandler(PartnerController.updateProfile)
);

router.get(
  '/dashboard',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  asyncHandler(PartnerController.getDashboard)
);

router.get(
  '/analytics',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  validate(schemas.dateRange),
  asyncHandler(PartnerController.getAnalytics)
);

router.get(
  '/studios',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  validate(schemas.partnerStudios),
  asyncHandler(PartnerController.getStudios)
);

router.post(
  '/request-verification',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  asyncHandler(PartnerController.requestVerification)
);

router.get(
  '/earnings',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  validate(schemas.paginationWithDateRange),
  asyncHandler(PartnerController.getEarnings)
);

router.get(
  '/bookings',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  validate(schemas.partnerBookings),
  asyncHandler(PartnerController.getBookings)
);

export default router;
