import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LOGOS = ["Salesforce","HubSpot","Notion","Stripe","Figma","Linear","Vercel","Loom"];
const FEATURES = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/><path d="M13 13l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: "Automated Formulas",
    desc: "SUM, AVERAGE, PIVOT and 50+ Excel functions written automatically — zero manual work required.",
    accent: "#22C55E", tag: "Zero manual work"
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7"><path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round"/><circle cx="19" cy="17" r="3"/></svg>,
    title: "Intelligent Data Cleaning",
    desc: "Auto-detects duplicates, nulls, type mismatches and fixes them silently before the report is built.",
    accent: "#3B82F6", tag: "ML-powered"
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9" strokeLinecap="round"/></svg>,
    title: "Custom Branding",
    desc: "Apply your brand colors across every sheet. Export board-ready reports in one click.",
    accent: "#8B5CF6", tag: "White-label ready"
  },
];

function SpreadsheetPreview() {
  const [activeRow, setActiveRow] = useState(2);
  useEffect(() => {
    const t = setInterval(() => setActiveRow(r => r >= 6 ? 2 : r + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const rows = [
    ["Region","Q1 Revenue","Q2 Revenue","Growth"],
    ["North America","$2,847,000","$3,421,000","▲ 20.2%"],
    ["Europe","$1,923,000","$2,104,000","▲ 9.4%"],
    ["Asia Pacific","$934,000","$1,287,000","▲ 37.8%"],
    ["Latin America","$612,000","$589,000","▼ -3.8%"],
    ["TOTAL","=SUM(B2:B5)","=SUM(C2:C5)","▲ 18.4%"],
  ];
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800">
        <div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-yellow-400"/><div className="w-3 h-3 rounded-full bg-green-400"/>
        <span className="ml-3 text-slate-400 text-xs">revenue_report.xlsx</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-500 text-white font-medium">● Live</span>
      </div>
      <table className="w-full text-xs" style={{fontFamily:'Consolas,monospace'}}>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={`transition-all duration-300 ${ri === activeRow ? 'bg-blue-50 ring-1 ring-inset ring-blue-400' : ri === 0 ? 'bg-slate-700' : ri === rows.length-1 ? 'bg-slate-100 font-bold' : 'bg-white'}`}>
              {row.map((cell, ci) => (
                <td key={ci} className={`px-4 py-2.5 border border-slate-200 ${ri===0?'text-white text-center font-bold':''} ${ci===3?['▲ 20.2%','▲ 9.4%','▲ 37.8%','▲ 18.4%'].includes(cell)?'text-green-600 font-bold':'▼ -3.8%'===cell?'text-red-500 font-bold':ci===3&&ri>0?'text-blue-600':''     :''}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between px-4 py-2 bg-slate-700 text-xs text-slate-400">
        <span>5,000 rows · 0 errors</span><span className="text-green-400">✓ Ready in 4.2s</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scroll,setScroll]= useState(false);
  useEffect(() => {
    const fn = () => setScroll(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",color:"#0F172A",background:"#FAFCFF"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        h1,h2,h3{font-family:'Syne',sans-serif}
        .btn-primary{background:#1D4ED8;color:white;border:none;border-radius:12px;padding:14px 28px;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
        .btn-primary:hover{background:#1E40AF;transform:translateY(-1px);box-shadow:0 8px 24px #1D4ED833}
        .btn-secondary{background:white;color:#334155;border:1.5px solid #CBD5E1;border-radius:12px;padding:14px 28px;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
        .btn-secondary:hover{border-color:#94A3B8;background:#F8FAFC}
        .card{background:white;border-radius:20px;border:1px solid #E2E8F0;box-shadow:0 2px 16px #0000000a;transition:all .28s;padding:32px}
        .card:hover{box-shadow:0 12px 40px #0000001a;transform:translateY(-4px)}
        .logo-scroll{animation:logoScroll 22s linear infinite}
        @keyframes logoScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        input:focus{outline:none;border-color:#1D4ED8;box-shadow:0 0 0 3px #1D4ED820}
      `}</style>

      {/* NAV */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:100,
        background: scroll ? 'rgba(250,252,255,.96)' : 'transparent',
        backdropFilter: scroll ? 'blur(14px)' : 'none',
        borderBottom: scroll ? '1px solid #E2E8F0' : '1px solid transparent',
        transition:'all .3s',
        padding:'0 max(24px,calc((100vw - 1200px)/2))'
      }}>
        <div style={{display:'flex',alignItems:'center',height:64,gap:32}}>
          <div style={{fontFamily:'Syne',fontWeight:800,fontSize:19,color:'#1A3A5C',display:'flex',alignItems:'center',gap:8}}>
            <span style={{background:'#1D4ED8',borderRadius:8,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'white'}}>⚡</span>
            DataSheet AI
          </div>
          <div style={{display:'flex',gap:28,marginLeft:'auto',alignItems:'center'}}>
            {['Features','How it works'].map(l => (
              <a key={l} href="#" style={{color:'#475569',fontSize:14,fontWeight:500,textDecoration:'none'}}>{l}</a>
            ))}
            <Link to="/login" style={{color:'#1D4ED8',fontSize:14,fontWeight:600,textDecoration:'none'}}>Sign in</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{paddingTop:130,paddingBottom:80,padding:'140px max(24px,calc((100vw-1200px)/2)) 80px',position:'relative',overflow:'hidden',background:'linear-gradient(170deg,#F0F7FF 0%,#FAFCFF 60%)'}}>
        <div style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:'#3B82F6',opacity:.06,filter:'blur(90px)',top:-100,right:-50,pointerEvents:'none'}}/>
        <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'#22C55E',opacity:.08,filter:'blur(80px)',bottom:0,left:-80,pointerEvents:'none'}}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center',position:'relative'}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'#EFF6FF',color:'#1D4ED8',borderRadius:999,padding:'5px 14px',fontSize:12,fontWeight:700,letterSpacing:'.05em',textTransform:'uppercase',marginBottom:24}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#22C55E',display:'inline-block'}}/>
              Trusted by 2,400+ data teams
            </div>
            <h1 style={{fontSize:'clamp(36px,4.5vw,60px)',fontWeight:800,lineHeight:1.08,letterSpacing:'-0.03em',marginBottom:24,color:'#0F172A'}}>
              Turn Raw Data into<br/>
              <span style={{background:'linear-gradient(135deg,#1D4ED8,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                Board-Ready Reports
              </span><br/>
              in Seconds
            </h1>
            <p style={{fontSize:17,color:'#475569',maxWidth:500,marginBottom:36,lineHeight:1.75}}>
              Upload any CSV or Excel file. Our AI cleans, pivots, charts, and styles it into a professional multi-sheet workbook — automatically.
            </p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:28}}>
              <Link to="/login" className="btn-primary" style={{fontSize:16,padding:'15px 32px'}}>⚡ Sign In to Get Started</Link>
              <a href="#demo" className="btn-secondary" style={{fontSize:16,padding:'15px 28px'}}>▶ See demo</a>
            </div>
            <div style={{display:'flex',gap:20,fontSize:13,color:'#64748B',flexWrap:'wrap'}}>
              {['✓ Any CSV or Excel','✓ Instant analysis','✓ Multi-sheet reports'].map(t => <span key={t}>{t}</span>)}
            </div>
          </div>
          <div id="demo">
            <SpreadsheetPreview/>
          </div>
        </div>
      </section>

      {/* LOGO BAR */}
      <div style={{background:'#F8FAFC',borderTop:'1px solid #E2E8F0',borderBottom:'1px solid #E2E8F0',padding:'16px 0',overflow:'hidden'}}>
        <p style={{textAlign:'center',fontSize:11,color:'#94A3B8',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12}}>Trusted at</p>
        <div style={{overflow:'hidden'}}>
          <div className="logo-scroll" style={{display:'flex',gap:56,paddingLeft:48,whiteSpace:'nowrap'}}>
            {[...LOGOS,...LOGOS].map((l,i) => (
              <span key={i} style={{fontFamily:'Syne',fontWeight:800,fontSize:14,color:'#CBD5E1',letterSpacing:'-0.01em'}}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section style={{padding:'100px max(24px,calc((100vw-1200px)/2))'}}>
        <div style={{textAlign:'center',marginBottom:60}}>
          <h2 style={{fontSize:'clamp(26px,3.5vw,44px)',fontWeight:800,letterSpacing:'-0.02em',marginBottom:14}}>Three pillars of a perfect report</h2>
          <p style={{color:'#475569',maxWidth:480,margin:'0 auto',fontSize:16}}>Built for analysts who need speed and executives who demand polish.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
          {FEATURES.map(({icon,title,desc,accent,tag}) => (
            <div key={title} className="card">
              <div style={{width:52,height:52,borderRadius:14,background:`${accent}18`,color:accent,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}>{icon}</div>
              <div style={{fontSize:11,fontWeight:700,color:accent,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8}}>{tag}</div>
              <h3 style={{fontSize:19,fontWeight:700,marginBottom:12,letterSpacing:'-0.01em'}}>{title}</h3>
              <p style={{color:'#64748B',fontSize:14,lineHeight:1.75}}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{padding:'80px max(24px,calc((100vw-1200px)/2))',background:'#F0F7FF'}}>
        <h2 style={{textAlign:'center',fontSize:'clamp(24px,3.5vw,42px)',fontWeight:800,letterSpacing:'-0.02em',marginBottom:56}}>
          Three steps. Under 30 seconds.
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:32}}>
          {[
            {num:'01',title:'Upload your file',desc:'CSV or Excel, any size up to 10M rows.'},
            {num:'02',title:'AI analyzes structure',desc:'Detects columns, types, relationships and picks charts automatically.'},
            {num:'03',title:'Download your report',desc:'A styled, multi-sheet Excel workbook in seconds.'},
          ].map(({num,title,desc}) => (
            <div key={num} style={{textAlign:'center',padding:'36px 24px'}}>
              <div style={{width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,#1D4ED8,#3B82F6)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,fontFamily:'Syne',margin:'0 auto 20px',boxShadow:'0 4px 20px #1D4ED833'}}>
                {num}
              </div>
              <h3 style={{fontSize:18,fontWeight:700,marginBottom:10}}>{title}</h3>
              <p style={{color:'#64748B',fontSize:14,lineHeight:1.7}}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'100px max(24px,calc((100vw-1200px)/2))',textAlign:'center'}}>
        <div style={{maxWidth:600,margin:'0 auto',background:'linear-gradient(135deg,#EFF6FF,#F0FFF4)',borderRadius:28,padding:'64px 48px',border:'1px solid #BFDBFE'}}>
          <h2 style={{fontSize:'clamp(26px,4vw,40px)',fontWeight:800,letterSpacing:'-0.02em',marginBottom:14}}>
            Ready to generate your first report?
          </h2>
          <p style={{color:'#475569',fontSize:16,marginBottom:36,lineHeight:1.7}}>
            Sign in to your account and turn any CSV or Excel file into a professional multi-sheet report in seconds.
          </p>
          <Link to="/login" className="btn-primary" style={{fontSize:16,padding:'15px 36px'}}>
            ⚡ Sign In &amp; Get Started
          </Link>
          <p style={{color:'#94A3B8',fontSize:12,marginTop:16}}>Works with any CSV or Excel file · Results in under 30 seconds</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid #E2E8F0',padding:'28px max(24px,calc((100vw-1200px)/2))',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div style={{fontFamily:'Syne',fontWeight:800,fontSize:16,color:'#1A3A5C'}}>⚡ DataSheet AI</div>
        <div style={{display:'flex',gap:24}}>
          {['Privacy','Terms','Docs','GitHub'].map(l=>(
            <a key={l} href="#" style={{color:'#94A3B8',fontSize:13,textDecoration:'none',fontWeight:500}}>{l}</a>
          ))}
        </div>
        <div style={{color:'#CBD5E1',fontSize:12}}>© 2024 DataSheet AI</div>
      </footer>
    </div>
  );
}
