'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KuisPage() {
  const [user, setUser] = useState(null);
  const [kategori, setKategori] = useState('');
  const [paket, setPaket] = useState(1);
  const [tingkatKesulitan, setTingkatKesulitan] = useState('sedang');
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [skor, setSkor] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [alreadyTaken, setAlreadyTaken] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem('user');
    if (!data) {
      router.push('/');
    } else {
      const parsedUser = JSON.parse(data);
      if (parsedUser.role === 'admin') {
        router.push('/admin');
      } else {
        setUser(parsedUser);
      }
    }
  }, []);

  const startKuis = async (selectedKat) => {
    setKategori(selectedKat);

    const resUser = await fetch('/api/admin/users');
    const dataUser = await resUser.json();
    if (dataUser.success) {
      const hasDone = dataUser.results.some(
        (r) => r.userId === user.id && r.kategori === selectedKat && (r.paket || 1) === paket
      );
      if (hasDone) {
        setAlreadyTaken(true);
        return;
      }
    }

    const res = await fetch('/api/admin/questions');
    const data = await res.json();
    if (data.success) {
      const filtered = data.questions.filter(
        (q) =>
          q.kategori === selectedKat &&
          (parseInt(q.paket) || 1) === parseInt(paket) &&
          (q.tingkatKesulitan || 'sedang') === tingkatKesulitan
      );
      setQuestions(filtered);
    }
  };

  const handleAnswer = (selectedIdx) => {
    if (answered) return;

    setAnswered(true);
    const currentQ = questions[currentIndex];
    const isCorrect = selectedIdx === currentQ.jawabanBenar;

    const newAnswers = [
      ...userAnswers,
      {
        soal: currentQ.soal,
        jawabanSiswa: currentQ.opsi[selectedIdx],
        jawabanBenar: currentQ.opsi[currentQ.jawabanBenar],
        isCorrect: isCorrect
      }
    ];
    setUserAnswers(newAnswers);

    let currentSkor = skor;
    if (isCorrect) {
      currentSkor += Math.round(100 / questions.length);
      setSkor(currentSkor);
    }

    setTimeout(async () => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setAnswered(false);
      } else {
        setIsDone(true);
        await fetch('/api/kuis/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            nama: user.nama || user.username,
            kategori,
            paket,
            tingkatKesulitan,
            skor: currentSkor,
            detailJawaban: newAnswers
          }),
        });
      }
    }, 600);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (!user) return null;

  // LAYAR JIKA SUDAH PERNAH KERJAKAN
  if (alreadyTaken) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh', padding: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚠️</div>
          <h3 style={{ color: '#d9534f', margin: '0 0 10px 0', fontSize: '18px' }}>Perhatian</h3>
          <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.4', marginBottom: '20px' }}>
            Kamu sudah pernah mengerjakan Paket {paket} ({kategori === 'matematika' ? 'Matematika' : 'Bahasa Indonesia'}).
          </p>
          <button
            onClick={() => setAlreadyTaken(false)}
            style={{ width: '100%', padding: '10px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}
          >
            Pilih Paket / Kategori Lain
          </button>
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '10px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // LAYAR PILIH PARAMETER & KATEGORI
  if (!kategori) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh', padding: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', maxWidth: '400px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Pilih Kuis</h3>
            <button onClick={handleLogout} style={{ padding: '4px 10px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
          </div>

          <p style={{ fontSize: '14px', color: '#666', marginTop: 0, marginBottom: '15px' }}>Halo <b>{user.nama || user.username}</b>, silakan pilih kuis:</p>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Paket Soal:</label>
            <select
              value={paket}
              onChange={(e) => setPaket(parseInt(e.target.value))}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
            >
              <option value={1}>Paket 1</option>
              <option value={2}>Paket 2</option>
              <option value={3}>Paket 3</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Tingkat Kesulitan:</label>
            <select
              value={tingkatKesulitan}
              onChange={(e) => setTingkatKesulitan(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
            >
              <option value="mudah">Mudah</option>
              <option value="sedang">Sedang</option>
              <option value="sulit">Sulit</option>
            </select>
          </div>

          <button
            onClick={() => startKuis('matematika')}
            style={{ width: '100%', padding: '10px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}
          >
            📐 Matematika
          </button>
          <button
            onClick={() => startKuis('bahasa_indonesia')}
            style={{ width: '100%', padding: '10px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            📖 Bahasa Indonesia
          </button>
        </div>
      </div>
    );
  }

  // LAYAR HASIL SELESAI
  if (isDone) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh', padding: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
          <h3 style={{ margin: '0 0 5px 0' }}>Kuis Selesai</h3>
          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Nilai Akhir Kamu:</p>
          <h1 style={{ fontSize: '48px', color: '#333', margin: '10px 0' }}>{skor}</h1>
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '10px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Keluar / Logout
          </button>
        </div>
      </div>
    );
  }

  // LAYAR JIKA SOAL KOSONG
  if (questions.length === 0) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh', padding: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
            Belum ada soal untuk Paket {paket} ({tingkatKesulitan.toUpperCase()}).
          </p>
          <button
            onClick={() => setKategori('')}
            style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];

  // LAYAR PENGERJAAN SOAL
  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh', padding: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', maxWidth: '450px', width: '100%', boxSizing: 'border-box' }}>
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
          <div style={{ height: '100%', background: '#5cb85c', width: `${((currentIndex + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }}></div>
        </div>

        <div style={{ fontSize: '12px', color: '#666', fontWeight: 'bold', marginBottom: '8px' }}>
          SOAL {currentIndex + 1} DARI {questions.length} (PAKET {paket})
        </div>

        <h3 style={{ fontSize: '16px', color: '#333', margin: '0 0 15px 0', lineHeight: '1.4' }}>
          {q.soal}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {q.opsi.map((opsiText, idx) => (
            <button
              key={idx}
              disabled={answered}
              onClick={() => handleAnswer(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: answered ? '#f9f9f9' : '#fff',
                cursor: answered ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            >
              <strong style={{ minWidth: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#eee', borderRadius: '3px', marginRight: '10px', fontSize: '12px' }}>
                {String.fromCharCode(65 + idx)}
              </strong>
              <span style={{ wordBreak: 'break-word' }}>{opsiText}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
