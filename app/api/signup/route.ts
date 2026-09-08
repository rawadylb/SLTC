import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['IDEA_MAKER', 'INVESTOR']),
  countryCode: z.string().min(1),
  phone: z.string().min(3),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password, role, countryCode, phone } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
  }

  const existingPhone = await db.user.findFirst({ where: { countryCode, phone } });
  if (existingPhone) {
    return NextResponse.json({ error: 'An account with this phone number already exists.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await db.user.create({
    data: { name, email, passwordHash, role, countryCode, phone, verificationToken },
  });

  try {
    await sendVerificationEmail(email, verificationToken);
  } catch (e) {
    console.error('Failed to send verification email:', e);
  }

  return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}
