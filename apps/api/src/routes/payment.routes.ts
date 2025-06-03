// apps/api/src/routes/payment.routes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import bodyParser from 'body-parser';
import { PaymentController } from '../controllers/payment.controller';
import { attachUserData, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { requireAuth } from '@clerk/express';

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and credit purchases with Stripe
 */

/**
 * @swagger
 * /api/payments/packages:
 *   get:
 *     summary: Get available credit packages
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Credit packages retrieved successfully
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
 *                             example: "standard"
 *                           name:
 *                             type: string
 *                             example: "Standard Pack"
 *                           credits:
 *                             type: integer
 *                             example: 50
 *                           price:
 *                             type: number
 *                             example: 45.00
 *                           pricePerCredit:
 *                             type: number
 *                             example: 0.90
 *                           popular:
 *                             type: boolean
 *                             example: true
 *                           description:
 *                             type: string
 *                             example: "Most popular choice for regular users"
 *                           savings:
 *                             type: string
 *                             example: "10% off"
 */
router.get(
  '/packages',
  requireAuth(),
  attachUserData,
  asyncHandler(PaymentController.getCreditPackages)
);

/**
 * @swagger
 * /api/payments/checkout-session:
 *   post:
 *     summary: Create Stripe checkout session for credit purchase
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credits
 *             properties:
 *               credits:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10000
 *                 example: 50
 *                 description: Number of credits to purchase
 *     responses:
 *       201:
 *         description: Checkout session created successfully
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
 *                         sessionId:
 *                           type: string
 *                           example: "cs_test_12345"
 *                         url:
 *                           type: string
 *                           format: uri
 *                           example: "https://checkout.stripe.com/c/pay/cs_test_12345"
 *                         amount:
 *                           type: number
 *                           example: 50.00
 *                         credits:
 *                           type: integer
 *                           example: 50
 *       400:
 *         description: Invalid credit amount or user not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Account must be verified to purchase credits
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/checkout-session',
  requireAuth(),
  attachUserData,
  validate(schemas.createCheckoutSession),
  asyncHandler(PaymentController.createCheckoutSession)
);

/**
 * @swagger
 * /api/payments/credits:
 *   get:
 *     summary: Get current user credit balance
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current credits retrieved successfully
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
 *                         currentCredits:
 *                           type: integer
 *                           example: 125
 *                         totalPurchases:
 *                           type: integer
 *                           example: 3
 */
router.get(
  '/credits',
  requireAuth(),
  attachUserData,
  asyncHandler(PaymentController.getCurrentCredits)
);

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Get user purchase history
 *     tags: [Payments]
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
 *           enum: [PENDING, COMPLETED, FAILED, CANCELLED, REFUNDED]
 *         description: Filter by purchase status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter purchases from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter purchases to this date
 *     responses:
 *       200:
 *         description: Purchase history retrieved successfully
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
 *                           amount:
 *                             type: number
 *                           credits:
 *                             type: integer
 *                           status:
 *                             type: string
 *                             enum: [PENDING, COMPLETED, FAILED, CANCELLED, REFUNDED]
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 */
router.get(
  '/history',
  requireAuth(),
  attachUserData,
  validate(schemas.purchaseHistory),
  asyncHandler(PaymentController.getPurchaseHistory)
);

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     summary: Get user purchase statistics
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Purchase statistics retrieved successfully
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
 *                         totalPurchases:
 *                           type: integer
 *                           example: 5
 *                         totalSpent:
 *                           type: number
 *                           example: 225.00
 *                         totalCredits:
 *                           type: integer
 *                           example: 250
 *                         successfulPurchases:
 *                           type: integer
 *                           example: 4
 *                         successRate:
 *                           type: number
 *                           example: 80.0
 *                         lastPurchase:
 *                           type: object
 *                           properties:
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                             status:
 *                               type: string
 *                             credits:
 *                               type: integer
 */
router.get(
  '/stats',
  requireAuth(),
  attachUserData,
  asyncHandler(PaymentController.getPurchaseStats)
);

/**
 * @swagger
 * /api/payments/purchases/{id}:
 *   get:
 *     summary: Get purchase details
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase ID
 *     responses:
 *       200:
 *         description: Purchase details retrieved successfully
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
 *                         id:
 *                           type: string
 *                         amount:
 *                           type: number
 *                         credits:
 *                           type: integer
 *                         status:
 *                           type: string
 *                         stripeSessionId:
 *                           type: string
 *                         metadata:
 *                           type: object
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         stripeDetails:
 *                           type: object
 *                           description: Stripe session details if available
 *       404:
 *         description: Purchase not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/purchases/:id',
  requireAuth(),
  attachUserData,
  validate(schemas.idParam),
  asyncHandler(PaymentController.getPurchaseDetails)
);

/**
 * @swagger
 * /api/payments/verify-session/{sessionId}:
 *   get:
 *     summary: Verify payment session status
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe session ID
 *     responses:
 *       200:
 *         description: Session status verified successfully
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
 *                         purchase:
 *                           type: object
 *                           description: Purchase record from database
 *                         stripeSession:
 *                           type: object
 *                           description: Stripe session details
 *       404:
 *         description: Payment session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/verify-session/:sessionId',
  requireAuth(),
  attachUserData,
  validate(schemas.sessionIdParam),
  asyncHandler(PaymentController.verifyPaymentSession)
);

/**
 * @swagger
 * /api/payments/success:
 *   get:
 *     summary: Get payment success information
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe session ID
 *     responses:
 *       200:
 *         description: Payment success information retrieved
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
 *                         purchase:
 *                           type: object
 *                         stripeSession:
 *                           type: object
 *                         success:
 *                           type: boolean
 *       400:
 *         description: Session ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/success',
  requireAuth(),
  attachUserData,
  validate(schemas.paymentSuccess),
  asyncHandler(PaymentController.getPaymentSuccess)
);

/**
 * @swagger
 * /api/payments/simulate:
 *   post:
 *     summary: Simulate credit purchase (Development only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Simulates a credit purchase for development and testing purposes.
 *       Only available when NODE_ENV is not 'production'.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credits
 *             properties:
 *               credits:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 1000
 *                 example: 25
 *                 description: Number of credits to simulate
 *     responses:
 *       200:
 *         description: Simulated purchase completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid credit amount for simulation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Simulate purchase not available in production
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/simulate',
  requireAuth(),
  attachUserData,
  validate(schemas.simulatePurchase),
  asyncHandler(PaymentController.simulatePurchase)
);

/**
 * @swagger
 * /api/payments/webhook/stripe:
 *   post:
 *     summary: Stripe webhook endpoint
 *     tags: [Payments]
 *     description: |
 *       Webhook endpoint for Stripe events. This endpoint processes payment events
 *       and updates the database accordingly. Must be configured in Stripe dashboard.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Stripe webhook event payload
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid webhook signature or malformed payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid webhook signature"
 *       500:
 *         description: Webhook processing failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Webhook processing failed"
 */
router.post(
  '/webhook/stripe',
  bodyParser.raw({ type: 'application/json' }), // Raw body required for Stripe signature verification
  asyncHandler(PaymentController.handleStripeWebhook)
);

export default router;