'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const navItems = [
    { label: 'Overview', href: '/admin' },
    { label: 'Siswa', href: '/admin/users' },
    { label: 'Bank Soal', href: '/admin/soal' },
    { label: 'Hasil Kuis', href: '/admin/hasil' },
  ];

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background-color: #f7f4ed; }
      `}</style>

      <header style={styles.header}>
        <div style={styles.brandGroup}>
          <h1 style={styles.logo}>KuisTKA <span style={styles.badgeAdmin}>ADMIN</span></h1>
          <nav style={styles.navMenu}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    ...styles.navLink,
                    color: isActive ? '#1a1a1a' : '#777777',
                    fontWeight: isActive ? '700' : '500',
                    borderBottom: isActive ? '2px solid #f6ca85' : '2px solid transparent',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button onClick={handleLogout} style={styles.btnLogout}>
          Keluar Account
        </button>
      </header>

      <main style={styles.mainContainer}>{children}</main>

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
    padding: '0 40px',
    height: '70px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #eae5d9',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  logo: {
    fontSize: '20px',
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
  },
  navMenu: {
    display: 'flex',
    gap: '20px',
    height: '70px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '0 4px',
    transition: 'all 0.2s ease',
  },
  btnLogout: {
    backgroundColor: 'transparent',
    border: '1px solid #e2ddd0',
    padding: '8px 16px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '13px',
    color: '#555',
    cursor: 'pointer',
  },
  mainContainer: {
    flex: 1,
    maxWidth: '1040px',
    width: '100%',
    margin: '0 auto',
    padding: '32px 20px',
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
