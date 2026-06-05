import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { sendEmail } from '@/lib/email';

export const revalidate = 0;

export async function GET() {
  try {
    console.log('[CRON JOB] Starting daily checks...');
    const settings = await db.setting.findFirst();
    const alertEmail = settings?.notificationEmail || 'alerts@renewalflow.com';
    const reminderIntervals = (settings?.reminderDays || '30,15,7,3,1')
      .split(',')
      .map((d) => parseInt(d.trim(), 10))
      .filter((d) => !isNaN(d));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let remindersSent = 0;

    // Helper to check and send reminders
    for (const days of reminderIntervals) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + days);

      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      // 1. Check Domains expiring on this exact target date
      const expiringDomains = await db.domain.findMany({
        where: {
          status: 'ACTIVE',
          expiryDate: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        include: { project: { include: { client: true } }, user: { include: { setting: true } } },
      });

      for (const domain of expiringDomains) {
        const domainAlertEmail = domain.user?.setting?.notificationEmail || domain.user?.email || alertEmail;
        const subject = `[RenewalFlow] Domain Expiry Reminder: ${domain.domainName} in ${days} days`;
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 12px;">
            <h2 style="color: #2563eb; margin-top: 0;">Domain Expiration Alert</h2>
            <p>Hello,</p>
            <p>This is an automated notification that the following domain tracker is expiring soon.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Domain:</td>
                <td style="padding: 8px 0; color: #1e293b;">${domain.domainName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Project:</td>
                <td style="padding: 8px 0; color: #1e293b;">${domain.project.projectName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Registrar:</td>
                <td style="padding: 8px 0; color: #1e293b;">${domain.registrar}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Expiry Date:</td>
                <td style="padding: 8px 0; color: #dc2626; font-weight: bold;">${new Date(domain.expiryDate).toLocaleDateString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Renewal Cost:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">₹${domain.renewalAmount}</td>
              </tr>
            </table>
            <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-t: 1px solid #e2e8f0; pt: 10px;">
              Manage this domain and view billing details at <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/domains" style="color: #2563eb;">RenewalFlow Dashboard</a>.
            </p>
          </div>
        `;

        await sendEmail({ to: domainAlertEmail, subject, html });

        // Record reminder log in DB
        await db.reminder.create({
          data: {
            userId: domain.userId,
            referenceType: 'DOMAIN',
            referenceId: domain.id,
            reminderDate: today,
            notificationType: 'EMAIL',
            status: 'SENT',
          },
        });
        remindersSent++;
      }

      // 2. Check Hosting Servers expiring on this exact target date
      const expiringServers = await db.server.findMany({
        where: {
          expiryDate: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        include: { project: { include: { client: true } }, user: { include: { setting: true } } },
      });

      for (const server of expiringServers) {
        const serverAlertEmail = server.user?.setting?.notificationEmail || server.user?.email || alertEmail;
        const subject = `[RenewalFlow] Hosting Renewal Reminder: ${server.provider} in ${days} days`;
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 12px;">
            <h2 style="color: #4f46e5; margin-top: 0;">Hosting Expiration Alert</h2>
            <p>Hello,</p>
            <p>This is an automated notification that the following server hosting contract is expiring soon.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Provider:</td>
                <td style="padding: 8px 0; color: #1e293b;">${server.provider}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Plan Name:</td>
                <td style="padding: 8px 0; color: #1e293b;">${server.planName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">IP Address:</td>
                <td style="padding: 8px 0; color: #1e293b; font-family: monospace;">${server.ipAddress}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Expiry Date:</td>
                <td style="padding: 8px 0; color: #dc2626; font-weight: bold;">${new Date(server.expiryDate).toLocaleDateString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Cost:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">₹${server.amount}</td>
              </tr>
            </table>
            <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-t: 1px solid #e2e8f0; pt: 10px;">
              Manage this hosting server at <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/servers" style="color: #4f46e5;">RenewalFlow Dashboard</a>.
            </p>
          </div>
        `;

        await sendEmail({ to: serverAlertEmail, subject, html });

        await db.reminder.create({
          data: {
            userId: server.userId,
            referenceType: 'SERVER',
            referenceId: server.id,
            reminderDate: today,
            notificationType: 'EMAIL',
            status: 'SENT',
          },
        });
        remindersSent++;
      }

      // 3. Check AMC contracts expiring on this exact target date
      const expiringAMCs = await db.aMCContract.findMany({
        where: {
          status: 'ACTIVE',
          endDate: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        include: { project: { include: { client: true } }, user: { include: { setting: true } } },
      });

      for (const amc of expiringAMCs) {
        const amcAlertEmail = amc.user?.setting?.notificationEmail || amc.user?.email || alertEmail;
        const subject = `[RenewalFlow] AMC Renewal Reminder: ${amc.project.projectName} in ${days} days`;
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 12px;">
            <h2 style="color: #059669; margin-top: 0;">AMC Contract Expiry Alert</h2>
            <p>Hello,</p>
            <p>This is an automated notification that the following Annual Maintenance Contract (AMC) is expiring soon.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Company Name:</td>
                <td style="padding: 8px 0; color: #1e293b;">${amc.project.client.companyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Project:</td>
                <td style="padding: 8px 0; color: #1e293b;">${amc.project.projectName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Renewal Cycle:</td>
                <td style="padding: 8px 0; color: #1e293b; text-transform: uppercase;">${amc.renewalCycle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">End Date:</td>
                <td style="padding: 8px 0; color: #dc2626; font-weight: bold;">${new Date(amc.endDate).toLocaleDateString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">AMC Amount:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">₹${amc.amount}</td>
              </tr>
            </table>
            <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-t: 1px solid #e2e8f0; pt: 10px;">
              Manage this AMC contract at <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/amc" style="color: #059669;">RenewalFlow Dashboard</a>.
            </p>
          </div>
        `;

        await sendEmail({ to: amcAlertEmail, subject, html });

        await db.reminder.create({
          data: {
            userId: amc.userId,
            referenceType: 'AMC',
            referenceId: amc.id,
            reminderDate: today,
            notificationType: 'EMAIL',
            status: 'SENT',
          },
        });
        remindersSent++;
      }
    }

    // 4. Check for Overdue Invoices
    const overdueInvoices = await db.invoice.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today,
        },
      },
      include: { client: true, project: true, user: { include: { setting: true } } },
    });

    for (const invoice of overdueInvoices) {
      // Find if we already sent a reminder today
      const alreadySentToday = await db.reminder.findFirst({
        where: {
          referenceType: 'INVOICE',
          referenceId: invoice.id,
          reminderDate: today,
        },
      });

      if (!alreadySentToday) {
        const invoiceAlertEmail = invoice.user?.setting?.notificationEmail || invoice.user?.email || alertEmail;
        const subject = `[RenewalFlow] OVERDUE Invoice Alert: ${invoice.invoiceNumber}`;
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 12px;">
            <h2 style="color: #e11d48; margin-top: 0;">Overdue Invoice Alert</h2>
            <p>Hello,</p>
            <p>The following client invoice is currently overdue and requires attention.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Invoice No:</td>
                <td style="padding: 8px 0; color: #1e293b;">${invoice.invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Client:</td>
                <td style="padding: 8px 0; color: #1e293b;">${invoice.client.companyName} (${invoice.client.name})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Project:</td>
                <td style="padding: 8px 0; color: #1e293b;">${invoice.project.projectName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Due Date:</td>
                <td style="padding: 8px 0; color: #dc2626; font-weight: bold;">${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Outstanding:</td>
                <td style="padding: 8px 0; color: #e11d48; font-weight: bold;">₹${invoice.amount}</td>
              </tr>
            </table>
            <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-t: 1px solid #e2e8f0; pt: 10px;">
              Review invoice and verify payment status at <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoices" style="color: #e11d48;">RenewalFlow Dashboard</a>.
            </p>
          </div>
        `;

        await sendEmail({ to: invoiceAlertEmail, subject, html });

        await db.reminder.create({
          data: {
            userId: invoice.userId,
            referenceType: 'INVOICE',
            referenceId: invoice.id,
            reminderDate: today,
            notificationType: 'EMAIL',
            status: 'SENT',
          },
        });
        remindersSent++;
      }
    }

    console.log(`[CRON JOB] Finished. Sent ${remindersSent} email alerts.`);
    return NextResponse.json({ success: true, remindersSent });
  } catch (error) {
    console.error('[CRON JOB ERROR] Cron execution failed:', error);
    return NextResponse.json({ error: 'Internal Server Error during cron checks' }, { status: 500 });
  }
}
