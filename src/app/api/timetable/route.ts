import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Timetable from '@/models/Timetable';
import Semester from '@/models/Semester';
import SemesterTimetableTemplate from '@/models/SemesterTimetableTemplate';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { getJwtAccessSecret } from '@/lib/env';

function getUserId(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    return (jwt.verify(token, getJwtAccessSecret()) as { userId?: string }).userId || null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    await connectDB();
    const user = await User.findById(userId).select('department currentSemesterId');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const semesterId = searchParams.get('semesterId') || (user.currentSemesterId ? String(user.currentSemesterId) : '');
    if (!semesterId) {
      return NextResponse.json({ semester: null, templates: [], custom: [] });
    }

    const [semester, templates, custom] = await Promise.all([
      Semester.findById(semesterId),
      SemesterTimetableTemplate.find({ semesterId, department: user.department }).sort({ day: 1, time: 1 }),
      Timetable.find({ userId, semesterId }).sort({ day: 1, time: 1 }),
    ]);

    return NextResponse.json({ semester, templates, custom, department: user.department });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    if (!data.semesterId) {
      return NextResponse.json({ error: 'Semester is required' }, { status: 400 });
    }
    await connectDB();

    const newClass = await Timetable.create({ ...data, userId });
    return NextResponse.json(newClass, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await connectDB();
    const existing = await Timetable.findById(id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (existing.userId.toString() !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await Timetable.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
