// src/routes/studio.routes.ts - WITH SWAGGER DOCUMENTATION
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { StudioController } from '../controllers/studio.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Studios
 *   description: Studio management and search operations
 */

/**
 * @swagger
 * /api/studios/search:
 *   get:
 *     summary: Search for studios
 *     tags: [Studios]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude for location-based search
 *         example: 40.7128
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude for location-based search
 *         example: -74.0060
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Search radius in kilometers
 *         example: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Class type filter
 *         example: yoga
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: string
 *         description: Comma-separated list of amenities
 *         example: "showers,parking,wifi"
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *         example: 10
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *         example: 50
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for availability
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for availability
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Studios found successfully
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
 *                               distance:
 *                                 type: number
 *                                 description: Distance in kilometers (if location search)
 */
router.get(
  '/search',
  validate(schemas.searchStudios),
  asyncHandler(StudioController.search)
);

/**
 * @swagger
 * /api/studios/{id}:
 *   get:
 *     summary: Get studio by ID
 *     tags: [Studios]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Studio ID
 *     responses:
 *       200:
 *         description: Studio retrieved successfully
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
router.get(
  '/:id',
  validate(schemas.idParam),
  asyncHandler(StudioController.getById)
);

/**
 * @swagger
 * /api/studios/{id}/classes:
 *   get:
 *     summary: Get classes for a studio
 *     tags: [Studios]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Studio ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED]
 *         description: Filter by class status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by class type
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
 *         description: Classes retrieved successfully
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
 *                         $ref: '#/components/schemas/Class'
 */
router.get(
  '/:id/classes',
  validate(schemas.studioClasses),
  asyncHandler(StudioController.getClasses)
);

/**
 * @swagger
 * /api/studios/{id}/schedule:
 *   get:
 *     summary: Get studio schedule
 *     tags: [Studios]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Studio ID
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for schedule
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for schedule
 *     responses:
 *       200:
 *         description: Schedule retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       additionalProperties:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Session'
 *       400:
 *         description: Start date and end date are required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id/schedule',
  validate(schemas.scheduleQuery),
  asyncHandler(StudioController.getSchedule)
);

/**
 * @swagger
 * /api/studios/{id}/reviews:
 *   get:
 *     summary: Get studio reviews
 *     tags: [Studios]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Studio ID
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
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get(
  '/:id/reviews',
  validate(schemas.studioReviews),
  asyncHandler(StudioController.getReviews)
);

/**
 * @swagger
 * /api/studios:
 *   post:
 *     summary: Create a new studio (Partner only)
 *     tags: [Studios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - address
 *               - lat
 *               - lng
 *               - amenities
 *               - photos
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Zen Yoga Studio"
 *               description:
 *                 type: string
 *                 example: "A peaceful yoga studio in the heart of the city"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City, State 12345"
 *               lat:
 *                 type: number
 *                 example: 40.7128
 *               lng:
 *                 type: number
 *                 example: -74.0060
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["showers", "parking", "wifi"]
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 example: ["https://example.com/photo1.jpg"]
 *     responses:
 *       201:
 *         description: Studio created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Studio'
 *       403:
 *         description: Partner must be verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  authenticate,
  authorize('PARTNER'),
  validate(schemas.createStudio),
  asyncHandler(StudioController.create)
);

/**
 * @swagger
 * /api/studios/{id}:
 *   put:
 *     summary: Update studio (Partner only)
 *     tags: [Studios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Studio ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Studio updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Studio'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Studio not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete studio (Partner only)
 *     tags: [Studios]
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
 *         description: Studio deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Studio not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/studios/{id}/analytics:
 *   get:
 *     summary: Get studio analytics (Partner only)
 *     tags: [Studios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Studio ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics period
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
 *                       type: object
 *                       properties:
 *                         period:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date-time
 *                             end:
 *                               type: string
 *                               format: date-time
 *                         bookings:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             byStatus:
 *                               type: array
 *                               items:
 *                                 type: object
 *                         revenue:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: number
 *                             averagePerBooking:
 *                               type: number
 *                             bookingsCount:
 *                               type: integer
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Studio not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id/analytics',
  authenticate,
  authorize('PARTNER'),
  validate(schemas.analyticsQuery),
  asyncHandler(StudioController.getAnalytics)
);

export default router;
