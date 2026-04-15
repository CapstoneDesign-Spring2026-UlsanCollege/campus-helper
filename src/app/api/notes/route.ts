import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Note from '@/models/Note';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    
    await connectDB();
    const query = department ? { department } : {};
    const notes = await Note.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const department = formData.get('department') as string;
    const userId = formData.get('userId') as string || '650e8b1b2f8a4b001c8e4b5a'; // Fallback mock exact ObjectId

    if (!file || !title || !department) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload Buffer directly to Cloudinary
    const fileUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'ulsan_campus_notes' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        }
      );
      uploadStream.end(buffer);
    });

    await connectDB();
    const newNote = await Note.create({
      title,
      department,
      fileUrl,
      uploadedBy: userId,
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
