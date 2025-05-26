// src/routes/auth.routes.ts - WITH SWAGGER DOCUMENTATION
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthController } from '../controllers/auth.controller';
import { validate, schemas } from '../middleware/validation';

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and account management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - clerkId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               clerkId:
 *                 type: string
 *                 example: clerk_user_123
 *               role:
 *                 type: string
 *                 enum: [CLIENT, PARTNER, ADMIN]
 *                 default: CLIENT
 *               referralCode:
 *                 type: string
 *                 example: TUDO123456
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/register',
  validate(schemas.createUser),
  asyncHandler(AuthController.register)
);

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify user email/phone
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clerkId
 *             properties:
 *               clerkId:
 *                 type: string
 *                 example: clerk_user_123
 *     responses:
 *       200:
 *         description: User verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/verify',
  asyncHandler(AuthController.verify)
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
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
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/me',
  asyncHandler(AuthController.me)
);

/**
 * @swagger
 * /api/auth/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/account',
  asyncHandler(AuthController.deleteAccount)
);

export default router;
