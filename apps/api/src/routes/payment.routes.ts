// apps/api/src/routes/payment.routes.ts - LIMPIO SIN SWAGGER EXCESIVO
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import bodyParser from 'body-parser';
import { PaymentController } from '../controllers/payment.controller';
import { attachUserData } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { requireAuth } from '@clerk/express';

const router: Router = Router();

// Obtener paquetes de créditos disponibles
router.get(
  '/packages',
  requireAuth(),
  attachUserData,
  asyncHandler(PaymentController.getCreditPackages)
);

// Crear sesión de checkout
router.post(
  '/checkout-session',
  requireAuth(),
  attachUserData,
  validate(schemas.createCheckoutSession),
  asyncHandler(PaymentController.createCheckoutSession)
);

// Obtener créditos actuales
router.get(
  '/credits',
  requireAuth(),
  attachUserData,
  asyncHandler(PaymentController.getCurrentCredits)
);

// Historial de compras
router.get(
  '/history',
  requireAuth(),
  attachUserData,
  validate(schemas.purchaseHistory),
  asyncHandler(PaymentController.getPurchaseHistory)
);

// Estadísticas de compras
router.get(
  '/stats',
  requireAuth(),
  attachUserData,
  asyncHandler(PaymentController.getPurchaseStats)
);

// Detalles de una compra
router.get(
  '/purchases/:id',
  requireAuth(),
  attachUserData,
  validate(schemas.idParam),
  asyncHandler(PaymentController.getPurchaseDetails)
);

// Verificar sesión de pago
router.get(
  '/verify-session/:sessionId',
  requireAuth(),
  attachUserData,
  validate(schemas.sessionIdParam),
  asyncHandler(PaymentController.verifyPaymentSession)
);

// Información de éxito de pago
router.get(
  '/success',
  requireAuth(),
  attachUserData,
  validate(schemas.paymentSuccess),
  asyncHandler(PaymentController.getPaymentSuccess)
);

// Simular compra (solo desarrollo)
router.post(
  '/simulate',
  requireAuth(),
  attachUserData,
  validate(schemas.simulatePurchase),
  asyncHandler(PaymentController.simulatePurchase)
);

// Webhook de Stripe (sin autenticación)
router.post(
  '/webhook/stripe',
  bodyParser.raw({ type: 'application/json' }),
  asyncHandler(PaymentController.handleStripeWebhook)
);

export default router;