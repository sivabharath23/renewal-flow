'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import QRCode from 'qrcode';

export async function getInvoices(searchQuery?: string) {
  try {
    return await db.invoice.findMany({
      where: searchQuery
        ? {
            OR: [
              { invoiceNumber: { contains: searchQuery } },
              { client: { name: { contains: searchQuery } } },
              { client: { companyName: { contains: searchQuery } } },
              { project: { projectName: { contains: searchQuery } } },
            ],
          }
        : undefined,
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

export async function getCompanySettings() {
  try {
    let settings = await db.setting.findFirst();
    if (!settings) {
      settings = await db.setting.create({
        data: {
          companyName: 'RenewalFlow Agency',
          companyEmail: 'hello@renewalflow.com',
          companyPhone: '+1 234 567 890',
          upiId: '9003793639@ptsbi',
          upiName: 'Sivabharath',
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
    const settings = await getCompanySettings();
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
