import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  // Always log to console in development
  console.log(`\n=== [EMAIL SEND PREVIEW] ===\nTo: ${to}\nSubject: ${subject}\nContent:\n${html}\n============================\n`);

  // Send real email if SMTP credentials are provided in .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const fromAddress = process.env.SMTP_FROM || '"RenewalFlow" <alerts@renewalflow.com>';

      await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
      });
      console.log(`[EMAIL SENT] Successfully sent real email to ${to}`);
      return true;
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send email via SMTP:', error);
      return false;
    }
  }

  return true;
}
