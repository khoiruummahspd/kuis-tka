'use client';

export const dynamic = 'force-dynamic';

import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const username = body?.username?.toString().trim() || '';
    const password = body?.password?.toString().trim() || '';

    // Validasi input kosong
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan Password wajib diisi!' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('kuis_tka');

    // Pencarian user (Case-insensitive pada username biar gak ribet huruf kapital/kecil)
    const user = await db.collection('users').findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      password: password
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Username atau Password salah!' },
        { status: 401 }
      );
    }

    // Response Sukses disesuaikan dengan kebutuhan AdminDashboard & Kuis
    return NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: {
        _id: user._id.toString(),
        username: user.username,
        nama: user.nama || user.username,
        role: user.role || 'siswa',
        isDefaultPassword: user.isDefaultPassword || false
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server / database' },
      { status: 500 }
    );
  }
}
