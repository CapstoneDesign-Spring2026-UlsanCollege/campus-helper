import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import BusSchedule from '@/models/BusSchedule';
import { getAdminUserId } from '@/lib/admin-auth';

export async function GET(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const semesterId = searchParams.get('semesterId');
  await connectDB();
  const schedules = await BusSchedule.find(semesterId ? { semesterId } : {}).sort({ campus: 1, routeName: 1, weekday: 1, departureTime: 1 });
  return NextResponse.json(schedules);
}

export async function POST(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const body = await req.json();
  await connectDB();
  const schedule = await BusSchedule.create(body);
  return NextResponse.json(schedule, { status: 201 });
}

export async function PUT(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const body = await req.json();
  const { _id, ...updates } = body;
  if (!_id) return NextResponse.json({ error: 'Bus schedule id is required' }, { status: 400 });
  await connectDB();
  const schedule = await BusSchedule.findByIdAndUpdate(_id, updates, { new: true });
  return NextResponse.json(schedule);
}

export async function DELETE(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Bus schedule id is required' }, { status: 400 });
  await connectDB();
  await BusSchedule.deleteOne({ _id: id });
  return NextResponse.json({ success: true });
}
