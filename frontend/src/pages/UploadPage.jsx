import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsAPI } from '../utils/api';
import { useTheme } from '../hooks/useTheme';
import { t } from '../theme';
import { Upload, File, X, AlertCircle, Zap, CheckCircle } from 'lucide-react';

const fmtSz = b => b >= 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${Math.round(b/1024)} KB`;
const STAGES = ['load','clean','analyze','sheets','raw','stats','pivot','charts','save','done'];
const LABELS = { load:'Loading', clean:'Cleaning', analyze:'Analyzing', sheets:'Building sheets',
  raw:'Raw data', stats:'Statistics', pivot:'Pivot table', charts:'Charts', save:'Saving', done:'Done!' };

export default function UploadPage() {
  const navigate    = useNavigate();
  const { dark }    = useTheme();
  const th          = t(dark);
  const fileRef     = useRef();
  const [file, setFile]         = useState(null);
  const [drag, setDrag]         = useState(false);
  const [uploading, setUploading]= useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage]       = useState('');
  const [error, setError]       = useState('');

  const pick = f => {
    if (!f) return;
    if (!['.csv','.xlsx','.xls'].some(e => f.name.toLowerCase().endsWith(e))) {
      setError('Please upload a .csv, .xlsx, or .xls file.'); return;
    }
    setFile(f); setError('');
  };

  const onDrop = useCallback(e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }, []);

  const pollStatus = async id => {
    while (true) {
      await new Promise(r => setTimeout(r, 1500));
      try {
        const { data } = await reportsAPI.status(id);
        if (data.pct)   setProgress(data.pct);
        if (data.stage) setStage(data.stage);
        if (data.status === 'completed') { setProgress(100); setTimeout(() => navigate(`/reports/${id}`), 600); return; }
        if (data.status === 'failed')    { setError(data.error_message || 'Processing failed'); setUploading(false); return; }
      } catch { setError('Connection lost'); setUploading(false); return; }
    }
  };

  const submit = async () => {
    if (!file) return;
    setUploading(true); setError(''); setProgress(5); setStage('load');
    const fd = new FormData(); fd.append('file', file);
    try {
      const { data } = await reportsAPI.upload(fd);
      await pollStatus(data.reportId);
    } catch (err) { setError(err.response?.data?.error || 'Upload failed'); setUploading(false); }
  };

  const card = { background:th.bgCard, border:`1px solid ${th.border}`, borderRadius:14 };
  const stageIdx = STAGES.indexOf(stage);

  return (
    <div style={{ padding:28, maxWidth:680, margin:'0 auto', fontFamily:"'Inter',system-ui,sans-serif", color:th.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>

      <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:24, color:th.textHeading, marginBottom:4 }}>
        Generate a Report
      </h1>
      <p style={{ color:th.textSub, fontSize:13, marginBottom:28 }}>
        Upload a CSV or Excel file — we'll build your full Excel report in seconds.
      </p>

      {error && (
        <div style={{ background: dark?'#2D1515':'#FEF2F2', border:`1px solid ${dark?'#7F1D1D':'#FECACA'}`,
          color: dark?'#FCA5A5':'#DC2626', borderRadius:10, padding:'12px 16px', marginBottom:16,
          display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
          <AlertCircle size={15}/> {error}
          <button onClick={()=>setError('')} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'inherit' }}>
            <X size={13}/>
          </button>
        </div>
      )}

      {!uploading && (
        <>
          {/* Drop zone */}
          <div onClick={() => !file && fileRef.current?.click()}
            onDragOver={e=>{e.preventDefault();setDrag(true)}}
            onDragLeave={()=>setDrag(false)} onDrop={onDrop}
            style={{ ...card, padding:44, textAlign:'center', cursor: file?'default':'pointer',
              borderStyle:'dashed', borderWidth:2, transition:'all .2s',
              borderColor: drag?'#2563EB': file?'#16A34A': th.border,
              background:  drag? (dark?'#0D1B2A':'#EFF6FF'): file? (dark?'#071A12':'#F0FDF4'): th.bgCard,
              marginBottom:16 }}>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{display:'none'}}
              onChange={e=>pick(e.target.files[0])}/>
            {file ? (
              <>
                <div style={{ width:52, height:52, borderRadius:14, background: dark?'#052e16':'#DCFCE7',
                  display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                  <File size={24} color="#16A34A"/>
                </div>
                <div style={{ fontWeight:700, color:'#16A34A', fontSize:15, marginBottom:4 }}>{file.name}</div>
                <div style={{ color:th.textSub, fontSize:12, marginBottom:12 }}>{fmtSz(file.size)}</div>
                <button onClick={e=>{e.stopPropagation();setFile(null)}}
                  style={{ padding:'5px 14px', borderRadius:8, background:th.bgBadge,
                    border:`1px solid ${th.border}`, color:th.textSub, fontSize:12, cursor:'pointer',
                    display:'inline-flex', alignItems:'center', gap:5 }}>
                  <X size={12}/> Remove file
                </button>
              </>
            ) : (
              <>
                <div style={{ width:52, height:52, borderRadius:14, background: dark?'#1C2D4A':'#EFF6FF',
                  display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                  <Upload size={24} color="#2563EB"/>
                </div>
                <div style={{ fontWeight:600, color:th.text, fontSize:15, marginBottom:6 }}>
                  {drag ? 'Drop it here!' : 'Drag & drop your file, or click to browse'}
                </div>
                <div style={{ color:th.textSub, fontSize:12 }}>CSV, XLSX, XLS — up to 100 MB</div>
              </>
            )}
          </div>

          {file && (
            <button onClick={submit} style={{
              width:'100%', padding:'13px', borderRadius:10, background:'#2563EB', color:'white',
              fontWeight:700, fontSize:15, border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .2s'
            }}
            onMouseOver={e=>e.currentTarget.style.background='#1D4ED8'}
            onMouseOut={e=>e.currentTarget.style.background='#2563EB'}>
              <Zap size={16}/> Generate Report
            </button>
          )}

          {!file && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:8 }}>
              {[
                ['📊','Summary sheet','KPI cards + column overview'],
                ['📈','3 chart types','Bar, line & pie charts'],
                ['🔄','Pivot table','Auto-grouped & calculated'],
              ].map(([icon,label,desc]) => (
                <div key={label} style={{ ...card, padding:16, textAlign:'center' }}>
                  <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
                  <div style={{ fontWeight:600, color:th.text, fontSize:13, marginBottom:3 }}>{label}</div>
                  <div style={{ fontSize:11, color:th.textSub }}>{desc}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Progress */}
      {uploading && (
        <div style={{ ...card, padding:28 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Zap size={18} color="#2563EB"/>
              <span style={{ fontWeight:700, color:th.textHeading, fontSize:15 }}>Building your report…</span>
            </div>
            <span style={{ fontWeight:800, color:'#2563EB', fontSize:22, fontFamily:'Syne' }}>{progress}%</span>
          </div>

          <div style={{ height:8, background: dark?'#1E2433':'#E2E8F0', borderRadius:4, overflow:'hidden', marginBottom:20 }}>
            <div style={{ height:'100%', width:`${progress}%`, borderRadius:4, transition:'width .4s ease',
              background:'linear-gradient(90deg,#2563EB,#16A34A)' }}/>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:`repeat(${STAGES.length},1fr)`, gap:4 }}>
            {STAGES.map((s,i) => {
              const done = i < stageIdx;
              const active = i === stageIdx;
              return (
                <div key={s} style={{ textAlign:'center' }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', margin:'0 auto 4px',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700,
                    background: done ? '#16A34A' : active ? '#2563EB' : (dark?'#1E2433':'#E2E8F0'),
                    color: done||active ? 'white' : th.textMuted }}>
                    {done ? '✓' : i+1}
                  </div>
                  <div style={{ fontSize:9, color: active?'#2563EB':th.textMuted, fontWeight: active?700:400 }}>
                    {LABELS[s]?.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>

          {stage && (
            <div style={{ marginTop:14, textAlign:'center', color:th.textSub, fontSize:13 }}>
              ⚡ {LABELS[stage]}…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
