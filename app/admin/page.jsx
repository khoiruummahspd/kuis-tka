'use client';

import { useState, useEffect } from 'react';

export default function AdminOverview() {
  const [metrics, setMetrics] = useState({ usersCount: 0, questionsCount: 0, totalSubmissions: 0 });
  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    async function loadOverview() {
      try {
        const [resUsers, resQ] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/questions'),
        ]);
        
        const dataUsers = await resUsers.json();
        const dataQ = await resQ.json();

        if (dataUsers.success) {
          const results = dataUsers.results || [];
          setMetrics({
            usersCount: dataUsers.users.length,
            questionsCount: dataQ.success ? dataQ.questions.length : 0,
            totalSubmissions: results.length,
          });
          setRecentResults(results.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadOverview();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <section style={styles.welcomeCard}>
        <h2 style={styles.title}>Ringkasan Sistem</h2>
        <p style={styles.subtitle}>Statistik keseluruhan aktivitas platform Kuis TKA saat ini.</p>
      </section>

      <div style={styles.statsGrid}>
        <div style={styles.statBox}>
          <span style={styles.statNum}>{metrics.usersCount}</span>
          <span style={styles.statLabel}>Siswa Terdaftar</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statNum}>{metrics.questionsCount}</span>
          <span style={styles.statLabel}>Bank Soal</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statNum}>{metrics.totalSubmissions}</span>
          <span style={styles.statLabel}>Sesi Kuis Selesai</span>
        </div>
      </div>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Aktivitas Kuis Terbaru</h3>
        {recentResults.length === 0 ? (
          <p style={{ color: '#888', fontSize: '13px' }}>Belum ada aktivitas kuis terbaru.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
            {recentResults.map((res, i) => (
              <div key={i} style={styles.activityItem}>
                <div>
                  <strong style={{ fontSize: '14px' }}>{res.nama || 'Siswa'}</strong>
                  <div style={{ fontSize: '12px', color: '#666' }}>Kategori: {res.kategori}</div>
                </div>
                <span style={styles.scoreBadge}>Skor: {res.skor}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '24px 28px',
    border: '1px solid #eae5d9',
  },
  title: { fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0' },
  subtitle: { fontSize: '13px', color: '#777', margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  statBox: {
    backgroundColor: '#ffffff',
    border: '1px solid #eae5d9',
    padding: '20px',
    borderRadius: '16px',
    textAlign: 'center',
  },
  statNum: { fontSize: '28px', fontWeight: '800', color: '#1a1a1a', display: 'block' },
  statLabel: { fontSize: '12px', color: '#777', fontWeight: '600' },
  card: { backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px 28px', border: '1px solid #eae5d9' },
  cardTitle: { fontSize: '16px', fontWeight: '700', margin: 0 },
  activityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#faf8f5',
    borderRadius: '10px',
    border: '1px solid #e2ddd0',
  },
  scoreBadge: {
    backgroundColor: '#fff4e5',
    color: '#b76e00',
    border: '1px solid #ffe0b2',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
  },
};
