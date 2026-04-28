export const metadata = {
  title: 'Guardian — Time Management & Focus App',
  description: 'Guardian helps you plan projects, build weekly schedules, block social media, and stay focused. 7-day free trial, then $3/month.',
  keywords: 'time management app, focus app, social media blocker, schedule builder, pomodoro timer, productivity app, deadline tracker',
  authors: [{ name: 'Guardian' }],
  metadataBase: new URL('https://www.guardianhours.com'),
  openGraph: {
    title: 'Guardian — Time Management & Focus App',
    description: 'Plan projects, build schedules, block distractions. Built for students and anyone who wants to actually get things done.',
    url: 'https://www.guardianhours.com',
    siteName: 'Guardian',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Guardian App' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guardian — Time Management & Focus App',
    description: 'Plan projects, build schedules, block distractions. $3/month.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="canonical" href="https://www.guardianhours.com" />
      </head>
      <body style={{ margin: 0, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
