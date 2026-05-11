import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Note from '@/models/Note';
import { getSessionUserId } from '@/lib/server-auth';
import path from 'path';
import { readFile } from 'fs/promises';

function sanitizeDownloadName(name: string) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').trim() || 'campus-note';
}

function getFallbackFileName(note: { fileName?: string; title: string; fileType?: string }) {
  if (note.fileName?.trim()) return sanitizeDownloadName(note.fileName);

  const extensionMap: Record<string, string> = {
    'application/pdf': '.pdf',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/vnd.ms-powerpoint': '.ppt',
  };

  const extension = note.fileType ? extensionMap[note.fileType] || '' : '';
  return `${sanitizeDownloadName(note.title)}${extension}`;
}

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

    const fileName = getFallbackFileName({
      fileName: typeof note.fileName === 'string' ? note.fileName : undefined,
      title: typeof note.title === 'string' ? note.title : 'campus-note',
      fileType: typeof note.fileType === 'string' ? note.fileType : undefined,
    });
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
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
          'Cache-Control': 'private, max-age=0, must-revalidate',
        },
      });
    }

    const upstream = await fetch(note.fileUrl);
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Unable to fetch note file for download.' }, { status: 502 });
    }

    const arrayBuffer = await upstream.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': upstream.headers.get('content-type') || contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Note download error:', error);
    return NextResponse.json({ error: 'Failed to download note.' }, { status: 500 });
  }
}
