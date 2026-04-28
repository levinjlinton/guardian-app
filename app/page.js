import Link from 'next/link';
import { FolderOpen, Calendar, ShieldOff, Target, Cloud, Palette, CheckCircle, ArrowRight } from 'lucide-react';
import GuardianLogo from './components/GuardianLogo';

const features = [
  { icon: <FolderOpen size={28}/>, title: 'Project & Deadline Tracking', desc: 'Add projects with deadlines, priorities, and progress tracking. Get alerted when due dates are approaching so nothing slips through the cracks.' },
  { icon: <Calendar size={28}/>, title: 'Smart Schedule Builder', desc: 'Build your weekly schedule with time blocks. Hit Auto-Schedule and Guardian fills your work sessions automatically around your projects.' },
  { icon: <ShieldOff size={28}/>, title: 'Social Media Blocker', desc: 'Install the Chrome extension and Guardian blocks Instagram, TikTok, X, and YouTube while you focus. Out of sight, out of mind.' },
  { icon: <Target size={28}/>, title: 'Pomodoro Focus Timer', desc: '25, 45, or 90-minute focus sessions with a clean countdown timer. Work in bursts, rest between them, and get more done.' },
  { icon: <Cloud size={28}/>, title: 'Syncs Across Devices', desc: 'Log in from any device — your projects, schedule, and settings are always up to date and ready to go.' },
  { icon: <Palette size={28}/>, title: '6 Beautiful Themes', desc: 'Dark, Light, Ocean, Forest, Bold, Rose — pick the vibe that keeps you in the zone and motivated to work.' },
];

const steps = [
  { num: '01', title: 'Add your projects', desc: 'Enter your tasks, deadlines, and how many hours each will take. Guardian keeps them sorted by urgency.' },
  { num: '02', title: 'Build your week', desc: 'Open the Schedule view and hit Auto-Schedule. Guardian fills your free hours with work blocks automatically.' },
  { num: '03', title: 'Focus and block', desc: 'Turn on the site blocker, start your timer, and work without distractions. Check things off as you go.' },
];

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes — 7 days completely free. No credit card required upfront. Cancel anytime before the trial ends and you won\'t be charged.' },
  { q: 'What is the Chrome extension for?', a: 'It blocks social media sites like Instagram, TikTok, Twitter, and YouTube so you can\'t open them while you\'re supposed to be working. You control which sites are blocked.' },
  { q: 'Does it work on mobile?', a: 'Guardian works in any mobile browser. Just go to guardianhours.com on your phone and log in — everything syncs.' },
  { q: 'Can I cancel anytime?', a: 'Yes, cancel anytime from the Settings page inside the app. No questions asked, no hidden fees.' },
  { q: 'Who is Guardian built for?', a: 'Students, freelancers, and anyone who struggles with staying on top of deadlines or gets distracted by their phone. If you have things to do and can\'t stop scrolling, Guardian is for you.' },
  { q: 'Is my data safe?', a: 'Your data is stored securely in Supabase with row-level security — only you can access your projects and schedule.' },
];

const testimonials = [
  { name: 'Alex R.', role: 'University Student', text: 'I used to forget deadlines constantly. Guardian fixed that. I check it every morning now.' },
  { name: 'Maya T.', role: 'Freelance Designer', text: 'The auto-schedule feature alone is worth $3. It plans my whole week in seconds.' },
  { name: 'Jordan K.', role: 'High School Senior', text: 'The site blocker is brutal (in a good way). I actually finish my homework now.' },
];

export default function LandingPage() {
  return (
    <div style={s.page}>
      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <GuardianLogo size={30} showText={true} textSize={17} />
        </div>
        <div style={s.navRight}>
          <Link href="#features" style={s.navLink}>Features</Link>
          <Link href="#how-it-works" style={s.navLink}>How it works</Link>
          <Link href="#pricing" style={s.navLink}>Pricing</Link>
          <Link href="/login" style={s.navLink}>Sign In</Link>
          <Link href="/login" style={s.btnPrimary}>Start Free Trial →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroContent}>
          <div style={s.heroBadge}>Your personal time guardian</div>
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
          <div style={s.heroStats}>
            {[['7-day', 'Free trial'],['$3/mo', 'After trial'],['6', 'Themes'],['∞', 'Projects']].map(([val, label]) => (
              <div key={label} style={s.heroStat}>
                <div style={s.heroStatVal}>{val}</div>
                <div style={s.heroStatLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini app preview */}
        <div style={s.heroPreview}>
          <div style={s.previewCard}>
            <div style={s.previewHeader}>
              <div style={s.previewDot}></div>
              <div style={{...s.previewDot, background:'#fbbf24'}}></div>
              <div style={{...s.previewDot, background:'#4ade80'}}></div>
              <span style={s.previewTitle}>Guardian — Dashboard</span>
            </div>
            <div style={s.previewStats}>
              {[['3','Active'],['1','Due Soon'],['4','Blocks']].map(([v,l])=>(
                <div key={l} style={s.previewStat}><div style={s.previewStatVal}>{v}</div><div style={s.previewStatLabel}>{l}</div></div>
              ))}
            </div>
            {[
              { name: 'History Essay', prog: 35, days: '2d left', color: '#f87171' },
              { name: 'Math Problem Set', prog: 70, days: '5d left', color: '#fbbf24' },
              { name: 'CS Project', prog: 10, days: '12d left', color: '#4ade80' },
            ].map(p => (
              <div key={p.name} style={s.previewItem}>
                <div style={s.previewItemTop}>
                  <span style={s.previewName}>{p.name}</span>
                  <span style={{...s.previewUrgency, color: p.color}}>{p.days}</span>
                </div>
                <div style={s.previewBar}><div style={{...s.previewFill, width:`${p.prog}%`}}></div></div>
              </div>
            ))}
            <div style={s.previewBlocker}>
              <span style={s.previewBlockerDot}></span>
              <span style={{fontSize:11,color:'#4ade80',fontWeight:600}}>Site blocker active</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={s.section}>
        <h2 style={s.sectionTitle}>Up and running in 3 steps</h2>
        <p style={s.sectionSub}>No complicated setup. Just sign in and start managing your time.</p>
        <div style={s.stepsGrid}>
          {steps.map((step, i) => (
            <div key={step.num} style={s.stepCard}>
              <div style={s.stepNum}>{step.num}</div>
              {i < steps.length - 1 && <div style={s.stepArrow}>→</div>}
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={s.section}>
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

      {/* TESTIMONIALS */}
      <section style={{...s.section, background:'#1a1a24', borderRadius:24, margin:'0 40px 80px'}}>
        <h2 style={s.sectionTitle}>What people are saying</h2>
        <div style={s.testimonialsGrid}>
          {testimonials.map(t => (
            <div key={t.name} style={s.testimonialCard}>
              <p style={s.testimonialText}>"{t.text}"</p>
              <div style={s.testimonialAuthor}>
                <div style={s.testimonialAvatar}>{t.name[0]}</div>
                <div>
                  <div style={s.testimonialName}>{t.name}</div>
                  <div style={s.testimonialRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={s.section}>
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
              <div key={f} style={s.pricingFeature}><CheckCircle size={15} color="#4ade80"/> {f}</div>
            ))}
          </div>
          <Link href="/login" style={{...s.btnPrimary, fontSize:16, padding:'14px 32px', alignSelf:'center'}}>
            Start Free Trial →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Frequently asked questions</h2>
        <div style={s.faqGrid}>
          {faqs.map(f => (
            <div key={f.q} style={s.faqCard}>
              <h3 style={s.faqQ}>{f.q}</h3>
              <p style={s.faqA}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={s.ctaBanner}>
        <h2 style={s.ctaTitle}>Ready to take back your time?</h2>
        <p style={s.ctaSub}>Join Guardian and start your 7-day free trial today. No credit card needed.</p>
        <Link href="/login" style={{...s.btnPrimary, fontSize:16, padding:'14px 36px'}}>Get Started Free →</Link>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerTop}>
          <div>
            <div style={s.footerLogo}><GuardianLogo size={24} showText={true} textSize={15} textColor="#94a3b8" /></div>
            <p style={s.footerTagline}>Plan your time. Block your distractions.<br/>Hit your deadlines.</p>
          </div>
          <div style={s.footerLinks}>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Product</div>
              <a href="#features" style={s.footerLink}>Features</a>
              <a href="#pricing" style={s.footerLink}>Pricing</a>
              <a href="#how-it-works" style={s.footerLink}>How it works</a>
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Account</div>
              <Link href="/login" style={s.footerLink}>Sign In</Link>
              <Link href="/login" style={s.footerLink}>Create Account</Link>
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Legal</div>
              <Link href="/privacy" style={s.footerLink}>Privacy Policy</Link>
              <a href="#" style={s.footerLink}>Terms of Service</a>
              <a href="mailto:support@guardianhours.com" style={s.footerLink}>Support</a>
            </div>
          </div>
        </div>
        <div style={s.footerBottom}>
          <div style={s.footerCopy}>© 2025 Guardian. All rights reserved.</div>
          <div style={s.footerCopy}>guardianhours.com</div>
        </div>
      </footer>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'#0f0f13', color:'#e2e8f0', fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  nav: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 60px', borderBottom:'1px solid #2a2a3a', position:'sticky', top:0, background:'rgba(15,15,19,0.92)', backdropFilter:'blur(12px)', zIndex:100 },
  navLogo: { display:'flex', alignItems:'center', gap:10 },
  logoIcon: { width:34, height:34, background:'#818cf8', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 },
  logoName: { fontSize:17, fontWeight:800, color:'#e2e8f0' },
  navRight: { display:'flex', alignItems:'center', gap:20 },
  navLink: { color:'#94a3b8', textDecoration:'none', fontSize:13, fontWeight:500 },
  hero: { display:'flex', alignItems:'center', gap:60, padding:'80px 60px', maxWidth:1200, margin:'0 auto', flexWrap:'wrap' },
  heroContent: { flex:1, minWidth:300 },
  heroBadge: { display:'inline-block', background:'rgba(129,140,248,0.15)', color:'#818cf8', padding:'6px 16px', borderRadius:100, fontSize:13, fontWeight:600, marginBottom:24 },
  heroTitle: { fontSize:56, fontWeight:900, lineHeight:1.1, letterSpacing:-2, marginBottom:20, background:'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  heroSub: { fontSize:17, color:'#94a3b8', lineHeight:1.7, marginBottom:32, maxWidth:480 },
  heroCtas: { display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', marginBottom:32 },
  heroPrice: { fontSize:13, color:'#64748b' },
  heroStats: { display:'flex', gap:32, flexWrap:'wrap' },
  heroStat: { textAlign:'center' },
  heroStatVal: { fontSize:22, fontWeight:800, color:'#818cf8' },
  heroStatLabel: { fontSize:11, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px', marginTop:2 },
  heroPreview: { flex:1, minWidth:280, display:'flex', justifyContent:'center' },
  previewCard: { background:'#1a1a24', border:'1px solid #2a2a3a', borderRadius:16, padding:20, width:'100%', maxWidth:340, boxShadow:'0 24px 64px rgba(0,0,0,0.5)' },
  previewHeader: { display:'flex', alignItems:'center', gap:6, marginBottom:16 },
  previewDot: { width:10, height:10, borderRadius:'50%', background:'#f87171' },
  previewTitle: { fontSize:11, fontWeight:600, color:'#475569', marginLeft:'auto' },
  previewStats: { display:'flex', gap:12, marginBottom:16 },
  previewStat: { flex:1, background:'#222232', borderRadius:8, padding:'8px 10px', textAlign:'center' },
  previewStatVal: { fontSize:18, fontWeight:800, color:'#818cf8' },
  previewStatLabel: { fontSize:9, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px' },
  previewItem: { marginBottom:10, padding:'10px 12px', background:'#222232', borderRadius:8 },
  previewItemTop: { display:'flex', justifyContent:'space-between', marginBottom:7 },
  previewName: { fontSize:12, fontWeight:600, color:'#e2e8f0' },
  previewUrgency: { fontSize:10, fontWeight:700 },
  previewBar: { height:3, background:'#2a2a3a', borderRadius:100, overflow:'hidden' },
  previewFill: { height:'100%', background:'#818cf8', borderRadius:100 },
  previewBlocker: { display:'flex', alignItems:'center', gap:6, marginTop:12, padding:'6px 10px', background:'rgba(74,222,128,0.08)', borderRadius:6 },
  previewBlockerDot: { width:6, height:6, borderRadius:'50%', background:'#4ade80', display:'inline-block' },
  section: { padding:'80px 60px', maxWidth:1200, margin:'0 auto' },
  sectionTitle: { fontSize:36, fontWeight:800, letterSpacing:-1, textAlign:'center', marginBottom:12 },
  sectionSub: { fontSize:16, color:'#94a3b8', textAlign:'center', marginBottom:48, maxWidth:520, margin:'0 auto 48px' },
  stepsGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, position:'relative' },
  stepCard: { background:'#1a1a24', border:'1px solid #2a2a3a', borderRadius:16, padding:28, position:'relative' },
  stepNum: { fontSize:36, fontWeight:900, color:'#818cf8', opacity:0.3, marginBottom:12, lineHeight:1 },
  stepArrow: { position:'absolute', right:-16, top:'40%', fontSize:20, color:'#2a2a3a', zIndex:1 },
  stepTitle: { fontSize:16, fontWeight:700, marginBottom:8 },
  stepDesc: { fontSize:13, color:'#94a3b8', lineHeight:1.7 },
  featuresGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 },
  featureCard: { background:'#1a1a24', border:'1px solid #2a2a3a', borderRadius:16, padding:24 },
  featureIcon: { fontSize:32, marginBottom:14 },
  featureTitle: { fontSize:16, fontWeight:700, marginBottom:8 },
  featureDesc: { fontSize:13, color:'#94a3b8', lineHeight:1.7 },
  testimonialsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 },
  testimonialCard: { background:'#222232', border:'1px solid #2a2a3a', borderRadius:16, padding:24 },
  testimonialText: { fontSize:14, color:'#cbd5e1', lineHeight:1.7, marginBottom:18, fontStyle:'italic' },
  testimonialAuthor: { display:'flex', alignItems:'center', gap:12 },
  testimonialAvatar: { width:36, height:36, background:'#818cf8', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 },
  testimonialName: { fontSize:13, fontWeight:700 },
  testimonialRole: { fontSize:11, color:'#64748b' },
  pricingCard: { background:'linear-gradient(135deg, #1a1a24 0%, #222232 100%)', border:'1px solid #2a2a3a', borderRadius:20, padding:40, display:'flex', alignItems:'flex-start', gap:40, flexWrap:'wrap' },
  pricingLeft: { minWidth:180 },
  pricingBadge: { fontSize:12, fontWeight:700, color:'#818cf8', textTransform:'uppercase', letterSpacing:1, marginBottom:12 },
  pricingPrice: { fontSize:56, fontWeight:900, letterSpacing:-2, marginBottom:8 },
  pricingPer: { fontSize:20, fontWeight:400, color:'#94a3b8' },
  pricingTrial: { fontSize:12, color:'#64748b' },
  pricingFeatures: { flex:1, display:'flex', flexDirection:'column', gap:10 },
  pricingFeature: { fontSize:14, color:'#94a3b8', display:'flex', alignItems:'center', gap:8 },
  check: { color:'#4ade80', fontWeight:700 },
  faqGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(440px, 1fr))', gap:16 },
  faqCard: { background:'#1a1a24', border:'1px solid #2a2a3a', borderRadius:14, padding:24 },
  faqQ: { fontSize:15, fontWeight:700, marginBottom:8, color:'#e2e8f0' },
  faqA: { fontSize:13, color:'#94a3b8', lineHeight:1.7 },
  ctaBanner: { background:'linear-gradient(135deg, #1e1040 0%, #12001f 100%)', margin:'0 40px 80px', borderRadius:24, padding:'64px 60px', textAlign:'center', border:'1px solid rgba(129,140,248,0.2)' },
  ctaTitle: { fontSize:40, fontWeight:900, letterSpacing:-1.5, marginBottom:12 },
  ctaSub: { fontSize:16, color:'#94a3b8', marginBottom:32 },
  footer: { borderTop:'1px solid #2a2a3a', padding:'48px 60px 32px' },
  footerTop: { display:'flex', justifyContent:'space-between', marginBottom:40, flexWrap:'wrap', gap:32 },
  footerLogo: { fontSize:18, fontWeight:800, marginBottom:10 },
  footerTagline: { fontSize:13, color:'#64748b', lineHeight:1.7 },
  footerLinks: { display:'flex', gap:48, flexWrap:'wrap' },
  footerCol: { display:'flex', flexDirection:'column', gap:10 },
  footerColTitle: { fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:4 },
  footerLink: { color:'#64748b', textDecoration:'none', fontSize:13, transition:'color 0.15s' },
  footerBottom: { borderTop:'1px solid #2a2a3a', paddingTop:24, display:'flex', justifyContent:'space-between' },
  footerCopy: { fontSize:12, color:'#334155' },
  btnPrimary: { background:'#818cf8', color:'#fff', padding:'11px 22px', borderRadius:10, textDecoration:'none', fontWeight:700, fontSize:14, display:'inline-flex', alignItems:'center', gap:6, border:'none', cursor:'pointer' },
};
