import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

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

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('kuis_tka');

    if (Array.isArray(body)) {
      if (!body.length) {
        return NextResponse.json({ success: false, message: 'Data JSON kosong' }, { status: 400 });
      }

      const formattedQuestions = body.map((q) => ({
        paket: parseInt(q.paket) || 1,
        tingkatKesulitan: q.tingkatKesulitan || 'sedang',
        kategori: q.kategori,
        soal: q.soal,
        opsi: q.opsi,
        jawabanBenar: parseInt(q.jawabanBenar),
      }));

      await db.collection('questions').insertMany(formattedQuestions);
      return NextResponse.json({ success: true, message: `${formattedQuestions.length} soal berhasil diunggah` });
    }

    const { paket, tingkatKesulitan, kategori, soal, opsi, jawabanBenar } = body;
    await db.collection('questions').insertOne({
      paket: parseInt(paket) || 1,
      tingkatKesulitan: tingkatKesulitan || 'sedang',
      kategori,
      soal,
      opsi,
      jawabanBenar: parseInt(jawabanBenar),
    });

    return NextResponse.json({ success: true, message: 'Soal berhasil disimpan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menyimpan soal' }, { status: 500 });
  }
}
