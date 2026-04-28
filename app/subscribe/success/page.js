import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.emoji}><CheckCircle size={64} color="#4ade80" strokeWidth={1.5}/></div>
        <h1 style={s.title}>You're all set!</h1>
        <p style={s.sub}>
          Your Guardian subscription is active. Start planning your time, building your schedule, and staying focused.
        </p>
        <Link href="/dashboard" style={s.btn}>Go to Dashboard →</Link>
        <p style={s.fine}>You'll receive a receipt by email. Cancel anytime from Settings.</p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'radial-gradient(ellipse at 50% 0%, #0d2010 0%, #050f05 60%)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, padding:48, width:'100%', maxWidth:440, backdropFilter:'blur(20px)', color:'#e2e8f0', textAlign:'center' },
  emoji: { display:'flex', justifyContent:'center', marginBottom:20 },
  title: { fontSize:28, fontWeight:800, marginBottom:12, letterSpacing:-1 },
  sub: { fontSize:15, color:'#94a3b8', marginBottom:32, lineHeight:1.7 },
  btn: { display:'inline-block', background:'#4ade80', color:'#052e10', padding:'14px 32px', borderRadius:12, textDecoration:'none', fontWeight:700, fontSize:16, marginBottom:20 },
  fine: { fontSize:12, color:'#475569' },
};
