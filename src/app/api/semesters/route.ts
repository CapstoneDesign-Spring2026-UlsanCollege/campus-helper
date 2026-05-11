import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Semester from '@/models/Semester';
import AcademicEvent from '@/models/AcademicEvent';
import { ensureDefaultSemesters } from '@/lib/semester-defaults';

export async function GET(req: Request) {
  await connectDB();
  await ensureDefaultSemesters();

  const { searchParams } = new URL(req.url);
  const includeEvents = searchParams.get('includeEvents') === 'true';

  const semesters = await Semester.find().sort({ year: -1, createdAt: -1 }).lean();

  if (!includeEvents) {
    return NextResponse.json(semesters);
  }

  const semesterIds = semesters.map((semester) => semester._id);
  const events = await AcademicEvent.find({ semesterId: { $in: semesterIds } }).sort({ startDate: 1 }).lean();
  const eventsBySemester = new Map<string, typeof events>();
  for (const event of events) {
    const key = String(event.semesterId);
    const list = eventsBySemester.get(key) || [];
    list.push(event);
    eventsBySemester.set(key, list);
  }

  return NextResponse.json(
    semesters.map((semester) => ({
      ...semester,
      events: eventsBySemester.get(String(semester._id)) || [],
    }))
  );
}
