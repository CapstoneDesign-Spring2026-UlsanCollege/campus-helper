import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Announcement from '@/models/Announcement';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();
    const token = req.headers.get('authorization')?.split(' ')[1];

    await connectDB();

    let authorId = '650e8b1b2f8a4b001c8e4b5a'; // Fallback Admin Mock ID
    if (token) {
        try {
            const decoded = jwt.decode(token) as any;
            if (decoded?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            authorId = decoded.userId;
        } catch(e) {}
    }

    const doc = await Announcement.create({ title, content, authorId });
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const posts = await Announcement.find().sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
