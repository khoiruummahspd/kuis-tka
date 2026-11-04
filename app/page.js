'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/kuis');
        }
      } else {
        setError(data.message || 'Login gagal, periksa username dan password');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: 'sans-serif',
      backgroundColor: '#f4f4f9',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '15px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#fff',
        padding: '24px 20px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        width: '100%',
        maxWidth: '360px',
        boxSizing: 'border-box',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', marginBottom: '18px' }}>
          <strong style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>Login Account</strong>
          <small style={{ color: '#666', fontSize: '12px' }}>Silakan masuk ke akun kuis kamu</small>
        </div>

        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#333' }}>Username:</label>
            <input
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#333' }}>Password:</label>
            <input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
              padding: '10px',
              background: '#0275d8',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
