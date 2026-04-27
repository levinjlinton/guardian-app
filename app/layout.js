export const metadata = {
  title: 'Guardian — Time Management',
  description: 'Plan your time, block distractions, hit your deadlines. $3/month.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
