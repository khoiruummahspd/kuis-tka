import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

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

      const formattedQuestions = body.map((q) => {
        let cleanKat = (q.kategori || '').toLowerCase().trim();
        if (cleanKat.includes('bahasa') || cleanKat.includes('indo')) {
          cleanKat = 'bahasa_indonesia';
        } else if (cleanKat.includes('matematika') || cleanKat.includes('mtk')) {
          cleanKat = 'matematika';
        }

        return {
          paket: q.paket ? q.paket.toString().trim() : '1',
          tingkatKesulitan: (q.tingkatKesulitan || 'sedang').toLowerCase(),
          kategori: cleanKat || 'matematika',
          soal: q.soal || '',
          opsi: Array.isArray(q.opsi) ? q.opsi : [],
          jawabanBenar: parseInt(q.jawabanBenar) ?? 0,
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
      paket: body.paket ? body.paket.toString().trim() : '1',
      tingkatKesulitan: (body.tingkatKesulitan || 'sedang').toLowerCase(),
      kategori: cleanKat || 'matematika',
      soal: body.soal || '',
      opsi: Array.isArray(body.opsi) ? body.opsi : [],
      jawabanBenar: parseInt(body.jawabanBenar) ?? 0,
    });

    return NextResponse.json({ success: true, message: 'Soal berhasil disimpan' });
  } catch (error) {
    console.error('Error Add Question:', error);
    return NextResponse.json({ success: false, message: 'Gagal menyimpan soal' }, { status: 500 });
  }
}

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

    let queryId;
    try {
      queryId = new ObjectId(_id);
    } catch (e) {
      queryId = _id;
    }

    await db.collection('questions').updateOne(
      { _id: queryId },
      {
        $set: {
          paket: paket ? paket.toString().trim() : '1',
          tingkatKesulitan: (tingkatKesulitan || 'sedang').toLowerCase(),
          kategori: cleanKat || 'matematika',
          soal: soal || '',
          opsi: Array.isArray(opsi) ? opsi : [],
          jawabanBenar: parseInt(jawabanBenar) ?? 0,
        },
      }
    );

    return NextResponse.json({ success: true, message: 'Soal berhasil diperbarui' });
  } catch (error) {
    console.error('Error Update Question:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui soal' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { questionId } = await request.json();
    if (!questionId) {
      return NextResponse.json({ success: false, message: 'ID soal wajib disertakan' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('kuis_tka');

    let queryId;
    try {
      queryId = new ObjectId(questionId);
    } catch (e) {
      queryId = questionId;
    }

    await db.collection('questions').deleteOne({
      $or: [{ _id: queryId }, { _id: questionId }]
    });

    return NextResponse.json({ success: true, message: 'Soal berhasil dihapus' });
  } catch (error) {
    console.error('Error Delete Question:', error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus soal' }, { status: 500 });
  }
}
