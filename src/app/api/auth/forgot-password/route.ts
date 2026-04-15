import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import nodemailer from 'nodemailer';

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

    // Map strictly to our default frontend port
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    // Intercept explicitly via Backend Output for active Development Testing
    console.log(`\n\n[SECURITY ENGINE] Password Reset Dispatch Intercepted!`);
    console.log(`Target Address: ${user.email}`);
    console.log(`Secure Gateway: ${resetUrl}\n\n`);

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
    }

    return NextResponse.json({ message: 'If an account with that email exists, we sent a password reset link.' });
  } catch (error) {
    return NextResponse.json({ error: 'System architecture errored out.' }, { status: 500 });
  }
}
