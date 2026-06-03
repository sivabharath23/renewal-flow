'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getClients(searchQuery?: string) {
  try {
    return await db.client.findMany({
      where: searchQuery
        ? {
            OR: [
              { name: { contains: searchQuery } },
              { companyName: { contains: searchQuery } },
              { email: { contains: searchQuery } },
            ],
          }
        : undefined,
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return [];
  }
}

export async function createClientAction(formData: FormData) {
  const name = formData.get('name') as string;
  const companyName = formData.get('companyName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const gstNo = formData.get('gstNo') as string || null;
  const notes = formData.get('notes') as string || null;

  if (!name || !companyName || !email || !phone || !address) {
    return { error: 'All fields except GST and Notes are required.' };
  }

  try {
    await db.client.create({
      data: { name, companyName, email, phone, address, gstNo, notes },
    });
    revalidatePath('/clients');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Create client error:', error);
    return { error: 'Failed to create client. Please try again.' };
  }
}

export async function updateClientAction(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const companyName = formData.get('companyName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const gstNo = formData.get('gstNo') as string || null;
  const notes = formData.get('notes') as string || null;

  if (!name || !companyName || !email || !phone || !address) {
    return { error: 'All fields except GST and Notes are required.' };
  }

  try {
    await db.client.update({
      where: { id },
      data: { name, companyName, email, phone, address, gstNo, notes },
    });
    revalidatePath('/clients');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Update client error:', error);
    return { error: 'Failed to update client. Please try again.' };
  }
}

export async function deleteClientAction(id: string) {
  try {
    await db.client.delete({
      where: { id },
    });
    revalidatePath('/clients');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete client error:', error);
    return { error: 'Failed to delete client. Note that you cannot delete clients with active relations.' };
  }
}
