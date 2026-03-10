import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI } from '../utils/api';
import { useTheme } from '../hooks/useTheme';
import { t } from '../theme';
import { FileSpreadsheet, Download, Trash2, Eye, Search, Upload, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const fmtInt = n => n >= 1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:String(n||0);
const fmtDt  = s => new Date(s).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
const fmtSz  = b => b>=1e6?`${(b/1e6).toFixed(1)} MB`:`${Math.round((b||0)/1024)} KB`;

export default function ReportsPage() {
  const { dark }          = useTheme();
  const th                = t(dark);
  const [reports,setR]    = useState([]);
  const [loading,setL]    = useState(true);
  const [search, setSrc]  = useState('');
  const [filter, setF]    = useState('all');
  const [dlId,   setDlId] = useState(null);

  const load = () => {
    setL(true);
    reportsAPI.list({ limit:50 }).then(r => setR(r.data.reports||[])).catch(console.error).finally(()=>setL(false));
  };
  useEffect(load, []);

  const download = async r => {
    setDlId(r.id);
    try {
      const { data } = await reportsAPI.download(r.id);
      const url = URL.createObjectURL(new Blob([data]));
      Object.assign(document.createElement('a'),{href:url,download:`${r.title}_report.xlsx`}).click();
      URL.revokeObjectURL(url);
    } finally { setDlId(null); }
  };

  const del = async id => {
    if (!confirm('Delete this report?')) return;
    await reportsAPI.delete(id).catch(console.error);
    setR(rs => rs.filter(r => r.id !== id));
  };

  const STATUS_MAP = {
    completed:  { color:'#16A34A', bg: dark?'#052e1620':'#F0FDF4', icon:<CheckCircle size={11}/> },
    failed:     { color:'#DC2626', bg: dark?'#45111120':'#FEF2F2', icon:<AlertCircle size={11}/> },
    processing: { color:'#2563EB', bg: dark?'#0c1a3a20':'#EFF6FF', icon:<RefreshCw size={11}/> },
    queued:     { color:'#D97706', bg: dark?'#2d1a0020':'#FFFBEB', icon:<Clock size={11}/> },
  };

  const visible = reports
    .filter(r => filter==='all' || r.status===filter)
    .filter(r => !search || [r.title,r.original_name].some(s=>s?.toLowerCase().includes(search.toLowerCase())));

  const card = { background:th.bgCard, border:`1px solid ${th.border}`, borderRadius:14 };

  return (
    <div style={{ padding:28, maxWidth:1100, margin:'0 auto', fontFamily:"'Inter',system-ui,sans-serif", color:th.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        input,select{outline:none;}`}</style>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:24, color:th.textHeading }}>My Reports</h1>
          <p style={{ color:th.textSub, fontSize:13, marginTop:4 }}>{reports.length} report{reports.length!==1?'s':''} total</p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <button onClick={load} style={{ padding:'9px 14px', borderRadius:9, background:th.bgCard,
            border:`1px solid ${th.border}`, color:th.textSub, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
            <RefreshCw size={13}/> Refresh
          </button>
          <Link to="/upload" style={{ padding:'9px 16px', borderRadius:9, background:'#2563EB', color:'white',
            fontWeight:600, fontSize:13, textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
            <Upload size={13}/> New Report
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:th.textMuted }}/>
          <input value={search} onChange={e=>setSrc(e.target.value)} placeholder="Search reports…"
            style={{ width:'100%', paddingLeft:36, paddingRight:12, paddingTop:9, paddingBottom:9,
              borderRadius:9, border:`1px solid ${th.borderInput}`, fontSize:13,
              background:th.bgInput, color:th.text }}/>
        </div>
        {['all','completed','processing','failed'].map(f => (
          <button key={f} onClick={()=>setF(f)} style={{
            padding:'9px 16px', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer',
            border:`1px solid ${f===filter?'#2563EB':th.border}`,
            background: f===filter?(dark?'#1C2D4A':'#EFF6FF'):th.bgCard,
            color: f===filter?'#2563EB':th.textSub
          }}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      <div style={card}>
        {loading ? (
          <div style={{ padding:48, textAlign:'center', color:th.textSub, fontSize:13 }}>Loading reports…</div>
        ) : visible.length === 0 ? (
          <div style={{ padding:56, display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            <FileSpreadsheet size={40} style={{ color:th.border }}/>
            <p style={{ color:th.textSub, fontSize:14, fontWeight:600 }}>
              {search||filter!=='all' ? 'No matching reports' : 'No reports yet'}
            </p>
            {!search && filter==='all' && (
              <Link to="/upload" style={{ padding:'8px 18px', borderRadius:9, background:'#2563EB',
                color:'white', fontSize:13, fontWeight:600, textDecoration:'none',
                display:'flex', alignItems:'center', gap:6 }}>
                <Upload size={13}/> Upload your first file
              </Link>
            )}
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background: dark?'#0F1117':th.bgTable }}>
                  {['Report','Status','Size','Rows','Created','Actions'].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:10,
                      color:th.textMuted, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em',
                      borderBottom:`1px solid ${th.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(r => {
                  const st = STATUS_MAP[r.status] || STATUS_MAP.queued;
                  return (
                    <tr key={r.id} style={{ borderBottom:`1px solid ${th.divider}`, transition:'background .1s' }}
                      onMouseOver={e=>e.currentTarget.style.background=th.bgCardHover}
                      onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ fontWeight:600, color:th.text, fontSize:13 }}>{r.title}</div>
                        <div style={{ fontSize:11, color:th.textMuted, marginTop:2 }}>{r.original_name}</div>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11,
                          fontWeight:700, padding:'3px 10px', borderRadius:999,
                          background:st.bg, color:st.color }}>
                          {st.icon} {r.status}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px', fontSize:13, color:th.textSub }}>{fmtSz(r.original_size)}</td>
                      <td style={{ padding:'12px 16px', fontSize:13, color:th.textSub }}>{r.row_count?fmtInt(r.row_count):'—'}</td>
                      <td style={{ padding:'12px 16px', fontSize:12, color:th.textMuted }}>{fmtDt(r.created_at)}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <Link to={`/reports/${r.id}`} style={{
                            padding:'6px 10px', borderRadius:7, border:`1px solid ${th.border}`,
                            background:th.bgCard, color:th.textSub, display:'flex', alignItems:'center',
                            gap:4, fontSize:12, fontWeight:600, textDecoration:'none' }}>
                            <Eye size={12}/> View
                          </Link>
                          {r.status==='completed' && (
                            <button onClick={()=>download(r)} disabled={dlId===r.id}
                              style={{ padding:'6px 10px', borderRadius:7, background: dark?'#052e16':'#F0FDF4',
                                color:'#16A34A', display:'flex', alignItems:'center', gap:4, fontSize:12,
                                fontWeight:600, border:'1px solid #16A34A40', cursor:'pointer',
                                opacity:dlId===r.id?0.6:1 }}>
                              <Download size={12}/> {dlId===r.id?'…':'Excel'}
                            </button>
                          )}
                          <button onClick={()=>del(r.id)} style={{
                            padding:'6px 10px', borderRadius:7, background: dark?'#2d1515':'#FEF2F2',
                            color:'#DC2626', border:'1px solid #DC262640', cursor:'pointer', display:'flex', alignItems:'center' }}>
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
