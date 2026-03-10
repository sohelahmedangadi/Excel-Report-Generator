import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { t } from '../theme';
import { LayoutDashboard, Upload, FileSpreadsheet, LogOut, Zap, User, Sun, Moon } from 'lucide-react';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/upload',    icon: Upload,          label: 'New Report'  },
  { to: '/reports',   icon: FileSpreadsheet, label: 'My Reports'  },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const th = t(dark);

  return (
    <div style={{ display: 'flex', height: '100vh', background: th.bg, overflow: 'hidden',
                  fontFamily: "'Inter',system-ui,sans-serif", transition: 'background .2s' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Sidebar */}
      <aside style={{ width: 220, display: 'flex', flexDirection: 'column',
                      background: th.bgSidebar, borderRight: `1px solid ${th.border}`,
                      flexShrink: 0, transition: 'background .2s, border .2s' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 16px',
                      borderBottom: `1px solid ${th.border}` }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#2563EB',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="white" fill="white"/>
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: th.textHeading }}>
            DataSheet AI
          </span>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 9, textDecoration: 'none', fontSize: 14,
              fontWeight: isActive ? 600 : 500, transition: 'all .15s',
              background: isActive ? (dark ? '#1C2D4A' : '#EFF6FF') : 'transparent',
              color:      isActive ? '#2563EB' : th.textSub,
            })}>
              {({ isActive }) => <><Icon size={16}/>{label}</>}
            </NavLink>
          ))}
        </nav>

        {/* Theme toggle + user */}
        <div style={{ padding: '8px', borderTop: `1px solid ${th.border}`,
                      display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={toggle} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
            borderRadius: 9, background: th.bgBadge, border: `1px solid ${th.border}`,
            cursor: 'pointer', fontSize: 13, fontWeight: 600, color: th.textSub,
            transition: 'all .15s', width: '100%' }}>
            {dark ? <Sun size={15} color="#F59E0B"/> : <Moon size={15} color="#6366F1"/>}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* User card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                        borderRadius: 9, background: th.bgBadge }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#2563EB',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={13} color="white"/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: th.text,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 11, color: th.textMuted, textTransform: 'capitalize' }}>
                {user?.plan} plan
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} title="Sign out"
              style={{ padding: 5, borderRadius: 6, background: 'none', border: 'none',
                       cursor: 'pointer', color: th.textMuted, transition: 'color .15s' }}
              onMouseOver={e => e.currentTarget.style.color = '#EF4444'}
              onMouseOut={e  => e.currentTarget.style.color = th.textMuted}>
              <LogOut size={14}/>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', background: th.bg, transition: 'background .2s' }}>
        <Outlet/>
      </main>
    </div>
  );
}
