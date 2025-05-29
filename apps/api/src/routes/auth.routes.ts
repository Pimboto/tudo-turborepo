// apps/api/src/routes/auth.routes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthController } from '../controllers/auth.controller';
import { validate, schemas } from '../middleware/validation';
import { requireAuth } from '@clerk/express';

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and account management with Clerk
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user after Clerk signup
 *     tags: [Authentication]
 *     description: |
 *       Called after successful Clerk authentication to create user in our database.
 *       The user must have already signed up with Clerk and have a valid clerkId.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clerkId
 *               - email
 *               - fullName
 *               - role
 *             properties:
 *               clerkId:
 *                 type: string
 *                 example: user_2NNEqL2nrIRdJ194ndJqAHwEfxC
 *                 description: Clerk user ID
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *                 description: User's full name
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *                 description: Phone number (optional)
 *               role:
 *                 type: string
 *                 enum: [CLIENT, PARTNER]
 *                 example: CLIENT
 *                 description: User role (CLIENT for regular users, PARTNER for studio owners)
 *               referralCode:
 *                 type: string
 *                 example: TUDO123456
 *                 description: Referral code if user was referred
 *               companyName:
 *                 type: string
 *                 example: Fitness Studios Inc.
 *                 description: Company name (required for PARTNER role)
 *               taxInfo:
 *                 type: string
 *                 example: 12-3456789
 *                 description: Tax ID (optional for PARTNER role)
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
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         referralCode:
 *                           type: string
 *                         credits:
 *                           type: integer
 *       400:
 *         description: Invalid input or missing required fields
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
  asyncHandler(AuthController.register)
);

/**
 * @swagger
 * /api/auth/complete-profile:
 *   put:
 *     summary: Complete user profile after registration
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
 *               - profile
 *             properties:
 *               clerkId:
 *                 type: string
 *                 example: user_2NNEqL2nrIRdJ194ndJqAHwEfxC
 *               profile:
 *                 type: object
 *                 properties:
 *                   fullName:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   address:
 *                     type: string
 *                   avatarUrl:
 *                     type: string
 *                     format: uri
 *                   preferences:
 *                     type: object
 *                     properties:
 *                       amenities:
 *                         type: array
 *                         items:
 *                           type: string
 *                       classTypes:
 *                         type: array
 *                         items:
 *                           type: string
 *                       zones:
 *                         type: array
 *                         items:
 *                           type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
router.put(
  '/complete-profile',
  asyncHandler(AuthController.completeProfile)
);

/**
 * @swagger
 * /api/auth/sync:
 *   post:
 *     summary: Sync user data with Clerk
 *     tags: [Authentication]
 *     description: |
 *       Called when user signs in to ensure our database is in sync with Clerk.
 *       Returns user data if exists, or indicates if registration is needed.
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
 *                 example: user_2NNEqL2nrIRdJ194ndJqAHwEfxC
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: User not found (needs registration)
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
 *                   example: User not found
 *                 needsRegistration:
 *                   type: boolean
 *                   example: true
 */
router.post(
  '/sync',
  asyncHandler(AuthController.syncUser)
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
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
 *                       allOf:
 *                         - $ref: '#/components/schemas/User'
 *                         - type: object
 *                           properties:
 *                             profile:
 *                               $ref: '#/components/schemas/Profile'
 *                             partner:
 *                               $ref: '#/components/schemas/Partner'
 *                             _count:
 *                               type: object
 *                               properties:
 *                                 bookings:
 *                                   type: integer
 *                                 referrals:
 *                                   type: integer
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found (needs registration)
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
 *                   example: User not found
 *                 needsRegistration:
 *                   type: boolean
 *                   example: true
 */
router.get(
  '/me',
  requireAuth(),
  asyncHandler(AuthController.me)
);

/**
 * @swagger
 * /api/auth/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Authentication]
 *     description: Permanently delete user account from both our database and Clerk
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
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/account',
  requireAuth(),
  asyncHandler(AuthController.deleteAccount)
);

export default router;
