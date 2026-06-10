import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { validateStrongPassword } from '@/lib/password-policy';

export async function POST(req: Request) {
  try {
     const { token, password } = await req.json();

     if (!token || typeof token !== 'string') {
       return NextResponse.json({ error: 'Reset token is missing or invalid.' }, { status: 400 });
     }

     if (typeof password !== 'string') {
       return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
     }

     const passwordCheck = validateStrongPassword(password);
     if (!passwordCheck.isValid) {
       return NextResponse.json({ error: passwordCheck.issues[0] }, { status: 400 });
     }
     
     // Reverse correlate the token against the mathematical SHA256 constraint algorithm
     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

     await connectDB();
     
     // Evaluate dual dimensional requirements
     const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
     });

     if (!user) return NextResponse.json({ error: 'This reset link is invalid or has expired.' }, { status: 400 });

     // Permutate and re-salt
     user.password = await hashPassword(password);
     
     // Destroy physical trace logs seamlessly
     user.resetPasswordToken = undefined;
     user.resetPasswordExpires = undefined;
     await user.save();

     return NextResponse.json({ message: 'Password reset successfully.' });
  } catch {
     return NextResponse.json({ error: 'Could not reset the password right now. Please try again.' }, { status: 500 });
  }
}
