import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Message from '@/models/Message';
import jwt from 'jsonwebtoken';

function getUserId(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if(!token) return null;
  try { return (jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId: string }).userId; } catch(e) { return null; }
}

export async function GET(req: Request) {
  const userId = getUserId(req);
  if(!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
     await connectDB();
     
     // Aggregate absolute sum of physical messages explicitly sent to this user that have not been loaded via GET /api/chat
     const count = await Message.countDocuments({
         receiver: userId,
         read: false
     });

     return NextResponse.json({ count });
  } catch(e) {
     return NextResponse.json({ error: 'Failed to compute array', count: 0 }, { status: 500 });
  }
}
