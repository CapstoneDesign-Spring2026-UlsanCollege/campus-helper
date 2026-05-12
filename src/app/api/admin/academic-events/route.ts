import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import AcademicEvent from '@/models/AcademicEvent';
import { getAdminUserId } from '@/lib/admin-auth';

export async function GET(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const semesterId = searchParams.get('semesterId');

  await connectDB();
  const query = semesterId ? { semesterId } : {};
  const events = await AcademicEvent.find(query).sort({ startDate: 1 });
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const body = await req.json();
  await connectDB();
  const event = await AcademicEvent.create(body);
  return NextResponse.json(event, { status: 201 });
}

export async function DELETE(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Event id is required' }, { status: 400 });
  await connectDB();
  await AcademicEvent.deleteOne({ _id: id });
  return NextResponse.json({ success: true });
}
