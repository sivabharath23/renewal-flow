'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getServers(searchQuery?: string) {
  try {
    return await db.server.findMany({
      where: searchQuery
        ? {
            OR: [
              { provider: { contains: searchQuery } },
              { planName: { contains: searchQuery } },
              { ipAddress: { contains: searchQuery } },
              { project: { projectName: { contains: searchQuery } } },
            ],
          }
        : undefined,
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch servers:', error);
    return [];
  }
}

export async function createServerAction(formData: FormData) {
  const provider = formData.get('provider') as string;
  const projectId = formData.get('projectId') as string;
  const planName = formData.get('planName') as string;
  const ipAddress = formData.get('ipAddress') as string;
  const purchaseDateStr = formData.get('purchaseDate') as string;
  const expiryDateStr = formData.get('expiryDate') as string;
  const amountStr = formData.get('amount') as string;
  const notes = formData.get('notes') as string || null;

  if (!provider || !projectId || !planName || !ipAddress || !purchaseDateStr || !expiryDateStr || !amountStr) {
    return { error: 'All fields except Notes are required.' };
  }

  try {
    const purchaseDate = new Date(purchaseDateStr);
    const expiryDate = new Date(expiryDateStr);
    const amount = parseFloat(amountStr);

    await db.server.create({
      data: {
        provider,
        projectId,
        planName,
        ipAddress,
        purchaseDate,
        expiryDate,
        amount,
        notes,
      },
    });

    revalidatePath('/servers');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Create server error:', error);
    return { error: 'Failed to create server tracker. Please verify entries.' };
  }
}

export async function updateServerAction(id: string, formData: FormData) {
  const provider = formData.get('provider') as string;
  const projectId = formData.get('projectId') as string;
  const planName = formData.get('planName') as string;
  const ipAddress = formData.get('ipAddress') as string;
  const purchaseDateStr = formData.get('purchaseDate') as string;
  const expiryDateStr = formData.get('expiryDate') as string;
  const amountStr = formData.get('amount') as string;
  const notes = formData.get('notes') as string || null;

  if (!provider || !projectId || !planName || !ipAddress || !purchaseDateStr || !expiryDateStr || !amountStr) {
    return { error: 'All fields except Notes are required.' };
  }

  try {
    const purchaseDate = new Date(purchaseDateStr);
    const expiryDate = new Date(expiryDateStr);
    const amount = parseFloat(amountStr);

    await db.server.update({
      where: { id },
      data: {
        provider,
        projectId,
        planName,
        ipAddress,
        purchaseDate,
        expiryDate,
        amount,
        notes,
      },
    });

    revalidatePath('/servers');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Update server error:', error);
    return { error: 'Failed to update server tracker. Please verify entries.' };
  }
}

export async function deleteServerAction(id: string) {
  try {
    await db.server.delete({
      where: { id },
    });
    revalidatePath('/servers');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete server error:', error);
    return { error: 'Failed to delete server record.' };
  }
}
