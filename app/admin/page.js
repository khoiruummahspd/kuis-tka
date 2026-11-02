'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const menuItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Aktivitas Terbaru' },
    { id: 'students', label: 'Data Siswa' },
    { id: 'questions', label: 'Bank Soal' },
    { id: 'stats', label: 'Hasil & Statistik' },
    { id: 'account', label: 'Pengaturan Akun' },
  ];

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh', padding: '20px' }}>
      
      {/* HEADER BAR & TOMBOL GARIS TIGA (KANAN ATAS) */}
      <div style={{ background: '#fff', padding: '15px 20px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong style={{ fontSize: '18px', marginRight: '10px' }}>Admin Dashboard</strong>
          <small style={{ color: '#666' }}>({user.nama || user.username})</small>
        </div>
        
        {/* Tombol Garis Tiga */}
        <button
          onClick={() => setIsMenuOpen(true)}
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '0 8px' }}
        >
          ☰
        </button>
      </div>

      {/* OVERLAY & PANEL SIDEBAR MENU (MUNCUL DI KIRI) */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }}>
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '250px', background: '#fff', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '2px 0 8px rgba(0,0,0,0.1)' }}>
            
            {/* Draf Menu Atas */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Menu Admin</h3>
                <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuItems.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMenuOpen(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      background: activeTab === tab.id ? '#0275d8' : '#fff',
                      color: activeTab === tab.id ? '#fff' : '#333',
                      fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tombol Logout (Di Paling Bawah Menu) */}
            <button
              onClick={handleLogout}
              style={{ padding: '10px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div>
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
              <span style={{ display: 'block', color: '#666', fontSize: '14px' }}>Total Siswa</span>
              <strong style={{ fontSize: '28px' }}>{users.length}</strong>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
              <span style={{ display: 'block', color: '#666', fontSize: '14px' }}>Total Soal</span>
              <strong style={{ fontSize: '28px' }}>{questions.length}</strong>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
              <span style={{ display: 'block', color: '#666', fontSize: '14px' }}>Kuis Selesai</span>
              <strong style={{ fontSize: '28px' }}>{results.length}</strong>
            </div>
          </div>
        )}

        {/* AKTIVITAS PENGERJAAN TERBARU (TAB TERPISAH) */}
        {activeTab === 'activity' && (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd' }}>
            <h3 style={{ marginTop: 0 }}>Aktivitas Pengerjaan Terbaru</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#eee', textAlign: 'left' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nama Siswa</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Username</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Matematika</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Bahasa Indonesia</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const mtk = results.find((r) => r.userId === u._id && r.kategori === 'matematika');
                  const indo = results.find((r) => r.userId === u._id && r.kategori === 'bahasa_indonesia');
                  return (
                    <tr key={u._id}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.nama || u.username}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.username}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{mtk ? mtk.skor : '-'}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{indo ? indo.skor : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* DATA SISWA */}
        {activeTab === 'students' && (
          <div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '20px' }}>
              <h3 style={{ marginTop: 0 }}>Tambah Akun Siswa Baru</h3>
              <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={studentForm.nama}
                  onChange={(e) => setStudentForm({ ...studentForm, nama: e.target.value })}
                  required
                  style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', flex: '1 min-width: 150px' }}
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={studentForm.username}
                  onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })}
                  required
                  style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', flex: '1 min-width: 150px' }}
                />
                <input
                  type="text"
                  placeholder="Password Default"
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  required
                  style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', flex: '1 min-width: 150px' }}
                />
                <button type="submit" style={{ padding: '8px 16px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  + Tambah Siswa
                </button>
              </form>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd' }}>
              <h3 style={{ marginTop: 0 }}>Daftar Akun Siswa</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#eee', textAlign: 'left' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nama</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Username</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', width: '150px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.nama}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.username}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <button
                          onClick={() => setEditUser({ _id: u._id, nama: u.nama, username: u.username, password: '' })}
                          style={{ padding: '4px 8px', marginRight: '6px', background: '#f0ad4e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          style={{ padding: '4px 8px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Hapus
                        </button>
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
            <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Input Soal Baru</h3>
                <label style={{ padding: '8px 12px', background: '#333', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                  Import JSON
                  <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              <form onSubmit={handleAddQuestion}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Paket Soal:</label>
                    <input
                      type="number"
                      value={questionForm.paket}
                      onChange={(e) => setQuestionForm({ ...questionForm, paket: parseInt(e.target.value) || 1 })}
                      required
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  </div>
                  <div style={{ flex: '1' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Tingkat Kesulitan:</label>
                    <select
                      value={questionForm.tingkatKesulitan}
                      onChange={(e) => setQuestionForm({ ...questionForm, tingkatKesulitan: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                      <option value="mudah">Mudah</option>
                      <option value="sedang">Sedang</option>
                      <option value="sulit">Sulit</option>
                    </select>
                  </div>
                  <div style={{ flex: '1' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Kategori:</label>
                    <select
                      value={questionForm.kategori}
                      onChange={(e) => setQuestionForm({ ...questionForm, kategori: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                      <option value="matematika">Matematika</option>
                      <option value="bahasa_indonesia">Bahasa Indonesia</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Pertanyaan:</label>
                  <input
                    type="text"
                    placeholder="Tuliskan teks pertanyaan..."
                    value={questionForm.soal}
                    onChange={(e) => setQuestionForm({ ...questionForm, soal: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Pilihan Jawaban:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Kunci Jawaban Benar:</label>
                  <select
                    value={questionForm.jawabanBenar}
                    onChange={(e) => setQuestionForm({ ...questionForm, jawabanBenar: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  >
                    <option value={0}>Pilihan A</option>
                    <option value={1}>Pilihan B</option>
                    <option value={2}>Pilihan C</option>
                    <option value={3}>Pilihan D</option>
                  </select>
                </div>

                <button type="submit" style={{ padding: '10px 20px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  + Simpan Soal
                </button>
              </form>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd' }}>
              <h3 style={{ marginTop: 0 }}>Daftar Soal ({questions.length})</h3>
              {questions.map((q, idx) => (
                <div key={q._id || idx} style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    <b>[{q.kategori?.toUpperCase()}]</b> Paket {q.paket || 1} • Kesulitan: {q.tingkatKesulitan || 'sedang'}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {idx + 1}. {q.soal}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '13px' }}>
                    {q.opsi?.map((op, i) => (
                      <span key={i} style={{ color: i === q.jawabanBenar ? 'green' : '#333', fontWeight: i === q.jawabanBenar ? 'bold' : 'normal' }}>
                        {String.fromCharCode(65 + i)}. {op} {i === q.jawabanBenar && '(Kunci)'}
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
          <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd' }}>
            <h3 style={{ marginTop: 0 }}>Lembar Hasil Kuis Siswa</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#eee', textAlign: 'left' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Siswa</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Kategori</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Skor</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', width: '120px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{r.nama}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{r.kategori === 'matematika' ? 'Matematika' : 'Bahasa Indonesia'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}><b>{r.skor}</b></td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <button
                        onClick={() => setSelectedDetail(r)}
                        style={{ padding: '4px 8px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Lihat Lembar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PENGATURAN AKUN */}
        {activeTab === 'account' && (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #ddd' }}>
            <h3 style={{ marginTop: 0 }}>Informasi Akun Admin</h3>
            <p><b>Username:</b> {user.username}</p>
            <p><b>Role Status:</b> Administrator</p>
          </div>
        )}
      </div>

      {/* MODAL EDIT SISWA */}
      {editUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', width: '350px' }}>
            <h3>Edit Data Siswa</h3>
            <form onSubmit={handleSaveEditUser}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px' }}>Nama:</label>
                <input type="text" value={editUser.nama} onChange={(e) => setEditUser({ ...editUser, nama: e.target.value })} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px' }}>Username:</label>
                <input type="text" value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px' }}>Password Baru (Kosongkan jika tak diubah):</label>
                <input type="password" value={editUser.password} onChange={(e) => setEditUser({ ...editUser, password: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => setEditUser(null)} style={{ padding: '6px 12px', marginRight: '8px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ padding: '6px 12px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL LEMBAR JAWABAN */}
      {selectedDetail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', width: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Detail Lembar Jawaban</h3>
            <p>Siswa: <b>{selectedDetail.nama}</b> | Kategori: <b>{selectedDetail.kategori}</b> | Skor: <b>{selectedDetail.skor}</b></p>
            <hr />
            <div>
              {selectedDetail.detailJawaban?.map((d, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{i + 1}. {d.soal}</p>
                  <p style={{ margin: 0, fontSize: '13px' }}>
                    Jawaban Siswa: <b>{d.jawabanSiswa}</b> | Status:{' '}
                    <span style={{ color: d.isCorrect ? 'green' : 'red', fontWeight: 'bold' }}>
                      {d.isCorrect ? 'BENAR' : `SALAH (Benar: ${d.jawabanBenar})`}
                    </span>
                  </p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'right', marginTop: '15px' }}>
              <button onClick={() => setSelectedDetail(null)} style={{ padding: '6px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
