import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPlans() {
  console.log('🌱 Seeding plans...');

  // Free Plan
  const freePlan = await prisma.plan.upsert({
    where: { name: 'free' },
    update: {},
    create: {
      name: 'free',
      displayName: 'Free',
      description: 'Perfect for getting started with basic proposal management',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: {
        proposals: 10,
        templates: 5,
        storage: 100, // MB
        emailsPerMonth: 50,
        signatures: true,
        analytics: false,
        customBranding: false,
        apiAccess: false,
        prioritySupport: false,
        teamMembers: 1,
      },
      isActive: true,
      sortOrder: 1,
    },
  });

  // Pro Plan
  const proPlan = await prisma.plan.upsert({
    where: { name: 'pro' },
    update: {},
    create: {
      name: 'pro',
      displayName: 'Pro',
      description: 'Advanced features for growing businesses',
      price: 29.99,
      currency: 'USD',
      interval: 'month',
      features: {
        proposals: 100,
        templates: 50,
        storage: 5000, // MB
        emailsPerMonth: 1000,
        signatures: true,
        analytics: true,
        customBranding: true,
        apiAccess: true,
        prioritySupport: false,
        teamMembers: 5,
        advancedTemplates: true,
        automatedReminders: true,
      },
      isActive: true,
      sortOrder: 2,
    },
  });

  // Business Plan
  const businessPlan = await prisma.plan.upsert({
    where: { name: 'business' },
    update: {},
    create: {
      name: 'business',
      displayName: 'Business',
      description: 'Complete solution for large teams and enterprises',
      price: 99.99,
      currency: 'USD',
      interval: 'month',
      features: {
        proposals: -1, // unlimited
        templates: -1, // unlimited
        storage: 50000, // MB
        emailsPerMonth: -1, // unlimited
        signatures: true,
        analytics: true,
        customBranding: true,
        apiAccess: true,
        prioritySupport: true,
        teamMembers: -1, // unlimited
        advancedTemplates: true,
        automatedReminders: true,
        whiteLabel: true,
        sso: true,
        customIntegrations: true,
        dedicatedManager: true,
      },
      isActive: true,
      sortOrder: 3,
    },
  });

  console.log('✅ Plans seeded successfully');
  console.log(`- Free Plan: ${freePlan.id}`);
  console.log(`- Pro Plan: ${proPlan.id}`);
  console.log(`- Business Plan: ${businessPlan.id}`);

  return { freePlan, proPlan, businessPlan };
}

export async function seedUserSubscriptions() {
  console.log('🌱 Seeding user subscriptions...');

  // Get the free plan
  const freePlan = await prisma.plan.findUnique({
    where: { name: 'free' },
  });

  if (!freePlan) {
    throw new Error('Free plan not found. Please seed plans first.');
  }

  // Get all users without subscriptions
  const usersWithoutSubscriptions = await prisma.user.findMany({
    where: {
      subscription: null,
    },
  });

  // Create free subscriptions for all users
  for (const user of usersWithoutSubscriptions) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: freePlan.id,
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    });
  }

  console.log(`✅ Created ${usersWithoutSubscriptions.length} free subscriptions`);
}

// Main seed function
export async function seedPlansAndSubscriptions() {
  try {
    await seedPlans();
    await seedUserSubscriptions();
  } catch (error) {
    console.error('❌ Error seeding plans and subscriptions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedPlansAndSubscriptions()
    .then(() => {
      console.log('🎉 Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}
