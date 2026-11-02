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
    paket: 1,
    tingkatKesulitan: 'sedang',
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
        fetch('/api/admin/questions'),
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

    setQuestionForm({ paket: 1, tingkatKesulitan: 'sedang', kategori: 'matematika', soal: '', opsi: ['', '', '', ''], jawabanBenar: 0 });
    fetchDashboardData();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = JSON.parse(event.target.result);
        const res = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonContent),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          alert(data.message || 'Berhasil upload soal!');
          fetchDashboardData();
        } else {
          alert(data.message || 'Gagal upload file JSON');
        }
      } catch (err) {
        alert('Format file JSON tidak valid!');
      }
    };
    reader.readAsText(file);
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

        #header-outer.scrolled {
          background-color: #1e293b;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        }

        .sidebar-nav-link {
          color: #94a3b8;
          transition: background-color 0.2s, color 0.2s;
          cursor: pointer;
        }

        .sidebar-nav-link:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .sidebar-nav-link.active {
          background-color: rgba(255, 255, 255, 0.07);
          color: #ffffff;
          font-weight: 600;
          position: relative;
        }

        .sidebar-nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 60%;
          width: 4px;
          background-color: #f6ca85;
          border-radius: 0 4px 4px 0;
        }

        .header-link {
          color: #334155;
          cursor: pointer;
        }

        .header-link:hover, .header-link.active {
          color: #d97706;
          font-weight: 700;
        }
      `}</style>

      {/* HEADER NAV */}
      <header id="header-outer" style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brand}>
            <span style={{ color: '#2563eb', fontWeight: '800' }}>ZEY</span>
            <span style={{ color: '#d97706', fontWeight: '800' }}>VERSE</span>
            <span style={styles.roleBadge}>ADMIN</span>
          </div>

          <nav style={styles.desktopNav}>
            <span
              onClick={() => setActiveTab('overview')}
              className={`header-link ${activeTab === 'overview' ? 'active' : ''}`}
            >
              OVERVIEW
            </span>
            <span
              onClick={() => setActiveTab('students')}
              className={`header-link ${activeTab === 'students' ? 'active' : ''}`}
            >
              DATA SISWA
            </span>
            <span
              onClick={() => setActiveTab('questions')}
              className={`header-link ${activeTab === 'questions' ? 'active' : ''}`}
            >
              BANK SOAL
            </span>
            <span
              onClick={() => setActiveTab('stats')}
              className={`header-link ${activeTab === 'stats' ? 'active' : ''}`}
            >
              HASIL & STATISTIK
            </span>
            <span
              onClick={() => setActiveTab('account')}
              className={`header-link ${activeTab === 'account' ? 'active' : ''}`}
            >
              PENGATURAN AKUN
            </span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>{user.nama || user.username}</span>
            <button onClick={handleLogout} style={styles.btnLogout}>
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main style={styles.mainContainer}>
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>TOTAL SISWA</span>
                <span style={styles.statValue}>{users.length}</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>TOTAL SOAL</span>
                <span style={styles.statValue}>{questions.length}</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>KUIS SELESAI</span>
                <span style={styles.statValue}>{results.length}</span>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Aktivitas Pengerjaan Terbaru</h3>
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

        {/* DATA SISWA */}
        {activeTab === 'students' && (
          <div>
            <div style={{ ...styles.card, marginBottom: '20px' }}>
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
                <button type="submit" style={styles.btnPrimary}>+ Tambah Siswa</button>
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

        {/* BANK SOAL */}
        {activeTab === 'questions' && (
          <div>
            <div style={{ ...styles.card, marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ ...styles.cardTitle, margin: 0 }}>Kelola Soal Kuis</h3>
                <label style={styles.btnUpload}>
                  📁 Import Bulk JSON
                  <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              <form onSubmit={handleAddQuestion}>
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Paket Soal</label>
                    <input
                      type="number"
                      value={questionForm.paket}
                      onChange={(e) => setQuestionForm({ ...questionForm, paket: parseInt(e.target.value) || 1 })}
                      required
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Tingkat Kesulitan</label>
                    <select
                      value={questionForm.tingkatKesulitan}
                      onChange={(e) => setQuestionForm({ ...questionForm, tingkatKesulitan: e.target.value })}
                      style={styles.input}
                    >
                      <option value="mudah">Mudah</option>
                      <option value="sedang">Sedang</option>
                      <option value="sulit">Sulit</option>
                    </select>
                  </div>
                  <div>
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
                </div>

                <div style={{ margin: '14px 0' }}>
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
                <div style={styles.grid2}>
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

                <div style={{ margin: '14px 0 18px 0' }}>
                  <label style={styles.label}>Kunci Jawaban Benar</label>
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

                <button type="submit" style={styles.btnPrimary}>+ Simpan Soal Manual</button>
              </form>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Daftar Soal Tersimpan ({questions.length})</h3>
              {questions.map((q, idx) => (
                <div key={q._id || idx} style={styles.itemBox}>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#666', marginBottom: '6px' }}>
                    <span style={styles.badgeTag}>{q.kategori?.toUpperCase()}</span>
                    <span style={styles.badgeTag}>PAKET {q.paket || 1}</span>
                    <span style={styles.badgeTag}>{(q.tingkatKesulitan || 'SEDANG').toUpperCase()}</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#1e293b' }}>{q.soal}</strong>
                  <div style={styles.grid2}>
                    {q.opsi?.map((op, i) => (
                      <span key={i} style={{ fontSize: '12px', color: i === q.jawabanBenar ? '#16a34a' : '#64748b', fontWeight: i === q.jawabanBenar ? '700' : '400' }}>
                        {String.fromCharCode(65 + i)}. {op}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HASIL & STATISTIK */}
        {activeTab === 'stats' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Lembar Hasil Kuis Siswa</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Siswa</th>
                  <th style={styles.th}>Kategori</th>
                  <th style={styles.th}>Skor</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx} style={styles.tr}>
                    <td style={styles.td}><strong>{r.nama}</strong></td>
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

        {/* PENGATURAN AKUN */}
        {activeTab === 'account' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Informasi Akun Administrator</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#334155' }}>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Role Status:</strong> Super Administrator</p>
              <p><strong>Database:</strong> MongoDB Atlas (Active)</p>
            </div>
          </div>
        )}
      </main>

      {/* MODAL EDIT SISWA */}
      {editUser && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.cardTitle}>Edit Data Siswa</h3>
            <form onSubmit={handleSaveEditUser}>
              <input type="text" value={editUser.nama} onChange={(e) => setEditUser({ ...editUser, nama: e.target.value })} required style={{ ...styles.input, marginBottom: '10px' }} />
              <input type="text" value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} required style={{ ...styles.input, marginBottom: '10px' }} />
              <input type="password" placeholder="Password Baru (Kosongkan bila tak diubah)" value={editUser.password} onChange={(e) => setEditUser({ ...editUser, password: e.target.value })} style={{ ...styles.input, marginBottom: '16px' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setEditUser(null)} style={styles.btnSec}>Batal</button>
                <button type="submit" style={styles.btnPrimary}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL LEMBAR JAWABAN */}
      {selectedDetail && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: '500px' }}>
            <h3 style={styles.cardTitle}>Detail Lembar: {selectedDetail.nama}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
              Kategori: {selectedDetail.kategori} | Skor Akhir: <b>{selectedDetail.skor}</b>
            </p>
            <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '16px' }}>
              {selectedDetail.detailJawaban?.map((d, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0', fontSize: '12px' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{i + 1}. {d.soal}</p>
                  <p style={{ margin: 0 }}>
                    Jawaban: <b>{d.jawabanSiswa}</b> | Status:{' '}
                    <span style={{ color: d.isCorrect ? '#16a34a' : '#dc2626', fontWeight: '700' }}>
                      {d.isCorrect ? 'BENAR' : `SALAH (Benar: ${d.jawabanBenar})`}
                    </span>
                  </p>
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
  pageWrapper: { minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#f7f4ed', color: '#0f172a' },
  header: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40 },
  headerInner: { maxWidth: '1000px', margin: '0 auto', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '18px' },
  roleBadge: { fontSize: '10px', backgroundColor: '#f6ca85', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', marginLeft: '4px' },
  desktopNav: { display: 'flex', gap: '20px', fontSize: '13px', fontWeight: '600' },
  btnLogout: { padding: '6px 14px', fontSize: '12px', fontWeight: '700', borderRadius: '6px', border: 'none', backgroundColor: '#f6ca85', color: '#0f172a', cursor: 'pointer' },
  mainContainer: { maxWidth: '1000px', margin: '0 auto', padding: '24px 20px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' },
  statCard: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' },
  statLabel: { fontSize: '11px', fontWeight: '700', color: '#64748b' },
  statValue: { display: 'block', fontSize: '32px', fontWeight: '800', color: '#0f172a', marginTop: '4px' },
  card: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' },
  cardTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '10px', fontSize: '12px', fontWeight: '700', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 10px', fontSize: '13px', color: '#334155' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13px', outline: 'none' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' },
  btnPrimary: { padding: '10px 18px', backgroundColor: '#f6ca85', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#0f172a', cursor: 'pointer' },
  btnSec: { padding: '6px 12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  btnDanger: { padding: '6px 12px', backgroundColor: '#fef2f2', border: 'none', color: '#dc2626', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', marginLeft: '6px', fontWeight: '600' },
  btnUpload: { padding: '8px 14px', backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  itemBox: { padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px', backgroundColor: '#f8fafc' },
  badgeTag: { fontSize: '10px', fontWeight: '700', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#334155' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', zIndex: 50 },
  modal: { width: '100%', maxWidth: '400px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px' },
};
