'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KuisPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' atau 'quiz'
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Stats & Dynamic Options State
  const [userResults, setUserResults] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);

  // Quiz Selection State
  const [kategori, setKategori] = useState('');
  const [paket, setPaket] = useState('');
  const [tingkatKesulitan, setTingkatKesulitan] = useState('sedang');
  
  // Quiz Flow State
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
        fetchInitialData(parsedUser.id);
      }
    }
  }, []);

  const fetchInitialData = async (userId) => {
    try {
      // Fetch data hasil/riwayat
      const resUsers = await fetch('/api/admin/users');
      const dataUsers = await resUsers.json();
      if (dataUsers.success) {
        const myResults = (dataUsers.results || []).filter((r) => r.userId === userId);
        setUserResults(myResults);
      }

      // Fetch data bank soal untuk sinkronisasi Kategori & Paket
      const resQ = await fetch('/api/admin/questions');
      const dataQ = await resQ.json();
      if (dataQ.success) {
        const qList = dataQ.questions || [];
        setAllQuestions(qList);

        // Ambil kategori unik yang ada di database
        const cats = [...new Set(qList.map((q) => q.kategori))].filter(Boolean);
        setAvailableCategories(cats);
        if (cats.length > 0) setKategori(cats[0]);

        // Ambil paket unik yang ada di database
        const pkgs = [...new Set(qList.map((q) => parseInt(q.paket) || 1))].sort((a, b) => a - b);
        setAvailablePackages(pkgs);
        if (pkgs.length > 0) setPaket(pkgs[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startKuis = async () => {
    if (!kategori || !paket) return alert('Pilih kategori dan paket soal terlebih dahulu!');

    // Cek apakah user sudah pernah mengerjakan paket & kategori ini
    const resUser = await fetch('/api/admin/users');
    const dataUser = await resUser.json();
    if (dataUser.success) {
      const hasDone = (dataUser.results || []).some(
        (r) => r.userId === user.id && r.kategori === kategori && (parseInt(r.paket) || 1) === parseInt(paket)
      );
      if (hasDone) {
        setAlreadyTaken(true);
        return;
      }
    }

    // Filter soal dari data bank soal yang tersimpan
    const filtered = allQuestions.filter(
      (q) =>
        q.kategori === kategori &&
        (parseInt(q.paket) || 1) === parseInt(paket) &&
        (q.tingkatKesulitan || 'sedang') === tingkatKesulitan
    );

    if (filtered.length === 0) {
      alert(`Belum ada soal untuk kategori ${kategori.toUpperCase()} Paket ${paket} (${tingkatKesulitan.toUpperCase()})`);
      return;
    }

    setQuestions(filtered);
    setCurrentIndex(0);
    setSkor(0);
    setAnswered(false);
    setIsDone(false);
    setAlreadyTaken(false);
    setUserAnswers([]);
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
            paket: parseInt(paket),
            tingkatKesulitan,
            skor: currentSkor,
            detailJawaban: newAnswers
          }),
        });
        fetchInitialData(user.id);
      }
    }, 600);
  };

  const resetQuizState = () => {
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

  // Ringkasan Statistik User
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
                  Dashboard
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
                  Kerjakan Kuis
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
              <h2 style={{ marginTop: 0, fontSize: '18px' }}>Selamat Datang, {user.nama || user.username}!</h2>
              <p style={{ color: '#555', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                Silakan pilih menu <b>Kerjakan Kuis</b> pada navigasi di kanan atas untuk mulai mengerjakan kuis yang tersedia.
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
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                            {r.kategori === 'matematika' ? 'Matematika' : r.kategori === 'bahasa_indonesia' ? 'Bahasa Indonesia' : r.kategori}
                          </td>
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
            {/* STATE 1: PERNAH MENGERJAKAN */}
            {alreadyTaken && (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                <h3 style={{ color: '#d9534f', margin: '0 0 10px 0', fontSize: '16px' }}>Kuis Sudah Dikerjakan</h3>
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '15px' }}>
                  Kamu sudah pernah mengerjakan kuis kategori <b>{kategori}</b> Paket <b>{paket}</b>.
                </p>
                <button
                  onClick={() => setAlreadyTaken(false)}
                  style={{ padding: '8px 16px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                >
                  Pilih Paket Lain
                </button>
              </div>
            )}

            {/* STATE 2: SELESAI KERJAKAN KUIS */}
            {isDone && (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#5cb85c' }}>Selamat! Kuis Telah Selesai</h3>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    resetQuizState();
                  }}
                  style={{ padding: '10px 20px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  Kembali ke Dashboard
                </button>
              </div>
            )}

            {/* STATE 3: FORM PILIH SOAL (DATABASE SINKRON) */}
            {!alreadyTaken && !isDone && questions.length === 0 && (
              <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
                <h3 style={{ marginTop: 0, fontSize: '16px' }}>Pilih Parameter Kuis</h3>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Kategori Soal:</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                  >
                    {availableCategories.length === 0 ? (
                      <option value="">Tidak ada kategori tersedia</option>
                    ) : (
                      availableCategories.map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat === 'matematika' ? 'Matematika' : cat === 'bahasa_indonesia' ? 'Bahasa Indonesia' : cat}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Paket Soal (Tersedia):</label>
                  <select
                    value={paket}
                    onChange={(e) => setPaket(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                  >
                    {availablePackages.length === 0 ? (
                      <option value="">Tidak ada paket tersedia</option>
                    ) : (
                      availablePackages.map((p, idx) => (
                        <option key={idx} value={p}>Paket {p}</option>
                      ))
                    )}
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
                  onClick={startKuis}
                  disabled={availableCategories.length === 0}
                  style={{ width: '100%', padding: '10px', background: availableCategories.length > 0 ? '#5cb85c' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Mulai Kuis
                </button>
              </div>
            )}

            {/* STATE 4: PENGERJAAN SOAL */}
            {!alreadyTaken && !isDone && questions.length > 0 && (
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
