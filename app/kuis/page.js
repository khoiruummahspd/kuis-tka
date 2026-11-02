'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KuisPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' atau 'quiz'
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Stats State
  const [userResults, setUserResults] = useState([]);
  
  // Quiz Form & Flow State
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
        fetchUserStats(parsedUser.id);
      }
    }
  }, []);

  const fetchUserStats = async (userId) => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        const myResults = (data.results || []).filter((r) => r.userId === userId);
        setUserResults(myResults);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startKuis = async (selectedKat) => {
    setKategori(selectedKat);

    const resUser = await fetch('/api/admin/users');
    const dataUser = await resUser.json();
    if (dataUser.success) {
      const hasDone = (dataUser.results || []).some(
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
        fetchUserStats(user.id);
      }
    }, 600);
  };

  const resetQuizState = () => {
    setKategori('');
    setQuestions([]);
    setCurrentIndex(0);
    setSkor(0);
    setAnswered(false);
    setIsDone(false);
    setAlreadyTaken(false);
    setUserAnswers([]);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (!user) return null;

  // Hitung ringkasan statistik user
  const totalKuis = userResults.length;
  const avgSkor = totalKuis > 0 ? Math.round(userResults.reduce((acc, curr) => acc + (curr.skor || 0), 0) / totalKuis) : 0;
  const maxSkor = totalKuis > 0 ? Math.max(...userResults.map((r) => r.skor || 0)) : 0;

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh', padding: '15px', boxSizing: 'border-box' }}>
      
      {/* HEADER BAR & TOMBOL GARIS TIGA */}
      <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <strong style={{ fontSize: '16px', display: 'block' }}>Portal Siswa</strong>
          <small style={{ color: '#666', fontSize: '12px' }}>{user.nama || user.username}</small>
        </div>
        
        <button
          onClick={() => setIsMenuOpen(true)}
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '0 4px' }}
        >
          ☰
        </button>
      </div>

      {/* OVERLAY & SIDEBAR MENU (MUNCUL DI KIRI) */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }}>
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '240px', background: '#fff', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '2px 0 8px rgba(0,0,0,0.1)', zIndex: 100 }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Menu Navigasi</h3>
                <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    resetQuizState();
                    setIsMenuOpen(false);
                  }}
                  style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: activeTab === 'dashboard' ? '#0275d8' : '#fff',
                    color: activeTab === 'dashboard' ? '#fff' : '#333',
                    fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal',
                    cursor: 'pointer'
                  }}
                >
                  📌 Dashboard & Sambutan
                </button>
                <button
                  onClick={() => {
                    setActiveTab('quiz');
                    resetQuizState();
                    setIsMenuOpen(false);
                  }}
                  style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: activeTab === 'quiz' ? '#0275d8' : '#fff',
                    color: activeTab === 'quiz' ? '#fff' : '#333',
                    fontWeight: activeTab === 'quiz' ? 'bold' : 'normal',
                    cursor: 'pointer'
                  }}
                >
                  📝 Kerjakan Kuis
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{ padding: '10px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div>
        {/* TAB 1: DASHBOARD / SAMBUTAN + STATISTIK */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '15px' }}>
              <h2 style={{ marginTop: 0, fontSize: '18px' }}>Selamat Datang, {user.nama || user.username}! 👋</h2>
              <p style={{ color: '#555', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                Siap untuk menguji kemampuanmu hari ini? Pilih menu <b>Kerjakan Kuis</b> melalui tombol navigasi di pojok kanan atas untuk mulai menjawab soal.
              </p>
            </div>

            {/* RINGKASAN STATISTIK USER */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginBottom: '15px' }}>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                <span style={{ display: 'block', color: '#666', fontSize: '11px' }}>Kuis Dikerjakan</span>
                <strong style={{ fontSize: '20px' }}>{totalKuis}</strong>
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                <span style={{ display: 'block', color: '#666', fontSize: '11px' }}>Rata-rata Skor</span>
                <strong style={{ fontSize: '20px', color: '#0275d8' }}>{avgSkor}</strong>
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                <span style={{ display: 'block', color: '#666', fontSize: '11px' }}>Skor Tertinggi</span>
                <strong style={{ fontSize: '20px', color: '#5cb85c' }}>{maxSkor}</strong>
              </div>
            </div>

            {/* RIWAYAT PENGERJAAN */}
            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', overflow: 'hidden' }}>
              <h3 style={{ marginTop: 0, fontSize: '15px' }}>Riwayat Hasil Kuis</h3>
              {userResults.length === 0 ? (
                <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Belum ada riwayat kuis yang dikerjakan.</p>
              ) : (
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '300px' }}>
                    <thead>
                      <tr style={{ background: '#eee', textAlign: 'left', fontSize: '12px' }}>
                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Kategori</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Paket</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Skor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userResults.map((r, idx) => (
                        <tr key={idx} style={{ fontSize: '13px' }}>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{r.kategori === 'matematika' ? 'Matematika' : 'Bahasa Indonesia'}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>Paket {r.paket || 1}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}><b>{r.skor}</b></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: HALAMAN KUIS */}
        {activeTab === 'quiz' && (
          <div>
            {/* SUB-STATE: PERNAH MENGERJAKAN */}
            {alreadyTaken && (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
                <h3 style={{ color: '#d9534f', margin: '0 0 10px 0', fontSize: '16px' }}>Sudah Dikerjakan</h3>
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '15px' }}>
                  Kamu sudah pernah mengerjakan Paket {paket} ({kategori === 'matematika' ? 'Matematika' : 'Bahasa Indonesia'}).
                </p>
                <button
                  onClick={() => setAlreadyTaken(false)}
                  style={{ padding: '8px 16px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                >
                  Pilih Paket / Kategori Lain
                </button>
              </div>
            )}

            {/* SUB-STATE: SELESAI */}
            {isDone && (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
                <h3 style={{ margin: '0 0 5px 0' }}>Kuis Selesai!</h3>
                <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Nilai Akhir Kamu:</p>
                <h1 style={{ fontSize: '48px', color: '#333', margin: '10px 0' }}>{skor}</h1>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    resetQuizState();
                  }}
                  style={{ padding: '10px 20px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  Kembali ke Dashboard
                </button>
              </div>
            )}

            {/* SUB-STATE: FORM PILIH SOAL */}
            {!alreadyTaken && !isDone && !kategori && (
              <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
                <h3 style={{ marginTop: 0, fontSize: '16px' }}>Pilih Parameter Kuis</h3>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Paket Soal:</label>
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

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Tingkat Kesulitan:</label>
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
                  style={{ width: '100%', padding: '10px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}
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
            )}

            {/* SUB-STATE: SOAL KOSONG */}
            {!alreadyTaken && !isDone && kategori && questions.length === 0 && (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: '13px', marginBottom: '15px' }}>
                  Belum ada soal untuk Paket {paket} ({tingkatKesulitan.toUpperCase()}).
                </p>
                <button
                  onClick={() => setKategori('')}
                  style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Kembali Pilih Paket
                </button>
              </div>
            )}

            {/* SUB-STATE: PENGERJAAN SOAL */}
            {!alreadyTaken && !isDone && kategori && questions.length > 0 && (
              <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ height: '100%', background: '#5cb85c', width: `${((currentIndex + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }}></div>
                </div>

                <div style={{ fontSize: '12px', color: '#666', fontWeight: 'bold', marginBottom: '8px' }}>
                  SOAL {currentIndex + 1} DARI {questions.length} (PAKET {paket})
                </div>

                <h3 style={{ fontSize: '15px', color: '#333', margin: '0 0 15px 0', lineHeight: '1.4' }}>
                  {questions[currentIndex]?.soal}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {questions[currentIndex]?.opsi.map((opsiText, idx) => (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
