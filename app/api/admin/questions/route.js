import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET: Ambil daftar soal
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('kuis_tka');
    const questions = await db.collection('questions').find({}).toArray();
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error mengambil soal' }, { status: 500 });
  }
}

// POST: Tambah Soal Baru
export async function POST(request) {
  try {
    const { kategori, soal, opsi, jawabanBenar } = await request.json();
    const client = await clientPromise;
    const db = client.db('kuis_tka');

    await db.collection('questions').insertOne({
      kategori,
      soal,
      opsi,
      jawabanBenar: parseInt(jawabanBenar)
    });

    return NextResponse.json({ success: true, message: 'Soal berhasil disimpan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menyimpan soal' }, { status: 500 });
  }
}
