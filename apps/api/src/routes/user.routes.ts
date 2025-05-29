// apps/api/src/routes/user.routes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { UserController } from '../controllers/user.controller';
import { attachUserData, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { requireAuth } from '@clerk/express';

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and account management
 */

// All user routes require authentication and user data
// We'll apply both middlewares to each route

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/avatar.jpg"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City, State"
 *               preferences:
 *                 type: object
 *                 properties:
 *                   amenities:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["showers", "parking"]
 *                   classTypes:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["yoga", "pilates"]
 *                   zones:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["downtown", "midtown"]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/profile',
  requireAuth(),
  attachUserData,
  asyncHandler(UserController.getProfile)
);

router.put(
  '/profile',
  requireAuth(),
  attachUserData,
  validate(schemas.updateProfile),
  asyncHandler(UserController.updateProfile)
);

/**
 * @swagger
 * /api/users/bookings:
 *   get:
 *     summary: Get user bookings
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CONFIRMED, CANCELLED, COMPLETED, NO_SHOW]
 *         description: Filter by booking status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
 */
router.get(
  '/bookings',
  validate(schemas.userBookings),
  asyncHandler(UserController.getBookings)
);

/**
 * @swagger
 * /api/users/bookings/upcoming:
 *   get:
 *     summary: Get upcoming classes
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Upcoming classes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
 */
router.get(
  '/bookings/upcoming',
  validate(schemas.pagination),
  asyncHandler(UserController.getUpcomingClasses)
);

/**
 * @swagger
 * /api/users/bookings/history:
 *   get:
 *     summary: Get booking history
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Booking history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
 */
router.get(
  '/bookings/history',
  validate(schemas.pagination),
  asyncHandler(UserController.getBookingHistory)
);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalBookings:
 *                           type: integer
 *                         completedBookings:
 *                           type: integer
 *                         cancelledBookings:
 *                           type: integer
 *                         upcomingBookings:
 *                           type: integer
 *                         credits:
 *                           type: integer
 *                         attendanceRate:
 *                           type: integer
 *                           description: Attendance rate percentage
 */
router.get(
  '/stats',
  asyncHandler(UserController.getUserStats)
);

/**
 * @swagger
 * /api/users/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter only unread notifications
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           type:
 *                             type: string
 *                           title:
 *                             type: string
 *                           body:
 *                             type: string
 *                           readAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 */
router.get(
  '/notifications',
  validate(schemas.userNotifications),
  asyncHandler(UserController.getNotifications)
);

/**
 * @swagger
 * /api/users/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/notifications/:id/read',
  validate(schemas.idParam),
  asyncHandler(UserController.markNotificationRead)
);

/**
 * @swagger
 * /api/users/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put(
  '/notifications/read-all',
  asyncHandler(UserController.markAllNotificationsRead)
);

/**
 * @swagger
 * /api/users/referral:
 *   get:
 *     summary: Get referral information and stats
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Referral information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         referralCode:
 *                           type: string
 *                           example: TUDO123456
 *                         totalReferrals:
 *                           type: integer
 *                         totalCreditsEarned:
 *                           type: integer
 *                         referrals:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               profile:
 *                                 type: object
 *                                 properties:
 *                                   fullName:
 *                                     type: string
 */
router.get(
  '/referral',
  asyncHandler(UserController.getReferralInfo)
);

/**
 * @swagger
 * /api/users/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         amenities:
 *                           type: array
 *                           items:
 *                             type: string
 *                         classTypes:
 *                           type: array
 *                           items:
 *                             type: string
 *                         zones:
 *                           type: array
 *                           items:
 *                             type: string
 *   put:
 *     summary: Update user preferences
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["showers", "parking", "wifi"]
 *               classTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["yoga", "pilates", "spinning"]
 *               zones:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["downtown", "midtown", "uptown"]
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get(
  '/preferences',
  asyncHandler(UserController.getPreferences)
);

router.put(
  '/preferences',
  validate(schemas.updatePreferences),
  asyncHandler(UserController.updatePreferences)
);

export default router;
