import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import SemesterTimetableTemplate from '@/models/SemesterTimetableTemplate';
import { getAdminUserId } from '@/lib/admin-auth';

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export async function GET(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  try {
    const { searchParams } = new URL(req.url);
    const semesterId = searchParams.get('semesterId');
    const department = searchParams.get('department');
    const query: Record<string, string> = {};
    if (semesterId) query.semesterId = semesterId;
    if (department) query.department = department;
    await connectDB();
    const templates = await SemesterTimetableTemplate.find(query).sort({ department: 1, day: 1, time: 1 });
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Admin timetable templates GET failed:', error);
    return NextResponse.json({ error: 'We could not load timetable templates right now.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  try {
    const body = await req.json().catch(() => ({}));
    await connectDB();
    if (Array.isArray(body)) {
      const docs = await SemesterTimetableTemplate.insertMany(body);
      return NextResponse.json(docs, { status: 201 });
    }

    const semesterId = normalizeText(body.semesterId);
    const department = normalizeText(body.department);
    const day = normalizeText(body.day);
    const time = normalizeText(body.time);
    const subject = normalizeText(body.subject);
    const room = normalizeText(body.room);

    if (!semesterId || !department || !day || !time || !subject) {
      return NextResponse.json({ error: 'Semester, department, day, time, and subject are required.' }, { status: 400 });
    }

    const template = await SemesterTimetableTemplate.create({ semesterId, department, day, time, subject, room });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Admin timetable templates POST failed:', error);
    return NextResponse.json({ error: 'We could not save that timetable row right now.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const semesterId = searchParams.get('semesterId');
    await connectDB();
    if (id) {
      await SemesterTimetableTemplate.deleteOne({ _id: id });
      return NextResponse.json({ success: true });
    }
    if (semesterId) {
      await SemesterTimetableTemplate.deleteMany({ semesterId });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Template ID or semester ID is required.' }, { status: 400 });
  } catch (error) {
    console.error('Admin timetable templates DELETE failed:', error);
    return NextResponse.json({ error: 'We could not delete that timetable row right now.' }, { status: 500 });
  }
}
