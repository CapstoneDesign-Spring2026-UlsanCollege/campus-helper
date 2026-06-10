import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Note from '@/models/Note';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { getJwtAccessSecret } from '@/lib/env';
import { getOptionalSessionUserId } from '@/lib/server-auth';

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

function sortNotes<T extends { createdAt?: Date | string; title?: string; likeCount?: number }>(notes: T[], sort: string) {
  switch (sort) {
    case 'popular':
      return [...notes].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0) || +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0));
    case 'oldest':
      return [...notes].sort((a, b) => +new Date(a.createdAt || 0) - +new Date(b.createdAt || 0));
    case 'title':
      return [...notes].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    default:
      return [...notes].sort((a, b) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0));
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department')?.trim();
    const queryText = searchParams.get('q')?.trim();
    const sort = searchParams.get('sort')?.trim() || 'newest';
    const onlySaved = searchParams.get('saved') === 'true';

    await connectDB();

    const currentUserId = await getOptionalSessionUserId(req);
    let savedNoteIds: string[] = [];

    if (currentUserId) {
      const currentUser = await User.findById(currentUserId).select('savedNotes').lean();
      savedNoteIds = Array.isArray(currentUser?.savedNotes)
        ? currentUser.savedNotes.map((noteId: unknown) => String(noteId))
        : [];
    }

    const query: Record<string, unknown> = {};
    if (department) query.department = department;
    if (queryText) {
      query.$or = [
        { title: { $regex: queryText, $options: 'i' } },
        { fileName: { $regex: queryText, $options: 'i' } },
      ];
    }
    if (onlySaved) {
      if (!currentUserId) {
        return NextResponse.json([]);
      }
      query._id = { $in: savedNoteIds };
    }

    const notes = await Note.find(query)
      .populate('uploadedBy', 'name department profilePicture createdAt')
      .lean();

    const normalizedNotes = notes.map((note) => {
      const likes = Array.isArray(note.likes) ? note.likes.map((likeId: unknown) => String(likeId)) : [];
      const uploadedBy = note.uploadedBy && typeof note.uploadedBy === 'object'
        ? {
            ...note.uploadedBy,
            _id: String((note.uploadedBy as { _id?: unknown })._id ?? ''),
          }
        : undefined;

      return {
        ...note,
        _id: String(note._id),
        likes,
        likeCount: likes.length,
        isSaved: savedNoteIds.includes(String(note._id)),
        uploadedBy,
      };
    });
    
    return NextResponse.json(sortNotes(normalizedNotes, sort));
  } catch (error) {
    console.error('Note list error:', error);
    return NextResponse.json({ error: 'Could not load notes right now.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });
    }

    const body = await req.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const department = typeof body.department === 'string' ? body.department.trim() : '';
    const fileUrl = typeof body.fileUrl === 'string' ? body.fileUrl.trim() : '';
    const fileName = typeof body.fileName === 'string' ? body.fileName.trim() : '';
    const fileType = typeof body.fileType === 'string' ? body.fileType.trim() : '';
    const thumbnailUrl = typeof body.thumbnailUrl === 'string' ? body.thumbnailUrl.trim() : '';

    if (!title) {
      return NextResponse.json({ error: 'Please enter a note title.' }, { status: 400 });
    }

    if (!department) {
      return NextResponse.json({ error: 'Please choose a department for this note.' }, { status: 400 });
    }

    if (!fileUrl) {
      return NextResponse.json({ error: 'The file uploaded, but the note is missing its file URL.' }, { status: 400 });
    }

    await connectDB();
    const newNote = await Note.create({
      title,
      department,
      fileUrl,
      fileName: fileName || undefined,
      fileType: fileType || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      uploadedBy: userId,
    });

    const populatedNote = await Note.findById(newNote._id)
      .populate('uploadedBy', 'name department profilePicture')
      .lean();

    return NextResponse.json(
      {
        ...populatedNote,
        _id: String(populatedNote?._id),
        likes: [],
        likeCount: 0,
        isSaved: false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Note create error:', error);
    return NextResponse.json({ error: 'The file uploaded, but saving the note failed. Please try again.' }, { status: 500 });
  }
}
