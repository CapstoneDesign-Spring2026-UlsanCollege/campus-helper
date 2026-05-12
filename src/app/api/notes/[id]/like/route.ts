import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Note from '@/models/Note';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { getJwtAccessSecret } from '@/lib/env';

function getUserIdFromRequest(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;

  try {
    const payload = jwt.verify(token, getJwtAccessSecret()) as { userId?: string; id?: string };
    return payload.userId || payload.id || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing note ID.' }, { status: 400 });
    }

    await connectDB();
    const note = await Note.findById(id);
    if (!note) {
      return NextResponse.json({ error: 'Note not found.' }, { status: 404 });
    }

    const alreadyLiked = note.likes.some((likeUserId: mongoose.Types.ObjectId) => likeUserId.toString() === userId);

    if (alreadyLiked) {
      note.likes = note.likes.filter((likeUserId: mongoose.Types.ObjectId) => likeUserId.toString() !== userId);
    } else {
      note.likes.push(userId as never);
    }

    await note.save();

    return NextResponse.json({
      liked: !alreadyLiked,
      likes: note.likes.map((likeUserId: mongoose.Types.ObjectId) => likeUserId.toString()),
      likeCount: note.likes.length,
    });
  } catch (error) {
    console.error('Note like toggle error:', error);
    return NextResponse.json({ error: 'Failed to update note like.' }, { status: 500 });
  }
}
