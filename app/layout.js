export const metadata = {
  title: 'Kuis TKA',
  description: 'Portal Kuis Online TKA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f4f6f9' }}>
        {children}
      </body>
    </html>
  );
}
