import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Timetable from '@/models/Timetable';
import Semester from '@/models/Semester';
import SemesterTimetableTemplate from '@/models/SemesterTimetableTemplate';
import User from '@/models/User';
import { getSessionUserId } from '@/lib/server-auth';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function isValidDay(value: string): value is (typeof DAYS)[number] {
  return DAYS.includes(value as (typeof DAYS)[number]);
}

export async function GET(req: Request) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    await connectDB();
    const user = await User.findById(userId).select('department currentSemesterId');
    if (!user) return NextResponse.json({ error: 'We could not find your account.' }, { status: 404 });

    const semesterId = searchParams.get('semesterId') || (user.currentSemesterId ? String(user.currentSemesterId) : '');
    if (!semesterId) {
      return NextResponse.json({ semester: null, templates: [], custom: [], department: user.department || '' });
    }

    const [semester, templates, custom] = await Promise.all([
      Semester.findById(semesterId),
      SemesterTimetableTemplate.find({ semesterId, department: user.department }).sort({ day: 1, time: 1 }),
      Timetable.find({ userId, semesterId }).sort({ day: 1, time: 1 }),
    ]);

    return NextResponse.json({ semester, templates, custom, department: user.department });
  } catch (error) {
    console.error('Timetable GET failed:', error);
    return NextResponse.json({ error: 'We could not load your timetable right now.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

    const data = await req.json();
    const semesterId = normalizeText(data.semesterId);
    const day = normalizeText(data.day);
    const subject = normalizeText(data.subject);
    const time = normalizeText(data.time);
    const room = normalizeText(data.room);

    if (!semesterId) {
      return NextResponse.json({ error: 'Semester is required' }, { status: 400 });
    }
    if (!isValidDay(day)) {
      return NextResponse.json({ error: 'Please choose a valid day for the class.' }, { status: 400 });
    }
    if (subject.length < 2) {
      return NextResponse.json({ error: 'Please enter a class name with at least 2 characters.' }, { status: 400 });
    }
    if (time.length < 3) {
      return NextResponse.json({ error: 'Please enter a valid class time.' }, { status: 400 });
    }

    await connectDB();

    const semester = await Semester.findById(semesterId).select('_id');
    if (!semester) {
      return NextResponse.json({ error: 'The selected semester no longer exists.' }, { status: 404 });
    }

    const existingCustom = await Timetable.findOne({
      userId,
      semesterId,
      day,
      time,
      subject,
      room,
    }).select('_id');

    if (existingCustom) {
      return NextResponse.json({ error: 'This class is already in your timetable.' }, { status: 409 });
    }

    const newClass = await Timetable.create({
      userId,
      semesterId,
      day,
      subject,
      time,
      room,
    });
    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Timetable POST failed:', error);
    return NextResponse.json({ error: 'We could not save that class yet. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Class ID is required.' }, { status: 400 });

    await connectDB();
    const existing = await Timetable.findById(id);
    if (!existing) return NextResponse.json({ error: 'That class was already removed.' }, { status: 404 });
    if (existing.userId.toString() !== userId) return NextResponse.json({ error: 'You cannot remove another user’s class.' }, { status: 403 });

    await Timetable.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Class removed.' });
  } catch (error) {
    console.error('Timetable DELETE failed:', error);
    return NextResponse.json({ error: 'We could not remove that class right now.' }, { status: 500 });
  }
}
