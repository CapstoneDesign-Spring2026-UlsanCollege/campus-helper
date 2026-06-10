import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Note from '@/models/Note';
import User from '@/models/User';
import mongoose from 'mongoose';
import { getSessionUserId } from '@/lib/server-auth';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing note ID.' }, { status: 400 });
    }

    await connectDB();
    const [note, user] = await Promise.all([
      Note.findById(id).select('_id').lean(),
      User.findById(userId).select('savedNotes'),
    ]);

    if (!note) {
      return NextResponse.json({ error: 'Note not found.' }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const currentSavedNotes = Array.isArray(user.savedNotes) ? user.savedNotes : [];
    const alreadySaved = currentSavedNotes.some((noteId: mongoose.Types.ObjectId) => noteId.toString() === id);

    if (alreadySaved) {
      user.savedNotes = currentSavedNotes.filter((noteId: mongoose.Types.ObjectId) => noteId.toString() !== id);
    } else {
      user.savedNotes.push(note._id as mongoose.Types.ObjectId);
    }

    await user.save();

    return NextResponse.json({
      saved: !alreadySaved,
      savedNotes: user.savedNotes.map((noteId: mongoose.Types.ObjectId) => noteId.toString()),
    });
  } catch (error) {
    console.error('Note save toggle error:', error);
    return NextResponse.json({ error: 'Failed to update saved note.' }, { status: 500 });
  }
}
