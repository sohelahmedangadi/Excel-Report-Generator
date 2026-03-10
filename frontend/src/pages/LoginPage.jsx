import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { t } from '../theme';
import { Zap, Eye, EyeOff, Sun, Moon } from 'lucide-react';

export default function LoginPage() {
  const { login }        = useAuth();
  const { dark, toggle } = useTheme();
  const th               = t(dark);
  const navigate         = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try { await login(form.email, form.password); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: th.bg,
                  fontFamily: "'Inter',system-ui,sans-serif", transition: 'background .2s' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Theme toggle */}
      <button onClick={toggle} style={{ position: 'fixed', top: 16, right: 16, padding: '8px 14px',
        borderRadius: 10, background: th.bgCard, border: `1px solid ${th.border}`, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: th.textSub, zIndex: 10 }}>
        {dark ? <Sun size={14} color="#F59E0B"/> : <Moon size={14} color="#6366F1"/>}
        {dark ? 'Light' : 'Dark'}
      </button>

      {/* Left branding panel */}
      <div style={{ width: 420, background: dark ? '#13151F' : '#1E40AF', display: 'flex',
        flexDirection: 'column', justifyContent: 'space-between', padding: 48, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#2563EB" fill="#2563EB"/>
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: 'white' }}>DataSheet AI</span>
        </div>
        <div>
          <div style={{ fontSize: 30, fontWeight: 800, fontFamily: 'Syne', color: 'white',
            lineHeight: 1.2, marginBottom: 24 }}>
            Turn raw data into<br/><span style={{ opacity: .7 }}>board-ready reports</span><br/>in seconds.
          </div>
          {['📊 Auto-generated pivot tables','📈 Embedded chart types','✅ Data cleaning & null detection',
            '🚨 Fraud pattern analysis','📐 Outlier detection','⚡ Under 30 seconds'].map(txt => (
            <div key={txt} style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, marginBottom: 10 }}>{txt}</div>
          ))}
        </div>
        <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 12 }}>© 2024 DataSheet AI</div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28,
            color: th.textHeading, marginBottom: 4 }}>Welcome back</h1>
          <p style={{ color: th.textSub, fontSize: 14, marginBottom: 28 }}>
            Sign in to your account to continue.
          </p>

          {error && (
            <div style={{ background: dark ? '#2D1515' : '#FEF2F2',
              border: `1px solid ${dark ? '#7F1D1D' : '#FECACA'}`,
              color: dark ? '#FCA5A5' : '#DC2626', borderRadius: 9,
              padding: '11px 14px', marginBottom: 14, fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', color: th.textSub, fontSize: 13,
                fontWeight: 600, marginBottom: 5 }}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} required
                placeholder="you@company.com"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 9,
                  border: `1px solid ${th.borderInput}`, fontSize: 14,
                  background: th.bgInput, color: th.text, outline: 'none' }}/>
            </div>
            <div>
              <label style={{ display: 'block', color: th.textSub, fontSize: 13,
                fontWeight: 600, marginBottom: 5 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input name="password" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={handle} required placeholder="••••••••"
                  style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: 9,
                    border: `1px solid ${th.borderInput}`, fontSize: 14,
                    background: th.bgInput, color: th.text, outline: 'none' }}/>
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: th.textMuted }}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              padding: '13px', borderRadius: 9, background: '#2563EB', color: 'white',
              fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
              opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: th.textMuted, fontSize: 13, marginTop: 22 }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
