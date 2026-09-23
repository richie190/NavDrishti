import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Anchor,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Cpu,
  Fingerprint,
  Lock,
  Radar,
  Radio,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface RoleOption {
  id: string;
  title: string;
  code: string;
  clearance: string;
  detail: string;
  defaultCallsign: string;
  icon: typeof Anchor;
}

const roles: RoleOption[] = [
  {
    id: 'captain',
    title: 'Captain',
    code: 'ROLE / 01',
    clearance: 'CLASS-A VESSEL COMMAND',
    detail: 'Final passage authorization, ice-ramming decisions, and distress protocol oversight.',
    defaultCallsign: 'CAPT. VIKRAM SHARMA // VESSEL 01',
    icon: Anchor,
  },
  {
    id: 'nav-officer',
    title: 'Navigation Officer',
    code: 'ROLE / 02',
    clearance: 'TACTICAL PASSAGE CLEARANCE',
    detail: 'Great-circle route generation, Polaris RIO calculation, and drift offset charting.',
    defaultCallsign: 'LT. CDR. S. DAS // NAV-DESK',
    icon: Compass,
  },
  {
    id: 'analyst',
    title: 'Ice Intelligence Analyst',
    code: 'ROLE / 03',
    clearance: 'SAR SATELLITE TELEMETRY',
    detail: 'Copernicus Sentinel-1 SAR analysis, AMSR2 sea ice concentration, and iceberg tracking.',
    defaultCallsign: 'DR. A. KHAN // POLARIS-SAR',
    icon: Radar,
  },
  {
    id: 'researcher',
    title: 'Research Lead',
    code: 'ROLE / 04',
    clearance: 'EXPEDITION MISSION DECK',
    detail: 'Bharati & Maitri resupply logistics, environmental compliance, and scientific payload.',
    defaultCallsign: 'PROF. R. MEHTA // 41-ISEA',
    icon: Cpu,
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [callsign, setCallsign] = useState<string>(roles[0].defaultCallsign);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestamp(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectRole = (index: number) => {
    setSelectedIdx(index);
    setCallsign(roles[index].defaultCallsign);
  };

  const handleAuthorize = () => {
    setIsAuthorizing(true);
    const activeRole = roles[selectedIdx];
    const sessionData = {
      role: activeRole.title,
      code: activeRole.code,
      clearance: activeRole.clearance,
      callsign: callsign.trim() || activeRole.defaultCallsign,
      loginTime: new Date().toISOString(),
    };
    sessionStorage.setItem('navdhrishti_session', JSON.stringify(sessionData));

    setTimeout(() => {
      navigate('/command-center');
    }, 700);
  };

  const activeRole = roles[selectedIdx];
  const IconComponent = activeRole.icon;

  return (
    <main className="login-page">
      <div className="login-grid-bg" />
      <div className="login-glow-center" />
      <div className="login-radial-scan" />

      {/* Top Header Bar */}
      <header className="login-header">
        <button
          className="brand login-brand"
          onClick={() => navigate('/')}
          aria-label="NAVDHRISHTI, return to start"
        >
          <img src="/navdhrishti-logo.svg" alt="" className="brand-logo-svg" />
          <div className="brand-text">
            <span>NAVDHRISHTI</span>
            <small>POLAR INTELLIGENCE ENVIRONMENT</small>
          </div>
        </button>

        <div className="login-header-meta">
          <span className="login-coordinates mono">69°24′ S &nbsp;/&nbsp; 76°11′ E</span>
          <span className="login-clock mono">{timestamp || 'INITIALIZING CLOCK...'}</span>
        </div>
      </header>

      {/* Main Terminal Shell */}
      <section className="login-shell" aria-labelledby="login-title">
        {/* Left Column: Animated Text & Identification Form */}
        <motion.div
          className="login-intro"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="login-eyebrow">
            <span className="status-dot green-pulse" />
            <span>SECURE EXPEDITION ACCESS // TERMINAL NODE 04</span>
          </div>

          <motion.h1
            id="login-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Choose your
            <br />
            <span className="gradient-text">role.</span>
          </motion.h1>

          <motion.p
            className="login-lede"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            Select an operational role to authenticate your session before entering the NavDhrishti polar navigation & iceberg decision dashboard.
          </motion.p>

          {/* Identification Input */}
          <div className="callsign-input-wrapper">
            <label className="callsign-label mono">
              <Radio size={12} className="text-cyan" />
              <span>OFFICER CALLSIGN / IDENTIFIER</span>
            </label>
            <div className="callsign-field-box">
              <Fingerprint size={16} className="callsign-icon" />
              <input
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                placeholder="Enter tactical callsign..."
                className="callsign-input mono"
                maxLength={45}
              />
            </div>
            <span className="callsign-hint mono">Authorized under Antarctic Treaty Protocol</span>
          </div>

          {/* Active Role Preview Pill */}
          <div className="selected-role-preview">
            <div className="preview-indicator">
              <IconComponent size={18} className="text-cyan" />
              <div className="preview-meta">
                <strong className="preview-role-title">{activeRole.title}</strong>
                <span className="preview-role-clearance mono">{activeRole.clearance}</span>
              </div>
            </div>
            <ShieldCheck size={18} className="text-emerald" />
          </div>

          {/* Submit Action Button */}
          <button
            className={`login-action-button ${isAuthorizing ? 'is-authorizing' : ''}`}
            onClick={handleAuthorize}
            disabled={isAuthorizing}
          >
            {isAuthorizing ? (
              <>
                <span className="login-spinner" />
                <span>AUTHORIZING TERMINAL ACCESS...</span>
              </>
            ) : (
              <>
                <Lock size={15} />
                <span>INITIALIZE COMMAND CONSOLE</span>
                <ArrowRight size={15} className="button-arrow" />
              </>
            )}
          </button>

          <div className="login-security-notice mono">
            <Shield size={13} />
            <span>SESSION ENCRYPTION: AES-256 POLARIS PROTOCOL</span>
          </div>
        </motion.div>

        {/* Right Column: Interactive Role Selection Cards */}
        <div className="role-selection-column">
          <div className="role-column-heading mono">
            <UserCheck size={13} className="text-cyan" />
            <span>SELECT EXPEDITION POST (4 ACTIVE ROLES)</span>
          </div>

          <div className="role-list" role="list" aria-label="Expedition roles">
            {roles.map((role, idx) => {
              const RoleIcon = role.icon;
              const isSelected = selectedIdx === idx;
              return (
                <motion.button
                  key={role.id}
                  className={`role-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelectRole(idx)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + idx * 0.08 }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.99 }}
                  aria-pressed={isSelected}
                >
                  <div className="role-card-top">
                    <span className="role-index mono">{role.code}</span>
                    <span className="role-clearance mono">{role.clearance}</span>
                  </div>

                  <div className="role-card-body">
                    <div className="role-icon-box">
                      <RoleIcon size={20} strokeWidth={1.5} />
                    </div>
                    <div className="role-copy">
                      <strong className="role-name">{role.title}</strong>
                      <p className="role-detail">{role.detail}</p>
                    </div>
                  </div>

                  <div className="role-card-footer">
                    {isSelected ? (
                      <span className="role-selected-badge mono">
                        <CheckCircle2 size={13} /> SELECTED POSITION
                      </span>
                    ) : (
                      <span className="role-select-prompt mono">SELECT ROLE</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer Return Link */}
      <footer className="login-footer">
        <button className="login-back" onClick={() => navigate('/')}>
          <ArrowLeft size={14} /> Return to 3D Expedition Overview
        </button>
      </footer>
    </main>
  );
}