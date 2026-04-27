import Link from 'next/link';

const features = [
  { icon: '📁', title: 'Project & Deadline Tracking', desc: 'Add projects with deadlines, priorities, and progress. Get alerted when due dates are close.' },
  { icon: '📅', title: 'Smart Schedule Builder', desc: 'Build your weekly schedule with time blocks. Hit Auto-Schedule and Guardian fills in your work sessions automatically.' },
  { icon: '🚫', title: 'Social Media Blocker', desc: 'Install the Chrome extension and Guardian blocks Instagram, TikTok, X, and YouTube while you focus.' },
  { icon: '🎯', title: 'Pomodoro Focus Timer', desc: '25, 45, or 90-minute sessions. Stay in the zone with a clean countdown timer.' },
  { icon: '☁️', title: 'Syncs Across Devices', desc: 'Log in from any device and your projects and schedule are always up to date.' },
  { icon: '🎨', title: 'Themes', desc: 'Dark, Light, Ocean, Forest, Bold, Rose — pick the vibe that keeps you motivated.' },
];

export default function LandingPage() {
  return (
    <div style={s.page}>
      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <div style={s.logoIcon}>🛡️</div>
          <span style={s.logoName}>Guardian</span>
        </div>
        <div style={s.navRight}>
          <Link href="/login" style={s.navLink}>Sign In</Link>
          <Link href="/login" style={s.btnPrimary}>Start Free Trial →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroContent}>
          <div style={s.heroBadge}>🛡️ Your personal time guardian</div>
          <h1 style={s.heroTitle}>
            Stop scrolling.<br />Start shipping.
          </h1>
          <p style={s.heroSub}>
            Guardian helps you plan projects, build schedules, and block social media — all in one focused workspace. Built for students and anyone who wants to actually get things done.
          </p>
          <div style={s.heroCtas}>
            <Link href="/login" style={s.btnPrimary}>Start 7-Day Free Trial</Link>
            <span style={s.heroPrice}>then $3 / month · Cancel anytime</span>
          </div>
        </div>

        {/* Mini app preview */}
        <div style={s.heroPreview}>
          <div style={s.previewCard}>
            <div style={s.previewHeader}>
              <div style={s.previewDot}></div>
              <div style={{...s.previewDot, background:'#fbbf24'}}></div>
              <div style={{...s.previewDot, background:'#4ade80'}}></div>
              <span style={s.previewTitle}>Guardian</span>
            </div>
            {[
              { name: 'History Essay', priority: 'high', prog: 35, days: '2d left', color: '#f87171' },
              { name: 'Math Problem Set', priority: 'medium', prog: 70, days: '5d left', color: '#fbbf24' },
              { name: 'CS Project', priority: 'low', prog: 10, days: '12d left', color: '#4ade80' },
            ].map(p => (
              <div key={p.name} style={s.previewItem}>
                <div style={s.previewItemTop}>
                  <span style={s.previewName}>{p.name}</span>
                  <span style={{...s.previewUrgency, color: p.color}}>{p.days}</span>
                </div>
                <div style={s.previewBar}><div style={{...s.previewFill, width:`${p.prog}%`}}></div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Everything you need to stay on track</h2>
        <p style={s.sectionSub}>No fluff. Just the tools that actually help you manage your time.</p>
        <div style={s.featuresGrid}>
          {features.map(f => (
            <div key={f.title} style={s.featureCard}>
              <div style={s.featureIcon}>{f.icon}</div>
              <h3 style={s.featureTitle}>{f.title}</h3>
              <p style={s.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Simple pricing</h2>
        <p style={s.sectionSub}>One plan. Everything included. Cancel whenever.</p>
        <div style={s.pricingCard}>
          <div style={s.pricingLeft}>
            <div style={s.pricingBadge}>Guardian Pro</div>
            <div style={s.pricingPrice}>$3<span style={s.pricingPer}>/month</span></div>
            <div style={s.pricingTrial}>7-day free trial · No credit card required upfront</div>
          </div>
          <div style={s.pricingFeatures}>
            {['Unlimited projects & deadlines','Weekly schedule builder with auto-scheduling','Pomodoro focus timer','Chrome extension to block social media','6 themes','Synced across all your devices','Cancel anytime'].map(f=>(
              <div key={f} style={s.pricingFeature}><span style={s.check}>✓</span> {f}</div>
            ))}
          </div>
          <Link href="/login" style={{...s.btnPrimary, fontSize:16, padding:'14px 32px', alignSelf:'center'}}>
            Start Free Trial →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerLogo}>🛡️ Guardian</div>
        <div style={s.footerLinks}>
          <a href="#" style={s.footerLink}>Privacy</a>
          <a href="#" style={s.footerLink}>Terms</a>
          <a href="mailto:support@guardianapp.com" style={s.footerLink}>Support</a>
        </div>
        <div style={s.footerCopy}>© 2025 Guardian. All rights reserved.</div>
      </footer>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'#0f0f13', color:'#e2e8f0', fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  nav: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 60px', borderBottom:'1px solid #2a2a3a', position:'sticky', top:0, background:'rgba(15,15,19,0.9)', backdropFilter:'blur(10px)', zIndex:100 },
  navLogo: { display:'flex', alignItems:'center', gap:10 },
  logoIcon: { width:36, height:36, background:'#818cf8', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 },
  logoName: { fontSize:18, fontWeight:800, color:'#e2e8f0' },
  navRight: { display:'flex', alignItems:'center', gap:16 },
  navLink: { color:'#94a3b8', textDecoration:'none', fontSize:14, fontWeight:500 },
  hero: { display:'flex', alignItems:'center', gap:60, padding:'80px 60px', maxWidth:1200, margin:'0 auto', flexWrap:'wrap' },
  heroContent: { flex:1, minWidth:300 },
  heroBadge: { display:'inline-block', background:'rgba(129,140,248,0.15)', color:'#818cf8', padding:'6px 16px', borderRadius:100, fontSize:13, fontWeight:600, marginBottom:24 },
  heroTitle: { fontSize:56, fontWeight:900, lineHeight:1.1, letterSpacing:-2, marginBottom:20, background:'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  heroSub: { fontSize:17, color:'#94a3b8', lineHeight:1.7, marginBottom:32, maxWidth:480 },
  heroCtas: { display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' },
  heroPrice: { fontSize:13, color:'#64748b' },
  heroPreview: { flex:1, minWidth:280, display:'flex', justifyContent:'center' },
  previewCard: { background:'#1a1a24', border:'1px solid #2a2a3a', borderRadius:16, padding:20, width:'100%', maxWidth:340, boxShadow:'0 24px 64px rgba(0,0,0,0.5)' },
  previewHeader: { display:'flex', alignItems:'center', gap:8, marginBottom:20 },
  previewDot: { width:12, height:12, borderRadius:'50%', background:'#f87171' },
  previewTitle: { fontSize:13, fontWeight:700, color:'#94a3b8', marginLeft:'auto' },
  previewItem: { marginBottom:14, padding:'12px', background:'#222232', borderRadius:8 },
  previewItemTop: { display:'flex', justifyContent:'space-between', marginBottom:8 },
  previewName: { fontSize:13, fontWeight:600, color:'#e2e8f0' },
  previewUrgency: { fontSize:11, fontWeight:700 },
  previewBar: { height:4, background:'#2a2a3a', borderRadius:100, overflow:'hidden' },
  previewFill: { height:'100%', background:'#818cf8', borderRadius:100 },
  section: { padding:'80px 60px', maxWidth:1200, margin:'0 auto' },
  sectionTitle: { fontSize:36, fontWeight:800, letterSpacing:-1, textAlign:'center', marginBottom:12 },
  sectionSub: { fontSize:16, color:'#94a3b8', textAlign:'center', marginBottom:48 },
  featuresGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 },
  featureCard: { background:'#1a1a24', border:'1px solid #2a2a3a', borderRadius:16, padding:24, transition:'box-shadow 0.2s' },
  featureIcon: { fontSize:32, marginBottom:14 },
  featureTitle: { fontSize:16, fontWeight:700, marginBottom:8 },
  featureDesc: { fontSize:13, color:'#94a3b8', lineHeight:1.7 },
  pricingCard: { background:'linear-gradient(135deg, #1a1a24 0%, #222232 100%)', border:'1px solid #2a2a3a', borderRadius:20, padding:40, display:'flex', alignItems:'flex-start', gap:40, flexWrap:'wrap' },
  pricingLeft: { minWidth:180 },
  pricingBadge: { fontSize:12, fontWeight:700, color:'#818cf8', textTransform:'uppercase', letterSpacing:1, marginBottom:12 },
  pricingPrice: { fontSize:56, fontWeight:900, letterSpacing:-2, marginBottom:8 },
  pricingPer: { fontSize:20, fontWeight:400, color:'#94a3b8' },
  pricingTrial: { fontSize:12, color:'#64748b' },
  pricingFeatures: { flex:1, display:'flex', flexDirection:'column', gap:10 },
  pricingFeature: { fontSize:14, color:'#94a3b8', display:'flex', alignItems:'center', gap:8 },
  check: { color:'#4ade80', fontWeight:700 },
  footer: { borderTop:'1px solid #2a2a3a', padding:'40px 60px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 },
  footerLogo: { fontSize:16, fontWeight:700 },
  footerLinks: { display:'flex', gap:24 },
  footerLink: { color:'#64748b', textDecoration:'none', fontSize:13 },
  footerCopy: { fontSize:12, color:'#475569' },
  btnPrimary: { background:'#818cf8', color:'#fff', padding:'11px 22px', borderRadius:10, textDecoration:'none', fontWeight:700, fontSize:14, display:'inline-flex', alignItems:'center', gap:6, transition:'background 0.2s', border:'none', cursor:'pointer' },
};
