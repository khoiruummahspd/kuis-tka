'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);

  // State Tambah Siswa
  const [namaSiswa, setNamaSiswa] = useState('');
  const [usernameSiswa, setUsernameSiswa] = useState('');
  const [passwordSiswa, setPasswordSiswa] = useState('123');

  // State Edit Siswa
  const [editUser, setEditUser] = useState(null);
  const [editNama, setEditNama] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  // State Live Detail Jawaban
  const [selectedDetail, setSelectedDetail] = useState(null);

  // State Tambah Soal
  const [kategori, setKategori] = useState('matematika');
  const [soal, setSoal] = useState('');
  const [opsi, setOpsi] = useState(['', '', '', '']);
  const [jawabanBenar, setJawabanBenar] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'admin') {
      router.push('/kuis');
      return;
    }

    fetchData();

    // Auto refresh data tiap 4 detik buat live update
    const interval = setInterval(() => {
      fetchData();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const resUser = await fetch('/api/admin/users');
      const dataUser = await resUser.json();
      if (dataUser.success) {
        setUsers(dataUser.users);
        setResults(dataUser.results);
      }

      const resQ = await fetch('/api/admin/questions');
      const dataQ = await resQ.json();
      if (dataQ.success) setQuestions(dataQ.questions);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTambahSiswa = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama: namaSiswa, username: usernameSiswa, password: passwordSiswa }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert('Siswa berhasil ditambahkan');
      setNamaSiswa('');
      setUsernameSiswa('');
      setPasswordSiswa('123');
      fetchData();
    } else {
      alert(data.message);
    }
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: editUser._id,
        nama: editNama,
        username: editUsername,
        newPassword: editPassword,
      }),
    });
    if (res.ok) {
      alert('Data siswa diperbarui');
      setEditUser(null);
      fetchData();
    }
  };

  const handleHapusUser = async (userId) => {
    if (!confirm('Hapus siswa ini?')) return;
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    fetchData();
  };

  const handleTambahSoal = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kategori, soal, opsi, jawabanBenar }),
    });
    if (res.ok) {
      alert('Soal disimpan');
      setSoal('');
      setOpsi(['', '', '', '']);
      fetchData();
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto', color: '#333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '20px', margin: 0 }}>Panel Kelola Admin Kuis TKA</h2>
        <button onClick={() => { localStorage.clear(); router.push('/'); }} style={{ padding: '6px 12px', cursor: 'pointer' }}>Logout</button>
      </div>
      <hr style={{ border: '0', borderTop: '1px solid #ccc', marginBottom: '20px' }} />

      {/* 1. FORM TAMBAH SISWA */}
      <h3 style={styles.sectionHeader}>Tambah Akun Siswa Baru</h3>
      <form onSubmit={handleTambahSiswa} style={styles.card}>
        <input type="text" placeholder="Nama Lengkap Siswa" value={namaSiswa} onChange={(e) => setNamaSiswa(e.target.value)} required style={styles.inputInline} />
        <input type="text" placeholder="Username" value={usernameSiswa} onChange={(e) => setUsernameSiswa(e.target.value)} required style={styles.inputInline} />
        <input type="text" placeholder="Password Default" value={passwordSiswa} onChange={(e) => setPasswordSiswa(e.target.value)} required style={styles.inputInline} />
        <button type="submit" style={styles.btnBlue}>Simpan</button>
      </form>

      {/* 2. DAFTAR SISWA & MONITORING LIVE */}
      <h3 style={styles.sectionHeader}>Daftar Siswa & Live Hasil Kuis</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', marginBottom: '30px', borderColor: '#ddd', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            <th>Nama Siswa</th>
            <th>Username</th>
            <th>Hasil Nilai</th>
            <th>Detail Jawaban</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const userScores = results.filter((r) => r.userId === u._id);
            return (
              <tr key={u._id}>
                <td>{u.nama || u.username}</td>
                <td>{u.username}</td>
                <td>
                  {userScores.length > 0
                    ? userScores.map((s, i) => (
                        <div key={i} style={{ marginBottom: '4px' }}>
                          {s.kategori}: <b>{s.skor}</b>
                        </div>
                      ))
                    : <span style={{ color: '#888' }}>Belum tes</span>}
                </td>
                <td>
                  {userScores.length > 0 ? (
                    userScores.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedDetail(s)}
                        style={{ padding: '3px 8px', fontSize: '12px', margin: '2px', cursor: 'pointer' }}
                      >
                        Lihat {s.kategori === 'matematika' ? 'MTK' : 'B.Indo'}
                      </button>
                    ))
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <button
                    onClick={() => {
                      setEditUser(u);
                      setEditNama(u.nama || '');
                      setEditUsername(u.username);
                      setEditPassword('');
                    }}
                    style={{ marginRight: '5px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleHapusUser(u._id)} style={{ color: 'red', fontSize: '12px', cursor: 'pointer' }}>Hapus</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 3. FORM KELOLA SOAL */}
      <h3 style={styles.sectionHeader}>Tambah Soal Kuis</h3>
      <form onSubmit={handleTambahSoal} style={styles.card}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Kategori:</label>
          <select value={kategori} onChange={(e) => setKategori(e.target.value)} style={{ padding: '6px' }}>
            <option value="matematika">Matematika</option>
            <option value="bahasa_indonesia">Bahasa Indonesia</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Pertanyaan:</label>
          <input type="text" value={soal} onChange={(e) => setSoal(e.target.value)} placeholder="Masukkan soal..." required style={{ width: '98%', padding: '6px' }} />
        </div>

        <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Pilihan Jawaban:</label>
        {opsi.map((op, idx) => (
          <input
            key={idx}
            type="text"
            placeholder={`Opsi ${idx + 1}`}
            value={op}
            onChange={(e) => {
              const newOpsi = [...opsi];
              newOpsi[idx] = e.target.value;
              setOpsi(newOpsi);
            }}
            required
            style={{ width: '45%', padding: '6px', margin: '3px 1%' }}
          />
        ))}

        <div style={{ marginTop: '10px', marginBottom: '15px' }}>
          <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Kunci Jawaban Benar:</label>
          <select value={jawabanBenar} onChange={(e) => setJawabanBenar(parseInt(e.target.value))} style={{ padding: '6px' }}>
            <option value={0}>Opsi 1</option>
            <option value={1}>Opsi 2</option>
            <option value={2}>Opsi 3</option>
            <option value={3}>Opsi 4</option>
          </select>
        </div>

        <button type="submit" style={styles.btnBlue}>Simpan Soal</button>
      </form>

      {/* MODAL EDIT USER */}
      {editUser && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ fontSize: '16px', marginTop: 0 }}>Edit Siswa</h3>
            <form onSubmit={handleSaveEditUser}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px' }}>Nama Siswa:</label>
                <input type="text" value={editNama} onChange={(e) => setEditNama(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px' }}>Username:</label>
                <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px' }}>Reset Password (Kosongkan jika tidak diubah):</label>
                <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Password Baru" style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => setEditUser(null)} style={{ marginRight: '10px', padding: '6px 12px' }}>Batal</button>
                <button type="submit" style={styles.btnBlue}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL JAWABAN LIVE */}
      {selectedDetail && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: '500px', width: '100%' }}>
            <h3 style={{ fontSize: '16px', marginTop: 0 }}>Rincian Jawaban: {selectedDetail.nama}</h3>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Kategori: {selectedDetail.kategori} | Skor: {selectedDetail.skor}</p>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
              {selectedDetail.detailJawaban && selectedDetail.detailJawaban.length > 0 ? (
                selectedDetail.detailJawaban.map((d, index) => (
                  <div key={index} style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '13px' }}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{index + 1}. {d.soal}</p>
                    <p style={{ margin: '2px 0' }}>Jawaban Siswa: {d.jawabanSiswa}</p>
                    <p style={{ margin: '2px 0' }}>Status: {d.isCorrect ? <span style={{ color: 'green', fontWeight: 'bold' }}>BENAR</span> : <span style={{ color: 'red', fontWeight: 'bold' }}>SALAH (Benar: {d.jawabanBenar})</span>}</p>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '12px', color: '#888' }}>Detail tidak tersedia untuk data lama.</p>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <button onClick={() => setSelectedDetail(null)} style={{ padding: '6px 12px' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  sectionHeader: { fontSize: '16px', marginBottom: '10px', color: '#2b6cb0' },
  card: { background: '#fff', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '25px' },
  inputInline: { padding: '6px', marginRight: '10px', marginBottom: '10px' },
  btnBlue: { padding: '7px 14px', backgroundColor: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px' },
  modal: { backgroundColor: '#fff', padding: '20px', borderRadius: '4px', maxWidth: '350px', width: '100%' }
};
