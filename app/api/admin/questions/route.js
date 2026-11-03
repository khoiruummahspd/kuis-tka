import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET: Ambil Semua Soal
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

// POST: Tambah Soal (Satuan atau Array JSON)
export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('kuis_tka');

    if (Array.isArray(body)) {
      if (!body.length) {
        return NextResponse.json({ success: false, message: 'Data JSON kosong' }, { status: 400 });
      }

      const formattedQuestions = body.map((q) => {
        let cleanKat = (q.kategori || '').toLowerCase().trim();
        if (cleanKat.includes('bahasa') || cleanKat.includes('indo')) {
          cleanKat = 'bahasa_indonesia';
        } else if (cleanKat.includes('matematika') || cleanKat.includes('mtk')) {
          cleanKat = 'matematika';
        }

        return {
          paket: parseInt(q.paket) || 1,
          tingkatKesulitan: (q.tingkatKesulitan || 'sedang').toLowerCase(),
          kategori: cleanKat,
          soal: q.soal || '',
          opsi: Array.isArray(q.opsi) ? q.opsi : [],
          jawabanBenar: parseInt(q.jawabanBenar) || 0,
        };
      });

      await db.collection('questions').insertMany(formattedQuestions);
      return NextResponse.json({ success: true, message: `${formattedQuestions.length} soal berhasil diunggah` });
    }

    let cleanKat = (body.kategori || '').toLowerCase().trim();
    if (cleanKat.includes('bahasa') || cleanKat.includes('indo')) {
      cleanKat = 'bahasa_indonesia';
    } else if (cleanKat.includes('matematika') || cleanKat.includes('mtk')) {
      cleanKat = 'matematika';
    }

    await db.collection('questions').insertOne({
      paket: parseInt(body.paket) || 1,
      tingkatKesulitan: (body.tingkatKesulitan || 'sedang').toLowerCase(),
      kategori: cleanKat,
      soal: body.soal || '',
      opsi: Array.isArray(body.opsi) ? body.opsi : [],
      jawabanBenar: parseInt(body.jawabanBenar) || 0,
    });

    return NextResponse.json({ success: true, message: 'Soal berhasil disimpan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menyimpan soal' }, { status: 500 });
  }
}

// PUT: Update / Edit Soal
export async function PUT(request) {
  try {
    const { _id, paket, tingkatKesulitan, kategori, soal, opsi, jawabanBenar } = await request.json();
    if (!_id) return NextResponse.json({ success: false, message: 'ID soal wajib diisi' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db('kuis_tka');

    let cleanKat = (kategori || '').toLowerCase().trim();
    if (cleanKat.includes('bahasa') || cleanKat.includes('indo')) {
      cleanKat = 'bahasa_indonesia';
    } else if (cleanKat.includes('matematika') || cleanKat.includes('mtk')) {
      cleanKat = 'matematika';
    }

    await db.collection('questions').updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          paket: parseInt(paket) || 1,
          tingkatKesulitan: (tingkatKesulitan || 'sedang').toLowerCase(),
          kategori: cleanKat,
          soal,
          opsi,
          jawabanBenar: parseInt(jawabanBenar) || 0,
        },
      }
    );

    return NextResponse.json({ success: true, message: 'Soal berhasil diperbarui' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal memperbarui soal' }, { status: 500 });
  }
}

// DELETE: Hapus Soal berdasarkan ID
export async function DELETE(request) {
  try {
    const { questionId } = await request.json();
    if (!questionId) {
      return NextResponse.json({ success: false, message: 'ID soal wajib disertakan' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('kuis_tka');

    await db.collection('questions').deleteOne({ _id: new ObjectId(questionId) });

    return NextResponse.json({ success: true, message: 'Soal berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menghapus soal' }, { status: 500 });
  }
}
