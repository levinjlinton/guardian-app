import Link from 'next/link';
import GuardianLogo from '../components/GuardianLogo';

export const metadata = {
  title: 'Privacy Policy — Guardian',
  description: 'Guardian privacy policy. Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link href="/" style={s.navLogo}>
          <GuardianLogo size={26} showText={true} textSize={16} />
        </Link>
        <Link href="/login" style={s.navLink}>Sign In →</Link>
      </nav>

      <div style={s.container}>
        <div style={s.header}>
          <h1 style={s.title}>Privacy Policy</h1>
          <p style={s.date}>Last updated: June 2025</p>
        </div>

        <div style={s.content}>

          <Section title="1. Overview">
            Guardian ("we", "us", "our") is a time management application available at guardianhours.com. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our service. By using Guardian, you agree to the practices described in this policy.
          </Section>

          <Section title="2. Information We Collect">
            <b>Account Information:</b> When you sign up, we collect your email address and, if you use Google Sign-In, your name and profile photo as provided by Google.<br/><br/>
            <b>User-Generated Content:</b> We store the projects, deadlines, schedule blocks, and settings you create within Guardian. This data is stored securely in our database and is only accessible to you.<br/><br/>
            <b>Google Calendar Data:</b> If you choose to connect your Google Calendar, we access your calendar events solely to display them within the Guardian schedule view and to allow you to sync Guardian schedule blocks to your Google Calendar. We do not store your Google Calendar events on our servers beyond what is needed to display them in your current session. We do not share your calendar data with any third parties.<br/><br/>
            <b>Usage Data:</b> We may collect basic usage information such as login timestamps and feature interactions to improve the app. This data is anonymized and not linked to your personal identity.
          </Section>

          <Section title="3. How We Use Google Calendar Data">
            Guardian's use of Google Calendar data is limited to the following:<br/><br/>
            • <b>Reading events:</b> We fetch your upcoming Google Calendar events to display them alongside your Guardian schedule, so you have a unified view of your week.<br/>
            • <b>Creating events:</b> When you choose to sync a Guardian schedule block to Google Calendar, we create a calendar event on your behalf.<br/><br/>
            We do not use your Google Calendar data for advertising, analytics, or any purpose beyond the features described above. We do not allow humans to read your Google Calendar data. Guardian's use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" style={s.link} target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.
          </Section>

          <Section title="4. Data Storage and Security">
            Your data is stored securely using Supabase, which provides row-level security ensuring only you can access your own data. We use industry-standard encryption for data in transit (HTTPS) and at rest. Google OAuth tokens used to access your Google Calendar are stored securely and encrypted.
          </Section>

          <Section title="5. Data Sharing">
            We do not sell, rent, or share your personal data with third parties for marketing purposes. We may share data only in the following limited circumstances:<br/><br/>
            • <b>Service providers:</b> We use Supabase (database), Stripe (payments), and Vercel (hosting) to operate Guardian. These providers only access your data as needed to provide their services and are bound by their own privacy policies.<br/>
            • <b>Legal requirements:</b> We may disclose your information if required by law or to protect the rights and safety of Guardian and its users.
          </Section>

          <Section title="6. Payments">
            Guardian uses Stripe to process subscription payments. We do not store your credit card information. All payment data is handled directly by Stripe and subject to their privacy policy. Your subscription status (active, inactive, canceled) is stored in our database to control access to the app.
          </Section>

          <Section title="7. Data Retention">
            We retain your data for as long as your account is active. If you cancel your subscription and delete your account, your data will be permanently deleted from our systems within 30 days. Google Calendar tokens are deleted immediately when you disconnect Google Calendar from the app.
          </Section>

          <Section title="8. Your Rights">
            You have the right to:<br/><br/>
            • Access the personal data we hold about you<br/>
            • Request correction of inaccurate data<br/>
            • Request deletion of your account and all associated data<br/>
            • Disconnect Google Calendar access at any time from Settings<br/>
            • Cancel your subscription at any time from Settings<br/><br/>
            To exercise any of these rights, contact us at <a href="mailto:privacy@guardianhours.com" style={s.link}>privacy@guardianhours.com</a>.
          </Section>

          <Section title="9. Cookies">
            Guardian uses essential cookies to maintain your login session. We do not use tracking cookies or third-party advertising cookies. You can disable cookies in your browser settings, but this will prevent you from staying logged in.
          </Section>

          <Section title="10. Children's Privacy">
            Guardian is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it.
          </Section>

          <Section title="11. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Continued use of Guardian after changes constitutes acceptance of the updated policy.
          </Section>

          <Section title="12. Contact Us">
            If you have questions about this Privacy Policy or how we handle your data, please contact us at:<br/><br/>
            <b>Email:</b> <a href="mailto:privacy@guardianhours.com" style={s.link}>privacy@guardianhours.com</a><br/>
            <b>Website:</b> <a href="https://www.guardianhours.com" style={s.link}>guardianhours.com</a>
          </Section>

        </div>
      </div>

      <footer style={s.footer}>
        <Link href="/" style={s.footerLink}>← Back to Guardian</Link>
        <Link href="/login" style={s.footerLink}>Sign In</Link>
      </footer>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 12 }}>{title}</h2>
      <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.8 }}>{children}</p>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0f0f13', color: '#e2e8f0', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 60px', borderBottom: '1px solid #2a2a3a', position: 'sticky', top: 0, background: 'rgba(15,15,19,0.95)', backdropFilter: 'blur(10px)', zIndex: 100 },
  navLogo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  navLink: { color: '#818cf8', textDecoration: 'none', fontSize: 13, fontWeight: 600 },
  container: { maxWidth: 740, margin: '0 auto', padding: '60px 40px' },
  header: { marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #2a2a3a' },
  title: { fontSize: 40, fontWeight: 900, letterSpacing: -1.5, marginBottom: 8 },
  date: { fontSize: 13, color: '#475569' },
  content: {},
  link: { color: '#818cf8', textDecoration: 'none' },
  footer: { borderTop: '1px solid #2a2a3a', padding: '24px 60px', display: 'flex', gap: 32 },
  footerLink: { color: '#64748b', textDecoration: 'none', fontSize: 13 },
};
