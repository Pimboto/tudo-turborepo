// apps/api/src/routes/admin.routes.ts - Actualizado para Clerk
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { AdminController } from '../controllers/admin.controller';
import { attachUserData, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { requireAuth } from '@clerk/express';

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations and platform management (Admin only)
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard overview
 *     tags: [Admin]
 *     description: Comprehensive dashboard with platform metrics, user stats, and recent activity
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
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
 *                         totalUsers:
 *                           type: integer
 *                           example: 1250
 *                           description: Total number of CLIENT users
 *                         totalPartners:
 *                           type: integer
 *                           example: 85
 *                           description: Total number of partner accounts
 *                         verifiedPartners:
 *                           type: integer
 *                           example: 68
 *                           description: Number of verified partners
 *                         pendingPartners:
 *                           type: integer
 *                           example: 17
 *                           description: Partners pending verification
 *                         totalStudios:
 *                           type: integer
 *                           example: 120
 *                           description: Total active studios
 *                         totalBookings:
 *                           type: integer
 *                           example: 15750
 *                           description: Total bookings all time
 *                         totalRevenue:
 *                           type: number
 *                           example: 425750.50
 *                           description: Total platform revenue
 *                         activeUsers:
 *                           type: integer
 *                           example: 890
 *                           description: Users active in last 30 days
 *                         recentMetrics:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                               bookings:
 *                                 type: integer
 *                               revenue:
 *                                 type: number
 *                               newUsers:
 *                                 type: integer
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/dashboard',
  requireAuth(),
  attachUserData,
  authorize('ADMIN'),
  asyncHandler(AdminController.getDashboard)
);


/**
 * @swagger
 * /api/admin/metrics:
 *   get:
 *     summary: Get system metrics
 *     tags: [Admin]
 *     description: Historical system metrics for analytics and reporting
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for metrics period
 *         example: "2024-01-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for metrics period
 *         example: "2024-01-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
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
 *                           date:
 *                             type: string
 *                             format: date
 *                           totalUsers:
 *                             type: integer
 *                           totalPartners:
 *                             type: integer
 *                           totalStudios:
 *                             type: integer
 *                           totalBookings:
 *                             type: integer
 *                           totalRevenue:
 *                             type: number
 *                           activeUsers:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 */
router.get(
  '/metrics',
  requireAuth(),
  attachUserData,
  authorize('ADMIN'),
  validate(schemas.dateRange),
  asyncHandler(AdminController.getMetrics)
);

/**
 * @swagger
 * /api/admin/partners/pending:
 *   get:
 *     summary: Get pending partner verifications
 *     tags: [Admin]
 *     description: List of partners waiting for admin verification
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
 *         description: Pending partners retrieved successfully
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
 *                         allOf:
 *                           - $ref: '#/components/schemas/Partner'
 *                           - type: object
 *                             properties:
 *                               user:
 *                                 allOf:
 *                                   - $ref: '#/components/schemas/User'
 *                                   - type: object
 *                                     properties:
 *                                       profile:
 *                                         $ref: '#/components/schemas/Profile'
 *                               studios:
 *                                 type: array
 *                                 items:
 *                                   allOf:
 *                                     - $ref: '#/components/schemas/Studio'
 *                                     - type: object
 *                                       properties:
 *                                         _count:
 *                                           type: object
 *                                           properties:
 *                                             classes:
 *                                               type: integer
 */
router.get(
  '/partners/pending',
  requireAuth(),
  attachUserData,
  authorize('ADMIN'),
  validate(schemas.pagination),
  asyncHandler(AdminController.getPendingVerifications)
);

/**
 * @swagger
 * /api/admin/partners/{id}/verify:
 *   put:
 *     summary: Verify partner account
 *     tags: [Admin]
 *     description: Approve a partner verification request
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner ID
 *     responses:
 *       200:
 *         description: Partner verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Partner'
 *       400:
 *         description: Partner already verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Partner not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/partners/:id/verify',
  requireAuth(),
  attachUserData,
  authorize('ADMIN'),
  validate(schemas.idParam),
  asyncHandler(AdminController.verifyPartner)
);

/**
 * @swagger
 * /api/admin/partners/{id}/reject:
 *   put:
 *     summary: Reject partner verification
 *     tags: [Admin]
 *     description: Reject a partner verification request with optional reason
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Incomplete documentation provided. Please submit all required business documents."
 *                 description: Reason for rejection (optional)
 *     responses:
 *       200:
 *         description: Partner verification rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Partner not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/partners/:id/reject',
  requireAuth(),
  attachUserData,
  authorize('ADMIN'),
  validate(schemas.rejectPartner),
  asyncHandler(AdminController.rejectPartner)
);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     description: List all platform users with filtering and search capabilities
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
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [CLIENT, PARTNER, ADMIN]
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by email or full name
 *         example: "john@example.com"
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                         allOf:
 *                           - $ref: '#/components/schemas/User'
 *                           - type: object
 *                             properties:
 *                               profile:
 *                                 $ref: '#/components/schemas/Profile'
 *                               partner:
 *                                 $ref: '#/components/schemas/Partner'
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   bookings:
 *                                     type: integer
 *                                   referrals:
 *                                     type: integer
 */
router.get(
  '/users',
  requireAuth(),
  attachUserData,
  authorize('ADMIN'),
  validate(schemas.adminUsers),
  asyncHandler(AdminController.getUsers)
);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update user verification status
 *     tags: [Admin]
 *     description: Verify or unverify a user account
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verified
 *             properties:
 *               verified:
 *                 type: boolean
 *                 example: true
 *                 description: Verification status
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/users/:id/status',
  requireAuth(),
  attachUserData,
  authorize('ADMIN'),
  validate(schemas.updateUserStatus),
  asyncHandler(AdminController.updateUserStatus)
);

/**
 * @swagger
 * /api/admin/reports/revenue:
 *   get:
 *     summary: Get revenue report
 *     tags: [Admin]
 *     description: Detailed revenue analytics including breakdowns by studio, day, and top classes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for report period
 *         example: "2024-01-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for report period
 *         example: "2024-01-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Revenue report generated successfully
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
 *                         totalRevenue:
 *                           type: number
 *                           example: 45750.50
 *                           description: Total revenue for the period
 *                         revenueByStudio:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               bookings:
 *                                 type: integer
 *                               revenue:
 *                                 type: number
 *                               avgBookingValue:
 *                                 type: number
 *                         revenueByDay:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                               bookings:
 *                                 type: integer
 *                               revenue:
 *                                 type: number
 *                         topClasses:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               studioName:
 *                                 type: string
 *                               bookings:
 *                                 type: integer
 *                               revenue:
 *                                 type: number
 *       400:
 *         description: Start date and end date are required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/reports/revenue',
  requireAuth(),
  attachUserData,
  authorize('ADMIN'),
  validate(schemas.revenueReport),
  asyncHandler(AdminController.getRevenueReport)
);

/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Admin]
 *     description: List all platform bookings with filtering capabilities
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CONFIRMED, CANCELLED, COMPLETED, NO_SHOW]
 *         description: Filter by booking status
 *       - in: query
 *         name: studioId
 *         schema:
 *           type: string
 *         description: Filter by studio ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter bookings from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter bookings to this date
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
 *                         allOf:
 *                           - $ref: '#/components/schemas/Booking'
 *                           - type: object
 *                             properties:
 *                               user:
 *                                 allOf:
 *                                   - $ref: '#/components/schemas/User'
 *                                   - type: object
 *                                     properties:
 *                                       profile:
 *                                         $ref: '#/components/schemas/Profile'
 *                               session:
 *                                 allOf:
 *                                   - $ref: '#/components/schemas/Session'
 *                                   - type: object
 *                                     properties:
 *                                       class:
 *                                         allOf:
 *                                           - $ref: '#/components/schemas/Class'
 *                                           - type: object
 *                                             properties:
 *                                               studio:
 *                                                 $ref: '#/components/schemas/Studio'
 */
router.get(
  '/bookings',
  requireAuth(),
  attachUserData,
  authorize('ADMIN'),
  validate(schemas.adminBookings),
  asyncHandler(AdminController.getBookings)
);

/**
 * @swagger
 * /api/admin/studios:
 *   get:
 *     summary: Get all studios
 *     tags: [Admin]
 *     description: List all studios on the platform with filtering capabilities
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
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter by studio active status
 *       - in: query
 *         name: partnerId
 *         schema:
 *           type: string
 *         description: Filter by partner ID
 *     responses:
 *       200:
 *         description: Studios retrieved successfully
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
 *                         allOf:
 *                           - $ref: '#/components/schemas/Studio'
 *                           - type: object
 *                             properties:
 *                               partner:
 *                                 allOf:
 *                                   - $ref: '#/components/schemas/Partner'
 *                                   - type: object
 *                                     properties:
 *                                       user:
 *                                         allOf:
 *                                           - $ref: '#/components/schemas/User'
 *                                           - type: object
 *                                             properties:
 *                                               profile:
 *                                                 $ref: '#/components/schemas/Profile'
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   classes:
 *                                     type: integer
 */
router.get(
  '/studios',
  requireAuth(),
  attachUserData,
  authorize('ADMIN'),
  validate(schemas.adminStudios),
  asyncHandler(AdminController.getStudios)
);

/**
 * @swagger
 * /api/admin/studios/{id}/toggle-status:
 *   put:
 *     summary: Toggle studio active status
 *     tags: [Admin]
 *     description: Activate or deactivate a studio
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Studio ID
 *     responses:
 *       200:
 *         description: Studio status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Studio'
 *       404:
 *         description: Studio not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/studios/:id/toggle-status',
  requireAuth(),
  attachUserData,
  authorize('ADMIN'),
  validate(schemas.idParam),
  asyncHandler(AdminController.toggleStudioStatus)
);

export default router;
