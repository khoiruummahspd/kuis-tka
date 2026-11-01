'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);

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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background-color: #f7f4ed; }
      `}</style>

      {/* NAVBAR ATAS UTAMA */}
      <header style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={styles.logoText}>Kuis TKA</span>
          <span style={styles.roleTag}>Admin Panel</span>
        </div>

        <nav style={styles.navMenu}>
          <button
            onClick={() => setActiveTab('overview')}
            style={activeTab === 'overview' ? styles.navItemActive : styles.navItem}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('students')}
            style={activeTab === 'students' ? styles.navItemActive : styles.navItem}
          >
            Data Siswa
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            style={activeTab === 'questions' ? styles.navItemActive : styles.navItem}
          >
            Bank Soal
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            style={activeTab === 'stats' ? styles.navItemActive : styles.navItem}
          >
            Hasil & Statistik
          </button>
          <button
            onClick={() => setActiveTab('account')}
            style={activeTab === 'account' ? styles.navItemActive : styles.navItem}
          >
            Pengaturan Akun
          </button>
        </nav>

        <div style={styles.navProfile}>
          <span style={styles.adminName}>{user.nama || user.username}</span>
          <button onClick={handleLogout} style={styles.btnLogout}>Logout</button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main style={styles.container}>

        {/* 1. HALAMAN OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <span style={styles.statTitle}>TOTAL SISWA</span>
                <span style={styles.statNumber}>{users.length}</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statTitle}>TOTAL SOAL</span>
                <span style={styles.statNumber}>{questions.length}</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statTitle}>KUIS SELESAI</span>
                <span style={styles.statNumber}>{results.length}</span>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardHeader}>Aktivitas Pengerjaan Terakhir</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nama Siswa</th>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>Matematika</th>
                    <th style={styles.th}>Bahasa Indonesia</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const mtk = results.find((r) => r.userId === u._id && r.kategori === 'matematika');
                    const indo = results.find((r) => r.userId === u._id && r.kategori === 'bahasa_indonesia');
                    return (
                      <tr key={u._id} style={styles.tr}>
                        <td style={styles.td}><strong>{u.nama || u.username}</strong></td>
                        <td style={styles.td}>{u.username}</td>
                        <td style={styles.td}>{mtk ? mtk.skor : '-'}</td>
                        <td style={styles.td}>{indo ? indo.skor : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. HALAMAN DATA SISWA */}
        {activeTab === 'students' && (
          <div>
            <div style={{ ...styles.card, marginBottom: '20px' }}>
              <h3 style={styles.cardHeader}>Tambah Akun Siswa</h3>
              <form onSubmit={handleAddStudent} style={styles.formRow}>
                <input
                  type="text"
                  placeholder="Nama Lengkap"
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
                <button type="submit" style={styles.btnPrimary}>Tambah Siswa</button>
              </form>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardHeader}>Daftar Akun Siswa</h3>
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
                          style={styles.btnSec}
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteUser(u._id)} style={styles.btnDanger}>Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. HALAMAN BANK SOAL */}
        {activeTab === 'questions' && (
          <div>
            <div style={{ ...styles.card, marginBottom: '20px' }}>
              <h3 style={styles.cardHeader}>Tambah Soal Baru</h3>
              <form onSubmit={handleAddQuestion}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.label}>Kategori</label>
                  <select
                    value={questionForm.kategori}
                    onChange={(e) => setQuestionForm({ ...questionForm, kategori: e.target.value })}
                    style={styles.input}
                  >
                    <option value="matematika">Matematika</option>
                    <option value="bahasa_indonesia">Bahasa Indonesia</option>
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.label}>Teks Soal</label>
                  <input
                    type="text"
                    placeholder="Masukkan pertanyaan"
                    value={questionForm.soal}
                    onChange={(e) => setQuestionForm({ ...questionForm, soal: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>

                <label style={styles.label}>Pilihan Jawaban</label>
                <div style={styles.grid2}>
                  {questionForm.opsi.map((op, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
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

                <div style={{ margin: '12px 0 18px 0' }}>
                  <label style={styles.label}>Kunci Jawaban</label>
                  <select
                    value={questionForm.jawabanBenar}
                    onChange={(e) => setQuestionForm({ ...questionForm, jawabanBenar: parseInt(e.target.value) })}
                    style={styles.input}
                  >
                    <option value={0}>Opsi A</option>
                    <option value={1}>Opsi B</option>
                    <option value={2}>Opsi C</option>
                    <option value={3}>Opsi D</option>
                  </select>
                </div>

                <button type="submit" style={styles.btnPrimary}>Simpan Soal</button>
              </form>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardHeader}>Daftar Soal Aktif</h3>
              {questions.map((q, idx) => (
                <div key={q._id || idx} style={styles.itemBox}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                    {q.kategori.toUpperCase()} — Soal #{idx + 1}
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>{q.soal}</div>
                  <div style={styles.grid2}>
                    {q.opsi.map((op, i) => (
                      <span key={i} style={{ fontSize: '12px', color: i === q.jawabanBenar ? '#16a34a' : '#666', fontWeight: i === q.jawabanBenar ? '700' : '400' }}>
                        {String.fromCharCode(65 + i)}. {op}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. HALAMAN HASIL & STATISTIK */}
        {activeTab === 'stats' && (
          <div style={styles.card}>
            <h3 style={styles.cardHeader}>Rincian Hasil Lembar Jawaban</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Siswa</th>
                  <th style={styles.th}>Kategori</th>
                  <th style={styles.th}>Skor</th>
                  <th style={styles.th}>Detail Jawaban</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx} style={styles.tr}>
                    <td style={styles.td}>{r.nama}</td>
                    <td style={styles.td}>{r.kategori === 'matematika' ? 'Matematika' : 'Bahasa Indonesia'}</td>
                    <td style={styles.td}><strong>{r.skor}</strong></td>
                    <td style={styles.td}>
                      <button onClick={() => setSelectedDetail(r)} style={styles.btnSec}>Lihat Lembar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. HALAMAN PENGATURAN AKUN */}
        {activeTab === 'account' && (
          <div style={styles.card}>
            <h3 style={styles.cardHeader}>Informasi Akun Admin</h3>
            <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#444' }}>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Role:</strong> Administrator System</p>
              <p><strong>Status Koneksi:</strong> MongoDB Atlas Connected</p>
            </div>
          </div>
        )}

      </main>

      {/* MODALS */}
      {editUser && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h4 style={{ margin: '0 0 12px 0' }}>Edit Siswa</h4>
            <form onSubmit={handleSaveEditUser}>
              <input type="text" value={editUser.nama} onChange={(e) => setEditUser({ ...editUser, nama: e.target.value })} required style={{ ...styles.input, marginBottom: '8px' }} />
              <input type="text" value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} required style={{ ...styles.input, marginBottom: '8px' }} />
              <input type="password" placeholder="Password Baru (Kosongkan jika tidak ubah)" value={editUser.password} onChange={(e) => setEditUser({ ...editUser, password: e.target.value })} style={{ ...styles.input, marginBottom: '14px' }} />
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => setEditUser(null)} style={{ ...styles.btnSec, marginRight: '6px' }}>Batal</button>
                <button type="submit" style={styles.btnPrimary}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDetail && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: '480px' }}>
            <h4 style={{ margin: '0 0 4px 0' }}>Lembar Jawaban: {selectedDetail.nama}</h4>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>Kategori: {selectedDetail.kategori} | Skor: {selectedDetail.skor}</p>
            <div style={{ maxHeight: '260px', overflowY: 'auto', marginBottom: '14px' }}>
              {selectedDetail.detailJawaban?.map((d, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '12px' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{i + 1}. {d.soal}</p>
                  <p style={{ margin: 0 }}>Jawaban: {d.jawabanSiswa} | Status: <strong style={{ color: d.isCorrect ? '#16a34a' : '#dc2626' }}>{d.isCorrect ? 'BENAR' : `SALAH (Benar: ${d.jawabanBenar})`}</strong></p>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedDetail(null)} style={styles.btnPrimary}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageWrapper: { minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#f7f4ed', color: '#2d2d2d' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: '#ffffff', borderBottom: '1px solid #eae5d9' },
  navBrand: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoText: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a' },
  roleTag: { fontSize: '11px', backgroundColor: '#f6ca85', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' },
  navMenu: { display: 'flex', gap: '4px' },
  navItem: { padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', fontSize: '13px', fontWeight: '500', color: '#666', cursor: 'pointer' },
  navItemActive: { padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#f6ca85', fontSize: '13px', fontWeight: '700', color: '#1a1a1a', cursor: 'pointer' },
  navProfile: { display: 'flex', alignItems: 'center', gap: '12px' },
  adminName: { fontSize: '13px', fontWeight: '600', color: '#444' },
  btnLogout: { padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid #e2ddd0', backgroundColor: '#faf8f5', cursor: 'pointer', fontWeight: '600' },
  container: { maxWidth: '960px', margin: '0 auto', padding: '24px 16px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' },
  statBox: { backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #eae5d9', textAlign: 'center' },
  statTitle: { fontSize: '11px', color: '#888', fontWeight: '700', letterSpacing: '0.5px' },
  statNumber: { display: 'block', fontSize: '28px', fontWeight: '800', color: '#1a1a1a', marginTop: '4px' },
  card: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #eae5d9' },
  cardHeader: { fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0', color: '#1a1a1a' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '10px', fontSize: '12px', fontWeight: '700', color: '#888', borderBottom: '1px solid #eee' },
  tr: { borderBottom: '1px solid #fafafa' },
  td: { padding: '10px', fontSize: '13px', color: '#333' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2ddd0', backgroundColor: '#faf8f5', fontSize: '13px', outline: 'none' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '4px' },
  btnPrimary: { padding: '10px 16px', backgroundColor: '#f6ca85', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '700', color: '#1a1a1a', cursor: 'pointer' },
  btnSec: { padding: '5px 10px', backgroundColor: '#ffffff', border: '1px solid #e2ddd0', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' },
  btnDanger: { padding: '5px 10px', backgroundColor: '#fef2f2', border: 'none', color: '#dc2626', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', marginLeft: '4px' },
  itemBox: { padding: '12px', border: '1px solid #eae5d9', borderRadius: '8px', marginBottom: '8px', backgroundColor: '#faf8f5' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' },
  modal: { width: '100%', maxWidth: '360px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px' },
};
