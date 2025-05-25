// src/prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client';
import { generateReferralCode } from '../utils/helpers';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@tudo.com',
      clerkId: 'clerk_admin_123',
      role: UserRole.ADMIN,
      verified: true,
      referralCode: generateReferralCode(),
      profile: {
        create: {
          fullName: 'Admin User',
          phone: '+1234567890',
        },
      },
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create test partner
  const partner = await prisma.user.create({
    data: {
      email: 'partner@tudo.com',
      clerkId: 'clerk_partner_123',
      role: UserRole.PARTNER,
      verified: true,
      referralCode: generateReferralCode(),
      profile: {
        create: {
          fullName: 'Test Partner',
          phone: '+1234567891',
        },
      },
      partner: {
        create: {
          companyName: 'Fitness Studios Inc.',
          isVerified: true,
          verifiedAt: new Date(),
          verifiedBy: admin.id,
        },
      },
    },
  });

  console.log('✅ Partner user created:', partner.email);

  // Create test client
  const client = await prisma.user.create({
    data: {
      email: 'client@tudo.com',
      clerkId: 'clerk_client_123',
      role: UserRole.CLIENT,
      verified: true,
      referralCode: generateReferralCode(),
      credits: 100,
      profile: {
        create: {
          fullName: 'Test Client',
          phone: '+1234567892',
          preferences: {
            amenities: ['showers', 'parking'],
            classTypes: ['yoga', 'spinning'],
            zones: ['downtown', 'midtown'],
          },
        },
      },
    },
  });

  console.log('✅ Client user created:', client.email);

  console.log('🌱 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
