import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const client = await clientPromise;
    const db = client.db('kuis_tka');
    
    const user = await db.collection('users').findOne({
      username: username.trim(),
      password: password.trim()
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Username atau Password salah!' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        nama: user.nama,
        role: user.role,
        isDefaultPassword: user.isDefaultPassword || false
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal terhubung ke database' },
      { status: 500 }
    );
  }
}
