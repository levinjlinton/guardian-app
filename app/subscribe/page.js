'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GuardianLogo from '../components/GuardianLogo';
import { AlertTriangle, Check } from 'lucide-react';

function SubscribeContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const canceled = searchParams.get('canceled');

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch (e) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}><GuardianLogo size={52} /></div>
        <h1 style={s.title}>Unlock Guardian</h1>
        <p style={s.sub}>Start your 7-day free trial — no charge today.</p>

        {canceled && (
          <div style={s.notice}>Payment canceled — no charge was made. You can try again below.</div>
        )}

        {error && <div style={s.errorBox}><AlertTriangle size={14} style={{flexShrink:0}}/> {error}</div>}

        <div style={s.priceBox}>
          <div style={s.price}>$3<span style={s.per}>/month</span></div>
          <div style={s.trialBadge}>7 days free</div>
        </div>

        <button style={{...s.btn, opacity: loading ? 0.7 : 1}} onClick={startCheckout} disabled={loading}>
          {loading ? 'Redirecting to payment…' : 'Start Free Trial →'}
        </button>

        <div style={s.features}>
          {['Unlimited projects & deadlines','Auto-schedule your week','Chrome extension blocker','All themes','Synced across devices','Cancel anytime'].map(f => (
            <div key={f} style={s.feature}><span style={s.check}><Check size={13}/></span>{f}</div>
          ))}
        </div>

        <p style={s.fine}>You won't be charged until your 7-day trial ends. Cancel any time from settings.</p>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={
      <div style={{minHeight:'100vh',background:'radial-gradient(ellipse at 50% 0%, #1e1040 0%, #0a0015 60%)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <GuardianLogo size={48} />
      </div>
    }>
      <SubscribeContent />
    </Suspense>
  );
}

const s = {
  page: { minHeight:'100vh', background:'radial-gradient(ellipse at 50% 0%, #1e1040 0%, #0a0015 60%)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, padding:40, width:'100%', maxWidth:440, backdropFilter:'blur(20px)', color:'#e2e8f0', textAlign:'center' },
  icon: { display:'flex', justifyContent:'center', marginBottom:16 },
  title: { fontSize:28, fontWeight:800, marginBottom:8, letterSpacing:-1 },
  sub: { fontSize:15, color:'#94a3b8', marginBottom:24, lineHeight:1.6 },
  notice: { background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#fbbf24', marginBottom:16 },
  errorBox: { display:'flex', alignItems:'center', gap:8, background:'rgba(248,113,113,0.12)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#f87171', marginBottom:16 },
  priceBox: { display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:24 },
  price: { fontSize:48, fontWeight:900, letterSpacing:-2 },
  per: { fontSize:18, fontWeight:400, color:'#94a3b8' },
  trialBadge: { background:'rgba(74,222,128,0.15)', color:'#4ade80', padding:'4px 12px', borderRadius:100, fontSize:12, fontWeight:700 },
  btn: { width:'100%', padding:'14px', background:'#818cf8', color:'#fff', border:'none', borderRadius:12, fontSize:16, fontWeight:700, cursor:'pointer', marginBottom:24, transition:'background 0.2s' },
  features: { display:'flex', flexDirection:'column', gap:8, textAlign:'left', marginBottom:20 },
  feature: { display:'flex', alignItems:'center', gap:10, fontSize:13, color:'#94a3b8' },
  check: { color:'#4ade80', fontWeight:700, display:'flex', alignItems:'center' },
  fine: { fontSize:11, color:'#475569', lineHeight:1.6 },
};
