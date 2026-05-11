import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Note from '@/models/Note';
import { getSessionUserId } from '@/lib/server-auth';
import path from 'path';
import { readFile } from 'fs/promises';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
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
    const note = await Note.findById(id).lean();
    if (!note) {
      return NextResponse.json({ error: 'Note not found.' }, { status: 404 });
    }

    const contentType = typeof note.fileType === 'string' && note.fileType.trim()
      ? note.fileType
      : 'application/octet-stream';

    if (typeof note.fileUrl !== 'string' || !note.fileUrl.trim()) {
      return NextResponse.json({ error: 'This note does not have a valid file URL.' }, { status: 400 });
    }

    if (note.fileUrl.startsWith('/')) {
      const relativePath = note.fileUrl.replace(/^\/+/, '');
      const absolutePath = path.join(process.cwd(), 'public', relativePath);
      const fileBuffer = await readFile(absolutePath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': 'inline',
          'Cache-Control': 'private, max-age=0, must-revalidate',
        },
      });
    }

    const upstream = await fetch(note.fileUrl);
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Unable to fetch note file for preview.' }, { status: 502 });
    }

    const arrayBuffer = await upstream.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': upstream.headers.get('content-type') || contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Note preview error:', error);
    return NextResponse.json({ error: 'Failed to preview note.' }, { status: 500 });
  }
}
