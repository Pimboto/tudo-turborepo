// apps/api/src/services/payment.service.ts
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { StripeService } from './stripe.service';
import { CreateCheckoutSessionDto, PurchaseHistoryFilters } from '../types';

export class PaymentService {
  /**
   * Crear sesión de checkout para compra de créditos
   */
  static async createCheckoutSession(userId: string, data: CreateCheckoutSessionDto) {
    try {
      // Validar usuario
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, verified: true },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      if (!user.verified) {
        throw new AppError(403, 'Account must be verified to purchase credits');
      }

      // Validar cantidad de créditos
      const { credits } = data;
      if (!credits || credits <= 0) {
        throw new AppError(400, 'Credits must be a positive number');
      }

      if (credits > 10000) {
        throw new AppError(400, 'Maximum 10,000 credits per purchase');
      }

      // Crear sesión de Stripe
      const session = await StripeService.createCheckoutSession(userId, credits);

      return session;
    } catch (error) {
      console.error('Error in PaymentService.createCheckoutSession:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to create checkout session');
    }
  }

  /**
   * Obtener historial de compras del usuario
   */
  static async getUserPurchases(
    userId: string,
    filters?: PurchaseHistoryFilters,
    pagination?: { page: number; limit: number }
  ) {
    try {
      const page = pagination?.page || 1;
      const limit = Math.min(pagination?.limit || 20, 100);
      const skip = (page - 1) * limit;

      const where: any = { userId };

      // Aplicar filtros
      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.startDate && filters.endDate) {
        where.createdAt = {
          gte: filters.startDate,
          lte: filters.endDate,
        };
      }

      const [purchases, total] = await Promise.all([
        prisma.purchase.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            amount: true,
            credits: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            metadata: true,
          },
        }),
        prisma.purchase.count({ where }),
      ]);

      return {
        purchases,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting user purchases:', error);
      throw new AppError(500, 'Failed to retrieve purchase history');
    }
  }

  /**
   * Obtener detalles de una compra específica
   */
  static async getPurchaseDetails(purchaseId: string, userId: string) {
    try {
      const purchase = await prisma.purchase.findFirst({
        where: {
          id: purchaseId,
          userId, // Asegurar que el usuario solo vea sus propias compras
        },
        include: {
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      });

      if (!purchase) {
        throw new AppError(404, 'Purchase not found');
      }

      // Si hay un sessionId de Stripe, obtener detalles adicionales
      let stripeDetails = null;
      if (purchase.stripeSessionId) {
        try {
          stripeDetails = await StripeService.getSession(purchase.stripeSessionId);
        } catch (error) {
          console.warn(`Could not fetch Stripe session details: ${error}`);
        }
      }

      return {
        ...purchase,
        stripeDetails,
      };
    } catch (error) {
      console.error('Error getting purchase details:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to retrieve purchase details');
    }
  }

  /**
   * Obtener estadísticas de compras del usuario
   */
  static async getUserPurchaseStats(userId: string) {
    try {
      const [
        totalPurchases,
        totalSpent,
        totalCredits,
        successfulPurchases,
        lastPurchase,
      ] = await Promise.all([
        // Total de compras
        prisma.purchase.count({
          where: { userId },
        }),
        
        // Total gastado (solo compras exitosas)
        prisma.purchase.aggregate({
          where: {
            userId,
            status: 'COMPLETED',
          },
          _sum: {
            amount: true,
          },
        }),
        
        // Total de créditos comprados
        prisma.purchase.aggregate({
          where: {
            userId,
            status: 'COMPLETED',
          },
          _sum: {
            credits: true,
          },
        }),
        
        // Compras exitosas
        prisma.purchase.count({
          where: {
            userId,
            status: 'COMPLETED',
          },
        }),
        
        // Última compra
        prisma.purchase.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          select: {
            createdAt: true,
            status: true,
            credits: true,
          },
        }),
      ]);

      return {
        totalPurchases,
        totalSpent: totalSpent._sum.amount || 0,
        totalCredits: totalCredits._sum.credits || 0,
        successfulPurchases,
        successRate: totalPurchases > 0 ? (successfulPurchases / totalPurchases) * 100 : 0,
        lastPurchase,
      };
    } catch (error) {
      console.error('Error getting user purchase stats:', error);
      throw new AppError(500, 'Failed to retrieve purchase statistics');
    }
  }

  /**
   * Verificar estado de sesión de pago
   */
  static async verifyPaymentSession(sessionId: string, userId: string) {
    try {
      // Buscar la compra en nuestra base de datos
      const purchase = await prisma.purchase.findFirst({
        where: {
          stripeSessionId: sessionId,
          userId,
        },
      });

      if (!purchase) {
        throw new AppError(404, 'Payment session not found');
      }

      // Obtener estado actual de Stripe
      const stripeSession = await StripeService.getSession(sessionId);

      // Verificar si hay discrepancias
      let needsUpdate = false;
      let newStatus = purchase.status;

      if (stripeSession.payment_status === 'paid' && purchase.status === 'PENDING') {
        newStatus = 'COMPLETED';
        needsUpdate = true;
      } else if (stripeSession.payment_status === 'unpaid' && purchase.status === 'PENDING') {
        // Verificar si la sesión expiró
        const sessionExpired = new Date() > new Date(stripeSession.expires_at * 1000);
        if (sessionExpired) {
          newStatus = 'CANCELLED';
          needsUpdate = true;
        }
      }

      // Actualizar si es necesario
      if (needsUpdate) {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: newStatus },
        });
      }

      return {
        purchase: {
          ...purchase,
          status: newStatus,
        },
        stripeSession: {
          id: stripeSession.id,
          payment_status: stripeSession.payment_status,
          amount_total: stripeSession.amount_total,
          expires_at: stripeSession.expires_at,
        },
      };
    } catch (error) {
      console.error('Error verifying payment session:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to verify payment session');
    }
  }

  /**
   * Obtener paquetes de créditos disponibles
   */
  static getCreditPackages() {
    return [
      {
        id: 'basic',
        name: 'Basic Pack',
        credits: 10,
        price: 10.00,
        pricePerCredit: 1.00,
        popular: false,
        description: 'Perfect for trying out our platform',
      },
      {
        id: 'standard',
        name: 'Standard Pack',
        credits: 50,
        price: 45.00,
        pricePerCredit: 0.90,
        popular: true,
        description: 'Most popular choice for regular users',
        savings: '10% off',
      },
      {
        id: 'premium',
        name: 'Premium Pack',
        credits: 100,
        price: 80.00,
        pricePerCredit: 0.80,
        popular: false,
        description: 'Best value for fitness enthusiasts',
        savings: '20% off',
      },
      {
        id: 'ultimate',
        name: 'Ultimate Pack',
        credits: 250,
        price: 175.00,
        pricePerCredit: 0.70,
        popular: false,
        description: 'For studios and heavy users',
        savings: '30% off',
      },
    ];
  }

  /**
   * Procesar cancelación de pago (para uso interno)
   */
  static async handlePaymentCancellation(sessionId: string) {
    try {
      const purchase = await prisma.purchase.findUnique({
        where: { stripeSessionId: sessionId },
      });

      if (purchase && purchase.status === 'PENDING') {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            status: 'CANCELLED',
            metadata: {
              ...purchase.metadata as object,
              cancelledAt: new Date().toISOString(),
            },
          },
        });

        // Notificar al usuario
        await prisma.notification.create({
          data: {
            userId: purchase.userId,
            type: 'PAYMENT_CANCELLED',
            title: 'Payment Cancelled',
            body: 'Your credit purchase was cancelled. You can try again anytime.',
          },
        });
      }
    } catch (error) {
      console.error('Error handling payment cancellation:', error);
      // No lanzar error para evitar afectar otros procesos
    }
  }
}