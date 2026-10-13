import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeSymptoms, getSymptomHistory } from '../services/api';
import SourceCard from '../components/SourceCard';
import Loading from '../components/Loading';
import {
  Stethoscope,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  History,
  Info,
  Sparkles,
  HeartPulse,
  Plus,
  X
} from 'lucide-react';

export default function Symptoms() {
  const { addToast } = useAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Headache', 'Fatigue']);
  const [customSymptom, setCustomSymptom] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [durationDays, setDurationDays] = useState(2);
  const [additionalContext, setAdditionalContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const commonSymptomChips = [
    'Headache',
    'Fever',
    'Cough',
    'Fatigue',
    'Nausea',
    'Dizziness',
    'Stomach discomfort',
    'Sleep problems',
    'Sore throat',
    'Muscle soreness',
    'Chest tightness',
    'Shortness of breath',
  ];

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await getSymptomHistory();
      setHistoryList(data);
    } catch (err) {
      console.error('Error fetching symptom history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms((prev) => prev.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms((prev) => [...prev, sym]);
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    const trimmed = customSymptom.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms((prev) => [...prev, trimmed]);
      setCustomSymptom('');
    }
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      addToast('Please select or add at least one symptom.', 'warning');
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisResult(null);
      const res = await analyzeSymptoms(
        selectedSymptoms,
        severity,
        durationDays,
        additionalContext
      );
      setAnalysisResult(res);
      addToast('Educational symptom analysis generated.', 'success');
      fetchHistory();
    } catch (err) {
      addToast(err.message || 'Error analyzing symptoms', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          borderLeft: '4px solid #57C99A',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F3FAF5 100%)',
          border: '1px solid #DFEAE2',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#2B8A62',
                background: '#E8F7EE',
                border: '1px solid #A8E6C1',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              Educational Symptom Evaluation
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#18392B', marginBottom: '0.35rem' }}>
            Symptom Information &amp; Triage
          </h1>
          <p style={{ color: '#718579', fontSize: '0.92rem', maxWidth: '640px' }}>
            Understand general clinical possibilities, self-care guidelines, and critical red flags.
            VitaMind AI does NOT provide medical diagnoses.
          </p>
        </div>
      </div>

      {/* Input Selection Form */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          background: '#FFFFFF',
          border: '1px solid #DFEAE2',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Step 1: Select Symptoms */}
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#18392B', marginBottom: '0.65rem' }}>
            1. Select or Enter Current Symptoms
          </label>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {commonSymptomChips.map((sym) => {
              const selected = selectedSymptoms.includes(sym);
              const isUrgent = sym.includes('Chest') || sym.includes('Breath');
              return (
                <button
                  key={sym}
                  onClick={() => toggleSymptom(sym)}
                  style={{
                    background: selected
                      ? isUrgent
                        ? '#FDF2F2'
                        : '#E8F7EE'
                      : '#F3FAF5',
                    border: selected
                      ? isUrgent
                        ? '1px solid #F8B4B4'
                        : '1px solid #57C99A'
                      : '1px solid #DFEAE2',
                    color: selected
                      ? isUrgent
                        ? '#9B1C1C'
                        : '#18392B'
                      : '#718579',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {selected && '✓ '} {sym}
                </button>
              );
            })}
          </div>

          {/* Add custom symptom */}
          <form onSubmit={handleAddCustom} style={{ display: 'flex', gap: '0.5rem', maxWidth: '420px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Add other symptom (e.g. Earache, Chills)..."
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
            />
            <button type="submit" className="btn-secondary" style={{ padding: '0.65rem 1rem' }}>
              <Plus size={16} /> Add
            </button>
          </form>

          {/* Selected pills list */}
          {selectedSymptoms.length > 0 && (
            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#718579' }}>Selected:</span>
              {selectedSymptoms.map((sym) => (
                <span
                  key={sym}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#E8F7EE',
                    color: '#2B8A62',
                    border: '1px solid #A8E6C1',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  {sym}
                  <X
                    size={12}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleSymptom(sym)}
                  />
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Severity & Duration */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            borderTop: '1px solid #DFEAE2',
            paddingTop: '1.25rem',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#718579', marginBottom: '0.4rem' }}>
              Severity Level
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['mild', 'moderate', 'severe'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSeverity(lvl)}
                  style={{
                    flex: 1,
                    textTransform: 'capitalize',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: severity === lvl ? (lvl === 'severe' ? '#FDF2F2' : '#E8F7EE') : '#F3FAF5',
                    border: severity === lvl ? (lvl === 'severe' ? '1px solid #F8B4B4' : '1px solid #57C99A') : '1px solid #DFEAE2',
                    color: severity === lvl ? (lvl === 'severe' ? '#9B1C1C' : '#18392B') : '#718579',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#718579', marginBottom: '0.4rem' }}>
              Duration ({durationDays} day{durationDays > 1 ? 's' : ''})
            </label>
            <input
              type="range"
              min="1"
              max="21"
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#57C99A', cursor: 'pointer', marginTop: '8px' }}
            />
          </div>
        </div>

        {/* Step 3: Additional Context */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#718579', marginBottom: '0.4rem' }}>
            Additional Context (Optional)
          </label>
          <textarea
            rows="2"
            className="input-field"
            placeholder="e.g. Started after working late on computer, haven't drunk much water today..."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="btn-primary"
          style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
        >
          {isAnalyzing ? 'Evaluating Symptoms...' : 'Analyze Symptoms with AI Copilot'}
        </button>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            background: '#FFFFFF',
            border: '1px solid #DFEAE2',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Emergency Alert if triggered */}
          {analysisResult.emergency_warning && (
            <div
              style={{
                background: '#FDF2F2',
                border: '1px solid #F8B4B4',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                color: '#9B1C1C',
              }}
            >
              <ShieldAlert size={26} color="#9B1C1C" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#9B1C1C', marginBottom: '4px' }}>
                  URGENT CARE NOTICE
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
                  {analysisResult.emergency_warning}
                </p>
              </div>
            </div>
          )}

          {/* Educational Guidance Intro */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2B8A62', textTransform: 'uppercase', marginBottom: '4px' }}>
              Educational Perspective
            </div>
            <p style={{ fontSize: '1rem', color: '#18392B', lineHeight: 1.6, fontWeight: 500 }}>
              {analysisResult.guidance}
            </p>
          </div>

          {/* General Possibilities */}
          <div
            style={{
              background: '#F3FAF5',
              border: '1px solid #DFEAE2',
              borderRadius: '12px',
              padding: '1.25rem',
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2B8A62', marginBottom: '0.75rem' }}>
              General Educational Possibilities (Not a diagnosis)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {analysisResult.general_possibilities?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', color: '#18392B' }}>
                  <span style={{ color: '#2B8A62', fontWeight: 700 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Self-care suggestions & Red flags side-by-side */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Self-Care */}
            <div
              style={{
                background: '#F3FAF5',
                border: '1px solid #DFEAE2',
                borderRadius: '12px',
                padding: '1.25rem',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2B8A62', marginBottom: '0.75rem' }}>
                Supportive Self-Care &amp; Rest
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysisResult.self_care_tips?.map((tip, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: '#18392B' }}>
                    <CheckCircle2 size={16} color="#2B8A62" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Flags */}
            <div
              style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '12px',
                padding: '1.25rem',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#92400E', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> Critical Red Flags to Watch
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysisResult.red_flags?.map((flag, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: '#78350F' }}>
                    <span style={{ color: '#92400E', fontWeight: 700 }}>!</span>
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sources */}
          {analysisResult.sources && analysisResult.sources.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#718579', marginBottom: '0.75rem' }}>
                Trusted Medical Sources Consulted
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1rem',
                }}
              >
                {analysisResult.sources.map((src, idx) => (
                  <SourceCard key={idx} source={src} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Symptom History */}
      {historyList.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18392B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#2B8A62" /> Past Symptom Evaluations ({historyList.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {historyList.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '1.2rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  background: '#FFFFFF',
                  border: '1px solid #DFEAE2',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#18392B', fontSize: '0.95rem' }}>
                      {item.symptoms?.join(', ')}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 7px',
                        borderRadius: '999px',
                        background: item.severity === 'severe' ? '#FDF2F2' : '#E8F7EE',
                        border: item.severity === 'severe' ? '1px solid #F8B4B4' : '1px solid #A8E6C1',
                        color: item.severity === 'severe' ? '#9B1C1C' : '#2B8A62',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#718579' }}>
                    Duration: {item.duration_days} day(s) &bull; Logged on {item.created_at?.split('T')[0]}
                  </div>
                </div>

                <span style={{ fontSize: '0.8rem', color: '#2B8A62', fontWeight: 600 }}>
                  Educational Log Saved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regulatory Disclaimer */}
      <div className="disclaimer-banner">
        <div style={{ fontWeight: 700, color: '#18392B', marginBottom: '4px' }}>
          Educational Medical Disclaimer
        </div>
        VitaMind AI provides general health and wellness information for educational purposes.
        It does not diagnose conditions, prescribe medicines, or replace professional medical advice, diagnosis, or treatment.
        Consult a qualified healthcare professional before starting, stopping, or changing any medication.
      </div>
    </div>
  );
}
