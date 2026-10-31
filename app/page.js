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
  const [modalLoading, setModalLoading] = useState(false);
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

        if (user.role === 'admin') {
          router.push('/admin');
          return;
        }

        if (user.isDefaultPassword) {
          setUserId(user.id);
          setShowModal(true);
        } else {
          router.push('/kuis');
        }
      } else {
        setErrorMsg(data.message || 'Username atau password salah.');
      }
    } catch (err) {
      setErrorMsg('Gagal menghubungkan ke server. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowModal(false);
        router.push('/kuis');
      } else {
        setModalError(data.message || 'Gagal mengubah password');
      }
    } catch (err) {
      setModalError('Kesalahan jaringan.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        {/* Header Branding */}
        <div style={styles.header}>
          <div style={styles.badge}>PORTAL BELAJAR</div>
          <h1 style={styles.title}>Kuis TK A</h1>
          <p style={styles.subtitle}>Masukkan akun Anda untuk melanjutkan</p>
        </div>

        {errorMsg && <div style={styles.alert}>{errorMsg}</div>}

        {/* Form Login */}
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
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
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Memproses...' : 'Masuk ke Portal'}
          </button>
        </form>

        <div style={styles.footer}>&copy; 2026 TK Pembina. All rights reserved.</div>
      </div>

      {/* Modal Ganti Password */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Perbarui Password</h3>
              <p style={styles.modalSubtitle}>
                Ini adalah login pertama Anda. Buat password baru demi keamanan akun.
              </p>
            </div>

            {modalError && <div style={styles.alert}>{modalError}</div>}

            <form onSubmit={handleChangePassword} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  style={styles.input}
                />
              </div>

              <button type="submit" disabled={modalLoading} style={styles.button}>
                {modalLoading ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: '20px',
  },
  loginCard: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '380px',
    padding: '36px 32px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
    border: '1px solid #e2e8f0',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  badge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '4px 10px',
    borderRadius: '20px',
    marginBottom: '10px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  button: {
    width: '100%',
    padding: '11px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '6px',
    transition: 'background-color 0.2s ease',
  },
  alert: {
    padding: '10px 12px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '18px',
    textAlign: 'center',
  },
  footer: {
    marginTop: '28px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#94a3b8',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    zIndex: 50,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    padding: '28px 24px',
    borderRadius: '16px',
    maxWidth: '350px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
  },
  modalHeader: {
    marginBottom: '20px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  modalSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.4',
  },
};
