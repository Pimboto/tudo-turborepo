// src/routes/booking.routes.ts - WITH SWAGGER DOCUMENTATION
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { BookingController } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management operations
 */

/**
 * @swagger
 * /api/bookings/available-sessions:
 *   get:
 *     summary: Get available sessions for booking
 *     tags: [Bookings]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: studioId
 *         schema:
 *           type: string
 *         description: Filter by studio ID
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Filter by class ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by specific date
 *     responses:
 *       200:
 *         description: Available sessions retrieved successfully
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
 *                           - $ref: '#/components/schemas/Session'
 *                           - type: object
 *                             properties:
 *                               availableSpots:
 *                                 type: integer
 *                                 description: Number of available spots
 *                               isAvailable:
 *                                 type: boolean
 *                                 description: Whether session can be booked
 *                               class:
 *                                 $ref: '#/components/schemas/Class'
 */
router.get(
  '/available-sessions',
  validate(schemas.availableSessions),
  asyncHandler(BookingController.getAvailableSessions)
);

/**
 * @swagger
 * /api/bookings/validate/{code}:
 *   get:
 *     summary: Validate booking code (for QR scanning)
 *     tags: [Bookings]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking code to validate
 *         example: "ABC12345"
 *     responses:
 *       200:
 *         description: Booking code validated successfully
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
 *                         valid:
 *                           type: boolean
 *                         bookingId:
 *                           type: string
 *                         status:
 *                           type: string
 *                           enum: [CONFIRMED, CANCELLED, COMPLETED, NO_SHOW]
 *                         checkedIn:
 *                           type: boolean
 *                         sessionInfo:
 *                           type: object
 *                           properties:
 *                             className:
 *                               type: string
 *                             startTime:
 *                               type: string
 *                               format: date-time
 *                         userName:
 *                           type: string
 *       404:
 *         description: Invalid booking code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/validate/:code',
  validate(schemas.bookingCode),
  asyncHandler(BookingController.validateCode)
);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: "session_123"
 *                 description: ID of the session to book
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid session or booking not available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  authenticate,
  validate(schemas.createBooking),
  asyncHandler(BookingController.create)
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Booking'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  authenticate,
  validate(schemas.idParam),
  asyncHandler(BookingController.getById)
);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   put:
 *     summary: Cancel booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Cannot cancel booking (too late or invalid status)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:id/cancel',
  authenticate,
  validate(schemas.idParam),
  asyncHandler(BookingController.cancel)
);

/**
 * @swagger
 * /api/bookings/{id}/check-in:
 *   put:
 *     summary: Check-in to session
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Checked in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Check-in not available (outside window or already checked in)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:id/check-in',
  authenticate,
  validate(schemas.idParam),
  asyncHandler(BookingController.checkIn)
);

/**
 * @swagger
 * /api/bookings/{id}/qr:
 *   get:
 *     summary: Get QR code data for booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: QR data retrieved successfully
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
 *                         bookingCode:
 *                           type: string
 *                         sessionInfo:
 *                           type: object
 *                           properties:
 *                             className:
 *                               type: string
 *                             studioName:
 *                               type: string
 *                             address:
 *                               type: string
 *                             startTime:
 *                               type: string
 *                               format: date-time
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id/qr',
  authenticate,
  validate(schemas.idParam),
  asyncHandler(BookingController.getQRData)
);

/**
 * @swagger
 * /api/bookings/code/{code}:
 *   get:
 *     summary: Get booking by code (Partner only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking code
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Booking'
 *       403:
 *         description: Partner access required or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/code/:code',
  authenticate,
  authorize('PARTNER'),
  validate(schemas.bookingCode),
  asyncHandler(BookingController.getByCode)
);

/**
 * @swagger
 * /api/bookings/code/{code}/check-in:
 *   put:
 *     summary: Check-in by code (Partner only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking code
 *     responses:
 *       200:
 *         description: Checked in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Booking is not confirmed or already checked in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Partner access required or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/code/:code/check-in',
  authenticate,
  authorize('PARTNER'),
  validate(schemas.bookingCode),
  asyncHandler(BookingController.checkInByCode)
);

/**
 * @swagger
 * /api/bookings/session/{sessionId}/no-shows:
 *   put:
 *     summary: Mark no-shows for a session (Partner only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: No-shows marked successfully
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
 *                         count:
 *                           type: integer
 *                           description: Number of bookings marked as no-show
 *       400:
 *         description: Session has not ended yet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Partner access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Session not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/session/:sessionId/no-shows',
  authenticate,
  authorize('PARTNER'),
  validate(schemas.sessionId),
  asyncHandler(BookingController.markNoShows)
);

export default router;
