import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId, nama, kategori, paket, tingkatKesulitan, skor, detailJawaban } = await request.json();
    const client = await clientPromise;
    const db = client.db('kuis_tka');

    await db.collection('results').insertOne({
      userId,
      nama,
      kategori,
      paket: paket ? parseInt(paket) : 1,
      tingkatKesulitan: tingkatKesulitan || 'sedang',
      skor,
      detailJawaban,
      tanggal: new Date()
    });

    return NextResponse.json({ success: true, message: 'Hasil berhasil disimpan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menyimpan hasil' }, { status: 500 });
  }
}
