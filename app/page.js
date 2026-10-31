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
      {/* Decorative background blobs */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      <div style={styles.loginBox}>
        <div style={styles.header}>
          <div style={styles.badge}>🎨 TK PEMBINA</div>
          <h2 style={styles.title}>PORTAL KUIS TK A</h2>
          <p style={styles.subtitle}>Masukkan Username & Password untuk memulai</p>
        </div>

        {errorMsg && <div style={styles.alert}>{errorMsg}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ketik username kamu..."
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
            {loading ? (
              <span style={styles.loadingContainer}>
                <span style={styles.spinner}></span> Memproses...
              </span>
            ) : (
              'MASUK SEKARANG 🚀'
            )}
          </button>
        </form>

        <div style={styles.footer}>&copy; 2026 Portal Kuis TK Pembina. All rights reserved.</div>
      </div>

      {/* Modal Change Password */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <span style={{ fontSize: '24px' }}>🔒</span>
              <h3 style={styles.modalTitle}>Ganti Password Default</h3>
            </div>
            <p style={styles.modalSubtitle}>
              Masukkan password baru pilihanmu untuk menjaga keamanan akun.
            </p>

            {modalError && <div style={styles.alert}>{modalError}</div>}

            <form onSubmit={handleChangePassword}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ketik password baru..."
                  required
                  style={styles.input}
                />
              </div>

              <button type="submit" style={styles.modalButton}>
                SIMPAN & LANJUTKAN ✨
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
    backgroundColor: '#f0f4f9',
    backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  bgCircle1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    top: '-50px',
    left: '-50px',
    opacity: 0.15,
    filter: 'blur(40px)',
  },
  bgCircle2: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    bottom: '-80px',
    right: '-80px',
    opacity: 0.15,
    filter: 'blur(50px)',
  },
  loginBox: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '400px',
    padding: '36px 30px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
    border: '1px solid #e2e8f0',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: '700',
    borderRadius: '20px',
    letterSpacing: '0.5px',
    marginBottom: '10px',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: '6px 0 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: '#334155',
    marginBottom: '6px',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s ease',
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
    transition: 'all 0.2s ease',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  alert: {
    padding: '10px 14px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    marginTop: '24px',
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    zIndex: 100,
  },
  modal: {
    backgroundColor: '#ffffff',
    padding: '28px 24px',
    borderRadius: '16px',
    maxWidth: '360px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
  },
  modalTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  modalSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '20px',
    lineHeight: '1.4',
  },
  modalButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '5px',
    boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)',
  },
};
