import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Semester from '@/models/Semester';
import AcademicEvent from '@/models/AcademicEvent';
import { getAdminUserId } from '@/lib/admin-auth';

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export async function GET(req: Request) {
  if (!getAdminUserId(req)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  try {
    await connectDB();
    const semesters = await Semester.find().sort({ year: -1, createdAt: -1 });
    return NextResponse.json(semesters);
  } catch (error) {
    console.error('Admin semesters GET failed:', error);
    return NextResponse.json({ error: 'We could not load semester records right now.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!getAdminUserId(req)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const name = normalizeText(body.name);
    const year = Number(body.year);
    const term = body.term;
    const status = body.status;

    if (!name || Number.isNaN(year)) {
      return NextResponse.json({ error: 'Semester name and year are required.' }, { status: 400 });
    }

    await connectDB();
    const semester = await Semester.create({ ...body, name, year, term, status });
    return NextResponse.json(semester, { status: 201 });
  } catch (error) {
    console.error('Admin semesters POST failed:', error);
    return NextResponse.json({ error: 'We could not save that semester right now.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!getAdminUserId(req)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { _id, ...updates } = body;
    if (!_id) return NextResponse.json({ error: 'Semester ID is required.' }, { status: 400 });

    if (typeof updates.name === 'string') updates.name = normalizeText(updates.name);
    if (updates.year !== undefined) updates.year = Number(updates.year);

    await connectDB();
    const semester = await Semester.findByIdAndUpdate(_id, updates, { new: true });
    return NextResponse.json(semester);
  } catch (error) {
    console.error('Admin semesters PUT failed:', error);
    return NextResponse.json({ error: 'We could not update that semester right now.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!getAdminUserId(req)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Semester ID is required.' }, { status: 400 });

    await connectDB();
    await AcademicEvent.deleteMany({ semesterId: id });
    await Semester.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin semesters DELETE failed:', error);
    return NextResponse.json({ error: 'We could not delete that semester right now.' }, { status: 500 });
  }
}
