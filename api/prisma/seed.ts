import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@proposal.com' },
    update: {},
    create: {
      email: 'admin@proposal.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'user@proposal.com' },
    update: {},
    create: {
      email: 'user@proposal.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
    },
  });

  // Create sample template
  const template = await prisma.template.upsert({
    where: { id: 'template-1' },
    update: {},
    create: {
      id: 'template-1',
      name: 'Business Proposal Template',
      content: 'This is a sample business proposal template...',
      category: 'Business',
      isPublic: true,
    },
  });

  // Create sample proposal
  const proposal = await prisma.proposal.upsert({
    where: { id: 'proposal-1' },
    update: {},
    create: {
      id: 'proposal-1',
      title: 'Sample Proposal',
      content: 'This is a sample proposal content...',
      status: 'DRAFT',
      authorId: user.id,
      templateId: template.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user:', admin.email);
  console.log('👤 Test user:', user.email);
  console.log('📄 Template:', template.name);
  console.log('📋 Proposal:', proposal.title);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
