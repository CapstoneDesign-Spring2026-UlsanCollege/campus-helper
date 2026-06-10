import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import AcademicEvent from '@/models/AcademicEvent';
import { getAdminUserId } from '@/lib/admin-auth';

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export async function GET(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const semesterId = searchParams.get('semesterId');

    await connectDB();
    const query = semesterId ? { semesterId } : {};
    const events = await AcademicEvent.find(query).sort({ startDate: 1 });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Admin academic events GET failed:', error);
    return NextResponse.json({ error: 'We could not load academic events right now.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  try {
    const body = await req.json().catch(() => ({}));
    const semesterId = normalizeText(body.semesterId);
    const title = normalizeText(body.title);
    const startDate = body.startDate;

    if (!semesterId || !title || !startDate) {
      return NextResponse.json({ error: 'Semester, title, and start date are required.' }, { status: 400 });
    }

    await connectDB();
    const event = await AcademicEvent.create({ ...body, semesterId, title });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Admin academic events POST failed:', error);
    return NextResponse.json({ error: 'We could not save that academic event right now.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!getAdminUserId(req)) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Event ID is required.' }, { status: 400 });
    await connectDB();
    await AcademicEvent.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin academic events DELETE failed:', error);
    return NextResponse.json({ error: 'We could not delete that academic event right now.' }, { status: 500 });
  }
}
