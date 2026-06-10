import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import Semester from '@/models/Semester';
import { hashPassword } from '@/lib/auth';
import { validateStrongPassword } from '@/lib/password-policy';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(10),
  department: z.string().min(2),
  studentId: z.string().min(5),
  gender: z.enum(['male', 'female']),
  currentSemesterId: z.string().min(1),
  admissionYear: z.number().int().min(2000).max(2100).optional(),
  profilePicture: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
    }
    const data = parsed.data;

    const passwordCheck = validateStrongPassword(data.password, {
      email: data.email,
      name: data.name,
    });
    if (!passwordCheck.isValid) {
      return NextResponse.json({ error: passwordCheck.issues[0] }, { status: 400 });
    }

    await connectDB();

    const semester = await Semester.findById(data.currentSemesterId);
    if (!semester) {
      return NextResponse.json({ error: 'Please choose a valid semester.' }, { status: 400 });
    }

    const existingUser = await User.findOne({ $or: [{ email: data.email }, { studentId: data.studentId }] });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email or student ID already exists.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(data.password);

    const newUser = await User.create({
      ...data,
      password: hashedPassword,
    });

    return NextResponse.json({ message: 'Account created successfully.', userId: newUser._id }, { status: 201 });
  } catch (error: unknown) {
    console.error('Signup route error:', error);
    return NextResponse.json({ error: 'Could not create your account right now. Please try again.' }, { status: 500 });
  }
}
