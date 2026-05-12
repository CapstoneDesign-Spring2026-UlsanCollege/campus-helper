import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import { getAppBaseUrl } from '@/lib/env';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
       // Obfuscate response logically to prevent scraping enumeration
       return NextResponse.json({ message: 'If an account with that email exists, we sent a password reset link.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 solid hour lockout
    await user.save();

    const resetUrl = `${getAppBaseUrl()}/reset-password?token=${resetToken}`;

    // Automatic hook logic for authentic SMTP environments. Drop env vars when ready!
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      await transporter.sendMail({
         from: '"Ulsan Campus+" <no-reply@ulsancampus.com>',
         to: user.email,
         subject: 'Password Verification Gateway',
         text: `A reset has been designated for your account. Re-secure your parameters here: ${resetUrl}`
      });
    } else if (process.env.NODE_ENV !== 'production') {
      // Never log raw reset tokens/URLs (they are secrets). In local dev without SMTP, print a redacted hint only.
      console.info('[forgot-password] SMTP not configured; reset email not sent (development mode).');
    }

    return NextResponse.json({ message: 'If an account with that email exists, we sent a password reset link.' });
  } catch {
    return NextResponse.json({ error: 'System architecture errored out.' }, { status: 500 });
  }
}
