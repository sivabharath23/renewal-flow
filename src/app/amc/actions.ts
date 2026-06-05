'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getUserFilter, getSessionUser } from '@/lib/auth-helpers';

export async function getAMCs(searchQuery?: string) {
  try {
    const filter = await getUserFilter();
    if (!filter) return [];

    return await db.aMCContract.findMany({
      where: {
        ...filter,
        ...(searchQuery
          ? {
              OR: [
                { project: { projectName: { contains: searchQuery } } },
                { project: { client: { name: { contains: searchQuery } } } },
                { project: { client: { companyName: { contains: searchQuery } } } },
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
      orderBy: { endDate: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch AMCs:', error);
    return [];
  }
}

export async function createAMCAction(formData: FormData) {
  const projectId = formData.get('projectId') as string;
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;
  const amountStr = formData.get('amount') as string;
  const renewalCycle = formData.get('renewalCycle') as string; // MONTHLY, QUARTERLY, YEARLY
  const status = formData.get('status') as string; // ACTIVE, INACTIVE
  const notes = formData.get('notes') as string || null;

  if (!projectId || !startDateStr || !endDateStr || !amountStr || !renewalCycle || !status) {
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

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const amount = parseFloat(amountStr);

    await db.aMCContract.create({
      data: {
        projectId,
        startDate,
        endDate,
        amount,
        renewalCycle,
        status,
        notes,
        userId: user.id,
      },
    });

    revalidatePath('/amc');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Create AMC error:', error);
    return { error: 'Failed to create AMC contract tracker. Please verify entries.' };
  }
}

export async function updateAMCAction(id: string, formData: FormData) {
  const projectId = formData.get('projectId') as string;
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;
  const amountStr = formData.get('amount') as string;
  const renewalCycle = formData.get('renewalCycle') as string;
  const status = formData.get('status') as string;
  const notes = formData.get('notes') as string || null;

  if (!projectId || !startDateStr || !endDateStr || !amountStr || !renewalCycle || !status) {
    return { error: 'All fields except Notes are required.' };
  }

  try {
    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    // Verify AMC belongs to user
    const amcExists = await db.aMCContract.findFirst({
      where: { id, ...filter },
    });
    if (!amcExists) {
      return { error: 'AMC contract record not found or unauthorized.' };
    }

    // Verify new project belongs to user
    const projectExists = await db.project.findFirst({
      where: { id: projectId, ...filter },
    });
    if (!projectExists) {
      return { error: 'Invalid project selected.' };
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const amount = parseFloat(amountStr);

    await db.aMCContract.update({
      where: { id },
      data: {
        projectId,
        startDate,
        endDate,
        amount,
        renewalCycle,
        status,
        notes,
      },
    });

    revalidatePath('/amc');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Update AMC error:', error);
    return { error: 'Failed to update AMC contract tracker. Please verify entries.' };
  }
}

export async function deleteAMCAction(id: string) {
  try {
    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    // Verify AMC belongs to user
    const amcExists = await db.aMCContract.findFirst({
      where: { id, ...filter },
    });
    if (!amcExists) {
      return { error: 'AMC contract record not found or unauthorized.' };
    }

    await db.aMCContract.delete({
      where: { id },
    });
    revalidatePath('/amc');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete AMC error:', error);
    return { error: 'Failed to delete AMC contract record.' };
  }
}
