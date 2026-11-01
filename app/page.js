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
      setError(data.message || 'Login gagal, periksa username dan password');
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
    <div style={styles.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background-color: #f7f4ed; }
      `}</style>

      {/* MAIN CONTAINER */}
      <main style={styles.mainContainer}>
        {/* ELEMENT DEKORASI LOKAL/CANVAS */}
        <div style={styles.decoBoxLeft}></div>
        <div style={styles.decoBoxRight}></div>

        {/* FLOATING CARD */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            {isMustChange ? 'Ubah Password' : 'Login Akun'}
          </h2>
          <p style={styles.cardSubtitle}>
            {isMustChange
              ? 'Password kamu masih bawaan, silakan perbarui'
              : 'Masukkan username & password untuk memulai kuis'}
          </p>

          {error && <div style={styles.errorAlert}>{error}</div>}

          {!isMustChange ? (
            <form onSubmit={handleLogin}>
              <div style={styles.inputBox}>
                <input
                  type="text"
                  placeholder="Username / No. Induk"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputBox}>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <button type="submit" style={styles.btnOrange}>
                Masuk Sekarang
              </button>
            </form>
          ) : (
            <form onSubmit={handleChangePassword}>
              <div style={styles.inputBox}>
                <input
                  type="password"
                  placeholder="Password Baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <button type="submit" style={styles.btnOrange}>
                Simpan Password
              </button>
            </form>
          )}

          {/* SOCIAL / OPTION DUMMY BADGES */}
          <div style={styles.dividerBox}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>Aplikasi Pembelajaran TK A</span>
            <span style={styles.dividerLine}></span>
          </div>

          <div style={styles.roleBadges}>
            <div style={styles.badge}>Siswa TK A</div>
            <div style={styles.badge}>Guru / Admin</div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        Copyright @KuisTKA 2026 | Privasi & Keamanan
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
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 48px',
  },
  logo: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    color: '#1a1a1a',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  helpText: {
    fontSize: '13px',
    color: '#666',
    fontWeight: '500',
  },
  btnNav: {
    backgroundColor: '#f6ca85',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    color: '#1a1a1a',
    cursor: 'pointer',
  },
  mainContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: '20px',
  },
  decoBoxLeft: {
    position: 'absolute',
    left: '10%',
    bottom: '15%',
    width: '80px',
    height: '140px',
    backgroundColor: '#f4c467',
    borderRadius: '12px',
    opacity: 0.8,
    zIndex: 1,
  },
  decoBoxRight: {
    position: 'absolute',
    right: '12%',
    bottom: '12%',
    width: '70px',
    height: '100px',
    backgroundColor: '#f6ca85',
    borderRadius: '12px',
    opacity: 0.8,
    zIndex: 1,
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '40px 32px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04)',
    textAlign: 'center',
    zIndex: 2,
    border: '1px solid #eae5d9',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#1a1a1a',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: '#777777',
    margin: '0 0 28px 0',
    lineHeight: '1.4',
  },
  inputBox: {
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid #e2ddd0',
    backgroundColor: '#faf8f5',
    fontSize: '13px',
    outline: 'none',
    color: '#333',
  },
  btnOrange: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#f6ca85',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 12px rgba(246, 202, 133, 0.4)',
  },
  errorAlert: {
    backgroundColor: '#fde8e8',
    color: '#9b1c1c',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '12px',
    marginBottom: '16px',
  },
  dividerBox: {
    display: 'flex',
    alignItems: 'center',
    margin: '28px 0 20px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#eee',
  },
  dividerText: {
    fontSize: '11px',
    color: '#aaa',
    padding: '0 10px',
  },
  roleBadges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  badge: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #eee',
    fontSize: '12px',
    fontWeight: '600',
    color: '#555',
    backgroundColor: '#fafafa',
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    fontSize: '12px',
    color: '#888888',
  },
};
