import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Timetable from '@/models/Timetable';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'mock-user-id'; // In production use JWT Auth
    
    await connectDB();
    const timetable = await Timetable.find({ userId }).sort({ day: 1, time: 1 });
    
    return NextResponse.json(timetable);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectDB();
    
    const newClass = await Timetable.create({ ...data, userId: data.userId || 'mock-user-id' });
    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await connectDB();
    await Timetable.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
