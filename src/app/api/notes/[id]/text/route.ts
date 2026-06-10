import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { inflateRawSync, inflateSync } from 'zlib';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/lib/mongoose';
import Note from '@/models/Note';
import { ensureCloudinary } from '@/lib/cloudinary';
import { getConfiguredAIModel } from '@/lib/ai-provider';
import { getSessionUserId } from '@/lib/server-auth';

function isCloudinaryUrl(fileUrl: string) {
  return /^https?:\/\/res\.cloudinary\.com\//i.test(fileUrl);
}

function getCloudinaryPublicId(fileUrl: string) {
  if (!isCloudinaryUrl(fileUrl)) return null;

  try {
    const url = new URL(fileUrl);
    const uploadIndex = url.pathname.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    const afterUpload = url.pathname.slice(uploadIndex + '/upload/'.length);
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    return decodeURIComponent(withoutVersion.replace(/\.[^/.]+$/, ''));
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
        Accept: 'application/pdf,text/plain,application/octet-stream,*/*',
        'User-Agent': 'Ulsan-Campus-Plus/1.0',
      },
    });

    return response.ok ? Buffer.from(await response.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

async function readNoteFile(fileUrl: string) {
  if (fileUrl.startsWith('/')) {
    const relativePath = fileUrl.replace(/^\/+/, '');
    const absolutePath = path.join(process.cwd(), 'public', relativePath);
    if (!existsSync(absolutePath)) return null;
    return readFile(absolutePath);
  }

  const response = await fetch(fileUrl, {
    headers: {
      Accept: 'application/pdf,text/plain,application/octet-stream,*/*',
      'User-Agent': 'Ulsan-Campus-Plus/1.0',
    },
  }).catch(() => null);

  if (response?.ok) {
    return Buffer.from(await response.arrayBuffer());
  }

  if (fileUrl.toLowerCase().includes('.pdf')) {
    return fetchSignedCloudinaryFile(fileUrl, 'pdf');
  }

  return null;
}

function decodePdfString(value: string) {
  return value
    .replace(/\\([nrtbf()\\])/g, (_, char: string) => {
      const map: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' };
      return map[char] || char;
    })
    .replace(/\\([0-7]{1,3})/g, (_, octal: string) => String.fromCharCode(parseInt(octal, 8)));
}

function decodeHexPdfString(value: string) {
  const clean = value.replace(/\s+/g, '');
  if (!clean || clean.length % 2 !== 0) return '';
  const bytes = Buffer.from(clean, 'hex');

  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    let text = '';
    for (let index = 2; index + 1 < bytes.length; index += 2) {
      text += String.fromCharCode(bytes.readUInt16BE(index));
    }
    return text;
  }

  return bytes.toString('utf8').replace(/\u0000/g, '');
}

function extractTextFromPdfStream(streamText: string) {
  const chunks: string[] = [];

  for (const match of streamText.matchAll(/\((?:\\.|[^\\)])*\)\s*Tj/g)) {
    chunks.push(decodePdfString(match[0].replace(/\s*Tj$/, '').slice(1, -1)));
  }

  for (const match of streamText.matchAll(/<([0-9a-fA-F\s]+)>\s*Tj/g)) {
    chunks.push(decodeHexPdfString(match[1]));
  }

  for (const match of streamText.matchAll(/\[((?:.|\n|\r)*?)\]\s*TJ/g)) {
    const arrayBody = match[1];
    for (const literal of arrayBody.matchAll(/\((?:\\.|[^\\)])*\)/g)) {
      chunks.push(decodePdfString(literal[0].slice(1, -1)));
    }
    for (const hex of arrayBody.matchAll(/<([0-9a-fA-F\s]+)>/g)) {
      chunks.push(decodeHexPdfString(hex[1]));
    }
  }

  return chunks.join(' ');
}

function extractPdfText(buffer: Buffer) {
  const binary = buffer.toString('latin1');
  const streams: string[] = [];

  for (const match of binary.matchAll(/<<(?:.|\n|\r)*?>>\s*stream\r?\n?([\s\S]*?)\r?\n?endstream/g)) {
    const dictionary = match[0].slice(0, Math.max(0, match[0].indexOf('stream')));
    const streamBuffer = Buffer.from(match[1], 'latin1');

    if (dictionary.includes('/FlateDecode')) {
      try {
        streams.push(inflateSync(streamBuffer).toString('latin1'));
        continue;
      } catch {
        try {
          streams.push(inflateRawSync(streamBuffer).toString('latin1'));
          continue;
        } catch {
          // ignore this stream
        }
      }
    }

    streams.push(streamBuffer.toString('latin1'));
  }

  const text = streams.map(extractTextFromPdfStream).join('\n');
  return text
    .replace(/\s+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isTextLike(fileType?: string, fileName?: string) {
  const lowerType = (fileType || '').toLowerCase();
  const lowerName = (fileName || '').toLowerCase();
  return lowerType.startsWith('text/') || lowerName.endsWith('.txt') || lowerName.endsWith('.md');
}

function isPdf(fileType?: string, fileName?: string) {
  const lowerType = (fileType || '').toLowerCase();
  const lowerName = (fileName || '').toLowerCase();
  return lowerType.includes('pdf') || lowerName.endsWith('.pdf');
}

function isImage(fileType?: string, fileName?: string) {
  const lowerType = (fileType || '').toLowerCase();
  const lowerName = (fileName || '').toLowerCase();
  return lowerType.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(lowerName);
}

async function extractImageText(buffer: Buffer, mediaType?: string) {
  const model = getConfiguredAIModel();
  if (!model) {
    return '';
  }

  try {
    const result = await generateText({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract only the readable text from this note image. Preserve line breaks when useful. Do not describe the image. If no readable text exists, return an empty string.',
            },
            {
              type: 'image',
              image: buffer,
              mediaType: mediaType || 'image/jpeg',
            },
          ],
        },
      ],
    });

    return result.text.trim();
  } catch {
    return '';
  }
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });
    }

    const { id } = await context.params;
    await connectDB();
    const note = await Note.findById(id).lean();

    if (!note) {
      return NextResponse.json({ error: 'Note not found.' }, { status: 404 });
    }

    if (typeof note.fileUrl !== 'string' || !note.fileUrl.trim()) {
      return NextResponse.json({ error: 'This note does not have a valid file URL.' }, { status: 400 });
    }

    const buffer = await readNoteFile(note.fileUrl);
    if (!buffer) {
      return NextResponse.json({ error: 'Could not open the uploaded note file.' }, { status: 502 });
    }

    let text = '';
    if (isTextLike(note.fileType, note.fileName)) {
      text = buffer.toString('utf8').trim();
    } else if (isPdf(note.fileType, note.fileName)) {
      text = extractPdfText(buffer);
    } else if (isImage(note.fileType, note.fileName)) {
      text = await extractImageText(buffer, typeof note.fileType === 'string' ? note.fileType : undefined);
    } else {
      return NextResponse.json(
        { error: 'This note type does not contain copyable text yet.' },
        { status: 415 }
      );
    }

    if (!text) {
      return NextResponse.json(
        {
          code: 'nothing_to_copy',
          error: 'No selectable text was found inside this note. It may be a scanned PDF or image-only file.',
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Note text extraction error:', error);
    return NextResponse.json({ error: 'Failed to extract note text.' }, { status: 500 });
  }
}
