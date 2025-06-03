/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/api/src/controllers/payment.controller.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { PaymentService } from '../services/payment.service';
import { StripeService } from '../services/stripe.service';
import { successResponse, getPagination } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class PaymentController {
  /**
   * Crear sesión de checkout para compra de créditos
   */
  static async createCheckoutSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { credits } = req.body;

    const session = await PaymentService.createCheckoutSession(userId, { credits });

    res.status(201).json(
      successResponse(session, 'Checkout session created successfully')
    );
  }

  /**
   * Obtener paquetes de créditos disponibles
   */
  static async getCreditPackages(req: AuthenticatedRequest, res: Response): Promise<void> {
    const packages = PaymentService.getCreditPackages();

    res.json(successResponse(packages));
  }

  /**
   * Obtener historial de compras del usuario
   */
  static async getPurchaseHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { page, limit } = getPagination(req.query);
    const { status, startDate, endDate } = req.query;

    const filters: any = {};
    if (status) filters.status = status as string;
    if (startDate && endDate) {
      filters.startDate = new Date(startDate as string);
      filters.endDate = new Date(endDate as string);
    }

    const result = await PaymentService.getUserPurchases(userId, filters, { page, limit });

    res.json(successResponse(result.purchases, undefined, result.pagination));
  }

  /**
   * Obtener detalles de una compra específica
   */
  static async getPurchaseDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { id } = req.params;

    const purchase = await PaymentService.getPurchaseDetails(id, userId);

    res.json(successResponse(purchase));
  }

  /**
   * Obtener estadísticas de compras del usuario
   */
  static async getPurchaseStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;

    const stats = await PaymentService.getUserPurchaseStats(userId);

    res.json(successResponse(stats));
  }

  /**
   * Verificar estado de una sesión de pago
   */
  static async verifyPaymentSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    const result = await PaymentService.verifyPaymentSession(sessionId, userId);

    res.json(successResponse(result));
  }

  /**
   * Webhook de Stripe - maneja eventos de pago
   */
  static async handleStripeWebhook(req: any, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      throw new AppError(400, 'Missing stripe-signature header');
    }

    try {
      // Construir evento desde el webhook
      const event = StripeService.constructWebhookEvent(req.body, signature);

      // Guardar evento para evitar duplicados
      await StripeService.saveWebhookEvent(event);

      // Procesar evento según su tipo
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          await StripeService.handleCheckoutSessionCompleted(session);
          await StripeService.markWebhookEventProcessed(event.id);
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as any;
          await StripeService.handlePaymentFailed(paymentIntent);
          await StripeService.markWebhookEventProcessed(event.id);
          break;
        }

        case 'checkout.session.expired': {
          const session = event.data.object as any;
          await PaymentService.handlePaymentCancellation(session.id);
          await StripeService.markWebhookEventProcessed(event.id);
          break;
        }

        case 'payment_intent.canceled': {
          const paymentIntent = event.data.object as any;
          // Buscar session relacionada si existe
          if (paymentIntent.metadata?.sessionId) {
            await PaymentService.handlePaymentCancellation(paymentIntent.metadata.sessionId);
          }
          await StripeService.markWebhookEventProcessed(event.id);
          break;
        }

        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
          await StripeService.markWebhookEventProcessed(event.id);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook processing failed:', error);
      
      // Intentar marcar el evento con error si es posible
      try {
        const event = StripeService.constructWebhookEvent(req.body, signature);
        await StripeService.markWebhookEventProcessed(
          event.id, 
          error instanceof Error ? error.message : 'Unknown error'
        );
      } catch (markError) {
        console.error('Failed to mark webhook event with error:', markError);
      }

      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Webhook processing failed',
      });
    }
  }

  /**
   * Obtener créditos actuales del usuario
   */
  static async getCurrentCredits(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        _count: {
          select: {
            purchases: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json(
      successResponse({
        currentCredits: user.credits,
        totalPurchases: user._count.purchases,
      })
    );
  }

  /**
   * Obtener información de éxito de pago (para página de éxito)
   */
  static async getPaymentSuccess(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { sessionId } = req.query;

    if (!sessionId) {
      throw new AppError(400, 'Session ID is required');
    }

    try {
      // Verificar que la sesión pertenece al usuario
      const purchase = await prisma.purchase.findFirst({
        where: {
          stripeSessionId: sessionId as string,
          userId,
        },
        select: {
          id: true,
          credits: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      });

      if (!purchase) {
        throw new AppError(404, 'Payment session not found');
      }

      // Obtener detalles de Stripe
      const stripeSession = await StripeService.getSession(sessionId as string);

      res.json(
        successResponse({
          purchase,
          stripeSession: {
            id: stripeSession.id,
            payment_status: stripeSession.payment_status,
            amount_total: stripeSession.amount_total,
            currency: stripeSession.currency,
          },
          success: stripeSession.payment_status === 'paid',
        })
      );
    } catch (error) {
      console.error('Error getting payment success info:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to retrieve payment information');
    }
  }

  /**
   * Simular compra para desarrollo/testing (solo en modo development)
   */
  static async simulatePurchase(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new AppError(403, 'Simulate purchase is not available in production');
    }

    const userId = req.user!.id;
    const { credits } = req.body;

    if (!credits || credits <= 0 || credits > 1000) {
      throw new AppError(400, 'Credits must be between 1 and 1000 for simulation');
    }

    // Crear compra simulada
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        amount: credits, // $1 por crédito
        credits,
        stripeSessionId: `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        status: 'COMPLETED',
        metadata: {
          simulated: true,
          simulatedAt: new Date().toISOString(),
        },
      },
    });

    // Agregar créditos al usuario
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: credits } },
    });

    // Crear notificación
    await prisma.notification.create({
      data: {
        userId,
        type: 'CREDITS_PURCHASED',
        title: 'Credits Added (Simulated)',
        body: `You've received ${credits} simulated credits for testing.`,
      },
    });

    res.json(
      successResponse(purchase, 'Simulated purchase completed successfully')
    );
  }
}

// Importar prisma aquí para evitar problemas de dependencias circulares
import { prisma } from '../prisma/client';