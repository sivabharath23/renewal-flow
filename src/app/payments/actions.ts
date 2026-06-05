'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { getUserFilter } from '@/lib/auth-helpers';

export async function getPayments(statusFilter?: string) {
  try {
    const filter = await getUserFilter();
    if (!filter) return [];

    return await db.payment.findMany({
      where: {
        invoice: {
          client: filter,
        },
        ...(statusFilter && statusFilter !== 'ALL'
          ? { status: statusFilter }
          : {}),
      },
      include: {
        invoice: {
          include: {
            client: true,
            project: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return [];
  }
}

export async function submitPaymentProofAction(formData: FormData) {
  const invoiceId = formData.get('invoiceId') as string;
  const amountStr = formData.get('amount') as string;
  const paidDateStr = formData.get('paidDate') as string;
  const transactionRef = formData.get('transactionRef') as string;
  const remarks = formData.get('remarks') as string || null;
  const file = formData.get('proofImageFile') as File | null;

  if (!invoiceId || !amountStr || !paidDateStr || !transactionRef) {
    return { error: 'Invoice, Amount, Paid Date, and Transaction Reference are required.' };
  }

  try {
    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    // Verify parent invoice belongs to user
    const invoiceExists = await db.invoice.findFirst({
      where: { id: invoiceId, client: filter },
    });
    if (!invoiceExists) {
      return { error: 'Invoice not found or unauthorized.' };
    }

    const amount = parseFloat(amountStr);
    const paidDate = new Date(paidDateStr);

    let proofImage = null;

    // Handle local file saving
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      // Auto-create directory
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileExtension = file.name.split('.').pop() || 'png';
      const fileName = `${invoiceId}-${Date.now()}.${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, buffer);
      proofImage = `/uploads/${fileName}`;
    }

    await db.payment.create({
      data: {
        invoiceId,
        amount,
        paidDate,
        transactionRef,
        proofImage,
        remarks,
        status: 'PENDING',
      },
    });

    // Mark the invoice status as PENDING if it was DRAFT (shows activity)
    const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
    if (invoice && invoice.status === 'DRAFT') {
      await db.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PENDING' },
      });
    }

    revalidatePath('/payments');
    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Submit payment proof error:', error);
    return { error: 'Failed to upload payment proof. Please try again.' };
  }
}

export async function approvePaymentAction(paymentId: string) {
  try {
    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    const payment = await db.payment.findFirst({
      where: { id: paymentId, invoice: { client: filter } },
    });

    if (!payment) {
      return { error: 'Payment record not found or unauthorized.' };
    }

    // 1. Update Payment status to VERIFIED
    await db.payment.update({
      where: { id: paymentId },
      data: { status: 'VERIFIED', remarks: 'Payment approved.' },
    });

    // 2. Update parent Invoice status to PAID
    await db.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'PAID' },
    });

    revalidatePath('/payments');
    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Approve payment error:', error);
    return { error: 'Failed to approve payment. Please check database connectivity.' };
  }
}

export async function rejectPaymentAction(paymentId: string, remarks: string) {
  if (!remarks) {
    return { error: 'Remarks are required to reject a payment.' };
  }

  try {
    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    const payment = await db.payment.findFirst({
      where: { id: paymentId, invoice: { client: filter } },
    });

    if (!payment) {
      return { error: 'Payment record not found or unauthorized.' };
    }

    // Update Payment status to REJECTED with remarks
    await db.payment.update({
      where: { id: paymentId },
      data: { status: 'REJECTED', remarks },
    });

    revalidatePath('/payments');
    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Reject payment error:', error);
    return { error: 'Failed to reject payment.' };
  }
}
