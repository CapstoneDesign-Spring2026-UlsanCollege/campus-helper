import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Message from '@/models/Message';
import { getSessionUserId } from '@/lib/server-auth';

export async function GET(req: Request) {
  const userId = await getSessionUserId(req);
  if(!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

  try {
     await connectDB();
     
     const count = await Message.countDocuments({
         receiver: userId,
         read: false
     });

     return NextResponse.json({ count });
  } catch (error) {
     console.error('Unread chat count failed:', error);
     return NextResponse.json({ error: 'Could not load unread message count.', count: 0 }, { status: 500 });
  }
}
