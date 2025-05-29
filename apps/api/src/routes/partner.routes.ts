// apps/api/src/routes/partner.routes.ts - Example update
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { PartnerController } from '../controllers/partner.controller';
import { validate, schemas } from '../middleware/validation';
import { attachUserData, authorize } from '../middleware/auth';
import { requireAuth, getAuth, clerkClient } from '@clerk/express';


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

// All other partner routes require PARTNER role
router.use(protectedRoute);
router.use(authorize('PARTNER'));

router.get(
  '/profile',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  asyncHandler(PartnerController.getProfile)
);

router.put(
  '/profile',
  validate(schemas.createPartner),
  asyncHandler(PartnerController.updateProfile)
);

router.get(
  '/dashboard',
  asyncHandler(PartnerController.getDashboard)
);

router.get(
  '/analytics',
  validate(schemas.dateRange),
  asyncHandler(PartnerController.getAnalytics)
);

router.get(
  '/studios',
  validate(schemas.partnerStudios),
  asyncHandler(PartnerController.getStudios)
);

router.post(
  '/request-verification',
  asyncHandler(PartnerController.requestVerification)
);

router.get(
  '/earnings',
  validate(schemas.paginationWithDateRange),
  asyncHandler(PartnerController.getEarnings)
);

router.get(
  '/bookings',
  validate(schemas.partnerBookings),
  asyncHandler(PartnerController.getBookings)
);

export default router;
