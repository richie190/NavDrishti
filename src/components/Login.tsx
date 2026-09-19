import { ArrowLeft, ArrowUpRight, Compass, Shield, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roles = [
  { title: 'Captain', detail: 'Vessel command and final decisions', code: 'ROLE / 01' },
  { title: 'Navigation Officer', detail: 'Routes, weather, and passage planning', code: 'ROLE / 02' },
  { title: 'Ice Intelligence Analyst', detail: 'Satellite signals and ice movement', code: 'ROLE / 03' },
  { title: 'Research Lead', detail: 'Expedition objectives and station data', code: 'ROLE / 04' },
];

export default function Login() {
  const navigate = useNavigate();

  return <main className="login-page">
    <div className="login-grid" />
    <div className="login-glow" />
    <header className="login-header"><button className="brand login-brand" onClick={() => navigate('/')} aria-label="NAVDRISHTI, return to start"><svg viewBox="0 0 36 40" fill="none" aria-hidden="true"><path d="m18 2 15 34-15-8L3 36 18 2Z" stroke="currentColor" strokeWidth="1.4" /><path d="M18 2v26M3 36l15-18 15 18" stroke="currentColor" strokeWidth=".8" /></svg><span>NAVDRISHTI<small>POLAR INTELLIGENCE</small></span></button><span className="login-coordinates mono">69°24′ S &nbsp; / &nbsp; 76°11′ E</span></header>
    <section className="login-shell" aria-labelledby="login-title">
      <div className="login-intro"><p className="eyebrow"><span className="status-dot" />SECURE EXPEDITION ACCESS</p><h1 id="login-title">Choose your<br /><em>station.</em></h1><p className="login-lede">Select a role to enter the NavDrishti polar intelligence environment.</p><div className="login-status mono"><Shield size={13} /> NO CREDENTIALS REQUIRED <span /></div></div>
      <div className="role-list" role="list" aria-label="Expedition roles">{roles.map(role => <button key={role.title} className="role-card" onClick={() => navigate('/command-center')}><span className="role-index mono">{role.code}</span><span className="role-icon"><UserRound size={18} strokeWidth={1.3} /></span><span className="role-copy"><strong>{role.title}</strong><small>{role.detail}</small></span><ArrowUpRight className="role-arrow" size={17} /></button>)}</div>
    </section>
    <button className="login-back" onClick={() => navigate('/')}><ArrowLeft size={14} /> Return to expedition</button><div className="login-orbit"><Compass size={26} strokeWidth={1} /></div>
  </main>;
}