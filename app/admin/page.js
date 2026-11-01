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

    // Auto refresh data tiap 4 detik untuk live update
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
    <div style={styles.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background-color: #f7f4ed; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #e2ddd0; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #d0c8b6; }
      `}</style>

      {/* HEADER / NAVIGATION BAR */}
      <header style={styles.header}>
        <div style={styles.brandGroup}>
          <h1 style={styles.logo}>KuisTKA <span style={styles.badgeAdmin}>ADMIN</span></h1>
        </div>
        <button
          onClick={() => { localStorage.clear(); router.push('/'); }}
          style={styles.btnLogout}
        >
          Keluar Account
        </button>
      </header>

      {/* MAIN CONTAINER */}
      <main style={styles.mainContainer}>
        {/* HERO BANNER SECTION */}
        <section style={styles.welcomeCard}>
          <div>
            <h2 style={styles.welcomeTitle}>Dashboard Kontrol Admin</h2>
            <p style={styles.welcomeSubtitle}>
              Kelola data peserta, pantau nilai secara real-time, dan perbarui bank soal kuis TKA.
            </p>
          </div>
          <div style={styles.statsGroup}>
            <div style={styles.statBox}>
              <span style={styles.statNum}>{users.length}</span>
              <span style={styles.statLabel}>Siswa Terdaftar</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statNum}>{questions.length}</span>
              <span style={styles.statLabel}>Total Soal</span>
            </div>
          </div>
        </section>

        {/* 1. FORM TAMBAH SISWA */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Tambah Akun Siswa Baru</h3>
            <span style={styles.cardDesc}>Buat kredensial siswa baru untuk akses aplikasi</span>
          </div>

          <form onSubmit={handleTambahSiswa} style={styles.formRow}>
            <input
              type="text"
              placeholder="Nama Lengkap Siswa"
              value={namaSiswa}
              onChange={(e) => setNamaSiswa(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Username / No. Induk"
              value={usernameSiswa}
              onChange={(e) => setUsernameSiswa(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Password Default"
              value={passwordSiswa}
              onChange={(e) => setPasswordSiswa(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.btnPrimary}>
              + Tambah Siswa
            </button>
          </form>
        </section>

        {/* 2. DAFTAR SISWA & MONITORING LIVE */}
        <section style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <div>
              <h3 style={styles.cardTitle}>Daftar Siswa & Live Hasil Kuis</h3>
              <span style={styles.cardDesc}>Data diperbarui secara otomatis secara real-time</span>
            </div>
            <span style={styles.liveIndicator}>
              <span style={styles.pulseDot}></span> Live Monitoring
            </span>
          </div>

          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nama Siswa</th>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Hasil Nilai</th>
                  <th style={styles.th}>Detail Jawaban</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#999', padding: '30px' }}>
                      Belum ada data siswa terdaftar.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const userScores = results.filter((r) => r.userId === u._id);
                    return (
                      <tr key={u._id} style={styles.trHover}>
                        <td style={styles.td}>
                          <strong style={{ color: '#1a1a1a' }}>{u.nama || u.username}</strong>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.codeText}>{u.username}</span>
                        </td>
                        <td style={styles.td}>
                          {userScores.length > 0 ? (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {userScores.map((s, i) => (
                                <span key={i} style={styles.scoreBadge}>
                                  {s.kategori === 'matematika' ? 'MTK' : 'B.Indo'}: <strong>{s.skor}</strong>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={styles.badgePending}>Belum tes</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {userScores.length > 0 ? (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {userScores.map((s, i) => (
                                <button
                                  key={i}
                                  onClick={() => setSelectedDetail(s)}
                                  style={styles.btnOutlineSmall}
                                >
                                  Lihat {s.kategori === 'matematika' ? 'MTK' : 'B.Indo'}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#bbb' }}>-</span>
                          )}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setEditUser(u);
                              setEditNama(u.nama || '');
                              setEditUsername(u.username);
                              setEditPassword('');
                            }}
                            style={styles.btnActionEdit}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleHapusUser(u._id)}
                            style={styles.btnActionDelete}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. FORM KELOLA SOAL */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Tambah Soal Kuis Baru</h3>
            <span style={styles.cardDesc}>Masukkan materi pertanyaan beserta opsi pilihan ganda</span>
          </div>

          <form onSubmit={handleTambahSoal}>
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Kategori Kuis</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                style={styles.select}
              >
                <option value="matematika">Matematika</option>
                <option value="bahasa_indonesia">Bahasa Indonesia</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Teks Pertanyaan Soal</label>
              <textarea
                value={soal}
                onChange={(e) => setSoal(e.target.value)}
                placeholder="Tuliskan pertanyaan kuis di sini..."
                required
                rows={3}
                style={styles.textarea}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Pilihan Jawaban (Opsi 1 - 4)</label>
              <div style={styles.opsiGrid}>
                {opsi.map((op, idx) => (
                  <div key={idx} style={styles.opsiInputGroup}>
                    <span style={styles.opsiLabel}>Opsi {idx + 1}</span>
                    <input
                      type="text"
                      placeholder={`Jawaban Pilihan ${idx + 1}`}
                      value={op}
                      onChange={(e) => {
                        const newOpsi = [...opsi];
                        newOpsi[idx] = e.target.value;
                        setOpsi(newOpsi);
                      }}
                      required
                      style={styles.input}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={styles.label}>Kunci Jawaban Yang Benar</label>
              <select
                value={jawabanBenar}
                onChange={(e) => setJawabanBenar(parseInt(e.target.value))}
                style={{ ...styles.select, maxWidth: '300px' }}
              >
                <option value={0}>Opsi 1 (Pertama)</option>
                <option value={1}>Opsi 2 (Kedua)</option>
                <option value={2}>Opsi 3 (Ketiga)</option>
                <option value={3}>Opsi 4 (Keempat)</option>
              </select>
            </div>

            <button type="submit" style={{ ...styles.btnPrimary, width: 'auto', padding: '14px 28px' }}>
              Simpan Soal Baru
            </button>
          </form>
        </section>
      </main>

      {/* MODAL EDIT USER */}
      {editUser && (
        <div style={styles.overlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Edit Data Siswa</h3>
            <p style={styles.modalSubtitle}>Ubah profil atau perbarui kata sandi pengguna ini.</p>
            
            <form onSubmit={handleSaveEditUser}>
              <div style={{ marginBottom: '14px' }}>
                <label style={styles.label}>Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={styles.label}>Username / No. Induk</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={styles.label}>Reset Password Baru</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  style={styles.input}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  style={styles.btnSecondary}
                >
                  Batal
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL JAWABAN LIVE */}
      {selectedDetail && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modalCard, maxWidth: '540px' }}>
            <h3 style={styles.modalTitle}>Rincian Jawaban: {selectedDetail.nama}</h3>
            <div style={styles.detailMetaBadge}>
              <span>Kategori: <strong>{selectedDetail.kategori}</strong></span>
              <span>•</span>
              <span>Skor Akhir: <strong>{selectedDetail.skor}</strong></span>
            </div>

            <div style={styles.detailScrollArea}>
              {selectedDetail.detailJawaban && selectedDetail.detailJawaban.length > 0 ? (
                selectedDetail.detailJawaban.map((d, index) => (
                  <div key={index} style={styles.detailItemBox}>
                    <p style={styles.detailQuestion}>{index + 1}. {d.soal}</p>
                    <div style={styles.detailAnswerRow}>
                      <span style={{ color: '#555' }}>Jawaban Siswa: <strong>{d.jawabanSiswa}</strong></span>
                      {d.isCorrect ? (
                        <span style={styles.statusCorrect}>BENAR</span>
                      ) : (
                        <span style={styles.statusWrong}>
                          SALAH (Kunci: {d.jawabanBenar})
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#999', fontSize: '13px' }}>
                  Detail pengerjaan tidak tersedia untuk catatan lama.
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <button onClick={() => setSelectedDetail(null)} style={styles.btnSecondary}>
                Tutup Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span>© 2026 <strong>KuisTKA Admin</strong>. All rights reserved.</span>
        <div style={styles.footerLinks}>
          <a href="#" style={styles.footerLink}>Privasi</a>
          <span>•</span>
          <a href="#" style={styles.footerLink}>Keamanan</a>
          <span>•</span>
          <a href="#" style={styles.footerLink}>Bantuan</a>
        </div>
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
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    color: '#1a1a1a',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  badgeAdmin: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#1a1a1a',
    color: '#f6ca85',
    padding: '3px 8px',
    borderRadius: '6px',
    letterSpacing: '0.5px',
  },
  btnLogout: {
    backgroundColor: 'transparent',
    border: '1px solid #e2ddd0',
    padding: '8px 18px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '13px',
    color: '#555555',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  mainContainer: {
    flex: 1,
    maxWidth: '1040px',
    width: '100%',
    margin: '0 auto',
    padding: '32px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '28px 32px',
    border: '1px solid #eae5d9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.02)',
    flexWrap: 'wrap',
    gap: '20px',
  },
  welcomeTitle: {
    fontSize: '22px',
    fontWeight: '800',
    margin: '0 0 6px 0',
    color: '#1a1a1a',
  },
  welcomeSubtitle: {
    fontSize: '13px',
    color: '#777777',
    margin: 0,
  },
  statsGroup: {
    display: 'flex',
    gap: '16px',
  },
  statBox: {
    backgroundColor: '#faf8f5',
    border: '1px solid #e2ddd0',
    padding: '12px 20px',
    borderRadius: '14px',
    textAlign: 'center',
    minWidth: '110px',
  },
  statNum: {
    display: 'block',
    fontSize: '22px',
    fontWeight: '800',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: '11px',
    color: '#777777',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '28px 32px',
    border: '1px solid #eae5d9',
    boxShadow: '0 10px 25px rgba(0,0,0,0.02)',
  },
  cardHeader: {
    marginBottom: '20px',
  },
  cardHeaderFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 4px 0',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#777777',
  },
  liveIndicator: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#2e7d32',
    backgroundColor: '#e8f5e9',
    padding: '5px 12px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#2e7d32',
    borderRadius: '50%',
  },
  formRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: '180px',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #e2ddd0',
    backgroundColor: '#faf8f5',
    fontSize: '13px',
    outline: 'none',
    color: '#333',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #e2ddd0',
    backgroundColor: '#faf8f5',
    fontSize: '13px',
    outline: 'none',
    color: '#333',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #e2ddd0',
    backgroundColor: '#faf8f5',
    fontSize: '13px',
    outline: 'none',
    color: '#333',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#444444',
    marginBottom: '6px',
  },
  opsiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  opsiInputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  opsiLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#888',
    marginBottom: '4px',
  },
  btnPrimary: {
    padding: '12px 20px',
    backgroundColor: '#f6ca85',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1a1a1a',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(246, 202, 133, 0.4)',
    fontFamily: 'inherit',
  },
  btnSecondary: {
    padding: '10px 18px',
    backgroundColor: '#f0ece1',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#777777',
    borderBottom: '2px solid #f0ece1',
    backgroundColor: '#faf8f5',
  },
  trHover: {
    borderBottom: '1px solid #eae5d9',
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#444444',
    verticalAlign: 'middle',
  },
  codeText: {
    fontFamily: 'monospace',
    backgroundColor: '#faf8f5',
    padding: '3px 6px',
    borderRadius: '4px',
    border: '1px solid #e2ddd0',
    fontSize: '12px',
    color: '#666',
  },
  scoreBadge: {
    fontSize: '11px',
    backgroundColor: '#fff4e5',
    color: '#b76e00',
    border: '1px solid #ffe0b2',
    padding: '4px 8px',
    borderRadius: '6px',
    fontWeight: '500',
  },
  badgePending: {
    fontSize: '11px',
    backgroundColor: '#f0ece1',
    color: '#777',
    padding: '4px 8px',
    borderRadius: '6px',
    fontWeight: '500',
  },
  btnOutlineSmall: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2ddd0',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#333',
    cursor: 'pointer',
  },
  btnActionEdit: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#2b6cb0',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
    marginRight: '12px',
  },
  btnActionDelete: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#c53030',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    zIndex: 999,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '28px 32px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: '1px solid #eae5d9',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '800',
    margin: '0 0 6px 0',
    color: '#1a1a1a',
  },
  modalSubtitle: {
    fontSize: '12px',
    color: '#777777',
    margin: '0 0 20px 0',
  },
  detailMetaBadge: {
    display: 'flex',
    gap: '10px',
    fontSize: '12px',
    color: '#666',
    backgroundColor: '#faf8f5',
    padding: '8px 12px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #e2ddd0',
  },
  detailScrollArea: {
    maxHeight: '280px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingRight: '4px',
  },
  detailItemBox: {
    padding: '12px',
    backgroundColor: '#faf8f5',
    borderRadius: '10px',
    border: '1px solid #e2ddd0',
  },
  detailQuestion: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 6px 0',
  },
  detailAnswerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
  },
  statusCorrect: {
    color: '#2e7d32',
    fontWeight: '800',
    backgroundColor: '#e8f5e9',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
  },
  statusWrong: {
    color: '#c53030',
    fontWeight: '800',
    backgroundColor: '#fff5f5',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '24px 20px',
    fontSize: '13px',
    color: '#777777',
    borderTop: '1px solid #eee8db',
    backgroundColor: '#f7f4ed',
    marginTop: 'auto',
  },
  footerLinks: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    fontSize: '12px',
    color: '#aaa',
  },
  footerLink: {
    color: '#666',
    textDecoration: 'none',
    fontWeight: '500',
  },
};
