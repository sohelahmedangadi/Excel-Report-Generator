import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reportsAPI } from '../utils/api';
import { useTheme } from '../hooks/useTheme';
import { t } from '../theme';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Download, ArrowLeft, FileSpreadsheet, Clock, CheckCircle,
  AlertCircle, RefreshCw, TrendingUp, TrendingDown, Minus,
  Hash, Table as TableIcon, Eye
} from 'lucide-react';

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtNum = n => {
  if (n == null || isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n/1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n/1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n/1e3).toFixed(1)}K`;
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
};
const fmtInt = n => n == null ? '—' : n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : String(n);
const fmtMs  = ms => !ms ? '—' : ms >= 1000 ? `${(ms/1000).toFixed(1)}s` : `${ms}ms`;
const fmtSz  = b  => b  >= 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${Math.round((b||0)/1024)} KB`;
const fmtDt  = s  => new Date(s).toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });

const COLORS = ['#2563EB','#16A34A','#D97706','#DC2626','#7C3AED','#0891B2','#DB2777','#65A30D','#EA580C','#0D9488'];
const DARK_COLORS = ['#3B82F6','#22C55E','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#EC4899','#84CC16','#F97316','#14B8A6'];

export default function ReportDetail() {
  const { id }           = useParams();
  const { dark }         = useTheme();
  const th               = t(dark);
  const [report, setRep] = useState(null);
  const [cols,   setCols]= useState([]);
  const [summ,   setSumm]= useState(null);
  const [loading,setLoad]= useState(true);
  const [dlLoad, setDl]  = useState(false);
  const [tab,    setTab] = useState('overview');

  useEffect(() => {
    setLoad(true);
    reportsAPI.get(id)
      .then(({ data }) => {
        setRep(data.report);
        setCols(data.columns || []);
        if (data.report.status === 'completed') {
          reportsAPI.summary(id)
            .then(r => { if (r.data.summary) setSumm(r.data.summary); })
            .catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setLoad(false));
  }, [id]);

  const download = async () => {
    setDl(true);
    try {
      const { data } = await reportsAPI.download(id);
      const url = URL.createObjectURL(new Blob([data]));
      Object.assign(document.createElement('a'), {
        href: url,
        download: `${report.title}_report.xlsx`
      }).click();
      URL.revokeObjectURL(url);
    } finally { setDl(false); }
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const colors = dark ? DARK_COLORS : COLORS;
  const card   = { background:th.bgCard, border:`1px solid ${th.border}`, borderRadius:14, padding:20, transition:'background .2s' };
  const ttStyle = {
    contentStyle: { background: dark ? '#1E2130' : '#FFFFFF', border:`1px solid ${th.border}`, borderRadius:10, color:th.text, fontSize:12 },
    labelStyle:   { color:'#2563EB', fontWeight:700 },
    itemStyle:    { color:th.textSub },
  };
  const tickStyle = { fill: th.textMuted, fontSize: 11 };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:th.bg }}>
      <div style={{ width:32, height:32, border:`4px solid ${th.border}`, borderTop:'4px solid #2563EB', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!report) return <div style={{ padding:32, color:th.textSub }}>Report not found.</div>;

  const statusMap = {
    completed:  { color:'#16A34A', bg: dark?'#052e16':'#F0FDF4', icon:<CheckCircle size={12}/> },
    failed:     { color:'#DC2626', bg: dark?'#450a0a':'#FEF2F2', icon:<AlertCircle size={12}/> },
    processing: { color:'#2563EB', bg: dark?'#0c1a3a':'#EFF6FF', icon:<RefreshCw size={12}/> },
    queued:     { color:'#D97706', bg: dark?'#2d1a00':'#FFFBEB', icon:<Clock size={12}/> },
  };
  const sm = statusMap[report.status] || statusMap.queued;
  const kpis = summ?.kpis;
  const quality = kpis ? (100 - (kpis.missing||0)).toFixed(0) : null;

  const TABS = [
    { key:'overview', label:'📊 Overview'  },
    { key:'charts',   label:'📈 Charts'    },
    { key:'columns',  label:'📋 Columns'   },
    { key:'details',  label:'⚙️ Details'   },
  ];

  return (
    <div style={{ padding:24, maxWidth:1280, margin:'0 auto', fontFamily:"'Inter',system-ui,sans-serif", color:th.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Back link ── */}
      <Link to="/reports" style={{ display:'inline-flex', alignItems:'center', gap:6, color:th.textSub,
        fontSize:13, textDecoration:'none', marginBottom:20, transition:'color .15s' }}>
        <ArrowLeft size={14}/> Back to Reports
      </Link>

      {/* ── Header Card ── */}
      <div style={{ ...card, marginBottom:20, display:'flex', alignItems:'center',
                    justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:52, height:52, borderRadius:14, background: dark?'#1C2D4A':'#EFF6FF',
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <FileSpreadsheet size={26} color="#2563EB"/>
          </div>
          <div>
            <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:21, color:th.textHeading, marginBottom:6 }}>
              {report.title}
            </h1>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700,
                padding:'3px 10px', borderRadius:999, background:sm.bg, color:sm.color }}>
                {sm.icon} {report.status}
              </span>
              <span style={{ fontSize:13, color:th.textSub }}>{report.original_name}</span>
              <span style={{ color:th.border }}>·</span>
              <span style={{ fontSize:13, color:th.textSub }}>{fmtSz(report.original_size)}</span>
            </div>
          </div>
        </div>

        {/* Download button — always visible for completed reports */}
        {report.status === 'completed' && (
          <button onClick={download} disabled={dlLoad} style={{
            display:'flex', alignItems:'center', gap:8, padding:'11px 22px',
            borderRadius:10, background:'#16A34A', color:'white', fontWeight:700,
            fontSize:14, border:'none', cursor: dlLoad ? 'not-allowed' : 'pointer',
            opacity: dlLoad ? 0.7 : 1, transition:'all .2s', boxShadow:'0 2px 8px #16A34A40'
          }}
          onMouseOver={e => !dlLoad && (e.currentTarget.style.background='#15803D')}
          onMouseOut={e => e.currentTarget.style.background='#16A34A'}>
            <Download size={16}/>
            {dlLoad ? 'Downloading...' : 'Download Excel Report'}
          </button>
        )}
      </div>

      {/* ── SUMMARY SECTION (always visible for completed reports) ── */}
      {report.status === 'completed' && kpis && (
        <div style={{ ...card, marginBottom:20, borderLeft:`4px solid #2563EB` }}>
          <div style={{ fontSize:16, fontWeight:700, color:th.textHeading, marginBottom:4,
                        fontFamily:'Syne', display:'flex', alignItems:'center', gap:8 }}>
            📋 Report Summary
          </div>
          <p style={{ fontSize:13, color:th.textSub, marginBottom:16 }}>
            This report analysed <strong style={{color:th.text}}>{fmtInt(kpis.rows)} rows</strong> across{' '}
            <strong style={{color:th.text}}>{kpis.cols} columns</strong> and grouped them by{' '}
            <strong style={{color:th.text}}>{summ.cat_col}</strong>. The key numeric measure is{' '}
            <strong style={{color:th.text}}>{summ.num_col}</strong>.
          </p>

          {/* 4 insight cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            {[
              { label:`Total ${summ.num_col}`, value:fmtNum(kpis.total), color:'#2563EB',
                note:'Sum of all values', icon:<Hash size={14}/> },
              { label:'Average per group', value:fmtNum(kpis.mean), color:'#7C3AED',
                note:`Mean ${summ.num_col}`, icon:<Minus size={14}/> },
              { label:'Highest value', value:fmtNum(kpis.max), color:'#16A34A',
                note:`Max ${summ.num_col}`, icon:<TrendingUp size={14}/> },
              { label:'Data completeness', value:`${quality}%`, color: Number(quality)>=90?'#16A34A':Number(quality)>=70?'#D97706':'#DC2626',
                note:`${kpis.missing}% missing data`, icon:<CheckCircle size={14}/> },
            ].map(({ label, value, color, note, icon }) => (
              <div key={label} style={{ background: dark?'#0F1117':th.bgTable, borderRadius:12,
                padding:16, borderTop:`3px solid ${color}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                  <span style={{ color }}>{icon}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:th.textMuted, textTransform:'uppercase', letterSpacing:'.04em' }}>{label}</span>
                </div>
                <div style={{ fontSize:22, fontWeight:800, color, fontFamily:'Syne', lineHeight:1 }}>{value}</div>
                <div style={{ fontSize:11, color:th.textMuted, marginTop:4 }}>{note}</div>
              </div>
            ))}
          </div>

          {/* Top category callout */}
          {summ.bar_chart?.length > 0 && (
            <div style={{ marginTop:14, padding:'12px 16px', background: dark?'#0F1117':th.bgTable,
                          borderRadius:10, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <span style={{ fontSize:13, color:th.textSub }}>🏆 Top performing {summ.cat_col}:</span>
              <span style={{ fontSize:14, fontWeight:700, color:'#2563EB' }}>{summ.bar_chart[0]?.name}</span>
              <span style={{ fontSize:13, color:th.textSub }}>with</span>
              <span style={{ fontSize:14, fontWeight:700, color:'#16A34A' }}>{fmtNum(summ.bar_chart[0]?.value)}</span>
              <span style={{ fontSize:13, color:th.textSub }}>in {summ.num_col}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:4, marginBottom:18, background:dark?'#1A1D27':'#F1F5F9',
                    padding:4, borderRadius:12, width:'fit-content' }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding:'8px 18px', borderRadius:8, fontSize:13, fontWeight:600,
            border:'none', cursor:'pointer', transition:'all .15s',
            background: tab===key ? th.bgCard : 'transparent',
            color:      tab===key ? '#2563EB' : th.textSub,
            boxShadow:  tab===key ? '0 1px 4px #00000015' : 'none',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════ OVERVIEW TAB ════════════════ */}
      {tab === 'overview' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {summ?.bar_chart?.length > 0 ? (
            <>
              {/* Bar + Pie row */}
              <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:16 }}>
                {/* Bar chart */}
                <div style={card}>
                  <div style={{ fontWeight:700, fontSize:14, color:th.textHeading, marginBottom:4 }}>
                    {summ.num_col} by {summ.cat_col}
                  </div>
                  <div style={{ fontSize:12, color:th.textSub, marginBottom:14 }}>
                    Top {summ.bar_chart.length} categories ranked by total value
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={summ.bar_chart} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false}/>
                      <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false}/>
                      <YAxis tick={tickStyle} axisLine={false} tickLine={false}
                        tickFormatter={v => v>=1e6?`${(v/1e6).toFixed(1)}M`:v>=1e3?`${(v/1e3).toFixed(0)}K`:v}/>
                      <Tooltip {...ttStyle} formatter={v => [fmtNum(v), summ.num_col]}/>
                      <Bar dataKey="value" radius={[5,5,0,0]}>
                        {summ.bar_chart.map((_,i) => <Cell key={i} fill={colors[i % colors.length]}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie chart */}
                <div style={card}>
                  <div style={{ fontWeight:700, fontSize:14, color:th.textHeading, marginBottom:4 }}>
                    Share by {summ.cat_col}
                  </div>
                  <div style={{ fontSize:12, color:th.textSub, marginBottom:14 }}>
                    How each group contributes to the total
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={summ.pie_chart} cx="50%" cy="46%" innerRadius={52} outerRadius={86}
                        dataKey="value" nameKey="name" paddingAngle={3}>
                        {summ.pie_chart.map((_,i) => <Cell key={i} fill={colors[i % colors.length]}/>)}
                      </Pie>
                      <Tooltip {...ttStyle} formatter={v => [fmtNum(v)]}/>
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11, color:th.textSub }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line chart */}
              <div style={card}>
                <div style={{ fontWeight:700, fontSize:14, color:th.textHeading, marginBottom:4 }}>
                  {summ.num_col} Trend
                </div>
                <div style={{ fontSize:12, color:th.textSub, marginBottom:14 }}>
                  How values vary across all {summ.cat_col} categories
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={summ.line_chart}>
                    <CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false}/>
                    <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false}/>
                    <YAxis tick={tickStyle} axisLine={false} tickLine={false}
                      tickFormatter={v => v>=1e6?`${(v/1e6).toFixed(1)}M`:v>=1e3?`${(v/1e3).toFixed(0)}K`:v}/>
                    <Tooltip {...ttStyle} formatter={v => [fmtNum(v), summ.num_col]}/>
                    <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2.5}
                      dot={{ fill:colors[1], strokeWidth:0, r:4 }} activeDot={{ r:6 }}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div style={{ ...card, textAlign:'center', padding:56 }}>
              <FileSpreadsheet size={42} style={{ color:th.border, margin:'0 auto 14px' }}/>
              <p style={{ fontSize:15, fontWeight:600, color:th.text, marginBottom:6 }}>No chart data available</p>
              <p style={{ fontSize:13, color:th.textSub }}>
                Re-upload your file to generate in-app charts and summary.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ════════════════ CHARTS TAB ════════════════ */}
      {tab === 'charts' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {summ ? (
            <>
              {/* Horizontal ranked bar */}
              <div style={card}>
                <div style={{ fontWeight:700, fontSize:14, color:th.textHeading, marginBottom:4 }}>
                  📊 {summ.num_col} Ranked by {summ.cat_col}
                </div>
                <div style={{ fontSize:12, color:th.textSub, marginBottom:14 }}>
                  Categories sorted from highest to lowest total value
                </div>
                <ResponsiveContainer width="100%" height={Math.max(220, summ.bar_chart.length * 36)}>
                  <BarChart data={[...summ.bar_chart].reverse()} layout="vertical" barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke={th.border} horizontal={false}/>
                    <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false}
                      tickFormatter={v => v>=1e6?`${(v/1e6).toFixed(1)}M`:v>=1e3?`${(v/1e3).toFixed(0)}K`:v}/>
                    <YAxis type="category" dataKey="name" tick={{ fill:th.textSub, fontSize:12 }}
                      axisLine={false} tickLine={false} width={130}/>
                    <Tooltip {...ttStyle} formatter={v => [fmtNum(v), summ.num_col]}/>
                    <Bar dataKey="value" radius={[0,5,5,0]}>
                      {[...summ.bar_chart].reverse().map((_,i) => <Cell key={i} fill={colors[i % colors.length]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {/* Pie */}
                <div style={card}>
                  <div style={{ fontWeight:700, fontSize:14, color:th.textHeading, marginBottom:4 }}>
                    🥧 Distribution Share
                  </div>
                  <div style={{ fontSize:12, color:th.textSub, marginBottom:14 }}>
                    Proportional breakdown across all categories
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={summ.pie_chart} cx="50%" cy="44%" outerRadius={95}
                        dataKey="value" nameKey="name" paddingAngle={2}>
                        {summ.pie_chart.map((_,i) => <Cell key={i} fill={colors[i % colors.length]}/>)}
                      </Pie>
                      <Tooltip {...ttStyle} formatter={v => [fmtNum(v)]}/>
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11, color:th.textSub }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Line */}
                <div style={card}>
                  <div style={{ fontWeight:700, fontSize:14, color:th.textHeading, marginBottom:4 }}>
                    📈 Value Trend
                  </div>
                  <div style={{ fontSize:12, color:th.textSub, marginBottom:14 }}>
                    Value pattern across all {summ.cat_col} categories
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={summ.line_chart}>
                      <CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false}/>
                      <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false}/>
                      <YAxis tick={tickStyle} axisLine={false} tickLine={false}
                        tickFormatter={v => v>=1e6?`${(v/1e6).toFixed(1)}M`:v>=1e3?`${(v/1e3).toFixed(0)}K`:v}/>
                      <Tooltip {...ttStyle} formatter={v => [fmtNum(v), summ.num_col]}/>
                      <Line type="monotone" dataKey="value" stroke={colors[1]} strokeWidth={2.5}
                        dot={{ fill:colors[0], strokeWidth:0, r:4 }} activeDot={{ r:6 }}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Download again */}
              {report.status === 'completed' && (
                <div style={{ ...card, display:'flex', alignItems:'center', justifyContent:'space-between',
                              background: dark?'#0d1f3c':'#EFF6FF', borderColor:'#2563EB', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <div style={{ fontWeight:700, color:'#2563EB', fontSize:14 }}>
                      Want to explore more? Download the full Excel report.
                    </div>
                    <div style={{ fontSize:12, color:th.textSub, marginTop:3 }}>
                      Includes pivot tables, all 3 chart sheets, statistics & raw data.
                    </div>
                  </div>
                  <button onClick={download} disabled={dlLoad} style={{
                    display:'flex', alignItems:'center', gap:8, padding:'10px 20px',
                    borderRadius:10, background:'#2563EB', color:'white', fontWeight:700,
                    fontSize:14, border:'none', cursor:'pointer', flexShrink:0,
                    opacity: dlLoad ? 0.7 : 1
                  }}>
                    <Download size={15}/> {dlLoad ? 'Downloading...' : 'Download Excel'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ ...card, textAlign:'center', padding:48 }}>
              <p style={{ color:th.textSub, fontSize:14 }}>
                No chart data. Re-upload the file to generate charts.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ════════════════ COLUMNS TAB ════════════════ */}
      {tab === 'columns' && (
        <div style={{ ...card, padding:0, overflow:'hidden' }}>
          {/* Summary bar */}
          <div style={{ display:'flex', gap:20, padding:'12px 20px', borderBottom:`1px solid ${th.border}`,
                        background: dark?'#0F1117':th.bgTable, flexWrap:'wrap' }}>
            {[
              [cols.length, 'total columns'],
              [cols.filter(c => ['int','float'].some(k => c.dtype?.includes(k))).length, 'numeric'],
              [cols.filter(c => c.dtype?.includes('object')).length, 'text / categorical'],
            ].map(([v,l]) => (
              <span key={l} style={{ fontSize:13 }}>
                <b style={{ color:'#2563EB' }}>{v}</b>{' '}
                <span style={{ color:th.textSub }}>{l}</span>
              </span>
            ))}
            {report.cat_column && (
              <span style={{ fontSize:13 }}>
                <span style={{ color:th.textSub }}>Grouped by: </span>
                <b style={{ color:'#7C3AED' }}>{report.cat_column}</b>
              </span>
            )}
          </div>

          {cols.length === 0 ? (
            <div style={{ padding:48, textAlign:'center', color:th.textSub, fontSize:13 }}>
              Re-upload your file to capture column metadata.
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background: dark?'#0F1117':th.bgTable }}>
                    {['#','Column Name','Data Type','Non-Null','Missing','Unique Values','Sample'].map(h => (
                      <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10,
                        color:th.textMuted, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em',
                        borderBottom:`1px solid ${th.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cols.map((c, i) => {
                    const isNum  = ['int','float'].some(k => c.dtype?.includes(k));
                    const isDate = c.dtype?.includes('datetime');
                    const chipBg = isNum ? (dark?'#1C2D4A':'#EFF6FF') : isDate ? (dark?'#2D1F6B':'#F5F3FF') : (dark?'#1E2433':'#F8FAFC');
                    const chipCl = isNum ? '#2563EB' : isDate ? '#7C3AED' : th.textSub;
                    const nullPct = parseFloat(c.null_pct) || 0;
                    const health  = 100 - nullPct;
                    const barCl   = health > 90 ? '#16A34A' : health > 70 ? '#D97706' : '#DC2626';
                    const isKey   = c.name === report.cat_column || c.name === report.num_column;

                    return (
                      <tr key={i} style={{
                        background: c.name===report.cat_column ? (dark?'#1a1340':'#F5F3FF') :
                                    c.name===report.num_column  ? (dark?'#0d1f3c':'#EFF6FF') : 'transparent',
                        borderBottom:`1px solid ${th.divider}`,
                        transition: 'background .1s',
                      }}>
                        <td style={{ padding:'10px 14px', fontSize:11, color:th.textMuted }}>{i+1}</td>
                        <td style={{ padding:'10px 14px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <span style={{ fontWeight: isKey?700:500, fontSize:13, color:th.text }}>{c.name}</span>
                            {c.name===report.cat_column && <span style={{ fontSize:9, background:'#7C3AED20', color:'#7C3AED', padding:'2px 6px', borderRadius:4, fontWeight:700 }}>GROUP BY</span>}
                            {c.name===report.num_column  && <span style={{ fontSize:9, background:'#2563EB20', color:'#2563EB', padding:'2px 6px', borderRadius:4, fontWeight:700 }}>VALUE</span>}
                          </div>
                        </td>
                        <td style={{ padding:'10px 14px' }}>
                          <span style={{ fontSize:10, background:chipBg, color:chipCl, padding:'3px 8px', borderRadius:5, fontFamily:'monospace' }}>{c.dtype}</span>
                        </td>
                        <td style={{ padding:'10px 14px', fontSize:12, color:th.textSub }}>{c.non_null?.toLocaleString()}</td>
                        <td style={{ padding:'10px 14px', minWidth:100 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <div style={{ flex:1, height:5, background:dark?'#1E2433':'#E2E8F0', borderRadius:3, overflow:'hidden' }}>
                              <div style={{ height:'100%', width:`${health}%`, background:barCl, borderRadius:3 }}/>
                            </div>
                            <span style={{ fontSize:10, color:th.textMuted, width:28 }}>{nullPct.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td style={{ padding:'10px 14px', fontSize:12, color:th.textSub }}>{c.unique_vals?.toLocaleString()}</td>
                        <td style={{ padding:'10px 14px', fontSize:11, color:th.textMuted, fontFamily:'monospace',
                          maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {String(c.sample || '—')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ════════════════ DETAILS TAB ════════════════ */}
      {tab === 'details' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div style={card}>
            <div style={{ fontWeight:700, color:th.textHeading, marginBottom:16, fontFamily:'Syne', fontSize:15 }}>
              File Information
            </div>
            {[
              ['Original File',   report.original_name],
              ['File Size',       fmtSz(report.original_size)],
              ['Total Rows',      fmtInt(report.row_count)],
              ['Total Columns',   report.col_count],
              ['Category Column', report.cat_column || '—'],
              ['Value Column',    report.num_column  || '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0',
                                        borderBottom:`1px solid ${th.divider}` }}>
                <span style={{ fontSize:13, color:th.textSub }}>{label}</span>
                <span style={{ fontSize:13, fontWeight:600, color:th.text, maxWidth:220,
                               overflow:'hidden', textOverflow:'ellipsis', textAlign:'right' }}>{value}</span>
              </div>
            ))}
            {report.status === 'completed' && (
              <button onClick={download} disabled={dlLoad} style={{
                marginTop:16, width:'100%', padding:'11px', borderRadius:9, background:'#16A34A',
                color:'white', fontWeight:700, fontSize:14, border:'none', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                opacity: dlLoad ? 0.7 : 1, transition:'all .2s'
              }}>
                <Download size={15}/> {dlLoad ? 'Downloading...' : 'Download Excel Report'}
              </button>
            )}
          </div>

          <div style={card}>
            <div style={{ fontWeight:700, color:th.textHeading, marginBottom:16, fontFamily:'Syne', fontSize:15 }}>
              Processing Info
            </div>
            {[
              ['Status',          report.status],
              ['Processing Time', fmtMs(report.processing_time_ms)],
              ['Created',         fmtDt(report.created_at)],
              ['Updated',         fmtDt(report.updated_at)],
            ].map(([label, value]) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0',
                                        borderBottom:`1px solid ${th.divider}` }}>
                <span style={{ fontSize:13, color:th.textSub }}>{label}</span>
                <span style={{ fontSize:13, fontWeight:600, color:th.text }}>{value}</span>
              </div>
            ))}

            <div style={{ marginTop:16, padding:14, background: dark?'#0F1117':th.bgTable,
                          borderRadius:10 }}>
              <div style={{ fontWeight:700, color:'#16A34A', fontSize:13, marginBottom:10 }}>
                ✅ Excel file includes
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {['📊 Summary sheet','📄 Raw data','📈 Statistics','🔄 Pivot table','📊 3 Charts','✅ Live formulas'].map(item => (
                  <span key={item} style={{ fontSize:12, color:th.textSub }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
