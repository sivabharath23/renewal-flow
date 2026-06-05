'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import QRCode from 'qrcode';
import { getUserFilter, getSessionUser } from '@/lib/auth-helpers';

export async function getInvoices(searchQuery?: string) {
  try {
    const filter = await getUserFilter();
    if (!filter) return [];

    return await db.invoice.findMany({
      where: {
        ...filter,
        ...(searchQuery
          ? {
              OR: [
                { invoiceNumber: { contains: searchQuery } },
                { client: { name: { contains: searchQuery } } },
                { client: { companyName: { contains: searchQuery } } },
                { project: { projectName: { contains: searchQuery } } },
              ],
            }
          : {}),
      },
      include: {
        client: true,
        project: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return [];
  }
}

export async function getCompanySettings(invoiceId?: string) {
  try {
    let targetUserId: string | null = null;

    if (invoiceId) {
      const invoice = await db.invoice.findUnique({
        where: { id: invoiceId },
      });
      if (invoice && invoice.userId) {
        targetUserId = invoice.userId;
      }
    }

    if (!targetUserId) {
      const user = await getSessionUser();
      if (user) {
        targetUserId = user.id;
      }
    }

    if (!targetUserId) return null;

    let settings = await db.setting.findUnique({
      where: { userId: targetUserId },
    });

    if (!settings) {
      const user = await db.user.findUnique({
        where: { id: targetUserId },
        select: { email: true, name: true },
      });
      settings = await db.setting.create({
        data: {
          userId: targetUserId,
          companyName: 'RenewalFlow Agency',
          companyEmail: user?.email || 'hello@renewalflow.com',
          companyPhone: '+1 234 567 890',
          upiId: '9003793639@ptsbi',
          upiName: user?.name || 'Sivabharath',
        },
      });
    }
    return settings;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return null;
  }
}

export async function generateUPIQRCode(amount: number, invoiceNumber: string) {
  try {
    const invoice = await db.invoice.findUnique({
      where: { invoiceNumber },
    });
    const settings = await getCompanySettings(invoice?.id);
    const upiId = settings?.upiId || '9003793639@ptsbi';
    const upiName = settings?.upiName || 'Sivabharath';

    // Format upi payment link
    const cleanedName = encodeURIComponent(upiName);
    const upiUrl = `upi://pay?pa=${upiId}&pn=${cleanedName}&am=${amount}&tr=${invoiceNumber}`;
    
    // Generate QR base64
    const qrDataUrl = await QRCode.toDataURL(upiUrl, {
      margin: 1,
      width: 240,
    });
    return { qrDataUrl, upiId, upiName, upiUrl };
  } catch (error) {
    console.error('QR code generation failed:', error);
    return null;
  }
}

export async function createInvoiceAction(formData: FormData) {
  const invoiceNumber = formData.get('invoiceNumber') as string;
  const clientId = formData.get('clientId') as string;
  const projectId = formData.get('projectId') as string;
  const invoiceDateStr = formData.get('invoiceDate') as string;
  const dueDateStr = formData.get('dueDate') as string;
  const amountStr = formData.get('amount') as string;
  const description = formData.get('description') as string || null;
  const status = formData.get('status') as string; // DRAFT, PENDING, PAID, CANCELLED

  if (!invoiceNumber || !clientId || !projectId || !invoiceDateStr || !dueDateStr || !amountStr || !status) {
    return { error: 'All fields except Description are required.' };
  }

  try {
    const user = await getSessionUser();
    if (!user) return { error: 'Unauthorized' };

    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    // Verify client belongs to user
    const clientExists = await db.client.findFirst({
      where: { id: clientId, ...filter },
    });
    if (!clientExists) {
      return { error: 'Invalid client selected.' };
    }

    // Verify project belongs to user
    const projectExists = await db.project.findFirst({
      where: { id: projectId, ...filter },
    });
    if (!projectExists) {
      return { error: 'Invalid project selected.' };
    }

    const invoiceDate = new Date(invoiceDateStr);
    const dueDate = new Date(dueDateStr);
    const amount = parseFloat(amountStr);

    // Verify uniqueness of invoice number
    const existing = await db.invoice.findUnique({
      where: { invoiceNumber },
    });
    if (existing) {
      return { error: `Invoice number ${invoiceNumber} already exists.` };
    }

    await db.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        projectId,
        invoiceDate,
        dueDate,
        amount,
        description,
        status,
        userId: user.id,
      },
    });

    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Create invoice error:', error);
    return { error: 'Failed to create invoice. Please check parameters.' };
  }
}

export async function updateInvoiceAction(id: string, formData: FormData) {
  const invoiceNumber = formData.get('invoiceNumber') as string;
  const clientId = formData.get('clientId') as string;
  const projectId = formData.get('projectId') as string;
  const invoiceDateStr = formData.get('invoiceDate') as string;
  const dueDateStr = formData.get('dueDate') as string;
  const amountStr = formData.get('amount') as string;
  const description = formData.get('description') as string || null;
  const status = formData.get('status') as string;

  if (!invoiceNumber || !clientId || !projectId || !invoiceDateStr || !dueDateStr || !amountStr || !status) {
    return { error: 'All fields except Description are required.' };
  }

  try {
    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    // Verify invoice belongs to user
    const invoiceExists = await db.invoice.findFirst({
      where: { id, ...filter },
    });
    if (!invoiceExists) {
      return { error: 'Invoice not found or unauthorized.' };
    }

    // Verify client belongs to user
    const clientExists = await db.client.findFirst({
      where: { id: clientId, ...filter },
    });
    if (!clientExists) {
      return { error: 'Invalid client selected.' };
    }

    // Verify project belongs to user
    const projectExists = await db.project.findFirst({
      where: { id: projectId, ...filter },
    });
    if (!projectExists) {
      return { error: 'Invalid project selected.' };
    }

    const invoiceDate = new Date(invoiceDateStr);
    const dueDate = new Date(dueDateStr);
    const amount = parseFloat(amountStr);

    await db.invoice.update({
      where: { id },
      data: {
        invoiceNumber,
        clientId,
        projectId,
        invoiceDate,
        dueDate,
        amount,
        description,
        status,
      },
    });

    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Update invoice error:', error);
    return { error: 'Failed to update invoice. Please check parameters.' };
  }
}

export async function deleteInvoiceAction(id: string) {
  try {
    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    // Verify invoice belongs to user
    const invoiceExists = await db.invoice.findFirst({
      where: { id, ...filter },
    });
    if (!invoiceExists) {
      return { error: 'Invoice not found or unauthorized.' };
    }

    await db.invoice.delete({
      where: { id },
    });
    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete invoice error:', error);
    return { error: 'Failed to delete invoice.' };
  }
}
