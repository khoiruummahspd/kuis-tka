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
      <div style={styles.pageWrapper}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; background-color: #f7f4ed; }
        `}</style>

        <div style={styles.centerBox}>
          <div style={styles.alertIcon}>⚠️</div>
          <h3 style={{ color: '#c53030', margin: '10px 0 5px 0', fontSize: '20px' }}>Perhatian</h3>
          <p style={{ margin: '15px 0 25px 0', fontSize: '14px', color: '#555', lineHeight: '1.5' }}>
            Kamu sudah pernah mengerjakan kuis kategori <b>{kategori === 'matematika' ? 'Matematika' : 'Bahasa Indonesia'}</b>.
          </p>
          <button onClick={() => setAlreadyTaken(false)} style={styles.katBtn}>Pilih Kategori Lain</button>
          <button onClick={handleLogout} style={{ ...styles.katBtn, backgroundColor: '#e2ddd0', color: '#333' }}>Logout</button>
        </div>
      </div>
    );
  }

  if (!kategori) {
    return (
      <div style={styles.pageWrapper}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; background-color: #f7f4ed; }
        `}</style>

        <div style={styles.centerBox}>
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            <button onClick={handleLogout} style={styles.logoutBtnSmall}>Logout</button>
          </div>
          <h2 style={styles.title}>Pilih Kategori Kuis</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '25px' }}>Halo <b>{user.nama || user.username}</b>, selamat mengerjakan!</p>
          
          <button onClick={() => startKuis('matematika')} style={styles.katBtn}>📐 Matematika</button>
          <button onClick={() => startKuis('bahasa_indonesia')} style={{ ...styles.katBtn, backgroundColor: '#8b5cf6', color: '#fff' }}>📖 Bahasa Indonesia</button>
        </div>
      </div>
    );
  }

  if (isDone) {
    return (
      <div style={styles.pageWrapper}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; background-color: #f7f4ed; }
        `}</style>

        <div style={styles.centerBox}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
          <h2 style={styles.title}>Kuis Selesai</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>Nilai Kamu:</p>
          <h1 style={{ fontSize: '56px', color: '#1a1a1a', margin: '15px 0', fontWeight: '800' }}>{skor}</h1>
          <button onClick={handleLogout} style={styles.katBtn}>Keluar / Logout</button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return (
    <div style={styles.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background-color: #f7f4ed; }
      `}</style>

      <div style={styles.centerBox}>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Belum ada soal untuk kategori ini.</p>
        <button onClick={() => setKategori('')} style={styles.katBtn}>Kembali</button>
      </div>
    </div>
  );

  const q = questions[currentIndex];

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background-color: #f7f4ed; }
      `}</style>

      <div style={styles.centerBox}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
        </div>

        <p style={{ fontSize: '12px', color: '#888', fontWeight: '600', marginBottom: '8px' }}>
          SOAL {currentIndex + 1} DARI {questions.length}
        </p>
        <h3 style={styles.questionText}>{q.soal}</h3>

        <div>
          {q.opsi.map((opsiText, idx) => (
            <button
              key={idx}
              disabled={answered}
              onClick={() => handleAnswer(idx)}
              style={{
                ...styles.optionBtn,
                backgroundColor: answered ? '#faf8f5' : '#ffffff',
                borderColor: answered ? '#e2ddd0' : '#e2ddd0',
                cursor: answered ? 'not-allowed' : 'pointer'
              }}
            >
              <span style={styles.optionBadge}>{String.fromCharCode(65 + idx)}</span>
              {opsiText}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    backgroundColor: '#f7f4ed',
    padding: '20px',
  },
  centerBox: {
    width: '100%',
    maxWidth: '440px',
    padding: '36px 28px',
    background: '#ffffff',
    border: '1px solid #eae5d9',
    borderRadius: '24px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04)',
    position: 'relative',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
  },
  questionText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d2d2d',
    margin: '15px 0 25px 0',
    lineHeight: '1.4',
  },
  katBtn: {
    display: 'block',
    width: '100%',
    padding: '14px',
    margin: '12px 0',
    backgroundColor: '#f6ca85',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    transition: 'all 0.2s',
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '14px 16px',
    margin: '10px 0',
    border: '1.5px solid #e2ddd0',
    borderRadius: '12px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333333',
    boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
  },
  optionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: '#f7f4ed',
    color: '#1a1a1a',
    fontWeight: '700',
    fontSize: '12px',
    marginRight: '12px',
    flexShrink: 0,
  },
  logoutBtnSmall: {
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    backgroundColor: '#faf8f5',
    border: '1px solid #e2ddd0',
    borderRadius: '8px',
    color: '#666',
  },
  progressBar: {
    width: '100%',
    height: '6px',
    backgroundColor: '#f7f4ed',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f6ca85',
    borderRadius: '10px',
    transition: 'width 0.3s ease',
  },
  alertIcon: {
    fontSize: '36px',
    marginBottom: '10px',
  },
};
