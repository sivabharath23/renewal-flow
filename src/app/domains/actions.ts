'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getDomains(searchQuery?: string) {
  try {
    return await db.domain.findMany({
      where: searchQuery
        ? {
            OR: [
              { domainName: { contains: searchQuery } },
              { registrar: { contains: searchQuery } },
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
    console.error('Failed to fetch domains:', error);
    return [];
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
