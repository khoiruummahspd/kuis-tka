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

          {/* LOGIN VIA GOOGLE SECTION */}
          <div style={styles.dividerBox}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>atau masuk dengan</span>
            <span style={styles.dividerLine}></span>
          </div>

          <button
            type="button"
            onClick={() => alert('Fitur Google Auth bisa disambungkan nanti!')}
            style={styles.googleBtn}
          >
            {/* Logo Google SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '10px' }}>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </button>
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
  googleBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #e2ddd0',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    color: '#333333',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    fontSize: '12px',
    color: '#888888',
  },
};
