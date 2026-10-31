'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KuisPage() {
  const [user, setUser] = useState(null);
  const [kategori, setKategori] = useState('');
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

  const startKuis = async (kat) => {
    setKategori(kat);

    const resUser = await fetch('/api/admin/users');
    const dataUser = await resUser.json();
    if (dataUser.success) {
      const hasDone = dataUser.results.some(
        (r) => r.userId === user.id && r.kategori === kat
      );
      if (hasDone) {
        setAlreadyTaken(true);
        return;
      }
    }

    const res = await fetch('/api/admin/questions');
    const data = await res.json();
    if (data.success) {
      const filtered = data.questions.filter((q) => q.kategori === kat);
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

  if (alreadyTaken) {
    return (
      <div style={styles.centerBox}>
        <h3 style={{ color: '#c53030' }}>Perhatian</h3>
        <p style={{ margin: '15px 0', fontSize: '14px' }}>
          Kamu sudah pernah mengerjakan kuis kategori <b>{kategori === 'matematika' ? 'Matematika' : 'Bahasa Indonesia'}</b>.
        </p>
        <button onClick={() => setAlreadyTaken(false)} style={styles.katBtn}>Pilih Kategori Lain</button>
        <button onClick={handleLogout} style={{ ...styles.katBtn, backgroundColor: '#718096' }}>Logout</button>
      </div>
    );
  }

  if (!kategori) {
    return (
      <div style={styles.centerBox}>
        <div style={{ textAlign: 'right' }}>
          <button onClick={handleLogout} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>Logout</button>
        </div>
        <h2>Pilih Kategori Kuis</h2>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Halo {user.nama || user.username}, selamat mengerjakan!</p>
        <button onClick={() => startKuis('matematika')} style={styles.katBtn}>Matematika</button>
        <button onClick={() => startKuis('bahasa_indonesia')} style={{ ...styles.katBtn, backgroundColor: '#38a169' }}>Bahasa Indonesia</button>
      </div>
    );
  }

  if (isDone) {
    return (
      <div style={styles.centerBox}>
        <h2>Kuis Selesai</h2>
        <p>Nilai Kamu:</p>
        <h1 style={{ fontSize: '48px', color: '#2b6cb0', margin: '10px 0' }}>{skor}</h1>
        <button onClick={handleLogout} style={styles.katBtn}>Keluar / Logout</button>
      </div>
    );
  }

  if (questions.length === 0) return (
    <div style={styles.centerBox}>
      <p>Belum ada soal untuk kategori ini.</p>
      <button onClick={() => setKategori('')} style={styles.katBtn}>Kembali</button>
    </div>
  );

  const q = questions[currentIndex];

  return (
    <div style={styles.centerBox}>
      <p style={{ fontSize: '12px', color: '#666' }}>Soal {currentIndex + 1} dari {questions.length}</p>
      <h3 style={{ margin: '15px 0' }}>{q.soal}</h3>

      <div>
        {q.opsi.map((opsiText, idx) => (
          <button
            key={idx}
            disabled={answered}
            onClick={() => handleAnswer(idx)}
            style={{
              ...styles.optionBtn,
              backgroundColor: answered ? '#e2e8f0' : '#edf2f7',
              cursor: answered ? 'not-allowed' : 'pointer'
            }}
          >
            {opsiText}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  centerBox: { maxWidth: '400px', margin: '50px auto', padding: '20px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center', fontFamily: 'Arial, sans-serif' },
  katBtn: { display: 'block', width: '100%', padding: '12px', margin: '10px 0', backgroundColor: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  optionBtn: { display: 'block', width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #cbd5e0', borderRadius: '4px', textAlign: 'left', fontSize: '14px' }
};
