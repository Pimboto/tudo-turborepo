// apps/api/src/prisma/seed-payments.ts
import { PrismaClient, PurchaseStatus } from '@prisma/client';
import { generateReferralCode } from '../utils/helpers';

const prisma = new PrismaClient();

async function seedPayments() {
  console.log('🌱 Seeding payment test data...');

  try {
    // Crear usuarios de prueba si no existen
    const testUsers = await Promise.all([
      prisma.user.upsert({
        where: { email: 'test-client@tudo.com' },
        update: {},
        create: {
          email: 'test-client@tudo.com',
          clerkId: 'clerk_test_client_payments',
          role: 'CLIENT',
          verified: true,
          referralCode: generateReferralCode(),
          credits: 25, // Créditos iniciales
          profile: {
            create: {
              fullName: 'Test Client Payments',
              phone: '+1234567893',
            },
          },
        },
      }),
      
      prisma.user.upsert({
        where: { email: 'premium-client@tudo.com' },
        update: {},
        create: {
          email: 'premium-client@tudo.com',
          clerkId: 'clerk_premium_client_payments',
          role: 'CLIENT',
          verified: true,
          referralCode: generateReferralCode(),
          credits: 150, // Usuario premium con más créditos
          profile: {
            create: {
              fullName: 'Premium Client',
              phone: '+1234567894',
            },
          },
        },
      }),
    ]);

    console.log('✅ Test users created/updated');

    // Crear compras de ejemplo
    const samplePurchases = [
      {
        userId: testUsers[0].id,
        amount: 10.00,
        credits: 10,
        stripeSessionId: 'cs_test_sample_1',
        status: 'COMPLETED' as PurchaseStatus,
        metadata: {
          packageType: 'basic',
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días atrás
          unitPrice: 1.00,
        },
      },
      {
        userId: testUsers[0].id,
        amount: 15.00,
        credits: 15,
        stripeSessionId: 'cs_test_sample_2',
        status: 'COMPLETED' as PurchaseStatus,
        metadata: {
          packageType: 'custom',
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días atrás
          unitPrice: 1.00,
        },
      },
      {
        userId: testUsers[1].id,
        amount: 45.00,
        credits: 50,
        stripeSessionId: 'cs_test_sample_3',
        status: 'COMPLETED' as PurchaseStatus,
        metadata: {
          packageType: 'standard',
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días atrás
          unitPrice: 0.90,
          savings: '10% off',
        },
      },
      {
        userId: testUsers[1].id,
        amount: 80.00,
        credits: 100,
        stripeSessionId: 'cs_test_sample_4',
        status: 'COMPLETED' as PurchaseStatus,
        metadata: {
          packageType: 'premium',
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
          unitPrice: 0.80,
          savings: '20% off',
        },
      },
      {
        userId: testUsers[0].id,
        amount: 25.00,
        credits: 25,
        stripeSessionId: 'cs_test_pending_1',
        status: 'PENDING' as PurchaseStatus,
        metadata: {
          packageType: 'custom',
          createdAt: new Date().toISOString(),
          unitPrice: 1.00,
        },
      },
      {
        userId: testUsers[0].id,
        amount: 30.00,
        credits: 30,
        stripeSessionId: 'cs_test_failed_1',
        status: 'FAILED' as PurchaseStatus,
        metadata: {
          packageType: 'custom',
          failedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
          failureReason: 'Card declined',
          unitPrice: 1.00,
        },
      },
    ];

    // Crear las compras
    for (const purchase of samplePurchases) {
      await prisma.purchase.upsert({
        where: { stripeSessionId: purchase.stripeSessionId },
        update: {},
        create: purchase,
      });
    }

    console.log('✅ Sample purchases created');

    // Crear algunos eventos de webhook de ejemplo
    const sampleWebhookEvents = [
      {
        stripeEventId: 'evt_test_sample_1',
        eventType: 'checkout.session.completed',
        processed: true,
        data: {
          object: 'event',
          id: 'evt_test_sample_1',
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_sample_1',
              amount_total: 1000,
              metadata: { userId: testUsers[0].id, credits: '10' },
            },
          },
        },
      },
      {
        stripeEventId: 'evt_test_sample_2',
        eventType: 'checkout.session.completed',
        processed: true,
        data: {
          object: 'event',
          id: 'evt_test_sample_2',
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_sample_2',
              amount_total: 1500,
              metadata: { userId: testUsers[0].id, credits: '15' },
            },
          },
        },
      },
      {
        stripeEventId: 'evt_test_pending_1',
        eventType: 'checkout.session.completed',
        processed: false,
        data: {
          object: 'event',
          id: 'evt_test_pending_1',
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_pending_1',
              amount_total: 2500,
              metadata: { userId: testUsers[0].id, credits: '25' },
            },
          },
        },
      },
    ];

    for (const event of sampleWebhookEvents) {
      await prisma.stripeWebhookEvent.upsert({
        where: { stripeEventId: event.stripeEventId },
        update: {},
        create: event,
      });
    }

    console.log('✅ Sample webhook events created');

    // Crear notificaciones relacionadas con pagos
    const paymentNotifications = [
      {
        userId: testUsers[0].id,
        type: 'CREDITS_PURCHASED',
        title: 'Credits Added!',
        body: 'You successfully purchased 10 credits. Happy booking!',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUsers[0].id,
        type: 'CREDITS_PURCHASED',
        title: 'Credits Added!',
        body: 'You successfully purchased 15 credits. Happy booking!',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUsers[1].id,
        type: 'CREDITS_PURCHASED',
        title: 'Credits Added!',
        body: 'You successfully purchased 50 credits. Happy booking!',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUsers[1].id,
        type: 'CREDITS_PURCHASED',
        title: 'Credits Added!',
        body: 'You successfully purchased 100 credits. Happy booking!',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUsers[0].id,
        type: 'PAYMENT_FAILED',
        title: 'Payment Failed',
        body: 'Your credit purchase could not be processed. Please try again.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ];

    for (const notification of paymentNotifications) {
      await prisma.notification.create({
        data: notification,
      });
    }

    console.log('✅ Payment notifications created');

    // Mostrar resumen
    const purchaseCounts = await prisma.purchase.groupBy({
      by: ['status'],
      _count: true,
    });

    const totalRevenue = await prisma.purchase.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true, credits: true },
    });

    console.log('\n📊 Payment Seed Summary:');
    console.log('Total purchases by status:');
    purchaseCounts.forEach(({ status, _count }) => {
      console.log(`  ${status}: ${_count}`);
    });
    console.log(`Total revenue: $${totalRevenue._sum.amount?.toFixed(2) || '0.00'}`);
    console.log(`Total credits sold: ${totalRevenue._sum.credits || 0}`);
    
    const userCredits = await prisma.user.findMany({
      where: { credits: { gt: 0 } },
      select: { email: true, credits: true },
    });
    
    console.log('\nUser credit balances:');
    userCredits.forEach(user => {
      console.log(`  ${user.email}: ${user.credits} credits`);
    });

    console.log('\n🌱 Payment seed completed successfully!');

  } catch (error) {
    console.error('❌ Payment seed failed:', error);
    throw error;
  }
}

// Función principal para ejecutar seed
async function main() {
  await seedPayments();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });