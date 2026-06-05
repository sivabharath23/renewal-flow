'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getUserFilter, getSessionUser } from '@/lib/auth-helpers';

export async function getServers(searchQuery?: string) {
  try {
    const filter = await getUserFilter();
    if (!filter) return [];

    return await db.server.findMany({
      where: {
        ...filter,
        ...(searchQuery
          ? {
              OR: [
                { provider: { contains: searchQuery } },
                { planName: { contains: searchQuery } },
                { ipAddress: { contains: searchQuery } },
                { project: { projectName: { contains: searchQuery } } },
              ],
            }
          : {}),
      },
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
    const user = await getSessionUser();
    if (!user) return { error: 'Unauthorized' };

    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    // Verify project belongs to user
    const projectExists = await db.project.findFirst({
      where: { id: projectId, ...filter },
    });
    if (!projectExists) {
      return { error: 'Invalid project selected.' };
    }

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
        userId: user.id,
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
    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    // Verify server belongs to user
    const serverExists = await db.server.findFirst({
      where: { id, ...filter },
    });
    if (!serverExists) {
      return { error: 'Server record not found or unauthorized.' };
    }

    // Verify new project belongs to user
    const projectExists = await db.project.findFirst({
      where: { id: projectId, ...filter },
    });
    if (!projectExists) {
      return { error: 'Invalid project selected.' };
    }

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
    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    // Verify server belongs to user
    const serverExists = await db.server.findFirst({
      where: { id, ...filter },
    });
    if (!serverExists) {
      return { error: 'Server record not found or unauthorized.' };
    }

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
