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

  let adminId = '';

  if (!defaultAdmin) {
    const hashedPassword = hashPassword('admin123');
    const created = await prisma.user.create({
      data: {
        name: 'Administrator',
        email,
        password: hashedPassword,
        role: 'ADMIN',
      }
    });
    adminId = created.id;
    console.log('Created default admin user (admin@renewalflow.com / admin123)');
  } else {
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
    adminId = updated.id;
    console.log('Admin user already exists, ensured role is ADMIN');
  }

  // Create default settings linked to admin
  const settingsCount = await prisma.setting.count({
    where: { userId: adminId }
  });
  if (settingsCount === 0) {
    await prisma.setting.create({
      data: {
        userId: adminId,
        companyName: 'RenewalFlow Agency',
        companyEmail: 'hello@renewalflow.com',
        companyPhone: '+1 234 567 890',
        upiId: '9003793639@ptsbi',
        upiName: 'Sivabharath',
        reminderDays: '30,15,7,3,1',
        notificationEmail: 'alerts@renewalflow.com',
      }
    });
    console.log('Created default settings for Admin');
  } else {
    console.log('Settings already exist for Admin');
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
