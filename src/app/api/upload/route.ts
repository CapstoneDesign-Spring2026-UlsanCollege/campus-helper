import { NextResponse } from 'next/server';
import { uploadFileToCloudinary } from '@/lib/cloudinary';
import { getSessionUserId } from '@/lib/server-auth';

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folderValue = formData.get('folder');
    const folder = typeof folderValue === 'string' ? folderValue : undefined;
    if (!file) return NextResponse.json({ error: 'No file detected' }, { status: 400 });

    const asset = await uploadFileToCloudinary(file, folder);
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[upload] ${asset.storage} upload complete for ${asset.fileName}`);
    }
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Upload route error:", error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    const status = message.includes('session expired')
      ? 401
      : message.includes('not configured')
        ? 503
        : message.includes('not supported') || message.includes('too large') || message.includes('empty')
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
