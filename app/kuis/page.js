'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KuisPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'quiz', atau 'activity'
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
  const [alreadyTaken, setAlreadyTaken] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  // Storing Selected Option per Question Index
  const [selectedAnswers, setSelectedAnswers] = useState({});
  // Storing Skipped Questions Index
  const [skippedQuestions, setSkippedQuestions] = useState({});

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
        fetchInitialData(parsedUser._id || parsedUser.id);
      }
    }
  }, []);

  const fetchInitialData = async (userId) => {
    try {
      const resUsers = await fetch('/api/admin/users');
      const dataUsers = await resUsers.json();
      if (dataUsers.success) {
        const myResults = (dataUsers.results || []).filter(
          (r) => r.userId === userId || r.userId === userId?.toString()
        );
        setUserResults(myResults);
      }

      const resQ = await fetch('/api/admin/questions');
      const dataQ = await resQ.json();
      if (dataQ.success) {
        const qList = dataQ.questions || [];
        setAllQuestions(qList);

        const cats = [...new Set(qList.map((q) => q.kategori))].filter(Boolean);
        setAvailableCategories(cats);
        if (cats.length > 0) setKategori(cats[0]);

        const pkgs = [...new Set(qList.map((q) => (q.paket ? q.paket.toString() : '1')))].sort();
        setAvailablePackages(pkgs);
        if (pkgs.length > 0) setPaket(pkgs[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startKuis = async () => {
    if (!kategori || !paket) return alert('Pilih kategori dan paket soal terlebih dahulu!');

    const currentUserId = user._id || user.id;

    // Cek apakah user sudah pernah mengerjakan kombinasi Kategori + Paket + Kesulitan ini
    const resUser = await fetch('/api/admin/users');
    const dataUser = await resUser.json();
    if (dataUser.success) {
      const hasDone = (dataUser.results || []).some(
        (r) =>
          (r.userId === currentUserId || r.userId === currentUserId?.toString()) &&
          r.kategori === kategori &&
          (r.paket ? r.paket.toString() : '1') === paket.toString() &&
          (r.tingkatKesulitan || 'sedang') === tingkatKesulitan
      );
      if (hasDone) {
        setAlreadyTaken(true);
        return;
      }
    }

    const filtered = allQuestions.filter(
      (q) =>
        q.kategori === kategori &&
        (q.paket ? q.paket.toString() : '1') === paket.toString() &&
        (q.tingkatKesulitan || 'sedang') === tingkatKesulitan
    );

    if (filtered.length === 0) {
      alert(`Belum ada soal untuk kategori ${kategori.toUpperCase()} Paket ${paket} (${tingkatKesulitan.toUpperCase()})`);
      return;
    }

    setQuestions(filtered);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSkippedQuestions({});
    setIsDone(false);
    setAlreadyTaken(false);
  };

  const handleSelectOption = (opsiIdx) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: opsiIdx,
    });

    // Jika soal ini tadinya di-skip (kuning), hapus dari daftar skipped setelah dijawab
    if (skippedQuestions[currentIndex]) {
      const copySkipped = { ...skippedQuestions };
      delete copySkipped[currentIndex];
      setSkippedQuestions(copySkipped);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    // Tandai soal ini sebagai di-skip (kuning) jika belum ada jawaban yang dipilih
    if (selectedAnswers[currentIndex] === undefined) {
      setSkippedQuestions({
        ...skippedQuestions,
        [currentIndex]: true,
      });
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Cek apakah masih ada soal yang di-skip atau belum dijawab
    const unansweredCount = questions.filter((_, idx) => selectedAnswers[idx] === undefined).length;

    if (unansweredCount > 0) {
      alert(`Kamu belum dapat menyelesaikan kuis! Masih ada ${unansweredCount} soal yang belum dijawab atau dilewati (warna kuning). Harap selesaikan seluruh soal terlebih dahulu.`);
      return;
    }

    if (!confirm('Apakah kamu yakin ingin menyelesaikan kuis ini?')) return;

    let totalCorrect = 0;
    const detailJawaban = questions.map((q, idx) => {
      const selectedIdx = selectedAnswers[idx];
      const isCorrect = selectedIdx !== undefined && selectedIdx === q.jawabanBenar;
      if (isCorrect) totalCorrect += 1;

      return {
        soal: q.soal,
        jawabanSiswa: selectedIdx !== undefined ? q.opsi[selectedIdx] : 'Tidak dijawab',
        jawabanBenar: q.opsi[q.jawabanBenar],
        isCorrect: isCorrect,
      };
    });

    const finalSkor = Math.round((totalCorrect / questions.length) * 100);

    try {
      await fetch('/api/kuis/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id || user.id,
          nama: user.nama || user.username,
          kategori,
          paket: paket.toString(),
          tingkatKesulitan,
          skor: finalSkor,
          detailJawaban,
        }),
      });
      setIsDone(true);
      fetchInitialData(user._id || user.id);
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim hasil kuis');
    }
  };

  const resetQuizState = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSkippedQuestions({});
    setIsDone(false);
    setAlreadyTaken(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (!user) return null;

  const totalKuis = userResults.length;
  const totalNilai = userResults.reduce((acc, curr) => acc + (curr.skor || 0), 0);
  const avgSkor = totalKuis > 0 ? Math.round(totalNilai / totalKuis) : 0;

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh', padding: '15px', boxSizing: 'border-box' }}>
      
      <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <strong style={{ fontSize: '16px', display: 'block' }}>Portal Siswa</strong>
          <small style={{ color: '#666', fontSize: '12px' }}>({user.nama || user.username})</small>
        </div>
        
        <button
          onClick={() => setIsMenuOpen(true)}
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '0 4px' }}
        >
          ☰
        </button>
      </div>

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

                <button
                  onClick={() => {
                    setActiveTab('activity');
                    resetQuizState();
                    setIsMenuOpen(false);
                  }}
                  style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: activeTab === 'activity' ? '#0275d8' : '#fff',
                    color: activeTab === 'activity' ? '#fff' : '#333',
                    fontWeight: activeTab === 'activity' ? 'bold' : 'normal',
                    cursor: 'pointer'
                  }}
                >
                  Aktivitas Kuis
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

      <div>
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '15px' }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#333' }}>
                Selamat Datang, {user.nama || user.username}
              </h2>
              <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                Pilih menu Kerjakan Kuis pada navigasi untuk memulai latihan kuis.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                <span style={{ display: 'block', color: '#666', fontSize: '12px' }}>Kuis Dikerjakan</span>
                <strong style={{ fontSize: '20px', color: '#333' }}>{totalKuis}</strong>
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                <span style={{ display: 'block', color: '#666', fontSize: '12px' }}>Total Nilai</span>
                <strong style={{ fontSize: '20px', color: '#333' }}>{totalNilai}</strong>
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                <span style={{ display: 'block', color: '#666', fontSize: '12px' }}>Rata-rata Skor</span>
                <strong style={{ fontSize: '20px', color: '#333' }}>{avgSkor}</strong>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', overflow: 'hidden' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '15px' }}>Aktivitas Kuis Terbaru</h3>
            {userResults.length === 0 ? (
              <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Belum ada riwayat kuis yang dikerjakan.</p>
            ) : (
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '350px' }}>
                  <thead>
                    <tr style={{ background: '#eee', textAlign: 'left', fontSize: '13px' }}>
                      <th style={{ padding: '8px', border: '1px solid #ddd' }}>Mata Pelajaran</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd' }}>Paket</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd' }}>Kesulitan</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', width: '60px' }}>Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userResults.map((r, idx) => (
                      <tr key={idx} style={{ fontSize: '13px' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          {r.kategori === 'matematika' ? 'Matematika' : r.kategori === 'bahasa_indonesia' ? 'Bahasa Indonesia' : r.kategori}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{r.paket || '1'}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{r.tingkatKesulitan || 'sedang'}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}><b>{r.skor}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quiz' && (
          <div>
            {alreadyTaken && (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                <h3 style={{ color: '#d9534f', margin: '0 0 10px 0', fontSize: '16px' }}>Kuis Sudah Dikerjakan</h3>
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '15px' }}>
                  Kamu sudah pernah mengerjakan kuis kategori <b>{kategori === 'matematika' ? 'Matematika' : 'Bahasa Indonesia'}</b> Paket <b>{paket}</b> ({tingkatKesulitan.toUpperCase()}). Kuis hanya dapat dikerjakan 1 kali.
                </p>
                <button
                  onClick={() => setAlreadyTaken(false)}
                  style={{ padding: '8px 16px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                >
                  Pilih Paket Lain
                </button>
              </div>
            )}

            {isDone && (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 6px 0', color: '#5cb85c', fontSize: '16px' }}>Kuis Telah Selesai</h3>
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '15px' }}>
                  Seluruh jawaban kamu berhasil disimpan ke sistem.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('activity');
                    resetQuizState();
                  }}
                  style={{ padding: '8px 16px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  Lihat Hasil
                </button>
              </div>
            )}

            {!alreadyTaken && !isDone && questions.length === 0 && (
              <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
                <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '15px' }}>Pilih Parameter Kuis</h3>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Kategori Soal:</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', boxSizing: 'border-box' }}
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
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Paket Soal:</label>
                  <select
                    value={paket}
                    onChange={(e) => setPaket(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    {availablePackages.length === 0 ? (
                      <option value="">Tidak ada paket tersedia</option>
                    ) : (
                      availablePackages.map((p, idx) => (
                        <option key={idx} value={p}>{p}</option>
                      ))
                    )}
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Tingkat Kesulitan:</label>
                  <select
                    value={tingkatKesulitan}
                    onChange={(e) => setTingkatKesulitan(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </div>

                <button
                  onClick={startKuis}
                  disabled={availableCategories.length === 0}
                  style={{ width: '100%', padding: '10px', background: availableCategories.length > 0 ? '#5cb85c' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  Mulai Kuis
                </button>
              </div>
            )}

            {!alreadyTaken && !isDone && questions.length > 0 && (
              <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
                
                {/* NAVIGASI NOMOR SOAL & INDIKATOR WARNA (KUNING / HIJAU / ABU) */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {questions.map((_, idx) => {
                    const isCurrent = idx === currentIndex;
                    const isAnswered = selectedAnswers[idx] !== undefined;
                    const isSkipped = skippedQuestions[idx] && !isAnswered;

                    let bgColor = '#eee';
                    let textColor = '#333';

                    if (isAnswered) {
                      bgColor = '#5cb85c'; // Hijau jika sudah dijawab
                      textColor = '#fff';
                    } else if (isSkipped) {
                      bgColor = '#f0ad4e'; // Kuning jika di-skip
                      textColor = '#fff';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: isCurrent ? '2px solid #000' : 'none',
                          borderRadius: '4px',
                          background: bgColor,
                          color: textColor,
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', marginBottom: '8px' }}>
                  SOAL {currentIndex + 1} DARI {questions.length} • PAKET: {paket}
                </div>

                <h3 style={{ fontSize: '14px', color: '#333', margin: '0 0 15px 0', lineHeight: '1.4' }}>
                  {questions[currentIndex]?.soal}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {questions[currentIndex]?.opsi.map((opsiText, idx) => {
                    const isSelected = selectedAnswers[currentIndex] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          padding: '10px 12px',
                          border: isSelected ? '1px solid #0275d8' : '1px solid #ccc',
                          borderRadius: '4px',
                          background: isSelected ? '#e7f1ff' : '#fff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <strong style={{
                          minWidth: '22px',
                          height: '22px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isSelected ? '#0275d8' : '#eee',
                          color: isSelected ? '#fff' : '#333',
                          borderRadius: '3px',
                          marginRight: '10px',
                          fontSize: '12px'
                        }}>
                          {String.fromCharCode(65 + idx)}
                        </strong>
                        <span style={{ wordBreak: 'break-word', color: '#333' }}>{opsiText}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TOMBOL NAVIGASI: KEMBALI, LEWATI, SELANJUTNYA / SELESAI */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    style={{
                      padding: '8px 12px',
                      background: currentIndex === 0 ? '#eee' : '#666',
                      color: currentIndex === 0 ? '#aaa' : '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    Kembali
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={handleSkip}
                      style={{
                        padding: '8px 12px',
                        background: '#f0ad4e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      Lewati
                    </button>

                    {currentIndex + 1 < questions.length ? (
                      <button
                        onClick={handleNext}
                        style={{
                          padding: '8px 12px',
                          background: '#0275d8',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Selanjutnya
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        style={{
                          padding: '8px 14px',
                          background: '#5cb85c',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Selesai Kuis
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
