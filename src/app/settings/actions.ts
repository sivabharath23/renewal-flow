'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/auth-helpers';

export async function getSettings() {
  try {
    const user = await getSessionUser();
    if (!user) return null;

    let settings = await db.setting.findUnique({
      where: { userId: user.id },
    });

    if (!settings) {
      settings = await db.setting.create({
        data: {
          userId: user.id,
          companyName: 'RenewalFlow Agency',
          companyEmail: user.email,
          companyPhone: '+1 234 567 890',
          upiId: '9003793639@ptsbi',
          upiName: user.name || 'Sivabharath',
          reminderDays: '30,15,7,3,1',
          notificationEmail: 'alerts@renewalflow.com',
        },
      });
    }
    return settings;
  } catch (error) {
    console.error('Failed to get settings:', error);
    return null;
  }
}

export async function updateSettingsAction(formData: FormData) {
  const companyName = formData.get('companyName') as string;
  const companyEmail = formData.get('companyEmail') as string;
  const companyPhone = formData.get('companyPhone') as string;
  const upiId = formData.get('upiId') as string;
  const upiName = formData.get('upiName') as string;
  const reminderDays = formData.get('reminderDays') as string;
  const notificationEmail = formData.get('notificationEmail') as string;
  const companyLogo = formData.get('companyLogo') as string | null;
  const showLogo = formData.get('showLogo') === 'on';

  if (!companyName || !companyEmail || !companyPhone || !upiId || !upiName || !reminderDays || !notificationEmail) {
    return { error: 'All configurations are required.' };
  }

  try {
    const user = await getSessionUser();
    if (!user) return { error: 'Unauthorized' };

    const existing = await db.setting.findUnique({
      where: { userId: user.id },
    });
    const logoToSave = companyLogo === '' ? null : companyLogo;

    if (existing) {
      await db.setting.update({
        where: { id: existing.id },
        data: {
          companyName,
          companyEmail,
          companyPhone,
          upiId,
          upiName,
          reminderDays,
          notificationEmail,
          companyLogo: logoToSave,
          showLogo,
        },
      });
    } else {
      await db.setting.create({
        data: {
          userId: user.id,
          companyName,
          companyEmail,
          companyPhone,
          upiId,
          upiName,
          reminderDays,
          notificationEmail,
          companyLogo: logoToSave,
          showLogo,
        },
      });
    }

    revalidatePath('/settings');
    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Update settings error:', error);
    return { error: 'Failed to save settings. Please verify inputs.' };
  }
}
