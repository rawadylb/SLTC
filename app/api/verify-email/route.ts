import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/verify-email?status=missing', req.url));
  }

  const user = await db.user.findUnique({ where: { verificationToken: token } });
  if (!user) {
    return NextResponse.redirect(new URL('/verify-email?status=invalid', req.url));
  }

  await db.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date(), verificationToken: null },
  });

  return NextResponse.redirect(new URL('/verify-email?status=success', req.url));
}
