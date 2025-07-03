/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable turbo/no-undeclared-env-vars */
// apps/api/src/services/stripe.service.ts
import Stripe from "stripe";
import { prisma } from "../prisma/client";
import { AppError } from "../middleware/errorHandler";

// Inicializar Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil", // Versión más reciente de la API
});

export class StripeService {
  /**
   * Crea una sesión de Stripe Checkout para compra de créditos
   */
  static async createCheckoutSession(userId: string, credits: number) {
    try {
      // Validar entrada
      if (credits <= 0 || credits > 10000) {
        throw new AppError(400, "Credit amount must be between 1 and 10000");
      }

      // Obtener usuario para verificar que existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user) {
        throw new AppError(404, "User not found");
      }

      // Calcular precio (ejemplo: 1 crédito = $1.00 USD)
      const amount = credits * 100; // Stripe maneja centavos
      const unitAmount = 100; // $1.00 por crédito

      // Crear sesión de Stripe Checkout
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: unitAmount,
              product_data: {
                name: "Tudo Fitness Credits",
                description: `${credits} fitness credits for booking classes`,
                images: ["https://example.com/credits-image.jpg"], // Opcional
              },
            },
            quantity: credits,
          },
        ],
        success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
        metadata: {
          userId,
          credits: credits.toString(),
          type: "credit_purchase",
        },
        customer_email: user.email,
      });

      // Crear registro de compra en estado PENDING
      await prisma.purchase.create({
        data: {
          userId,
          amount: credits, // Monto en dólares
          credits,
          stripeSessionId: session.id,
          status: "PENDING",
          metadata: {
            sessionUrl: session.url,
            unitPrice: 1.0,
          },
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
        amount: credits,
        credits,
      };
    } catch (error) {
      console.error("Error creating Stripe checkout session:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, "Failed to create checkout session");
    }
  }

  /**
   * Procesa webhook de checkout.session.completed
   */
  static async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session
  ) {
    try {
      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || "0");

      if (!userId || !credits) {
        throw new AppError(400, "Invalid session metadata");
      }

      // Verificar que la sesión no haya sido procesada antes
      const existingPurchase = await prisma.purchase.findUnique({
        where: { stripeSessionId: session.id },
      });

      if (!existingPurchase) {
        console.error(`Purchase not found for session: ${session.id}`);
        return;
      }

      if (existingPurchase.status === "COMPLETED") {
        console.log(`Purchase already completed: ${session.id}`);
        return;
      }

      // Transacción atómica para actualizar créditos y purchase
      await prisma.$transaction([
        // Actualizar purchase
        prisma.purchase.update({
          where: { stripeSessionId: session.id },
          data: {
            status: "COMPLETED",
            stripePaymentIntentId: session.payment_intent as string,
            metadata: {
              ...(existingPurchase.metadata as object),
              completedAt: new Date().toISOString(),
              amountReceived: session.amount_total,
            },
          },
        }),
        // Incrementar créditos del usuario
        prisma.user.update({
          where: { id: userId },
          data: {
            credits: { increment: credits },
          },
        }),
        // Crear notificación
        prisma.notification.create({
          data: {
            userId,
            type: "CREDITS_PURCHASED",
            title: "Credits Added!",
            body: `You've successfully purchased ${credits} credits. Happy booking!`,
          },
        }),
      ]);

      console.log(
        `Successfully processed credit purchase for user ${userId}: ${credits} credits`
      );
    } catch (error) {
      console.error("Error processing checkout session completed:", error);

      // Marcar purchase como fallida si existe
      try {
        await prisma.purchase.updateMany({
          where: { stripeSessionId: session.id },
          data: { status: "FAILED" },
        });
      } catch (updateError) {
        console.error("Error updating purchase to failed:", updateError);
      }

      throw error;
    }
  }

  /**
   * Maneja webhook de payment_intent.payment_failed
   */
  static async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      // Buscar purchase por payment intent
      const purchase = await prisma.purchase.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

      if (purchase) {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            status: "FAILED",
            metadata: {
              ...(purchase.metadata as object),
              failureReason:
                paymentIntent.last_payment_error?.message || "Payment failed",
              failedAt: new Date().toISOString(),
            },
          },
        });

        // Notificar al usuario
        await prisma.notification.create({
          data: {
            userId: purchase.userId,
            type: "PAYMENT_FAILED",
            title: "Payment Failed",
            body: "Your credit purchase could not be processed. Please try again.",
          },
        });
      }
    } catch (error) {
      console.error("Error handling payment failed:", error);
      throw error;
    }
  }

  /**
   * Obtiene detalles de una sesión de Stripe
   */
  static async getSession(sessionId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error("Error retrieving Stripe session:", error);
      throw new AppError(404, "Session not found");
    }
  }

  /**
   * Procesa refund (para futuras implementaciones)
   */
  static async processRefund(purchaseId: string, reason?: string) {
    try {
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
      });

      if (!purchase || !purchase.stripePaymentIntentId) {
        throw new AppError(404, "Purchase not found or no payment intent");
      }

      if (purchase.status !== "COMPLETED") {
        throw new AppError(400, "Can only refund completed purchases");
      }

      // Crear refund en Stripe
      const refund = await stripe.refunds.create({
        payment_intent: purchase.stripePaymentIntentId,
        reason: "requested_by_customer",
        metadata: {
          purchaseId,
          reason: reason || "Customer request",
        },
      });

      // Actualizar purchase y restar créditos del usuario
      await prisma.$transaction([
        prisma.purchase.update({
          where: { id: purchaseId },
          data: {
            status: "REFUNDED",
            metadata: {
              ...(purchase.metadata as object),
              refundId: refund.id,
              refundedAt: new Date().toISOString(),
              refundReason: reason,
            },
          },
        }),
        prisma.user.update({
          where: { id: purchase.userId },
          data: {
            credits: { decrement: purchase.credits },
          },
        }),
        prisma.notification.create({
          data: {
            userId: purchase.userId,
            type: "REFUND_PROCESSED",
            title: "Refund Processed",
            body: `Your purchase of ${purchase.credits} credits has been refunded.`,
          },
        }),
      ]);

      return refund;
    } catch (error) {
      console.error("Error processing refund:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, "Failed to process refund");
    }
  }

  /**
   * Construye y verifica evento de webhook
   */
  static constructWebhookEvent(body: string | Buffer, signature: string) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      console.log("🔐 Webhook validation:", {
        hasSecret: !!webhookSecret,
        secretLength: webhookSecret?.length,
        signatureLength: signature?.length,
        bodyType: typeof body,
        bodyLength: body?.length || 0,
      });

      if (!webhookSecret) {
        throw new AppError(500, "Webhook secret not configured");
      }

      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
      console.log("✅ Webhook event validated:", event.type);
      return event;
    } catch (error) {
      console.error("❌ Webhook signature verification failed:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      throw new AppError(400, "Invalid webhook signature");
    }
  }

  /**
   * Guarda evento de webhook para evitar duplicados
   */
  static async saveWebhookEvent(event: Stripe.Event) {
    try {
      await prisma.stripeWebhookEvent.create({
        data: {
          stripeEventId: event.id,
          eventType: event.type,
          processed: false,
          data: event.data,
        },
      });
    } catch (error) {
      // Si el evento ya existe (unique constraint), no es un error
      if (
        error instanceof Error &&
        error.message.includes("unique constraint")
      ) {
        console.log(`Webhook event ${event.id} already exists, skipping save`);
        return;
      }
      console.error("Error saving webhook event:", error);
      throw error;
    }
  }

  /**
   * Marca evento como procesado
   */
  static async markWebhookEventProcessed(eventId: string, error?: string) {
    try {
      await prisma.stripeWebhookEvent.update({
        where: { stripeEventId: eventId },
        data: {
          processed: true,
          processingError: error || null,
        },
      });
    } catch (updateError) {
      console.error("Error marking webhook event as processed:", updateError);
    }
  }
}

export { stripe };
