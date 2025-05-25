// src/routes/auth.routes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthController } from '../controllers/auth.controller';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Public routes
router.post(
  '/register',
  validate(schemas.createUser),
  asyncHandler(AuthController.register)
);

router.post(
  '/verify',
  asyncHandler(AuthController.verify)
);

// Protected routes (require Clerk auth)
router.get(
  '/me',
  asyncHandler(AuthController.me)
);

router.delete(
  '/account',
  asyncHandler(AuthController.deleteAccount)
);

export default router;
