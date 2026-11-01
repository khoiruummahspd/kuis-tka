'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Form States
  const [studentForm, setStudentForm] = useState({ nama: '', username: '', password: '123' });
  const [editUser, setEditUser] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [questionForm, setQuestionForm] = useState({
    kategori: 'matematika',
    soal: '',
    opsi: ['', '', '', ''],
    jawabanBenar: 0,
  });

  const router = useRouter();

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      router.push('/');
      return;
    }

    const parsed = JSON.parse(rawUser);
    if (parsed.role !== 'admin') {
      router.push('/kuis');
      return;
    }
    setUser(parsed);

    fetchDashboardData();
    const timer = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [resUsers, resQ] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/questions')
      ]);

      const dataUsers = await resUsers.json();
      const dataQ = await resQ.json();

      if (dataUsers.success) {
        setUsers(dataUsers.users || []);
        setResults(dataUsers.results || []);
      }
      if (dataQ.success) {
        setQuestions(dataQ.questions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentForm),
    });

    if (!res.ok) return alert('Gagal menambah siswa');
    
    setStudentForm({ nama: '', username: '', password: '123' });
    fetchDashboardData();
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: editUser._id,
        nama: editUser.nama,
        username: editUser.username,
        newPassword: editUser.password,
      }),
    });

    if (!res.ok) return alert('Gagal memperbarui siswa');

    setEditUser(null);
    fetchDashboardData();
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Hapus akun siswa ini?')) return;
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    fetchDashboardData();
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionForm),
    });

    if (!res.ok) return alert('Gagal menambah soal');

    setQuestionForm({ kategori: 'matematika', soal: '', opsi: ['', '', '', ''], jawabanBenar: 0 });
    fetchDashboardData();
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background-color: #f7f4ed; }
      `}</style>

      {/* TOPBAR NAV */}
      <header style={styles.header}>
        <div style={styles.logo}>Kuis TKA <span style={styles.adminBadge}>Admin</span></div>
        <div style={styles.navRight}>
          <span style={styles.userText}>Halo, <strong>{user.nama || user.username}</strong></span>
          <button onClick={handleLogout} style={styles.btnLogout}>Logout</button>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <main style={styles.mainContainer}>
        {/* TABS NAVIGATION */}
        <div style={styles.tabBar}>
          <button
            onClick={() => setActiveTab('overview')}
            style={activeTab === 'overview' ? styles.activeTabBtn : styles.tabBtn}
          >
            📊 Ringkasan Live
          </button>
          <button
            onClick={() => setActiveTab('students')}
            style={activeTab === 'students' ? styles.activeTabBtn : styles.tabBtn}
          >
            👥 Kelola Siswa
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            style={activeTab === 'questions' ? styles.activeTabBtn : styles.tabBtn}
          >
            📝 Bank Soal ({questions.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & MONITORING LIVE */}
        {activeTab === 'overview' && (
          <div style={styles.tabContent}>
            <div style={styles.metricsGrid}>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Total Siswa</span>
                <h2 style={styles.metricValue}>{users.length}</h2>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Total Soal Aktif</span>
                <h2 style={styles.metricValue}>{questions.length}</h2>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Kuis Terselesaikan</span>
                <h2 style={styles.metricValue}>{results.length}</h2>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Live Status Siswa & Hasil Kuis</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Nama Siswa</th>
                      <th style={styles.th}>Username</th>
                      <th style={styles.th}>Perolehan Skor</th>
                      <th style={styles.th}>Detail Lembar Jawaban</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const userScores = results.filter((r) => r.userId === u._id);
                      return (
                        <tr key={u._id} style={styles.tr}>
                          <td style={styles.td}><strong>{u.nama || u.username}</strong></td>
                          <td style={styles.td}>{u.username}</td>
                          <td style={styles.td}>
                            {userScores.length > 0 ? (
                              userScores.map((s, idx) => (
                                <span key={idx} style={styles.scorePill}>
                                  {s.kategori === 'matematika' ? 'MTK' : 'B.Indo'}: <b>{s.skor}</b>
                                </span>
                              ))
                            ) : (
                              <span style={{ color: '#aaa' }}>Belum Mengerjakan</span>
                            )}
                          </td>
                          <td style={styles.td}>
                            {userScores.length > 0 ? (
                              userScores.map((s, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedDetail(s)}
                                  style={styles.btnDetail}
                                >
                                  Cek {s.kategori === 'matematika' ? 'MTK' : 'B.Indo'}
                                </button>
                              ))
                            ) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KELOLA SISWA */}
        {activeTab === 'students' && (
          <div style={styles.tabContent}>
            <div style={{ ...styles.card, marginBottom: '24px' }}>
              <h3 style={styles.cardTitle}>Tambah Akun Siswa Baru</h3>
              <form onSubmit={handleAddStudent} style={styles.formGrid}>
                <input
                  type="text"
                  placeholder="Nama Lengkap Siswa"
                  value={studentForm.nama}
                  onChange={(e) => setStudentForm({ ...studentForm, nama: e.target.value })}
                  required
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={studentForm.username}
                  onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })}
                  required
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Password Default"
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  required
                  style={styles.input}
                />
                <button type="submit" style={styles.btnOrange}>+ Simpan Siswa</button>
              </form>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Daftar Akun Siswa</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nama</th>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={styles.tr}>
                      <td style={styles.td}>{u.nama}</td>
                      <td style={styles.td}>{u.username}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => setEditUser({ _id: u._id, nama: u.nama, username: u.username, password: '' })}
                          style={styles.btnActionEdit}
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteUser(u._id)} style={styles.btnActionDelete}>Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BANK SOAL */}
        {activeTab === 'questions' && (
          <div style={styles.tabContent}>
            <div style={{ ...styles.card, marginBottom: '24px' }}>
              <h3 style={styles.cardTitle}>Buat Soal Kuis Baru</h3>
              <form onSubmit={handleAddQuestion}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={styles.label}>Kategori Soal</label>
                  <select
                    value={questionForm.kategori}
                    onChange={(e) => setQuestionForm({ ...questionForm, kategori: e.target.value })}
                    style={styles.input}
                  >
                    <option value="matematika">Matematika</option>
                    <option value="bahasa_indonesia">Bahasa Indonesia</option>
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={styles.label}>Pertanyaan Soal</label>
                  <input
                    type="text"
                    placeholder="Tuliskan teks pertanyaan..."
                    value={questionForm.soal}
                    onChange={(e) => setQuestionForm({ ...questionForm, soal: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>

                <label style={styles.label}>Pilihan Jawaban</label>
                <div style={styles.opsiGrid}>
                  {questionForm.opsi.map((op, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                      value={op}
                      onChange={(e) => {
                        const nextOpsi = [...questionForm.opsi];
                        nextOpsi[idx] = e.target.value;
                        setQuestionForm({ ...questionForm, opsi: nextOpsi });
                      }}
                      required
                      style={styles.input}
                    />
                  ))}
                </div>

                <div style={{ margin: '14px 0 20px 0' }}>
                  <label style={styles.label}>Kunci Jawaban yang Benar</label>
                  <select
                    value={questionForm.jawabanBenar}
                    onChange={(e) => setQuestionForm({ ...questionForm, jawabanBenar: parseInt(e.target.value) })}
                    style={styles.input}
                  >
                    <option value={0}>Pilihan A</option>
                    <option value={1}>Pilihan B</option>
                    <option value={2}>Pilihan C</option>
                    <option value={3}>Pilihan D</option>
                  </select>
                </div>

                <button type="submit" style={styles.btnOrange}>+ Simpan Soal Kuis</button>
              </form>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Daftar Soal Tersimpan</h3>
              {questions.map((q, idx) => (
                <div key={q._id || idx} style={styles.questionItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={styles.badgeCategory}>{q.kategori === 'matematika' ? 'Matematika' : 'Bahasa Indonesia'}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>Soal #{idx + 1}</span>
                  </div>
                  <strong style={{ fontSize: '15px', color: '#2d2d2d' }}>{q.soal}</strong>
                  <div style={styles.opsiPreview}>
                    {q.opsi.map((op, i) => (
                      <span key={i} style={i === q.jawabanBenar ? styles.opsiCorrect : styles.opsiNormal}>
                        {String.fromCharCode(65 + i)}. {op}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL EDIT SISWA */}
      {editUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.cardTitle}>Edit Akun Siswa</h3>
            <form onSubmit={handleSaveEditUser}>
              <input
                type="text"
                value={editUser.nama}
                onChange={(e) => setEditUser({ ...editUser, nama: e.target.value })}
                required
                style={{ ...styles.input, marginBottom: '10px' }}
              />
              <input
                type="text"
                value={editUser.username}
                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                required
                style={{ ...styles.input, marginBottom: '10px' }}
              />
              <input
                type="password"
                placeholder="Password Baru (Kosongkan jika tak diubah)"
                value={editUser.password}
                onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                style={{ ...styles.input, marginBottom: '16px' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditUser(null)} style={styles.btnCancel}>Batal</button>
                <button type="submit" style={styles.btnOrange}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL JAWABAN */}
      {selectedDetail && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '520px' }}>
            <h3 style={styles.cardTitle}>Lembar Jawaban: {selectedDetail.nama}</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
              Kategori: <b>{selectedDetail.kategori}</b> | Nilai Akhir: <b>{selectedDetail.skor}</b>
            </p>
            <div style={{ maxHeight: '320px', overflowY: 'auto', marginBottom: '16px' }}>
              {selectedDetail.detailJawaban?.map((d, i) => (
                <div key={i} style={styles.answerItem}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: '600', fontSize: '13px' }}>{i + 1}. {d.soal}</p>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}>Jawaban Siswa: <b>{d.jawabanSiswa}</b></p>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}>
                    Status: {d.isCorrect ? <span style={{ color: '#16a34a', fontWeight: '700' }}>BENAR</span> : <span style={{ color: '#dc2626', fontWeight: '700' }}>SALAH (Kunci: {d.jawabanBenar})</span>}
                  </p>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedDetail(null)} style={styles.btnOrange}>Tutup</button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span>© 2026 <strong>tka lidam</strong>. admin control panel.</span>
      </footer>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    backgroundColor: '#f7f4ed',
    color: '#2d2d2d',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #eae5d9',
  },
  logo: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1a1a1a',
  },
  adminBadge: {
    fontSize: '11px',
    backgroundColor: '#f6ca85',
    padding: '3px 8px',
    borderRadius: '6px',
    marginLeft: '6px',
    fontWeight: '700',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userText: {
    fontSize: '13px',
    color: '#555',
  },
  btnLogout: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e2ddd0',
    backgroundColor: '#faf8f5',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  mainContainer: {
    flex: 1,
    maxWidth: '1000px',
    width: '100%',
    margin: '0 auto',
    padding: '30px 20px',
  },
  tabBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
  },
  tabBtn: {
    padding: '10px 18px',
    borderRadius: '10px',
    border: '1px solid #e2ddd0',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
    cursor: 'pointer',
  },
  activeTabBtn: {
    padding: '10px 18px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#f6ca85',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1a1a1a',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(246, 202, 133, 0.4)',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  metricCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #eae5d9',
    boxShadow: '0 10px 20px rgba(0,0,0,0.02)',
  },
  metricLabel: {
    fontSize: '12px',
    color: '#777',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1a1a1a',
    margin: '6px 0 0 0',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '28px',
    border: '1px solid #eae5d9',
    boxShadow: '0 10px 25px rgba(0,0,0,0.02)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 20px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 14px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#888',
    borderBottom: '1px solid #eee',
  },
  tr: {
    borderBottom: '1px solid #fafafa',
  },
  td: {
    padding: '14px',
    fontSize: '13px',
    color: '#333',
  },
  scorePill: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#faf8f5',
    border: '1px solid #e2ddd0',
    borderRadius: '6px',
    fontSize: '12px',
    marginRight: '6px',
  },
  btnDetail: {
    padding: '4px 10px',
    fontSize: '11px',
    borderRadius: '6px',
    border: '1px solid #e2ddd0',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    marginRight: '4px',
    fontWeight: '600',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #e2ddd0',
    backgroundColor: '#faf8f5',
    fontSize: '13px',
    outline: 'none',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '6px',
  },
  btnOrange: {
    padding: '12px 20px',
    backgroundColor: '#f6ca85',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1a1a1a',
    cursor: 'pointer',
  },
  btnCancel: {
    padding: '12px 20px',
    backgroundColor: '#faf8f5',
    border: '1px solid #e2ddd0',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    cursor: 'pointer',
  },
  btnActionEdit: {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '6px',
    border: '1px solid #e2ddd0',
    backgroundColor: '#ffffff',
    marginRight: '6px',
    cursor: 'pointer',
  },
  btnActionDelete: {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    cursor: 'pointer',
    fontWeight: '600',
  },
  opsiGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  questionItem: {
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #eae5d9',
    backgroundColor: '#faf8f5',
    marginBottom: '12px',
  },
  badgeCategory: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#e2ddd0',
    padding: '2px 8px',
    borderRadius: '4px',
    color: '#444',
  },
  opsiPreview: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '10px',
    fontSize: '12px',
  },
  opsiNormal: {
    color: '#666',
  },
  opsiCorrect: {
    color: '#16a34a',
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: '20px',
  },
  modalCard: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
  answerItem: {
    padding: '10px',
    borderBottom: '1px solid #eee',
  },
  footer: {
    textAlign: 'center',
    padding: '24px 20px',
    fontSize: '13px',
    color: '#777777',
    borderTop: '1px solid #eee8db',
    backgroundColor: '#f7f4ed',
  },
};
