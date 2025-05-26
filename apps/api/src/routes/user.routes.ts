// src/routes/user.routes.ts - WITH SWAGGER DOCUMENTATION
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and account management
 */

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
  authenticate,
  asyncHandler(UserController.getProfile)
);

router.put(
  '/profile',
  authenticate,
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
  authenticate,
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
  authenticate,
  validate(schemas.pagination),
  asyncHandler(UserController.getUpcomingClasses)
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
  authenticate,
  asyncHandler(UserController.getUserStats)
);

export default router;
