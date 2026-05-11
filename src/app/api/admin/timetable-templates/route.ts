import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import SemesterTimetableTemplate from '@/models/SemesterTimetableTemplate';
import { getAdminUserId } from '@/lib/admin-auth';

export async function GET(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const semesterId = searchParams.get('semesterId');
  const department = searchParams.get('department');
  const query: Record<string, string> = {};
  if (semesterId) query.semesterId = semesterId;
  if (department) query.department = department;
  await connectDB();
  const templates = await SemesterTimetableTemplate.find(query).sort({ department: 1, day: 1, time: 1 });
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const body = await req.json();
  await connectDB();
  if (Array.isArray(body)) {
    const docs = await SemesterTimetableTemplate.insertMany(body);
    return NextResponse.json(docs, { status: 201 });
  }
  const template = await SemesterTimetableTemplate.create(body);
  return NextResponse.json(template, { status: 201 });
}

export async function DELETE(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
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
  return NextResponse.json({ error: 'Template id or semesterId is required' }, { status: 400 });
}
