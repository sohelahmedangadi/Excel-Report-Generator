import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { t } from '../theme';
import { Zap, Eye, EyeOff, Sun, Moon } from 'lucide-react';

export default function RegisterPage() {
  const { register }     = useAuth();
  const { dark, toggle } = useTheme();
  const th               = t(dark);
  const navigate         = useNavigate();

  const [form,    setForm]    = useState({ name: '', email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const d = err.response?.data;
      setError(d?.error || (d?.errors?.[0]?.msg) || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inp = {
    width: '100%', padding: '12px 14px', borderRadius: 9,
    border: `1px solid ${th.borderInput}`, fontSize: 14,
    background: th.bgInput, color: th.text, outline: 'none', transition: 'border .15s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: th.bg,
                  fontFamily: "'Inter',system-ui,sans-serif", transition: 'background .2s' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        input::placeholder { color: ${th.textMuted}; }`}
      </style>

      {/* Theme toggle */}
      <button onClick={toggle} style={{ position: 'fixed', top: 16, right: 16, padding: '8px 14px',
        borderRadius: 10, background: th.bgCard, border: `1px solid ${th.border}`, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: th.textSub, zIndex: 10 }}>
        {dark ? <Sun size={14} color="#F59E0B"/> : <Moon size={14} color="#6366F1"/>}
        {dark ? 'Light' : 'Dark'}
      </button>

      {/* Left branding panel */}
      <div style={{ width: 420, background: dark ? '#0D1117' : '#1E3A8A', flexShrink: 0,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#2563EB" fill="#2563EB"/>
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: 'white' }}>DataSheet AI</span>
        </div>
        <div>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 30, color: 'white',
            lineHeight: 1.2, marginBottom: 24 }}>
            Turn raw data into<br/><span style={{ opacity: .65 }}>instant reports.</span>
          </div>
          {['📊 Auto-generated pivot tables','📈 Bar, pie & scatter charts',
            '✅ Null detection & data cleaning','🚨 Fraud pattern analysis',
            '📐 Outlier detection','⚡ Report in under 30 seconds'].map(txt => (
            <div key={txt} style={{ color: 'rgba(255,255,255,.65)', fontSize: 14, marginBottom: 10 }}>{txt}</div>
          ))}
        </div>
        <div style={{ color: 'rgba(255,255,255,.25)', fontSize: 12 }}>© 2024 DataSheet AI</div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28,
            color: th.textHeading, marginBottom: 4 }}>Create your account</h1>
          <p style={{ color: th.textSub, fontSize: 14, marginBottom: 28 }}>
            Free forever. No credit card required.
          </p>

          {error && (
            <div style={{ background: dark ? '#2D1515' : '#FEF2F2',
              border: `1px solid ${dark ? '#7F1D1D' : '#FECACA'}`,
              color: dark ? '#FCA5A5' : '#DC2626',
              borderRadius: 9, padding: '11px 14px', marginBottom: 16, fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', color: th.textSub, fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                Full Name
              </label>
              <input name="name" type="text" value={form.name} onChange={handle}
                required minLength={2} placeholder="Alex Johnson" style={inp}/>
            </div>
            <div>
              <label style={{ display: 'block', color: th.textSub, fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                Email Address
              </label>
              <input name="email" type="email" value={form.email} onChange={handle}
                required placeholder="alex@company.com" style={inp}/>
            </div>
            <div>
              <label style={{ display: 'block', color: th.textSub, fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input name="password" type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={handle} required minLength={6} placeholder="Min. 6 characters"
                  style={{ ...inp, paddingRight: 44 }}/>
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: th.textMuted }}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              padding: '13px', borderRadius: 10, background: '#2563EB', color: 'white',
              fontWeight: 700, fontSize: 15, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1,
              marginTop: 4, transition: 'all .2s' }}
              onMouseOver={e => !loading && (e.currentTarget.style.background = '#1D4ED8')}
              onMouseOut={e => e.currentTarget.style.background = '#2563EB'}>
              {loading ? 'Creating account…' : 'Create Free Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: th.textMuted, fontSize: 13, marginTop: 22 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
