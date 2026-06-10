import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Note from '@/models/Note';
import { getSessionUserId } from '@/lib/server-auth';
import { ensureCloudinary } from '@/lib/cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

function sanitizeDownloadName(name: string) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').trim() || 'campus-note';
}

function getUrlFileName(fileUrl: string) {
  const cleanPath = fileUrl.split('?')[0]?.split('#')[0] || '';
  const candidate = cleanPath.split('/').pop();
  return candidate ? sanitizeDownloadName(candidate) : '';
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

function buildContentDisposition(fileName: string) {
  const asciiFallback = fileName.replace(/[^\x20-\x7E]/g, '_');
  const encoded = encodeURIComponent(fileName);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

function isCloudinaryUrl(fileUrl: string) {
  return /^https?:\/\/res\.cloudinary\.com\//i.test(fileUrl);
}

function buildCloudinaryDownloadUrls(fileUrl: string) {
  if (!isCloudinaryUrl(fileUrl)) return [fileUrl];

  const candidates = new Set<string>([fileUrl]);
  candidates.add(fileUrl.replace('/upload/', '/upload/fl_attachment/'));

  if (fileUrl.includes('/image/upload/')) {
    candidates.add(fileUrl.replace('/image/upload/', '/raw/upload/'));
    candidates.add(fileUrl.replace('/image/upload/', '/raw/upload/fl_attachment/'));
  }

  if (fileUrl.includes('/raw/upload/')) {
    candidates.add(fileUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/'));
  }

  return Array.from(candidates);
}

function getCloudinaryPublicId(fileUrl: string) {
  if (!isCloudinaryUrl(fileUrl)) return null;

  try {
    const url = new URL(fileUrl);
    const uploadIndex = url.pathname.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    const afterUpload = url.pathname.slice(uploadIndex + '/upload/'.length);
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    const withoutExtension = withoutVersion.replace(/\.[^/.]+$/, '');
    return decodeURIComponent(withoutExtension);
  } catch {
    return null;
  }
}

async function fetchSignedCloudinaryFile(fileUrl: string, format: string) {
  const publicId = getCloudinaryPublicId(fileUrl);
  if (!publicId) return null;

  try {
    ensureCloudinary();
    const signedUrl = cloudinary.utils.private_download_url(publicId, format, {
      resource_type: 'image',
      type: 'upload',
      attachment: true,
      expires_at: Math.floor(Date.now() / 1000) + 60,
    });

    const response = await fetch(signedUrl, {
      headers: {
        Accept: 'application/pdf,application/octet-stream,*/*',
        'User-Agent': 'Ulsan-Campus-Plus/1.0',
      },
    });

    return response.ok ? response : null;
  } catch (error) {
    console.error('Signed Cloudinary note download failed:', error);
    return null;
  }
}

async function fetchUpstreamFile(fileUrl: string) {
  let lastStatus = 0;

  for (const url of buildCloudinaryDownloadUrls(fileUrl)) {
    try {
      const upstream = await fetch(url, {
        headers: {
          Accept: 'application/pdf,application/octet-stream,*/*',
          'User-Agent': 'Ulsan-Campus-Plus/1.0',
        },
      });

      lastStatus = upstream.status;
      if (upstream.ok) {
        return upstream;
      }
    } catch {
      // try the next candidate
    }
  }

  if (fileUrl.toLowerCase().includes('.pdf')) {
    const signed = await fetchSignedCloudinaryFile(fileUrl, 'pdf');
    if (signed) return signed;
  }

  return { error: `Unable to fetch note file for download. Storage responded with status ${lastStatus || 'unknown'}.` };
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

    const storedFileName = typeof note.fileName === 'string' ? note.fileName : undefined;
    const urlFileName = getUrlFileName(note.fileUrl);
    const fileName = getFallbackFileName({
      fileName: storedFileName || urlFileName || undefined,
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
      if (!existsSync(absolutePath)) {
        return NextResponse.json(
          {
            error:
              'This note still points to an older local-only upload and is not available on the deployed app yet. Please re-upload it or migrate the note asset.',
          },
          { status: 410 }
        );
      }
      const fileBuffer = await readFile(absolutePath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': buildContentDisposition(fileName),
          'Cache-Control': 'private, max-age=0, must-revalidate',
        },
      });
    }

    const upstream = await fetchUpstreamFile(note.fileUrl);
    if ('error' in upstream) {
      return NextResponse.json({ error: upstream.error }, { status: 502 });
    }

    const arrayBuffer = await upstream.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': upstream.headers.get('content-type') || contentType,
        'Content-Disposition': buildContentDisposition(fileName),
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Note download error:', error);
    return NextResponse.json({ error: 'Failed to download note.' }, { status: 500 });
  }
}
