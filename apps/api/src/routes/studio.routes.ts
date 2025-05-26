// src/routes/studio.routes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { StudioController } from '../controllers/studio.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Public routes
router.get(
  '/search',
  validate(schemas.searchStudios),
  asyncHandler(StudioController.search)
);

router.get(
  '/:id',
  validate(schemas.idParam),
  asyncHandler(StudioController.getById)
);

router.get(
  '/:id/classes',
  validate(schemas.studioClasses),
  asyncHandler(StudioController.getClasses)
);

router.get(
  '/:id/schedule',
  validate(schemas.scheduleQuery),
  asyncHandler(StudioController.getSchedule)
);

router.get(
  '/:id/reviews',
  validate(schemas.studioReviews),
  asyncHandler(StudioController.getReviews)
);

// Partner only routes
router.post(
  '/',
  authenticate,
  authorize('PARTNER'),
  validate(schemas.createStudio),
  asyncHandler(StudioController.create)
);

router.put(
  '/:id',
  authenticate,
  authorize('PARTNER'),
  validate(schemas.updateStudio),
  asyncHandler(StudioController.update)
);

router.delete(
  '/:id',
  authenticate,
  authorize('PARTNER'),
  validate(schemas.idParam),
  asyncHandler(StudioController.delete)
);

router.get(
  '/:id/analytics',
  authenticate,
  authorize('PARTNER'),
  validate(schemas.analyticsQuery),
  asyncHandler(StudioController.getAnalytics)
);

export default router;
