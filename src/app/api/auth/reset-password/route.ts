import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
     const { token, password } = await req.json();
     
     // Reverse correlate the token against the mathematical SHA256 constraint algorithm
     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

     await connectDB();
     
     // Evaluate dual dimensional requirements
     const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
     });

     if (!user) return NextResponse.json({ error: 'Gateway Token degraded or corrupted' }, { status: 400 });

     // Permutate and re-salt
     user.password = await hashPassword(password);
     
     // Destroy physical trace logs seamlessly
     user.resetPasswordToken = undefined;
     user.resetPasswordExpires = undefined;
     await user.save();

     return NextResponse.json({ message: 'Decryption re-secured successfully!' });
  } catch(e) {
     return NextResponse.json({ error: 'System processing collision occurs' }, { status: 500 });
  }
}
