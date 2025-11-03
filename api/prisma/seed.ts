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
  const proposalTemplate = await prisma.template.upsert({
    where: { id: 'template-proposal-default' },
    update: {},
    create: {
      id: 'template-proposal-default',
      name: 'Default Proposal Template',
      type: 'PROPOSAL',
      content: '<h1>{{title}}</h1>\n<p>{{content}}</p>',
      category: 'Default',
      isPublic: true,
      authorId: admin.id,
    },
  });

  const emailProposalSent = await prisma.template.upsert({
    where: { id: 'template-email-proposal-sent' },
    update: {},
    create: {
      id: 'template-email-proposal-sent',
      name: 'proposal-sent',
      type: 'EMAIL',
      subject: 'New Proposal Sent',
      content: '<h1>Proposal Sent</h1>\n<p>Hi {{recipientName}}, your proposal "{{proposalTitle}}" was sent.</p>',
      category: 'system',
      isPublic: true,
      authorId: admin.id,
    },
  });

  const emailThankYou = await prisma.template.upsert({
    where: { id: 'template-email-thank-you' },
    update: {},
    create: {
      id: 'template-email-thank-you',
      name: 'thank-you',
      type: 'EMAIL',
      subject: 'Thank You',
      content: '<h1>Thank you, {{name}}!</h1>\n<p>We appreciate you using our service.</p>',
      category: 'system',
      isPublic: true,
      authorId: admin.id,
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
      templateId: proposalTemplate.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user:', admin.email);
  console.log('👤 Test user:', user.email);
  console.log('📄 Proposal Template:', proposalTemplate.name);
  console.log('✉️ Email Templates:', emailProposalSent.name, ',', emailThankYou.name);
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
