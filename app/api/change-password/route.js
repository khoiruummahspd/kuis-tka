import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return Response.json(
        { success: false, message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('kuis_tka');

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: newPassword,
          isDefaultPassword: false,
        },
      }
    );

    if (result.modifiedCount === 1) {
      return Response.json({
        success: true,
        message: 'Password berhasil diperbarui',
      });
    } else {
      return Response.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
