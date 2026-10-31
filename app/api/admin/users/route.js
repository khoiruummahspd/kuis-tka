import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET: Ambil data user & hasil kuis
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('kuis_tka');
    
    const users = await db.collection('users').find({ role: 'siswa' }).toArray();
    const results = await db.collection('results').find({}).toArray();

    return NextResponse.json({ success: true, users, results });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

// POST: Tambah Siswa Baru
export async function POST(request) {
  try {
    const { nama, username, password } = await request.json();
    const client = await clientPromise;
    const db = client.db('kuis_tka');

    const existingUser = await db.collection('users').findOne({ username: username.trim() });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'Username sudah digunakan!' }, { status: 400 });
    }

    await db.collection('users').insertOne({
      nama: nama.trim(),
      username: username.trim(),
      password: password.trim(),
      role: 'siswa',
      isDefaultPassword: true
    });

    return NextResponse.json({ success: true, message: 'Siswa berhasil ditambahkan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menambah siswa' }, { status: 500 });
  }
}

// PUT: Edit Siswa & Reset Password
export async function PUT(request) {
  try {
    const { userId, nama, username, newPassword } = await request.json();
    const client = await clientPromise;
    const db = client.db('kuis_tka');

    const updateData = {
      nama: nama.trim(),
      username: username.trim()
    };

    // Jika password diisi, sekalian reset passwordnya
    if (newPassword && newPassword.trim() !== '') {
      updateData.password = newPassword.trim();
      updateData.isDefaultPassword = true; // Wajibkan ganti password lagi saat login berikutnya
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true, message: 'Data siswa berhasil diubah' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal memperbarui data' }, { status: 500 });
  }
}

// DELETE: Hapus Siswa
export async function DELETE(request) {
  try {
    const { userId } = await request.json();
    const client = await clientPromise;
    const db = client.db('kuis_tka');

    await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
    return NextResponse.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menghapus user' }, { status: 500 });
  }
}
