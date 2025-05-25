// src/routes/class.routes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { ClassController } from '../controllers/class.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Public routes
router.get(
  '/upcoming',
  validate(schemas.upcomingSessions),
  asyncHandler(ClassController.getUpcomingSessions)
);

router.get(
  '/:id',
  validate(schemas.idParam),
  asyncHandler(ClassController.getById)
);

router.get(
  '/:id/sessions',
  validate(schemas.classSessions),
  asyncHandler(ClassController.getSessions)
);

// Partner only routes
router.use(authenticate);
router.use(authorize('PARTNER'));

router.post(
  '/',
  validate(schemas.createClass),
  asyncHandler(ClassController.create)
);

router.put(
  '/:id',
  validate(schemas.updateClass),
  asyncHandler(ClassController.update)
);

router.delete(
  '/:id',
  validate(schemas.idParam),
  asyncHandler(ClassController.delete)
);

router.put(
  '/:id/status',
  validate(schemas.updateClassStatus),
  asyncHandler(ClassController.updateStatus)
);

router.post(
  '/:id/duplicate',
  validate(schemas.idParam),
  asyncHandler(ClassController.duplicate)
);

router.post(
  '/:id/sessions',
  validate(schemas.createSession),
  asyncHandler(ClassController.createSession)
);

router.delete(
  '/:id/sessions/:sessionId',
  validate(schemas.classSession),
  asyncHandler(ClassController.cancelSession)
);

router.get(
  '/:id/sessions/:sessionId/attendees',
  validate(schemas.classSession),
  asyncHandler(ClassController.getSessionAttendees)
);

export default router;
