import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Semester from '@/models/Semester';
import AcademicEvent from '@/models/AcademicEvent';
import { getAdminUserId } from '@/lib/admin-auth';

export async function GET(req: Request) {
  if (!getAdminUserId(req)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  await connectDB();
  const semesters = await Semester.find().sort({ year: -1, createdAt: -1 });
  return NextResponse.json(semesters);
}

export async function POST(req: Request) {
  if (!getAdminUserId(req)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await req.json();
  await connectDB();
  const semester = await Semester.create(body);
  return NextResponse.json(semester, { status: 201 });
}

export async function PUT(req: Request) {
  if (!getAdminUserId(req)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await req.json();
  const { _id, ...updates } = body;
  if (!_id) return NextResponse.json({ error: 'Semester id is required' }, { status: 400 });

  await connectDB();
  const semester = await Semester.findByIdAndUpdate(_id, updates, { new: true });
  return NextResponse.json(semester);
}

export async function DELETE(req: Request) {
  if (!getAdminUserId(req)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Semester id is required' }, { status: 400 });

  await connectDB();
  await AcademicEvent.deleteMany({ semesterId: id });
  await Semester.deleteOne({ _id: id });
  return NextResponse.json({ success: true });
}
