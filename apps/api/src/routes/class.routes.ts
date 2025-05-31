
// apps/api/src/routes/class.routes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { ClassController } from '../controllers/class.controller';
import { attachUserData, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { requireAuth } from '@clerk/express';

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: Fitness class management and session operations
 */

/**
 * @swagger
 * /api/classes/upcoming:
 *   get:
 *     summary: Get upcoming sessions (Public)
 *     tags: [Classes]
 *     description: Get all upcoming sessions across all studios and classes
 *     security: []
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
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by class type
 *         example: "yoga"
 *       - in: query
 *         name: studioId
 *         schema:
 *           type: string
 *         description: Filter by studio ID
 *     responses:
 *       200:
 *         description: Upcoming sessions retrieved successfully
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
 *                               class:
 *                                 allOf:
 *                                   - $ref: '#/components/schemas/Class'
 *                                   - type: object
 *                                     properties:
 *                                       studio:
 *                                         $ref: '#/components/schemas/Studio'
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   bookings:
 *                                     type: integer
 *                                     example: 15
 *                                     description: Number of current bookings
 */
router.get(
  '/upcoming',
  validate(schemas.upcomingSessions),
  asyncHandler(ClassController.getUpcomingSessions)
);

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Get class by ID (Public)
 *     tags: [Classes]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Class retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Class'
 *                         - type: object
 *                           properties:
 *                             studio:
 *                               allOf:
 *                                 - $ref: '#/components/schemas/Studio'
 *                                 - type: object
 *                                   properties:
 *                                     partner:
 *                                       type: object
 *                                       properties:
 *                                         isVerified:
 *                                           type: boolean
 *                                           example: true
 *                             sessions:
 *                               type: array
 *                               items:
 *                                 allOf:
 *                                   - $ref: '#/components/schemas/Session'
 *                                   - type: object
 *                                     properties:
 *                                       _count:
 *                                         type: object
 *                                         properties:
 *                                           bookings:
 *                                             type: integer
 *                             _count:
 *                               type: object
 *                               properties:
 *                                 sessions:
 *                                   type: integer
 *                                   example: 10
 *       404:
 *         description: Class not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  validate(schemas.idParam),
  asyncHandler(ClassController.getById)
);

/**
 * @swagger
 * /api/classes/{id}/sessions:
 *   get:
 *     summary: Get class sessions (Public)
 *     tags: [Classes]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
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
 *           enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter by session status
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter sessions from this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter sessions to this date
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
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
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   bookings:
 *                                     type: integer
 *                                     description: Number of confirmed bookings
 */
router.get(
  '/:id/sessions',
  validate(schemas.classSessions),
  asyncHandler(ClassController.getSessions)
);

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Create a new class (Partner only)
 *     tags: [Classes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studioId
 *               - title
 *               - description
 *               - type
 *               - durationMinutes
 *               - maxCapacity
 *               - basePrice
 *               - photos
 *               - amenities
 *             properties:
 *               studioId:
 *                 type: string
 *                 example: "studio_123"
 *                 description: ID of the studio where class will be held
 *               title:
 *                 type: string
 *                 example: "Morning Vinyasa Yoga"
 *                 description: Class title
 *               description:
 *                 type: string
 *                 example: "A flowing yoga class perfect for starting your day with mindfulness and energy"
 *               type:
 *                 type: string
 *                 example: "yoga"
 *                 description: Type of class (yoga, pilates, spinning, etc.)
 *               durationMinutes:
 *                 type: integer
 *                 example: 60
 *                 minimum: 15
 *                 maximum: 480
 *                 description: Duration in minutes
 *               maxCapacity:
 *                 type: integer
 *                 example: 20
 *                 minimum: 1
 *                 maximum: 500
 *                 description: Maximum number of participants
 *               basePrice:
 *                 type: number
 *                 example: 25.00
 *                 minimum: 0
 *                 description: Base price per session
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 example: ["https://example.com/yoga-class1.jpg", "https://example.com/yoga-class2.jpg"]
 *                 description: Array of photo URLs
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["mats_provided", "beginner_friendly", "towels"]
 *                 description: Class amenities and features
 *     responses:
 *       201:
 *         description: Class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Class'
 *       400:
 *         description: Invalid input data
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
 *         description: Studio not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  validate(schemas.createClass),
  asyncHandler(ClassController.create)
);

/**
 * @swagger
 * /api/classes/{id}:
 *   put:
 *     summary: Update class (Partner only)
 *     tags: [Classes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Morning Vinyasa Yoga"
 *               description:
 *                 type: string
 *                 example: "An updated flowing yoga class description"
 *               type:
 *                 type: string
 *                 example: "yoga"
 *               durationMinutes:
 *                 type: integer
 *                 example: 75
 *                 minimum: 15
 *                 maximum: 480
 *               maxCapacity:
 *                 type: integer
 *                 example: 25
 *                 minimum: 1
 *                 maximum: 500
 *               basePrice:
 *                 type: number
 *                 example: 30.00
 *                 minimum: 0
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Class updated successfully
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
 *         description: Class not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete class (Partner only)
 *     tags: [Classes]
 *     description: Archives the class instead of permanently deleting it
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Class archived successfully
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
 *                           example: "Class archived successfully"
 *       400:
 *         description: Cannot delete class with upcoming sessions
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
 *         description: Class not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:id',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  validate(schemas.updateClass),
  asyncHandler(ClassController.update)
);

router.delete(
  '/:id',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  validate(schemas.idParam),
  asyncHandler(ClassController.delete)
);

/**
 * @swagger
 * /api/classes/{id}/status:
 *   put:
 *     summary: Update class status (Partner only)
 *     tags: [Classes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED]
 *                 example: "PUBLISHED"
 *                 description: New status for the class
 *     responses:
 *       200:
 *         description: Class status updated successfully
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
 *         description: Class not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:id/status',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  validate(schemas.updateClassStatus),
  asyncHandler(ClassController.updateStatus)
);

/**
 * @swagger
 * /api/classes/{id}/duplicate:
 *   post:
 *     summary: Duplicate class (Partner only)
 *     tags: [Classes]
 *     description: Create a copy of an existing class with "(Copy)" suffix
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID to duplicate
 *     responses:
 *       201:
 *         description: Class duplicated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Class'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Class not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:id/duplicate',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  validate(schemas.idParam),
  asyncHandler(ClassController.duplicate)
);

/**
 * @swagger
 * /api/classes/{id}/sessions:
 *   post:
 *     summary: Create session for class (Partner only)
 *     tags: [Classes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startTime
 *               - instructorName
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-25T09:00:00Z"
 *                 description: Session start time
 *               instructorName:
 *                 type: string
 *                 example: "Sarah Johnson"
 *                 description: Name of the instructor
 *     responses:
 *       201:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Session'
 *       400:
 *         description: Class must be published or session conflicts with existing session
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
 *         description: Class not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:id/sessions',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  validate(schemas.createSession),
  asyncHandler(ClassController.createSession)
);

/**
 * @swagger
 * /api/classes/{id}/sessions/{sessionId}:
 *   delete:
 *     summary: Cancel session (Partner only)
 *     tags: [Classes]
 *     description: Cancel a session and notify all booked users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Only scheduled sessions can be cancelled
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
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:id/sessions/:sessionId',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  validate(schemas.classSession),
  asyncHandler(ClassController.cancelSession)
);

/**
 * @swagger
 * /api/classes/{id}/sessions/{sessionId}/attendees:
 *   get:
 *     summary: Get session attendees (Partner only)
 *     tags: [Classes]
 *     description: Get list of users who booked this session
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Attendees retrieved successfully
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
 *       403:
 *         description: Access denied
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
router.get(
  '/:id/sessions/:sessionId/attendees',
  requireAuth(),
  attachUserData,
  authorize('PARTNER'),
  validate(schemas.classSession),
  asyncHandler(ClassController.getSessionAttendees)
);

export default router;
