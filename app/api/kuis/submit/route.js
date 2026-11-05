import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('kuis_tka');

    await db.collection('results').insertOne({
      userId: body.userId.toString(),
      nama: body.nama,
      kategori: body.kategori,
      paket: body.paket.toString(),
      tingkatKesulitan: body.tingkatKesulitan.toLowerCase(),
      skor: body.skor,
      detailJawaban: body.detailJawaban,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, message: 'Hasil kuis berhasil disimpan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menyimpan hasil kuis' }, { status: 500 });
  }
}
