// src/routes/partner.routes.ts - WITH SWAGGER DOCUMENTATION
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { PartnerController } from '../controllers/partner.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Partners
 *   description: Partner account management and business operations
 */

/**
 * @swagger
 * /api/partners/register:
 *   post:
 *     summary: Register as a partner
 *     tags: [Partners]
 *     description: Convert a CLIENT account to a PARTNER account
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: "Fitness Studios Inc."
 *                 description: Name of the business/company
 *               taxInfo:
 *                 type: string
 *                 example: "12-3456789"
 *                 description: Tax identification number (optional)
 *     responses:
 *       201:
 *         description: Partner account created successfully
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
 *         description: User is already a partner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - must be authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Must be a CLIENT role to register as partner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Partner account already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/register',
  authenticate,
  authorize('CLIENT'),
  validate(schemas.createPartner),
  asyncHandler(PartnerController.register)
);

/**
 * @swagger
 * /api/partners/profile:
 *   get:
 *     summary: Get partner profile
 *     tags: [Partners]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Partner profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Partner'
 *       404:
 *         description: Partner not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update partner profile
 *     tags: [Partners]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: "Updated Fitness Studios Inc."
 *               taxInfo:
 *                 type: string
 *                 example: "98-7654321"
 *     responses:
 *       200:
 *         description: Partner profile updated successfully
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
router.get(
  '/profile',
  authenticate,
  authorize('PARTNER'),
  asyncHandler(PartnerController.getProfile)
);

router.put(
  '/profile',
  authenticate,
  authorize('PARTNER'),
  validate(schemas.createPartner),
  asyncHandler(PartnerController.updateProfile)
);

/**
 * @swagger
 * /api/partners/dashboard:
 *   get:
 *     summary: Get partner dashboard data
 *     tags: [Partners]
 *     description: Comprehensive dashboard data including analytics, recent bookings, and upcoming sessions
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
 *                         partner:
 *                           $ref: '#/components/schemas/Partner'
 *                         analytics:
 *                           $ref: '#/components/schemas/PartnerAnalytics'
 *                         recentBookings:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Booking'
 *                         upcomingSessions:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Session'
 *                         stats:
 *                           type: object
 *                           properties:
 *                             totalStudios:
 *                               type: integer
 *                               example: 3
 *                             totalClasses:
 *                               type: integer
 *                               example: 15
 *       404:
 *         description: Partner not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/dashboard',
  authenticate,
  authorize('PARTNER'),
  asyncHandler(PartnerController.getDashboard)
);

/**
 * @swagger
 * /api/partners/analytics:
 *   get:
 *     summary: Get partner analytics
 *     tags: [Partners]
 *     description: Detailed analytics for partner's business performance
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics period
 *         example: "2024-01-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics period
 *         example: "2024-01-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PartnerAnalytics'
 */
router.get(
  '/analytics',
  authenticate,
  authorize('PARTNER'),
  validate(schemas.dateRange),
  asyncHandler(PartnerController.getAnalytics)
);

/**
 * @swagger
 * /api/partners/studios:
 *   get:
 *     summary: Get partner's studios
 *     tags: [Partners]
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
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   classes:
 *                                     type: integer
 *                                     example: 5
 */
router.get(
  '/studios',
  authenticate,
  authorize('PARTNER'),
  validate(schemas.partnerStudios),
  asyncHandler(PartnerController.getStudios)
);

/**
 * @swagger
 * /api/partners/request-verification:
 *   post:
 *     summary: Request partner verification
 *     tags: [Partners]
 *     description: Submit a request for admin verification of partner account
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Verification request sent successfully
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
 *                         message:
 *                           type: string
 *                           example: "Verification request sent successfully"
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
router.post(
  '/request-verification',
  authenticate,
  authorize('PARTNER'),
  asyncHandler(PartnerController.requestVerification)
);

/**
 * @swagger
 * /api/partners/earnings:
 *   get:
 *     summary: Get partner earnings
 *     tags: [Partners]
 *     description: Detailed earnings report with commission calculations
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
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for earnings period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for earnings period
 *     responses:
 *       200:
 *         description: Earnings retrieved successfully
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
 *                         earnings:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/Booking'
 *                               - type: object
 *                                 properties:
 *                                   commission:
 *                                     type: number
 *                                     example: 3.75
 *                                     description: Platform commission amount
 *                                   netEarning:
 *                                     type: number
 *                                     example: 21.25
 *                                     description: Net earning after commission
 *                         summary:
 *                           type: object
 *                           properties:
 *                             totalRevenue:
 *                               type: number
 *                               example: 1500.00
 *                             totalCommission:
 *                               type: number
 *                               example: 225.00
 *                             netEarnings:
 *                               type: number
 *                               example: 1275.00
 *                             commissionRate:
 *                               type: number
 *                               example: 0.15
 *                               description: Commission rate (0.15 = 15%)
 */
router.get(
  '/earnings',
  authenticate,
  authorize('PARTNER'),
  validate(schemas.paginationWithDateRange),
  asyncHandler(PartnerController.getEarnings)
);

/**
 * @swagger
 * /api/partners/bookings:
 *   get:
 *     summary: Get partner's bookings
 *     tags: [Partners]
 *     description: All bookings for partner's studios and classes
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
 *         description: Filter by specific studio ID
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
 *                                 $ref: '#/components/schemas/User'
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
  authenticate,
  authorize('PARTNER'),
  validate(schemas.partnerBookings),
  asyncHandler(PartnerController.getBookings)
);

export default router;
