import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import AcademicEvent from '@/models/AcademicEvent';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const semesterId = searchParams.get('semesterId');

    await connectDB();
    const query = semesterId ? { semesterId } : {};
    const events = await AcademicEvent.find(query).sort({ startDate: 1 });

    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: 'Could not load academic events' }, { status: 500 });
  }
}
