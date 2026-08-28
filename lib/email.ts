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
