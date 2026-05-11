import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import BusSchedule from '@/models/BusSchedule';

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const semesterId = searchParams.get('semesterId');
  const campus = searchParams.get('campus');
  const routeName = searchParams.get('route');
  const weekday = searchParams.get('weekday');

  const query: Record<string, unknown> = { active: true };
  if (semesterId) query.semesterId = semesterId;
  if (campus) query.campus = campus;
  if (routeName) query.routeName = routeName;
  if (weekday) query.weekday = weekday;

  const schedules = await BusSchedule.find(query)
    .populate('semesterId', 'name year term status')
    .sort({ campus: 1, routeName: 1, weekday: 1, departureTime: 1 });

  return NextResponse.json(schedules);
}
