import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  department: z.string().min(2),
  studentId: z.string().min(5),
  gender: z.enum(['male', 'female']),
  profilePicture: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = signupSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({ $or: [{ email: data.email }, { studentId: data.studentId }] });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email or Student ID already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(data.password);

    const newUser = await User.create({
      ...data,
      password: hashedPassword,
    });

    return NextResponse.json({ message: 'User created successfully', userId: newUser._id }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error: ' + (error.message || String(error)) }, { status: 500 });
  }
}
