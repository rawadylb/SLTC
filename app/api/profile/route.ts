import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json();

  if (body.kind === 'details') {
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    if (name.length < 2) return NextResponse.json({ error: 'Name is too short' }, { status: 400 });

    await db.user.update({ where: { id: session.user.id }, data: { name, phone: phone || null } });
    return NextResponse.json({ ok: true });
  }

  if (body.kind === 'email') {
    const { newEmail, currentPassword } = body;
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });

    const existing = await db.user.findUnique({ where: { email: newEmail } });
    if (existing) return NextResponse.json({ error: 'That email is already in use' }, { status: 409 });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await db.user.update({
      where: { id: session.user.id },
      data: { email: newEmail, emailVerified: null, verificationToken },
    });

    try {
      await sendVerificationEmail(newEmail, verificationToken);
    } catch (e) {
      console.error('Failed to send verification email:', e);
    }

    return NextResponse.json({ ok: true });
  }

  if (body.kind === 'password') {
    const { currentPassword, newPassword } = body;
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.user.update({ where: { id: session.user.id }, data: { passwordHash } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown request' }, { status: 400 });
}
