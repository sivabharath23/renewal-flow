import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Seeding database...');

  // Create default admin user
  const email = 'admin@renewalflow.com';
  const defaultAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (!defaultAdmin) {
    const hashedPassword = hashPassword('admin123');
    await prisma.user.create({
      data: {
        name: 'Administrator',
        email,
        password: hashedPassword,
      }
    });
    console.log('Created default admin user (admin@renewalflow.com / admin123)');
  } else {
    console.log('Admin user already exists');
  }

  // Create default settings
  const settingsCount = await prisma.setting.count();
  if (settingsCount === 0) {
    await prisma.setting.create({
      data: {
        companyName: 'RenewalFlow Agency',
        companyEmail: 'hello@renewalflow.com',
        companyPhone: '+1 234 567 890',
        upiId: 'sivabharath@upi',
        upiName: 'Sivabharath',
        reminderDays: '30,15,7,3,1',
        notificationEmail: 'alerts@renewalflow.com',
      }
    });
    console.log('Created default settings');
  } else {
    console.log('Settings already exist');
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
