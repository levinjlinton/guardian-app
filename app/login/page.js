'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlError = searchParams.get('error');

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(urlError ? 'Sign-in failed. Please try again.' : '');
  const [success, setSuccess] = useState('');

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/subscribe`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    const supabase = createClient();

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/subscribe`,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      // Check if email confirmation is required
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Email confirmation disabled — logged in immediately
        router.push('/subscribe');
      } else {
        // Email confirmation required
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setMode('signin');
        setPassword('');
        setConfirmPassword('');
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : signInError.message);
        setLoading(false);
        return;
      }
      router.push('/dashboard');
    }

    setLoading(false);
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logo}>
          <div style={s.logoIcon}>🛡️</div>
          <h1 style={s.logoName}>Guardian</h1>
          <p style={s.logoTag}>Your personal time manager</p>
        </div>

        {/* Mode toggle */}
        <div style={s.tabs}>
          <button style={{...s.tab, ...(mode==='signin'?s.tabActive:{})}} onClick={()=>{setMode('signin');setError('');setSuccess('');}}>
            Sign In
          </button>
          <button style={{...s.tab, ...(mode==='signup'?s.tabActive:{})}} onClick={()=>{setMode('signup');setError('');setSuccess('');}}>
            Create Account
          </button>
        </div>

        {/* Feedback */}
        {error && <div style={s.errorBox}>⚠️ {error}</div>}
        {success && <div style={s.successBox}>✅ {success}</div>}

        {/* Email / Password form */}
        <form onSubmit={handleEmailAuth} style={s.form}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={s.input}
              required
              autoComplete="email"
            />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              style={s.input}
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>
          {mode === 'signup' && (
            <div style={s.fieldGroup}>
              <label style={s.label}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                style={s.input}
                required
              />
            </div>
          )}
          <button type="submit" style={{...s.btnPrimary, opacity: loading ? 0.7 : 1}} disabled={loading}>
            {loading ? '…' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={s.divider}><span style={s.dividerText}>or</span></div>

        {/* Google */}
        <button style={s.btnGoogle} onClick={signInWithGoogle}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p style={s.terms}>
          By signing in you agree to Guardian's{' '}
          <a href="#" style={s.link}>Terms of Service</a> and{' '}
          <a href="#" style={s.link}>Privacy Policy</a>.
        </p>

        <div style={s.pricing}>
          <span style={s.pricingBadge}>$3 / month</span>
          {' '}after a 7-day free trial. Cancel anytime.
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 50% 0%, #1e1040 0%, #0a0015 60%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px',
    backdropFilter: 'blur(20px)', color: '#e2e8f0',
  },
  logo: { textAlign: 'center', marginBottom: '24px' },
  logoIcon: {
    width: '52px', height: '52px', background: '#818cf8',
    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '26px', margin: '0 auto 10px',
  },
  logoName: { fontSize: '22px', fontWeight: '800', margin: '0 0 4px' },
  logoTag: { fontSize: '12px', color: '#94a3b8', margin: 0 },
  tabs: {
    display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px',
    padding: '4px', marginBottom: '20px',
  },
  tab: {
    flex: 1, padding: '8px', border: 'none', background: 'none',
    color: '#64748b', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
    borderRadius: '7px', transition: 'all 0.15s', fontFamily: 'inherit',
  },
  tabActive: {
    background: '#818cf8', color: '#fff',
  },
  errorBox: {
    background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#f87171',
    marginBottom: '14px',
  },
  successBox: {
    background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
    borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#4ade80',
    marginBottom: '14px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0px', marginBottom: '16px' },
  fieldGroup: { marginBottom: '12px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' },
  input: {
    width: '100%', padding: '10px 13px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: '#e2e8f0', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  },
  btnPrimary: {
    width: '100%', padding: '11px', background: '#818cf8', color: '#fff',
    border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', marginTop: '4px', fontFamily: 'inherit', transition: 'opacity 0.15s',
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0',
    color: '#334155', fontSize: '12px',
    '::before': { content: '""', flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' },
  },
  dividerText: {
    color: '#475569', fontSize: '12px', fontWeight: '500',
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%',
    // Using pseudo approach via inline style workaround:
  },
  btnGoogle: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    width: '100%', padding: '11px', background: '#fff', color: '#1e293b', border: 'none',
    borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    marginBottom: '18px', fontFamily: 'inherit',
  },
  terms: { fontSize: '11px', color: '#475569', textAlign: 'center', marginBottom: '14px', lineHeight: 1.6 },
  link: { color: '#818cf8', textDecoration: 'none' },
  pricing: {
    textAlign: 'center', fontSize: '12px', color: '#475569',
    borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px',
  },
  pricingBadge: {
    background: 'rgba(129,140,248,0.15)', color: '#818cf8',
    padding: '2px 8px', borderRadius: '100px', fontWeight: '700', fontSize: '12px',
  },
};
