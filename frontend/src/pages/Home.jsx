import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Heart,
  Moon,
  Sparkles,
  ShieldCheck,
  Brain,
  Lock,
  ArrowRight,
  TrendingUp,
  Droplets,
  Stethoscope,
  Pill,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Zap,
  Flame,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // Interactive App Mockup State
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | copilot | medications | nutrition
  const [demoWater, setDemoWater] = useState(2.6);
  const [demoCopilotQuery, setDemoCopilotQuery] = useState('');
  const [demoChat, setDemoChat] = useState([
    {
      role: 'user',
      text: 'Analyze my 7-day sleep debt and evening stress correlation.'
    },
    {
      role: 'copilot',
      summary: 'Your sleep quality and autonomic stress recovery have stabilized notably over the past 7 days.',
      data: 'Average sleep duration is 7.5 hrs with 64 bpm resting heart rate. Nights with >7.5 hrs sleep show a 42% lower evening stress score.',
      action: 'Maintain your current wind-down routine 45 minutes before sleep and continue evening Magnesium Glycinate.',
      sources: 'Sleep Foundation • NIH Office of Dietary Supplements'
    }
  ]);
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);

  // Medication search state inside mockup
  const [medQuery, setMedQuery] = useState('');
  const sampleMeds = [
    { name: 'Magnesium Glycinate', dose: '200mg', category: 'Essential Mineral', note: 'Promotes restorative sleep & muscle recovery', safe: true },
    { name: 'Vitamin D3 (Cholecalciferol)', dose: '1000 IU', category: 'Secosteroid Vitamin', note: 'Supports bone density & circadian immune balance', safe: true },
    { name: 'Melatonin', dose: '3mg', category: 'Circadian Hormone', note: 'Assists circadian phase alignment for sleep onset', safe: true },
    { name: 'Ibuprofen', dose: '200mg', category: 'NSAID', note: 'Avoid routine evening use to protect gastric lining', safe: false }
  ];

  // Interactive Wellness Simulator State
  const [simSleep, setSimSleep] = useState(7.5);
  const [simSteps, setSimSteps] = useState(8500);
  const [simStress, setSimStress] = useState(3);

  // Calculate dynamic wellness score
  const computedScore = Math.min(100, Math.max(30, Math.round(
    (simSleep / 8) * 35 +
    (simSteps / 10000) * 35 +
    ((10 - simStress) / 10) * 30
  )));

  const handleLaunchInstantDemo = async () => {
    try {
      await login({ email: 'demo.wellness@vitamind.ai', password: 'VitaMind2026!' });
      navigate('/dashboard');
    } catch (e) {
      navigate('/dashboard');
    }
  };

  const handleSendMockQuery = (queryText) => {
    const textToSend = queryText || demoCopilotQuery;
    if (!textToSend.trim()) return;

    setIsCopilotTyping(true);
    setDemoChat((prev) => [...prev, { role: 'user', text: textToSend }]);
    setDemoCopilotQuery('');

    setTimeout(() => {
      let reply = {
        role: 'copilot',
        summary: 'Clinical analysis indicates consistent autonomic recovery with your current baseline.',
        data: `Biometrics show steady circadian markers. Logged fluid balance (${demoWater.toFixed(1)}L) supports healthy cardiac output.`,
        action: 'Keep your hydration pace and maintain consistent sleep timing within a 30-minute window.',
        sources: 'NHS Clinical Evidence • WHO Guidelines'
      };

      if (textToSend.toLowerCase().includes('magnesium') || textToSend.toLowerCase().includes('coffee')) {
        reply = {
          role: 'copilot',
          summary: 'Magnesium Glycinate does not chemically interact adversely with morning caffeine.',
          data: 'Caffeine has a mild diuretic property. For optimal slow-wave sleep benefit, take magnesium in the evening and keep caffeine before 1 PM.',
          action: 'Space caffeine at least 6 hours away from your planned bedtime to maximize slow-wave sleep cycles.',
          sources: 'FDA Pharmacologic Reference • Harvard Health'
        };
      } else if (textToSend.toLowerCase().includes('headache') || textToSend.toLowerCase().includes('tension')) {
        reply = {
          role: 'copilot',
          summary: 'Observation suggests typical tension pattern related to screen posture or hydration.',
          data: 'No red-flag emergency symptoms detected (no visual aura, no sudden thunderclap onset).',
          action: 'Perform 20-20-20 visual breaks, drink 300ml water, and gently stretch cervical neck muscles.',
          sources: 'American Headache Society • NHS Guidance'
        };
      }

      setDemoChat((prev) => [...prev, reply]);
      setIsCopilotTyping(false);
    }, 700);
  };

  return (
    <div style={{ paddingBottom: '5rem', overflowX: 'hidden' }}>
      {/* SaaS Hero Section */}
      <section
        style={{
          padding: '3.5rem 1.5rem 2rem',
          maxWidth: '1280px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        {/* Live System Indicator */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            background: '#FFFFFF',
            border: '1px solid var(--panel-border-bright)',
            padding: '0.45rem 1.1rem',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-subtle)',
            marginBottom: '1.75rem',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 10px #10B981',
              display: 'inline-block',
            }}
          />
          <span>VitaMind AI Engine v2.4 Active</span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: '#2B8A62' }}>WHO &amp; FDA Monograph Anchored</span>
        </div>

        {/* Hero Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
            fontWeight: 900,
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
            color: 'var(--text-main)',
            maxWidth: '960px',
            margin: '0 auto 1.5rem',
          }}
        >
          Your Personal Health Intelligence{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #18392B 0%, #2B8A62 50%, #57C99A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Operating System
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p
          style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--text-muted)',
            maxWidth: '740px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
            fontWeight: 500,
          }}
        >
          Unifying multi-variable biometric tracking, peer-reviewed clinical pharmacology, and a conversational
          AI copilot into a single, private, and explainable wellness platform.
        </p>

        {/* Action Button Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '3.5rem',
          }}
        >
          <button
            onClick={handleLaunchInstantDemo}
            className="btn-primary"
            style={{
              fontSize: '1.05rem',
              padding: '0.95rem 2rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <Zap size={20} /> Launch Live Web App (Instant Demo)
          </button>

          <Link
            to={isAuthenticated ? '/copilot' : '/login'}
            className="btn-secondary"
            style={{
              fontSize: '1.05rem',
              padding: '0.95rem 1.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <Brain size={20} color="#2B8A62" /> Talk to AI Copilot
          </Link>
        </div>

        {/* Live Metrics Pill Strip */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1.5rem',
            marginBottom: '3rem',
            fontSize: '0.86rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#2B8A62" /> 14,000+ Verified Monographs
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={16} color="#2563EB" /> 100% Client-Isolated Privacy
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#059669" /> Zero Diagnostic Overreach
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#7C3AED" /> Real-Time Trend Analytics
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE WEB APPLICATION MOCKUP (The Real Web App Experience) */}
        {/* ========================================================================= */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'left' }}>
          <div className="app-mockup-frame">
            {/* Window Chrome Header */}
            <div className="mockup-header">
              <div className="window-dots">
                <span className="window-dot red" />
                <span className="window-dot yellow" />
                <span className="window-dot green" />
              </div>

              <div className="mockup-url-bar">
                <Lock size={12} color="#10B981" />
                <span>vitamind.app/workspace/alex-rivera</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#2B8A62' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                Live Sync
              </div>
            </div>

            {/* Application Inside Tab Bar */}
            <div
              style={{
                background: '#FFFFFF',
                borderBottom: '1px solid var(--panel-border)',
                padding: '0.65rem 1.25rem',
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
              }}
            >
              {[
                { id: 'dashboard', label: '📊 Biometrics Dashboard', icon: <Activity size={16} /> },
                { id: 'copilot', label: '🤖 AI Copilot Studio', icon: <Brain size={16} /> },
                { id: 'medications', label: '💊 Medication Monographs', icon: <Pill size={16} /> },
                { id: 'nutrition', label: '🥗 Smart Nutrition & Diet', icon: <Flame size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? 'var(--accent-mint-soft)' : 'transparent',
                    border: activeTab === tab.id ? '1px solid var(--accent-mint-light)' : '1px solid transparent',
                    color: activeTab === tab.id ? '#18392B' : 'var(--text-muted)',
                    fontWeight: activeTab === tab.id ? 800 : 600,
                    padding: '0.45rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Application Inside View Area */}
            <div style={{ padding: '1.75rem', background: '#FAFCFA', minHeight: '380px' }}>
              {/* TAB 1: DASHBOARD VIEW */}
              {activeTab === 'dashboard' && (
                <div>
                  {/* Top Bar inside console */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Good morning, Alex Rivera 👋
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        7-Day Longitudinal Physiology Report • Baseline: Moderately Active
                      </div>
                    </div>
                    <button
                      onClick={() => setDemoWater((prev) => +(prev + 0.25).toFixed(2))}
                      style={{
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#2563EB',
                        padding: '0.45rem 0.9rem',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Droplets size={14} /> + Log 250ml Water (Currently: {demoWater.toFixed(2)}L)
                    </button>
                  </div>

                  {/* Vitals Grid inside console */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    {/* Wellness Score Card */}
                    <div style={{ background: '#FFFFFF', border: '1px solid var(--panel-border)', borderRadius: '14px', padding: '1.25rem' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Wellness Index
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 900, color: '#18392B' }}>88</span>
                        <span style={{ fontSize: '0.88rem', color: '#2B8A62', fontWeight: 700 }}>/ 100 • Optimal</span>
                      </div>
                      <div style={{ marginTop: '0.5rem', height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, #57C99A, #2B8A62)' }} />
                      </div>
                    </div>

                    {/* Resting Heart Rate */}
                    <div style={{ background: '#FFFFFF', border: '1px solid var(--panel-border)', borderRadius: '14px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Resting Heart Rate</div>
                        <Heart size={16} color="#E11D48" />
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#18392B', margin: '0.3rem 0' }}>
                        64 <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>bpm</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#2B8A62', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={12} /> 4 bpm below baseline (Strong recovery)
                      </div>
                    </div>

                    {/* Sleep Duration */}
                    <div style={{ background: '#FFFFFF', border: '1px solid var(--panel-border)', borderRadius: '14px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Sleep Architecture</div>
                        <Moon size={16} color="#2563EB" />
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#18392B', margin: '0.3rem 0' }}>
                        7.8 <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>hrs</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#2563EB', fontWeight: 700 }}>
                        2.1h Deep SWS • Sleep Latency: 14 min
                      </div>
                    </div>

                    {/* Daily Activity */}
                    <div style={{ background: '#FFFFFF', border: '1px solid var(--panel-border)', borderRadius: '14px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Physical Activity</div>
                        <Activity size={16} color="#059669" />
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#18392B', margin: '0.3rem 0' }}>
                        9,420 <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>steps</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>
                        94% of 10,000 daily goal completed
                      </div>
                    </div>
                  </div>

                  {/* Live AI Insight Card inside console */}
                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid var(--panel-border-bright)',
                      borderLeft: '4px solid var(--accent-mint)',
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-mint-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={18} color="#2B8A62" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#18392B' }}>
                          Copilot Synthesis: Positive Autonomic Balance
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Higher hydration ({demoWater.toFixed(1)}L) directly correlated with lower evening cortisol spikes and faster sleep onset.
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleLaunchInstantDemo}
                      style={{
                        background: 'var(--accent-mint)',
                        color: '#18392B',
                        border: 'none',
                        padding: '0.45rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      Open Full Analytics <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: COPILOT STUDIO VIEW */}
              {activeTab === 'copilot' && (
                <div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Ask clinical wellness questions based on your logged biometric data and health goals:
                  </div>

                  {/* Suggestion Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {[
                      'Can I take Magnesium with morning coffee?',
                      'Why did my resting heart rate drop to 64 bpm?',
                      'Evaluate screen strain and mild tension headache',
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMockQuery(prompt)}
                        className="interactive-chip"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <Sparkles size={12} color="#2B8A62" /> {prompt}
                      </button>
                    ))}
                  </div>

                  {/* Chat Conversation Thread */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '250px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem' }}>
                    {demoChat.map((msg, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        {msg.role === 'user' ? (
                          <div style={{ background: '#18392B', color: '#FFFFFF', padding: '0.65rem 1.1rem', borderRadius: '16px 16px 4px 16px', fontSize: '0.86rem', maxWidth: '85%' }}>
                            {msg.text}
                          </div>
                        ) : (
                          <div style={{ background: '#FFFFFF', border: '1px solid var(--panel-border)', padding: '1rem', borderRadius: '16px 16px 16px 4px', fontSize: '0.84rem', maxWidth: '92%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                            <div style={{ fontWeight: 800, color: '#18392B', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Brain size={14} color="#2B8A62" /> Clinical Synthesis
                            </div>
                            <p style={{ margin: '0 0 6px', color: 'var(--text-main)', lineHeight: 1.45 }}>{msg.summary}</p>
                            <p style={{ margin: '0 0 6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}><strong>Observed Data:</strong> {msg.data}</p>
                            <p style={{ margin: '0 0 6px', color: '#059669', fontSize: '0.8rem', fontWeight: 600 }}><strong>Next Steps:</strong> {msg.action}</p>
                            <div style={{ fontSize: '0.72rem', color: '#94A3B8', borderTop: '1px solid #F1F5F9', paddingTop: '4px' }}>
                              Sources: {msg.sources}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {isCopilotTyping && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} color="#2B8A62" /> VitaMind Copilot is analyzing peer-reviewed monographs...
                      </div>
                    )}
                  </div>

                  {/* Input Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMockQuery();
                    }}
                    style={{ display: 'flex', gap: '0.5rem' }}
                  >
                    <input
                      type="text"
                      placeholder="Type a clinical question (e.g. sleep debt, hydration, vitamins)..."
                      value={demoCopilotQuery}
                      onChange={(e) => setDemoCopilotQuery(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.7rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid var(--panel-border)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        background: '#FFFFFF',
                      }}
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: '0.7rem 1.25rem', fontSize: '0.85rem', borderRadius: '10px' }}
                    >
                      <Send size={15} /> Ask
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: MEDICATIONS MONOGRAPH VIEW */}
              {activeTab === 'medications' && (
                <div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                      <input
                        type="text"
                        placeholder="Search FDA & NHS monographs (e.g., Magnesium, Melatonin, Ibuprofen)..."
                        value={medQuery}
                        onChange={(e) => setMedQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.65rem 1rem 0.65rem 2.4rem',
                          borderRadius: '10px',
                          border: '1px solid var(--panel-border)',
                          fontSize: '0.85rem',
                          outline: 'none',
                          background: '#FFFFFF',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                    {sampleMeds
                      .filter((m) => m.name.toLowerCase().includes(medQuery.toLowerCase()) || m.category.toLowerCase().includes(medQuery.toLowerCase()))
                      .map((med, i) => (
                        <div key={i} style={{ background: '#FFFFFF', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>{med.name}</div>
                            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px', background: med.safe ? 'var(--accent-mint-soft)' : '#FEF2F2', color: med.safe ? '#2B8A62' : '#DC2626', fontWeight: 700 }}>
                              {med.safe ? 'Safe Monograph' : 'Caution Advised'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{med.category} • Dosage: {med.dose}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.4 }}>{med.note}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 4: NUTRITION VIEW */}
              {activeTab === 'nutrition' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Daily Calories</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18392B' }}>2,180 / 2,200 kcal</div>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Protein Intake</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB' }}>128g / 130g</div>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Hydration Pace</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>{demoWater.toFixed(1)}L / 2.8L</div>
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                      🌙 Circadian Sleep Optimization Meal Plan
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Include wild salmon or steamed edamame with pumpkin seeds for dinner. Rich in natural tryptophan and magnesium to stimulate endogenous melatonin synthesis before sleep.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status Ribbon */}
            <div
              style={{
                background: '#F8FCF9',
                borderTop: '1px solid var(--panel-border)',
                padding: '0.75rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
              }}
            >
              <div>💡 Tip: Click between the tabs above to test the real live features</div>
              <button
                onClick={handleLaunchInstantDemo}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2B8A62',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Enter Full Application <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* INTERACTIVE WELLNESS SCORE SIMULATOR (Live Web Calculator) */}
      {/* ========================================================================= */}
      <section style={{ maxWidth: '1100px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div
          className="glass-panel"
          style={{
            padding: '2.5rem',
            background: '#FFFFFF',
            border: '1px solid var(--panel-border)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span
              style={{
                display: 'inline-block',
                background: 'var(--accent-mint-soft)',
                color: '#2B8A62',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '0.35rem 0.9rem',
                borderRadius: '999px',
                marginBottom: '0.5rem',
              }}
            >
              Interactive Physiology Calculator
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
              See How Your Daily Habits Impact Your Wellness Score
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '600px', margin: '0 auto' }}>
              Adjust the sliders below to simulate how sleep duration, daily activity, and evening stress levels interact in real-time.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            {/* Sliders Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Slider 1: Sleep */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Moon size={15} color="#2563EB" /> Sleep Duration</span>
                  <span style={{ color: '#2563EB' }}>{simSleep} Hours</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="0.5"
                  value={simSleep}
                  onChange={(e) => setSimSleep(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#2563EB', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>4 hrs (Severe Debt)</span>
                  <span>8 hrs (Optimal)</span>
                  <span>10 hrs</span>
                </div>
              </div>

              {/* Slider 2: Steps */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={15} color="#059669" /> Daily Steps</span>
                  <span style={{ color: '#059669' }}>{simSteps.toLocaleString()} Steps</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="16000"
                  step="500"
                  value={simSteps}
                  onChange={(e) => setSimSteps(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#059669', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>2,000 (Sedentary)</span>
                  <span>8,000 - 10,000 (Active)</span>
                  <span>16,000</span>
                </div>
              </div>

              {/* Slider 3: Stress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Heart size={15} color="#E11D48" /> Evening Stress Level</span>
                  <span style={{ color: simStress > 6 ? '#DC2626' : '#2B8A62' }}>{simStress} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={simStress}
                  onChange={(e) => setSimStress(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#E11D48', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>1 (Relaxed)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Severe Stress)</span>
                </div>
              </div>
            </div>

            {/* Score Display Column */}
            <div
              style={{
                background: '#F8FCF9',
                border: '1px solid var(--panel-border)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Simulated Wellness Score
              </div>

              <div
                style={{
                  fontSize: '4rem',
                  fontWeight: 900,
                  color: computedScore >= 80 ? '#2B8A62' : computedScore >= 60 ? '#D97706' : '#DC2626',
                  lineHeight: 1,
                  marginBottom: '0.5rem',
                }}
              >
                {computedScore}
              </div>

              <div
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: computedScore >= 80 ? '#2B8A62' : computedScore >= 60 ? '#D97706' : '#DC2626',
                  marginBottom: '1rem',
                }}
              >
                {computedScore >= 85
                  ? 'Optimal Recovery & Resilience'
                  : computedScore >= 70
                  ? 'Balanced with Minor Fatigue Markers'
                  : computedScore >= 50
                  ? 'Elevated Stress & Sleep Deprivation'
                  : 'Critical Exhaustion Alert'}
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 auto 1.5rem' }}>
                {computedScore >= 80
                  ? 'Your biometric balance promotes robust parasympathetic heart rate variability (HRV) and cellular recovery.'
                  : 'Prioritizing an extra 45 minutes of sleep and an evening wind-down walk can elevate your wellness score significantly.'}
              </p>

              <button
                onClick={handleLaunchInstantDemo}
                className="btn-primary"
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem' }}
              >
                Track Your Real Biometrics <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODERN BENTO GRID (Platform Capabilities) */}
      {/* ========================================================================= */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Built for Real Clinical Utility
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Not just another wellness tracker. A medically grounded copilot anchored in authoritative standards.
          </p>
        </div>

        <div className="bento-grid">
          {/* Bento Card 1: Longitudinal Trends */}
          <div className="glass-panel bento-col-6" style={{ padding: '2rem', background: '#FFFFFF' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <TrendingUp size={22} color="#2563EB" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Multi-Factor Correlation Analytics
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Discover hidden physiological relationships: see precisely how hydration changes your resting pulse, or how late caffeine disrupts restorative slow-wave sleep.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="interactive-chip active" style={{ fontSize: '0.76rem' }}>Sleep Consistency: 91%</span>
              <span className="interactive-chip active" style={{ fontSize: '0.76rem' }}>Autonomic Recovery: 85%</span>
            </div>
          </div>

          {/* Bento Card 2: Clinical Evidence Anchoring */}
          <div className="glass-panel bento-col-6" style={{ padding: '2rem', background: '#FFFFFF' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--accent-mint-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShieldCheck size={22} color="#2B8A62" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              FDA, WHO &amp; NHS Evidence Base
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Every insight and pharmacology monograph cites verified clinical sources with direct trust links. VitaMind AI never improvises medical claims or diagnoses.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="interactive-chip" style={{ fontSize: '0.76rem' }}>FDA Pharmacology</span>
              <span className="interactive-chip" style={{ fontSize: '0.76rem' }}>NHS Guidelines</span>
              <span className="interactive-chip" style={{ fontSize: '0.76rem' }}>PubMed Literature</span>
            </div>
          </div>

          {/* Bento Card 3: Autonomous Triage Guardrails */}
          <div className="glass-panel bento-col-6" style={{ padding: '2rem', background: '#FFFFFF' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <AlertCircle size={22} color="#DC2626" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Red-Flag Emergency Detection
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Built-in clinical safety filters detect acute red-flag symptoms (severe chest discomfort, stroke signs, breathing distress) and automatically trigger prominent urgent care notices (911/112).
            </p>
          </div>

          {/* Bento Card 4: Prescription & Tablet Tracking */}
          <div className="glass-panel bento-col-6" style={{ padding: '2rem', background: '#FFFFFF' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Pill size={22} color="#7C3AED" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Medication &amp; Dose Reminders
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Schedule daily tablet reminders, track adherence logs, review contraindications, and prepare concise pharmacology summaries for physician consultations.
            </p>
          </div>
        </div>
      </section>

      {/* Regulatory Notice Banner */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="disclaimer-banner">
          <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Medical &amp; Clinical Safety Advisory
          </div>
          VitaMind AI provides educational wellness synthesis. It is not an FDA-cleared diagnostic device and does not replace the judgment of a licensed healthcare physician. In the event of an acute medical emergency, contact emergency medical services immediately.
        </div>
      </section>
    </div>
  );
}
