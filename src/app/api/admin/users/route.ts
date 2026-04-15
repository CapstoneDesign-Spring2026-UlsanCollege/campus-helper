import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import Note from '@/models/Note';

export async function GET(req: Request) {
  try {
    await connectDB();
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await connectDB();
    await User.findByIdAndDelete(userId);
    // Optionally wipe out the notes to maintain platform hygiene
    await Note.deleteMany({ uploadedBy: userId });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
