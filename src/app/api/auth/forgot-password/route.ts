import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import { getAppBaseUrl } from '@/lib/env';

function isDemoResetFallbackEnabled() {
  return process.env.ALLOW_DEMO_PASSWORD_RESET === 'true';
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
       // Keep this generic to avoid account enumeration.
       return NextResponse.json({ message: 'If an account with that email exists, we sent a password reset link.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 solid hour lockout
    await user.save();

    const resetUrl = `${getAppBaseUrl()}/reset-password?token=${resetToken}`;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      await transporter.sendMail({
         from: '"Ulsan Campus+" <no-reply@ulsancampus.com>',
         to: user.email,
         subject: 'Reset your Ulsan Campus+ password',
         text: `We received a request to reset your password. Use this link to continue: ${resetUrl}`
      });
      return NextResponse.json({
        message: 'If an account with that email exists, we sent a password reset link.',
        deliveryMode: 'email',
      });
    }

    if (isDemoResetFallbackEnabled()) {
      return NextResponse.json({
        message: 'Email delivery is not configured on this deployment yet. Use the temporary reset link below.',
        deliveryMode: 'onscreen',
        resetUrl,
      });
    } else if (process.env.NODE_ENV !== 'production') {
      // Never log raw reset tokens/URLs (they are secrets). In local dev without SMTP, print a redacted hint only.
      console.info('[forgot-password] SMTP not configured; reset email not sent (development mode).');
    }

    return NextResponse.json({
      message: 'Password reset email is not configured yet on this deployment. Please contact the administrator.',
      deliveryMode: 'unavailable',
    });
  } catch {
    return NextResponse.json({ error: 'Could not start password reset. Please try again.' }, { status: 500 });
  }
}
