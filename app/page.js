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
    <div style={styles.wrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background-color: #0f0f15; }
        @media (max-width: 768px) {
          .login-card { flex-direction: column-reverse !important; width: 95% !important; }
          .side-banner { padding: 30px 20px !important; text-align: center; }
        }
      `}</style>

      <div className="login-card" style={styles.card}>
        {/* SISI KIRI: FORM LOGIN */}
        <div style={styles.formSection}>
          <div style={styles.logoCircle}></div>
          <h2 style={styles.title}>
            {isMustChange ? 'Ganti Password' : 'Log in / Masuk Akun'}
          </h2>

          {error && <div style={styles.errorAlert}>{error}</div>}

          {!isMustChange ? (
            <form onSubmit={handleLogin}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  placeholder="Username siswa / admin"
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
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <button type="submit" style={styles.btnGradient}>
                Log in
              </button>
            </form>
          ) : (
            <form onSubmit={handleChangePassword}>
              <p style={styles.infoText}>
                Password kamu masih default. Masukkan password baru demi keamanan.
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
              <button type="submit" style={styles.btnGradient}>
                Simpan Password Baru
              </button>
            </form>
          )}
        </div>

        {/* SISI KANAN: BANNER GRADIENT */}
        <div className="side-banner" style={styles.bannerSection}>
          <h1 style={styles.bannerTitle}>Kuis TKA</h1>
          <p style={styles.bannerText}>
            Aplikasi kuis interaktif untuk siswa TK A. Mudah dikerjakan, cepat, dan terorganisir.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Poppins', sans-serif",
    padding: '20px',
  },
  card: {
    display: 'flex',
    width: '850px',
    maxWidth: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  },
  formSection: {
    flex: 1,
    padding: '40px 35px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logoCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '4px solid #8b5cf6',
    marginBottom: '15px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: '25px',
  },
  inputGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '6px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '13px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    outline: 'none',
  },
  btnGradient: {
    width: '100%',
    padding: '12px',
    marginTop: '10px',
    border: 'none',
    borderRadius: '20px',
    background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '12px',
    marginBottom: '15px',
  },
  infoText: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '15px',
  },
  bannerSection: {
    flex: 1,
    background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #f43f5e 100%)',
    padding: '50px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: '#ffffff',
  },
  bannerTitle: {
    fontSize: '36px',
    fontWeight: '700',
    margin: '0 0 10px 0',
  },
  bannerText: {
    fontSize: '13px',
    lineHeight: '1.6',
    opacity: 0.9,
    margin: 0,
  },
};
EOF
