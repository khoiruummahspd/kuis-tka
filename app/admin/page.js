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

  const [studentForm, setStudentForm] = useState({ nama: '', username: '', password: '123' });
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [editQuestion, setEditQuestion] = useState(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    paket: 1,
    tingkatKesulitan: 'sedang',
    kategori: 'matematika',
    soal: '',
    opsi: ['', '', '', ''],
    jawabanBenar: 0,
  });

  const [selectedDetail, setSelectedDetail] = useState(null);

  const [filterKategoriResult, setFilterKategoriResult] = useState('matematika');
  const [filterKesulitanResult, setFilterKesulitanResult] = useState('sedang');
  const [filterPaketResult, setFilterPaketResult] = useState('1');

  const [filterKategoriQuestion, setFilterKategoriQuestion] = useState('semua');
  const [filterKesulitanQuestion, setFilterKesulitanQuestion] = useState('semua');
  const [filterPaketQuestion, setFilterPaketQuestion] = useState('semua');

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
    setIsAddingStudent(false);
    fetchDashboardData();
  };

  const handleStudentFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = JSON.parse(event.target.result);
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonContent),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          alert(data.message || 'Berhasil import akun siswa!');
          fetchDashboardData();
        } else {
          alert(data.message || 'Gagal import file JSON');
        }
      } catch (err) {
        alert('Format file JSON tidak valid!');
      }
    };
    reader.readAsText(file);
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

  const handleDeleteResult = async (resultId) => {
    if (!confirm('Apakah kamu yakin ingin menghapus riwayat kuis ini? Siswa akan bisa mengerjakan ulang.')) return;
    try {
      const res = await fetch('/api/admin/results', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId }),
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        alert('Gagal menghapus riwayat kuis');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus');
    }
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

  const handleAddQuestionManual = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
      });

      if (res.ok) {
        setIsAddingQuestion(false);
        setNewQuestion({
          paket: 1,
          tingkatKesulitan: 'sedang',
          kategori: 'matematika',
          soal: '',
          opsi: ['', '', '', ''],
          jawabanBenar: 0,
        });
        fetchDashboardData();
      } else {
        alert('Gagal menambah soal');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan soal');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Apakah kamu yakin ingin menghapus soal ini?')) return;
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId }),
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        alert('Gagal menghapus soal');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus');
    }
  };

  const handleSaveEditQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editQuestion),
      });
      if (res.ok) {
        setEditQuestion(null);
        fetchDashboardData();
      } else {
        alert('Gagal memperbarui soal');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (!user) return null;

  const menuItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'results', label: 'Hasil Pengerjaan' },
    { id: 'students', label: 'Data Siswa' },
    { id: 'questions', label: 'Bank Soal' },
  ];

  const availableResultPaketList = Array.from(
    new Set(results.map((r) => (r.paket || 1).toString()))
  ).sort((a, b) => parseInt(a) - parseInt(b));

  const availableQuestionPaketList = Array.from(
    new Set(questions.map((q) => (q.paket || 1).toString()))
  ).sort((a, b) => parseInt(a) - parseInt(b));

  const filteredQuestions = questions.filter((q) => {
    if (filterKategoriQuestion !== 'semua' && q.kategori !== filterKategoriQuestion) return false;
    if (filterKesulitanQuestion !== 'semua' && (q.tingkatKesulitan || 'sedang') !== filterKesulitanQuestion) return false;
    if (filterPaketQuestion !== 'semua' && (q.paket || 1).toString() !== filterPaketQuestion) return false;
    return true;
  });

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh', padding: '15px' }}>
      
      <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <strong style={{ fontSize: '16px', display: 'block' }}>Admin Dashboard</strong>
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
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '240px', background: '#fff', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '2px 0 8px rgba(0,0,0,0.1)' }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
                      padding: '10px 12px',
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
        {activeTab === 'overview' && (
          <div>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '15px' }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#333' }}>
                Selamat Datang, Admin
              </h2>
              <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                Panel kontrol pengelolaan data kuis dan akun siswa.
              </p>
            </div>

            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center', width: '50%', boxSizing: 'border-box' }}>
              <span style={{ display: 'block', color: '#666', fontSize: '12px' }}>Total Siswa</span>
              <strong style={{ fontSize: '24px', color: '#333' }}>{users.length}</strong>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', overflow: 'hidden' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '12px' }}>Hasil Pengerjaan Siswa</h3>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px', background: '#f9f9f9', padding: '10px', borderRadius: '6px', border: '1px solid #eee' }}>
              <div style={{ flex: '1 1 130px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>Pilih Mata Pelajaran:</label>
                <select
                  value={filterKategoriResult}
                  onChange={(e) => setFilterKategoriResult(e.target.value)}
                  style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                >
                  <option value="matematika">Matematika</option>
                  <option value="bahasa_indonesia">Bahasa Indonesia</option>
                </select>
              </div>

              <div style={{ flex: '1 1 120px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>Pilih Paket:</label>
                <select
                  value={filterPaketResult}
                  onChange={(e) => setFilterPaketResult(e.target.value)}
                  style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                >
                  {availableResultPaketList.length === 0 ? (
                    <option value="1">Paket 1</option>
                  ) : (
                    availableResultPaketList.map((pkt) => (
                      <option key={pkt} value={pkt}>
                        Paket {pkt}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ flex: '1 1 120px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>Tingkat Kesulitan:</label>
                <select
                  value={filterKesulitanResult}
                  onChange={(e) => setFilterKesulitanResult(e.target.value)}
                  style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                >
                  <option value="mudah">Mudah</option>
                  <option value="sedang">Sedang</option>
                  <option value="sulit">Sulit</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '420px' }}>
                <thead>
                  <tr style={{ background: '#eee', textAlign: 'left', fontSize: '13px' }}>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Nama Siswa</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Username</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>
                      Nilai {filterKategoriResult === 'matematika' ? 'Matematika' : 'Bahasa Indonesia'}
                    </th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', width: '120px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const matchResult = results.find(
                      (r) =>
                        r.userId === u._id &&
                        r.kategori === filterKategoriResult &&
                        (r.paket || 1).toString() === filterPaketResult &&
                        (r.tingkatKesulitan || 'sedang') === filterKesulitanResult
                    );

                    return (
                      <tr key={u._id} style={{ fontSize: '13px' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.nama || u.username}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.username}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          {matchResult ? <b>{matchResult.skor}</b> : '-'}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          {matchResult ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => setSelectedDetail(matchResult)}
                                style={{ padding: '4px 6px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                Detail
                              </button>
                              <button
                                onClick={() => handleDeleteResult(matchResult._id)}
                                style={{ padding: '4px 6px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                Hapus
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#888' }}>Belum</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Kelola Data Siswa</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsAddingStudent(true)}
                  style={{ padding: '8px 14px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                >
                  + Tambah Siswa
                </button>
                <label style={{ padding: '8px 14px', background: '#333', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'inline-block' }}>
                  Import JSON
                  <input type="file" accept=".json" onChange={handleStudentFileUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', overflow: 'hidden' }}>
              <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '15px' }}>Daftar Akun Siswa ({users.length})</h3>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '350px' }}>
                  <thead>
                    <tr style={{ background: '#eee', textAlign: 'left', fontSize: '13px' }}>
                      <th style={{ padding: '8px', border: '1px solid #ddd' }}>Nama</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd' }}>Username</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', width: '110px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} style={{ fontSize: '13px' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.nama}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.username}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          <button
                            onClick={() => setEditUser({ _id: u._id, nama: u.nama, username: u.username, password: '' })}
                            style={{ padding: '4px 6px', marginRight: '4px', background: '#f0ad4e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            style={{ padding: '4px 6px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
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

            {isAddingStudent && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', zIndex: 100 }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', width: '100%', maxWidth: '360px', boxSizing: 'border-box' }}>
                  <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '15px' }}>Tambah Akun Siswa Baru</h3>
                  <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Nama Lengkap:</label>
                      <input
                        type="text"
                        placeholder="Nama Lengkap"
                        value={studentForm.nama}
                        onChange={(e) => setStudentForm({ ...studentForm, nama: e.target.value })}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Username:</label>
                      <input
                        type="text"
                        placeholder="Username"
                        value={studentForm.username}
                        onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Password Default:</label>
                      <input
                        type="text"
                        placeholder="Password Default"
                        value={studentForm.password}
                        onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '6px' }}>
                      <button type="button" onClick={() => setIsAddingStudent(false)} style={{ padding: '6px 12px', marginRight: '6px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                        Batal
                      </button>
                      <button type="submit" style={{ padding: '6px 12px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'questions' && (
          <div>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Kelola Bank Soal</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsAddingQuestion(true)}
                  style={{ padding: '8px 14px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                >
                  + Tambah Soal
                </button>
                <label style={{ padding: '8px 14px', background: '#333', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'inline-block' }}>
                  Import JSON
                  <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Daftar Soal ({filteredQuestions.length})</h3>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#f9f9f9', padding: '10px', borderRadius: '6px', border: '1px solid #eee' }}>
                  <div style={{ flex: '1 1 120px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>Mata Pelajaran:</label>
                    <select
                      value={filterKategoriQuestion}
                      onChange={(e) => setFilterKategoriQuestion(e.target.value)}
                      style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    >
                      <option value="semua">Semua Kategori</option>
                      <option value="matematika">Matematika</option>
                      <option value="bahasa_indonesia">Bahasa Indonesia</option>
                    </select>
                  </div>

                  <div style={{ flex: '1 1 120px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>Paket:</label>
                    <select
                      value={filterPaketQuestion}
                      onChange={(e) => setFilterPaketQuestion(e.target.value)}
                      style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    >
                      <option value="semua">Semua Paket</option>
                      {availableQuestionPaketList.map((pkt) => (
                        <option key={pkt} value={pkt}>
                          Paket {pkt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: '1 1 120px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>Kesulitan:</label>
                    <select
                      value={filterKesulitanQuestion}
                      onChange={(e) => setFilterKesulitanQuestion(e.target.value)}
                      style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    >
                      <option value="semua">Semua Kesulitan</option>
                      <option value="mudah">Mudah</option>
                      <option value="sedang">Sedang</option>
                      <option value="sulit">Sulit</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredQuestions.length === 0 ? (
                <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Tidak ada soal yang sesuai dengan filter ini.</p>
              ) : (
                filteredQuestions.map((q, idx) => (
                  <div key={q._id || idx} style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        <b>[{q.kategori?.toUpperCase()}]</b> Paket {q.paket || 1} • {q.tingkatKesulitan || 'sedang'}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setEditQuestion({ ...q })}
                          style={{ padding: '4px 8px', background: '#f0ad4e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q._id)}
                          style={{ padding: '4px 8px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>
                      {idx + 1}. {q.soal}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                      {q.opsi?.map((op, i) => (
                        <span key={i} style={{ color: i === q.jawabanBenar ? 'green' : '#333', fontWeight: i === q.jawabanBenar ? 'bold' : 'normal' }}>
                          {String.fromCharCode(65 + i)}. {op} {i === q.jawabanBenar && '(Kunci)'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {isAddingQuestion && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', zIndex: 100 }}>
                <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
                  <h3 style={{ marginTop: 0, fontSize: '16px' }}>Tambah Soal Baru</h3>
                  <form onSubmit={handleAddQuestionManual}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Paket:</label>
                        <input
                          type="number"
                          value={newQuestion.paket}
                          onChange={(e) => setNewQuestion({ ...newQuestion, paket: parseInt(e.target.value) || 1 })}
                          required
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Kesulitan:</label>
                        <select
                          value={newQuestion.tingkatKesulitan}
                          onChange={(e) => setNewQuestion({ ...newQuestion, tingkatKesulitan: e.target.value })}
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                        >
                          <option value="mudah">Mudah</option>
                          <option value="sedang">Sedang</option>
                          <option value="sulit">Sulit</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Kategori:</label>
                        <select
                          value={newQuestion.kategori}
                          onChange={(e) => setNewQuestion({ ...newQuestion, kategori: e.target.value })}
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                        >
                          <option value="matematika">Matematika</option>
                          <option value="bahasa_indonesia">Bahasa Indonesia</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Pertanyaan:</label>
                      <input
                        type="text"
                        value={newQuestion.soal}
                        onChange={(e) => setNewQuestion({ ...newQuestion, soal: e.target.value })}
                        required
                        style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Pilihan Jawaban:</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {newQuestion.opsi.map((op, idx) => (
                          <input
                            key={idx}
                            type="text"
                            placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                            value={op}
                            onChange={(e) => {
                              const nextOpsi = [...newQuestion.opsi];
                              nextOpsi[idx] = e.target.value;
                              setNewQuestion({ ...newQuestion, opsi: nextOpsi });
                            }}
                            required
                            style={{ padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Kunci Jawaban Benar:</label>
                      <select
                        value={newQuestion.jawabanBenar}
                        onChange={(e) => setNewQuestion({ ...newQuestion, jawabanBenar: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                      >
                        <option value={0}>Pilihan A</option>
                        <option value={1}>Pilihan B</option>
                        <option value={2}>Pilihan C</option>
                        <option value={3}>Pilihan D</option>
                      </select>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <button type="button" onClick={() => setIsAddingQuestion(false)} style={{ padding: '6px 12px', marginRight: '6px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                        Batal
                      </button>
                      <button type="submit" style={{ padding: '6px 12px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {editQuestion && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', zIndex: 100 }}>
                <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
                  <h3 style={{ marginTop: 0, fontSize: '16px' }}>Edit Soal</h3>
                  <form onSubmit={handleSaveEditQuestion}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Paket:</label>
                        <input
                          type="number"
                          value={editQuestion.paket || 1}
                          onChange={(e) => setEditQuestion({ ...editQuestion, paket: parseInt(e.target.value) || 1 })}
                          required
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Kesulitan:</label>
                        <select
                          value={editQuestion.tingkatKesulitan || 'sedang'}
                          onChange={(e) => setEditQuestion({ ...editQuestion, tingkatKesulitan: e.target.value })}
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                        >
                          <option value="mudah">Mudah</option>
                          <option value="sedang">Sedang</option>
                          <option value="sulit">Sulit</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Kategori:</label>
                        <select
                          value={editQuestion.kategori || 'matematika'}
                          onChange={(e) => setEditQuestion({ ...editQuestion, kategori: e.target.value })}
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                        >
                          <option value="matematika">Matematika</option>
                          <option value="bahasa_indonesia">Bahasa Indonesia</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Pertanyaan:</label>
                      <input
                        type="text"
                        value={editQuestion.soal || ''}
                        onChange={(e) => setEditQuestion({ ...editQuestion, soal: e.target.value })}
                        required
                        style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Pilihan Jawaban:</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {editQuestion.opsi?.map((op, idx) => (
                          <input
                            key={idx}
                            type="text"
                            value={op}
                            onChange={(e) => {
                              const nextOpsi = [...editQuestion.opsi];
                              nextOpsi[idx] = e.target.value;
                              setEditQuestion({ ...editQuestion, opsi: nextOpsi });
                            }}
                            required
                            style={{ padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Kunci Jawaban Benar:</label>
                      <select
                        value={editQuestion.jawabanBenar}
                        onChange={(e) => setEditQuestion({ ...editQuestion, jawabanBenar: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                      >
                        <option value={0}>Pilihan A</option>
                        <option value={1}>Pilihan B</option>
                        <option value={2}>Pilihan C</option>
                        <option value={3}>Pilihan D</option>
                      </select>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <button type="button" onClick={() => setEditQuestion(null)} style={{ padding: '6px 12px', marginRight: '6px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                        Batal
                      </button>
                      <button type="submit" style={{ padding: '6px 12px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {editUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', width: '100%', maxWidth: '360px', boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '15px' }}>Edit Data Siswa</h3>
            <form onSubmit={handleSaveEditUser}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Nama:</label>
                <input
                  type="text"
                  value={editUser.nama}
                  onChange={(e) => setEditUser({ ...editUser, nama: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Username:</label>
                <input
                  type="text"
                  value={editUser.username}
                  onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Password Baru (Opsional):</label>
                <input
                  type="password"
                  value={editUser.password}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => setEditUser(null)} style={{ padding: '6px 12px', marginRight: '6px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Batal</button>
                <button type="submit" style={{ padding: '6px 12px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDetail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', width: '100%', maxWidth: '450px', maxHeight: '80vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px' }}>Detail Lembar Jawaban</h3>
            <p style={{ fontSize: '13px' }}>Siswa: <b>{selectedDetail.nama}</b> | Skor: <b>{selectedDetail.skor}</b></p>
            <hr />
            <div>
              {selectedDetail.detailJawaban?.map((d, i) => (
                <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '13px' }}>{i + 1}. {d.soal}</p>
                  <p style={{ margin: 0, fontSize: '12px' }}>
                    Jawaban: <b>{d.jawabanSiswa}</b> | Status:{' '}
                    <span style={{ color: d.isCorrect ? 'green' : 'red', fontWeight: 'bold' }}>
                      {d.isCorrect ? 'BENAR' : `SALAH (${d.jawabanBenar})`}
                    </span>
                  </p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'right', marginTop: '12px' }}>
              <button onClick={() => setSelectedDetail(null)} style={{ padding: '6px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
