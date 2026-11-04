import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

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

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('kuis_tka');

    if (Array.isArray(body)) {
      if (!body.length) {
        return NextResponse.json({ success: false, message: 'Data JSON kosong' }, { status: 400 });
      }

      const formattedUsers = body.map((u) => ({
        nama: (u.nama || u.username || 'Siswa').trim(),
        username: (u.username || '').trim(),
        password: (u.password || '123').trim(),
        role: 'siswa',
        isDefaultPassword: true,
      }));

      await db.collection('users').insertMany(formattedUsers);
      return NextResponse.json({ success: true, message: `${formattedUsers.length} siswa berhasil diimport` });
    }

    const { nama, username, password } = body;
    if (!username) {
      return NextResponse.json({ success: false, message: 'Username wajib diisi!' }, { status: 400 });
    }

    const existingUser = await db.collection('users').findOne({ username: username.trim() });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'Username sudah digunakan!' }, { status: 400 });
    }

    await db.collection('users').insertOne({
      nama: nama.trim(),
      username: username.trim(),
      password: (password || '123').trim(),
      role: 'siswa',
      isDefaultPassword: true
    });

    return NextResponse.json({ success: true, message: 'Siswa berhasil ditambahkan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menambah siswa' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { userId, nama, username, newPassword } = await request.json();
    const client = await clientPromise;
    const db = client.db('kuis_tka');

    const updateData = {
      nama: nama.trim(),
      username: username.trim()
    };

    if (newPassword && newPassword.trim() !== '') {
      updateData.password = newPassword.trim();
      updateData.isDefaultPassword = true;
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

export async function DELETE(request) {
  try {
    const { userId, resultId } = await request.json();
    const client = await clientPromise;
    const db = client.db('kuis_tka');

    if (resultId) {
      await db.collection('results').deleteOne({ _id: new ObjectId(resultId) });
      return NextResponse.json({ success: true, message: 'Hasil kuis berhasil dihapus' });
    }

    if (userId) {
      await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
      await db.collection('results').deleteMany({ userId });
      return NextResponse.json({ success: true, message: 'User berhasil dihapus' });
    }

    return NextResponse.json({ success: false, message: 'ID tidak valid' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menghapus data' }, { status: 500 });
  }
}
