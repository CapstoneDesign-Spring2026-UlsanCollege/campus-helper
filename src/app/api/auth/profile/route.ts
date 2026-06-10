import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { getSessionUserId } from '@/lib/server-auth';

export async function PUT(req: Request) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

    const { profilePicture, currentSemesterId, admissionYear } = await req.json();
    const updateFields: Record<string, unknown> = {};

    if (typeof profilePicture === 'string') {
      updateFields.profilePicture = profilePicture.trim();
    }

    if (typeof currentSemesterId === 'string' && currentSemesterId.trim()) {
      updateFields.currentSemesterId = currentSemesterId.trim();
    }

    if (typeof admissionYear === 'number') {
      updateFields.admissionYear = admissionYear;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No profile fields were provided.' }, { status: 400 });
    }

    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(
       userId,
       { $set: updateFields },
       { new: true }
    ).select('-password');

    if (!updatedUser) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    return NextResponse.json({
      message: 'Profile updated',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        role: updatedUser.role,
        gender: updatedUser.gender,
        profilePicture: updatedUser.profilePicture,
        department: updatedUser.department,
        currentSemesterId: updatedUser.currentSemesterId,
        admissionYear: updatedUser.admissionYear,
      }
    });
  } catch (error) {
    console.error('Profile update failed:', error);
    return NextResponse.json({ error: 'We could not update your profile right now.' }, { status: 500 });
  }
}
