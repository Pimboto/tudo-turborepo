// src/routes/user.routes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get(
  '/profile',
  asyncHandler(UserController.getProfile)
);

router.put(
  '/profile',
  validate(schemas.updateProfile),
  asyncHandler(UserController.updateProfile)
);

// Preferences
router.get(
  '/preferences',
  asyncHandler(UserController.getPreferences)
);

router.put(
  '/preferences',
  validate(schemas.updatePreferences),
  asyncHandler(UserController.updatePreferences)
);

// Bookings
router.get(
  '/bookings',
  validate(schemas.userBookings),
  asyncHandler(UserController.getBookings)
);

router.get(
  '/bookings/history',
  validate(schemas.pagination),
  asyncHandler(UserController.getBookingHistory)
);

router.get(
  '/bookings/upcoming',
  validate(schemas.pagination),
  asyncHandler(UserController.getUpcomingClasses)
);

// Notifications
router.get(
  '/notifications',
  validate(schemas.userNotifications),
  asyncHandler(UserController.getNotifications)
);

router.put(
  '/notifications/:id/read',
  validate(schemas.idParam),
  asyncHandler(UserController.markNotificationRead)
);

router.put(
  '/notifications/read-all',
  asyncHandler(UserController.markAllNotificationsRead)
);

// Referrals
router.get(
  '/referrals',
  asyncHandler(UserController.getReferralInfo)
);

// Stats
router.get(
  '/stats',
  asyncHandler(UserController.getUserStats)
);

export default router;
