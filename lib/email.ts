import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// IMPORTANT: "from" must be an address on a domain you've verified in Resend.
// Until sltc.me's DNS is verified in Resend, use their default: onboarding@resend.dev
const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev';

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'Confirm your sltc.me account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to sltc.me</h2>
        <p>Click the button below to confirm your email address and activate your account.</p>
        <a href="${verifyUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2563EB;color:#fff;text-decoration:none;border-radius:6px;">
          Confirm my email
        </a>
        <p style="margin-top:24px;color:#64748b;font-size:13px;">
          If you didn't create this account, you can ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendInterestNotification(
  adminEmails: string[],
  data: { ideaTitle: string; ideaId: string; investorName: string; investorEmail: string; phone: string; location: string; capital: string; message?: string }
) {
  if (adminEmails.length === 0) return;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: adminEmails,
    subject: `New investor interest: ${data.ideaTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
        <h2>New investor interest</h2>
        <p><strong>Idea:</strong> ${data.ideaTitle} (ID: ${data.ideaId})</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
        <p><strong>Investor:</strong> ${data.investorName} (${data.investorEmail})</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Approximate capital:</strong> ${data.capital}</p>
        ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
        <p style="margin-top:24px;color:#64748b;font-size:13px;">
          Review this in your admin dashboard and decide whether to connect them with the idea maker.
        </p>
      </div>
    `,
  });
}
