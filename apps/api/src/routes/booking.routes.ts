// src/routes/booking.routes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { BookingController } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router: Router = Router();


// Public routes
router.get(
  '/available-sessions',
  validate(schemas.availableSessions),
  asyncHandler(BookingController.getAvailableSessions)
);

router.get(
  '/validate/:code',
  validate(schemas.bookingCode),
  asyncHandler(BookingController.validateCode)
);

// Authenticated user routes
router.use(authenticate);

router.post(
  '/',
  validate(schemas.createBooking),
  asyncHandler(BookingController.create)
);

router.get(
  '/:id',
  validate(schemas.idParam),
  asyncHandler(BookingController.getById)
);

router.put(
  '/:id/cancel',
  validate(schemas.idParam),
  asyncHandler(BookingController.cancel)
);

router.put(
  '/:id/check-in',
  validate(schemas.idParam),
  asyncHandler(BookingController.checkIn)
);

router.get(
  '/:id/qr',
  validate(schemas.idParam),
  asyncHandler(BookingController.getQRData)
);

// Partner only routes
router.get(
  '/code/:code',
  authorize('PARTNER'),
  validate(schemas.bookingCode),
  asyncHandler(BookingController.getByCode)
);

router.put(
  '/code/:code/check-in',
  authorize('PARTNER'),
  validate(schemas.bookingCode),
  asyncHandler(BookingController.checkInByCode)
);

router.put(
  '/session/:sessionId/no-shows',
  authorize('PARTNER'),
  validate(schemas.sessionId),
  asyncHandler(BookingController.markNoShows)
);

export default router;
