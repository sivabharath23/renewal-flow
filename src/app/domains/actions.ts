'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getUserFilter, getSessionUser } from '@/lib/auth-helpers';

export async function getDomains(searchQuery?: string, page?: number, limit?: number) {
  try {
    const filter = await getUserFilter();
    if (!filter) return page !== undefined ? { data: [], total: 0, pages: 0 } : [];

    const whereClause = {
      ...filter,
      ...(searchQuery
        ? {
            OR: [
              { domainName: { contains: searchQuery } },
              { registrar: { contains: searchQuery } },
              { project: { projectName: { contains: searchQuery } } },
            ],
          }
        : {}),
    };

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const [total, data] = await Promise.all([
        db.domain.count({ where: whereClause }),
        db.domain.findMany({
          where: whereClause,
          include: {
            project: {
              include: {
                client: true,
              },
            },
          },
          orderBy: { expiryDate: 'asc' },
          skip,
          take: limit,
        })
      ]);
      return {
        data,
        total,
        pages: Math.ceil(total / limit),
      };
    }

    return await db.domain.findMany({
      where: whereClause,
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
    console.error('Failed to fetch domains:', error);
    return page !== undefined ? { data: [], total: 0, pages: 0 } : [];
  }
}

export async function createDomainAction(formData: FormData) {
  const domainName = formData.get('domainName') as string;
  const projectId = formData.get('projectId') as string;
  const registrar = formData.get('registrar') as string;
  const purchaseDateStr = formData.get('purchaseDate') as string;
  const expiryDateStr = formData.get('expiryDate') as string;
  const renewalAmountStr = formData.get('renewalAmount') as string;
  const autoRenew = formData.get('autoRenew') === 'true';
  const status = formData.get('status') as string;
  const notes = formData.get('notes') as string || null;

  if (!domainName || !projectId || !registrar || !purchaseDateStr || !expiryDateStr || !renewalAmountStr || !status) {
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
    const renewalAmount = parseFloat(renewalAmountStr);

    await db.domain.create({
      data: {
        domainName,
        projectId,
        registrar,
        purchaseDate,
        expiryDate,
        renewalAmount,
        autoRenew,
        status,
        notes,
        userId: user.id,
      },
    });

    revalidatePath('/domains');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Create domain error:', error);
    return { error: 'Failed to create domain record. Please check values.' };
  }
}

export async function updateDomainAction(id: string, formData: FormData) {
  const domainName = formData.get('domainName') as string;
  const projectId = formData.get('projectId') as string;
  const registrar = formData.get('registrar') as string;
  const purchaseDateStr = formData.get('purchaseDate') as string;
  const expiryDateStr = formData.get('expiryDate') as string;
  const renewalAmountStr = formData.get('renewalAmount') as string;
  const autoRenew = formData.get('autoRenew') === 'true';
  const status = formData.get('status') as string;
  const notes = formData.get('notes') as string || null;

  if (!domainName || !projectId || !registrar || !purchaseDateStr || !expiryDateStr || !renewalAmountStr || !status) {
    return { error: 'All fields except Notes are required.' };
  }

  try {
    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    // Verify domain belongs to user
    const domainExists = await db.domain.findFirst({
      where: { id, ...filter },
    });
    if (!domainExists) {
      return { error: 'Domain record not found or unauthorized.' };
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
    const renewalAmount = parseFloat(renewalAmountStr);

    await db.domain.update({
      where: { id },
      data: {
        domainName,
        projectId,
        registrar,
        purchaseDate,
        expiryDate,
        renewalAmount,
        autoRenew,
        status,
        notes,
      },
    });

    revalidatePath('/domains');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Update domain error:', error);
    return { error: 'Failed to update domain record. Please check values.' };
  }
}

export async function deleteDomainAction(id: string) {
  try {
    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    // Verify domain belongs to user
    const domainExists = await db.domain.findFirst({
      where: { id, ...filter },
    });
    if (!domainExists) {
      return { error: 'Domain record not found or unauthorized.' };
    }

    await db.domain.delete({
      where: { id },
    });
    revalidatePath('/domains');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete domain error:', error);
    return { error: 'Failed to delete domain record.' };
  }
}
