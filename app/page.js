cat << 'EOF' > app/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isMustChange, setIsMustChange] = useState(false);
  const [userTemp, setUserTemp] = useState(null);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      if (data.user.isDefaultPassword && data.user.role === 'siswa') {
        setIsMustChange(true);
        setUserTemp(data.user);
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/kuis');
        }
      }
    } else {
      setError(data.message || 'Login gagal');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userTemp.id, newPassword }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert('Password berhasil diubah, silakan login kembali!');
      setIsMustChange(false);
      setPassword('');
      setNewPassword('');
    } else {
      setError(data.message || 'Gagal mengubah password');
    }
  };

  return (
    <div style={styles.container}>
      {/* Import Font Inter dari Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          background-color: #f3f4f6;
          margin: 0;
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.headerBox}>
          <h2 style={styles.title}>KUIS TKA</h2>
          <p style={styles.subtitle}>
            {isMustChange ? 'Pembaruan Password Akun' : 'Portal Pembelajaran & Evaluasi'}
          </p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        {!isMustChange ? (
          <form onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.btnPrimary}>
              Masuk ke Aplikasi
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword}>
            <p style={styles.infoText}>
              Password kamu masih bawaan/default. Silakan buat password baru agar lebih aman.
            </p>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password Baru</label>
              <input
                type="password"
                placeholder="Password baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <button type="submit" style={styles.btnSuccess}>
              Simpan Password Baru
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
    border: '1px solid #e5e7eb',
    padding: '32px 24px',
  },
  headerBox: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: '6px 0 0 0',
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '400',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#334155',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  infoText: {
    fontSize: '13px',
    color: '#475569',
    marginBottom: '16px',
    lineHeight: '1.4',
  },
  btnPrimary: {
    width: '100%',
    padding: '11px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '6px',
  },
  btnSuccess: {
    width: '100%',
    padding: '11px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '6px',
  },
};
EOF
