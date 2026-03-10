import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { t } from '../theme';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FileSpreadsheet, Upload, ArrowRight, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const fmtInt = n => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : String(n||0);
const fmtMs  = ms => ms >= 1000 ? `${(ms/1000).toFixed(1)}s` : `${ms||0}ms`;
const fmtDt  = s => new Date(s).toLocaleDateString('en-US', { month:'short', day:'numeric' });
const STATUS_COLOR = { completed:'#16A34A', failed:'#DC2626', queued:'#D97706', processing:'#2563EB' };

export default function DashboardPage() {
  const { user }         = useAuth();
  const { dark }         = useTheme();
  const th               = t(dark);
  const [data,    setD]  = useState(null);
  const [loading, setL]  = useState(true);

  useEffect(() => {
    dashboardAPI.stats().then(r => setD(r.data)).catch(console.error).finally(() => setL(false));
  }, []);

  const s       = data?.stats || {};
  const recent  = data?.recentReports || [];
  const monthly = (data?.monthlyActivity || []).map(m => ({ month: m.month.slice(5), count: m.count }));
  const card    = { background:th.bgCard, border:`1px solid ${th.border}`, borderRadius:14, padding:20 };

  return (
    <div style={{ padding:28, maxWidth:1100, margin:'0 auto', fontFamily:"'Inter',system-ui,sans-serif", color:th.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:24, color:th.textHeading, marginBottom:4 }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color:th.textSub, fontSize:13 }}>Here's your report activity at a glance.</p>
        </div>
        <Link to="/upload" style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px',
          borderRadius:10, background:'#2563EB', color:'white', fontWeight:600, fontSize:14,
          textDecoration:'none', transition:'all .2s' }}>
          <Upload size={15}/> New Report
        </Link>
      </div>



      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:'Total Reports',    value:fmtInt(s.totalReports),        color:'#2563EB', icon:FileSpreadsheet },
          { label:'Rows Processed',   value:fmtInt(s.totalRowsProcessed),  color:'#16A34A', icon:TrendingUp },
          { label:'Avg Process Time', value:fmtMs(s.avgProcessingMs),      color:'#D97706', icon:Clock },
          { label:'Completed',        value:fmtInt(s.completed),           color:'#7C3AED', icon:CheckCircle },
        ].map(({ label, value, color, icon:Icon }) => (
          <div key={label} style={{ ...card, borderTop:`3px solid ${color}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`${color}18`,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon size={15} color={color}/>
              </div>
              <span style={{ fontSize:11, color:th.textMuted, fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{label}</span>
            </div>
            <div style={{ fontSize:26, fontWeight:800, color:th.textHeading, fontFamily:'Syne' }}>
              {loading ? '—' : value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
        {/* Bar chart */}
        <div style={card}>
          <div style={{ fontWeight:700, color:th.textHeading, marginBottom:4, fontFamily:'Syne', fontSize:14 }}>Monthly Activity</div>
          <div style={{ fontSize:12, color:th.textSub, marginBottom:14 }}>Reports generated per month</div>
          {loading ? (
            <div style={{ height:190, display:'flex', alignItems:'center', justifyContent:'center', color:th.textMuted, fontSize:13 }}>Loading…</div>
          ) : monthly.every(m=>m.count===0) ? (
            <div style={{ height:190, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:th.textMuted, gap:8 }}>
              <FileSpreadsheet size={30} style={{ opacity:.3 }}/>
              <span style={{ fontSize:13 }}>No activity yet</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={monthly} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false}/>
                <XAxis dataKey="month" tick={{ fill:th.textMuted, fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis allowDecimals={false} tick={{ fill:th.textMuted, fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:th.bgCard, border:`1px solid ${th.border}`, borderRadius:10, color:th.text, fontSize:12 }}
                  labelStyle={{ color:'#2563EB', fontWeight:700 }} itemStyle={{ color:th.textSub }}/>
                <Bar dataKey="count" fill="#2563EB" radius={[5,5,0,0]} name="Reports"/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status breakdown */}
        <div style={card}>
          <div style={{ fontWeight:700, color:th.textHeading, marginBottom:4, fontFamily:'Syne', fontSize:14 }}>Status Breakdown</div>
          <div style={{ fontSize:12, color:th.textSub, marginBottom:16 }}>Overview of all report statuses</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { label:'Completed', key:'completed', color:'#16A34A' },
              { label:'Failed',    key:'failed',    color:'#DC2626' },
              { label:'Pending',   key:'pending',   color:'#D97706' },
            ].map(({ label, key, color }) => {
              const total = (s.completed||0)+(s.failed||0)+(s.pending||0);
              const val   = s[key]||0;
              const pct   = total ? Math.round(val/total*100) : 0;
              return (
                <div key={key}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:13, color:th.textSub }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color }}>{loading?'—':val}</span>
                  </div>
                  <div style={{ height:6, background: dark?'#1E2433':'#E2E8F0', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3, transition:'width .6s' }}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:18, padding:'10px 14px', background: dark?'#0F1117':th.bgTable,
            borderRadius:9, display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:12, color:th.textMuted }}>Total storage used</span>
            <span style={{ fontSize:12, fontWeight:700, color:th.text }}>
              {loading ? '—' : `${((s.totalBytesUploaded||0)/1e6).toFixed(1)} MB`}
            </span>
          </div>
        </div>
      </div>

      {/* Recent reports */}
      <div style={card}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <div style={{ fontWeight:700, color:th.textHeading, fontFamily:'Syne', fontSize:14 }}>Recent Reports</div>
            <div style={{ fontSize:12, color:th.textSub, marginTop:2 }}>Your last 5 generated reports</div>
          </div>
          <Link to="/reports" style={{ fontSize:12, color:'#2563EB', textDecoration:'none', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
            View all <ArrowRight size={12}/>
          </Link>
        </div>
        {loading ? (
          <div style={{ padding:32, textAlign:'center', color:th.textMuted, fontSize:13 }}>Loading…</div>
        ) : recent.length === 0 ? (
          <div style={{ padding:40, display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            <FileSpreadsheet size={36} style={{ color:th.border }}/>
            <p style={{ color:th.textMuted, fontSize:14 }}>No reports yet.</p>
            <Link to="/upload" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px',
              borderRadius:8, background:'#2563EB', color:'white', fontSize:13, fontWeight:600, textDecoration:'none' }}>
              <Upload size={13}/> Upload your first file
            </Link>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['Report','Status','Rows','Date',''].map(h => (
                <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:10, color:th.textMuted,
                  fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', borderBottom:`1px solid ${th.border}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {recent.map(r => (
                <tr key={r.id} style={{ borderBottom:`1px solid ${th.divider}` }}>
                  <td style={{ padding:'10px 12px' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:th.text }}>{r.title}</div>
                    <div style={{ fontSize:11, color:th.textMuted, marginTop:2 }}>{r.original_name}</div>
                  </td>
                  <td style={{ padding:'10px 12px' }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999,
                      background:`${STATUS_COLOR[r.status]}15`, color:STATUS_COLOR[r.status] }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding:'10px 12px', fontSize:13, color:th.textSub }}>
                    {r.row_count ? fmtInt(r.row_count) : '—'}
                  </td>
                  <td style={{ padding:'10px 12px', fontSize:12, color:th.textMuted }}>{fmtDt(r.created_at)}</td>
                  <td style={{ padding:'10px 12px' }}>
                    <Link to={`/reports/${r.id}`} style={{ fontSize:12, color:'#2563EB', textDecoration:'none',
                      fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                      View <ArrowRight size={12}/>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
