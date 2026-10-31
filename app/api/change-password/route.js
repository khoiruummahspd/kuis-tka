import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const { userId, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Password terlalu pendek!' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('kuis_tk');

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: newPassword.trim(),
          isDefaultPassword: false 
        } 
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah!'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui password' },
      { status: 500 }
    );
  }
}
