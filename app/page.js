'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State untuk ganti password
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [modalError, setModalError] = useState('');

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const user = data.user;
        localStorage.setItem('user', JSON.stringify(user));

        // Jika Admin -> masuk dashboard admin
        if (user.role === 'admin') {
          router.push('/admin');
          return;
        }

        // Jika Siswa baru pertama login -> wajib ganti pw
        if (user.isDefaultPassword) {
          setUserId(user.id);
          setShowModal(true);
        } else {
          router.push('/kuis');
        }
      } else {
        setErrorMsg(data.message || 'Login gagal!');
      }
    } catch (err) {
      setErrorMsg('Gagal menghubungkan ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setModalError('');

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('Password berhasil diubah!');
        setShowModal(false);
        router.push('/kuis');
      } else {
        setModalError(data.message || 'Gagal mengubah password');
      }
    } catch (err) {
      setModalError('Kesalahan jaringan.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <h2>PORTAL KUIS TK A</h2>
          <p>Masukan Username & Password</p>
        </div>

        {errorMsg && <div style={styles.alert}>{errorMsg}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'PROSES...' : 'MASUK'}
          </button>
        </form>

        <div style={styles.footer}>&copy; 2026 Portal Kuis TK Pembina</div>
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ fontSize: '15px', marginBottom: '8px' }}>Ganti Password Default</h3>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
              Masukkan password baru pilihanmu untuk keamanan.
            </p>

            {modalError && <div style={styles.alert}>{modalError}</div>}

            <form onSubmit={handleChangePassword}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password Baru"
                  required
                  style={styles.input}
                />
              </div>

              <button type="submit" style={styles.button}>SIMPAN & SIMPAN</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#f4f6f9', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  loginBox: { backgroundColor: '#ffffff', width: '100%', maxWidth: '350px', padding: '25px', borderRadius: '6px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', border: '1px solid #ddd' },
  header: { textAlign: 'center', marginBottom: '20px' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', fontSize: '13px', color: '#444', marginBottom: '5px', fontWeight: 'bold' },
  input: { width: '100%', padding: '8px 10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '10px', backgroundColor: '#2b6cb0', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' },
  alert: { padding: '8px', backgroundColor: '#fed7d7', color: '#9b2c2c', borderRadius: '4px', fontSize: '12px', marginBottom: '15px', textAlign: 'center' },
  footer: { marginTop: '15px', textAlign: 'center', fontSize: '11px', color: '#888' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px' },
  modal: { backgroundColor: '#fff', padding: '20px', borderRadius: '6px', maxWidth: '300px', width: '100%' }
};
