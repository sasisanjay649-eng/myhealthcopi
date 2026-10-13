import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHealthSummary, getHealthTrends, seedDemoData } from '../services/api';
import HealthCard from '../components/HealthCard';
import HealthChart from '../components/HealthChart';
import AIInsight from '../components/AIInsight';
import Loading from '../components/Loading';
import {
  Moon,
  Activity,
  Heart,
  Droplets,
  Flame,
  Brain,
  Scale,
  Sparkles,
  PlusCircle,
  Database,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Calendar,
  Clock,
  Utensils,
  Pill
} from 'lucide-react';

export default function Dashboard() {
  const { user, addToast } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [insights, setInsights] = useState([]);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartViewTab, setChartViewTab] = useState('all'); // 'all', 'sleep', 'activity', 'vitals'

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumData, trendData] = await Promise.all([
        getHealthSummary(),
        getHealthTrends(),
      ]);

      setSummary(sumData);
      setTrends(trendData.trends || []);
      setInsights(trendData.insights || []);
      setIsDemo(sumData.is_demo_data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load health metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeedDemo = async () => {
    try {
      await seedDemoData();
      addToast('Demo dataset successfully populated into your database!', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message || 'Could not seed demo records', 'error');
    }
  };

  if (loading) {
    return <Loading text="Analyzing personal health patterns..." fullPage={true} />;
  }

  if (error && !summary) {
    return <Loading isError={true} errorText={error} onRetry={fetchData} fullPage={true} />;
  }

  const wellnessScore = summary?.wellness_score || 82;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Welcome & Score Header */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
          borderLeft: '4px solid var(--accent-mint)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Personal Health Copilot
            </span>
            {isDemo && (
              <span className="badge-demo">
                Simulated Demo Data
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Friend'}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '580px' }}>
            Goal: <span style={{ color: '#2B8A62', fontWeight: 700 }}>{user?.health_goal || 'Consistent daily wellness & vitality'}</span>
          </p>
        </div>

        {/* Holistic Wellness Score Gauge Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            background: 'var(--bg-secondary)',
            padding: '1rem 1.4rem',
            borderRadius: '16px',
            border: '1px solid var(--panel-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Circular Score Visual */}
          <div
            style={{
              position: 'relative',
              width: '74px',
              height: '74px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="74" height="74" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="rgba(87, 201, 154, 0.2)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="var(--accent-mint)"
                strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * wellnessScore) / 100}
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--text-main)',
              }}
            >
              {wellnessScore}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Wellness Score
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2B8A62', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={16} /> {summary?.trend_status || 'Stable'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Non-diagnostic lifestyle index
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
          <Link to="/health" className="btn-primary" style={{ fontSize: '0.86rem', padding: '0.65rem 1.2rem' }}>
            <PlusCircle size={16} /> Log Health Data
          </Link>
          <Link to="/copilot" className="btn-secondary" style={{ fontSize: '0.86rem', padding: '0.65rem 1.2rem' }}>
            <Sparkles size={16} color="#2B8A62" /> Ask Copilot
          </Link>
          {isDemo && (
            <button
              onClick={handleSeedDemo}
              className="btn-outline"
              style={{ fontSize: '0.84rem', padding: '0.65rem 1rem', marginLeft: 'auto', borderColor: 'var(--panel-border)', color: 'var(--text-main)' }}
              title="Add 14 sample records to your actual database"
            >
              <Database size={15} /> Save Demo Data to Account
            </button>
          )}
        </div>
      </div>

      {/* 7 Key Health Metric Cards */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Current Vital Indicators
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            14-Day Averages &amp; Baselines
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
          }}
        >
          <HealthCard
            title="Sleep"
            value={summary?.sleep_avg || 7.4}
            unit="hours"
            icon={<Moon size={18} />}
            trend={summary?.sleep_status === 'Improving' ? 'up' : 'stable'}
            trendText={summary?.sleep_status || 'Stable'}
            targetText="Target: 7-9h"
            color="blue"
          />

          <HealthCard
            title="Daily Steps"
            value={(summary?.steps_avg || 7800).toLocaleString()}
            unit="steps"
            icon={<Activity size={18} />}
            trend="up"
            trendText="+8% vs prior"
            targetText="Goal: 8,000"
            color="mint"
          />

          <HealthCard
            title="Heart Rate"
            value={summary?.heart_rate_avg || 71}
            unit="bpm"
            icon={<Heart size={18} />}
            trend="stable"
            trendText="Resting pulse"
            targetText="Normal: 60-100"
            color="rose"
          />

          <HealthCard
            title="Hydration"
            value={summary?.water_avg || 2.4}
            unit="L"
            icon={<Droplets size={18} />}
            trend="up"
            trendText="On target"
            targetText="Target: 2.5L"
            color="blue"
          />

          <HealthCard
            title="Exercise"
            value={summary?.exercise_avg || 35}
            unit="min"
            icon={<Flame size={18} />}
            trend="up"
            trendText="Consistent"
            targetText="Target: 30m"
            color="amber"
          />

          <HealthCard
            title="Stress Level"
            value={summary?.stress_avg || 3.8}
            unit="/ 10"
            icon={<Brain size={18} />}
            trend={summary?.stress_avg > 6 ? 'down' : 'up'}
            trendText="Mild / Managed"
            targetText="Optimum: < 4"
            color="purple"
          />

          <HealthCard
            title="Body Weight"
            value={summary?.weight_latest || 69.6}
            unit="kg"
            icon={<Scale size={18} />}
            trend="stable"
            trendText="Steady"
            targetText="Baseline tracked"
            color="mint"
          />
        </div>
      </div>

      {/* AI Health Insights Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#2B8A62" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              AI Wellness Insights
            </h3>
          </div>
          <Link
            to="/health-analysis"
            style={{ fontSize: '0.84rem', color: '#2B8A62', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Full Analysis <ArrowRight size={14} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {insights.slice(0, 3).map((ins, idx) => (
            <AIInsight
              key={idx}
              title={ins.title}
              content={ins.content}
              category={ins.category}
              scoreImpact={ins.score_impact}
            />
          ))}
        </div>
      </div>

      {/* Interactive Quick Hub: Tablet Schedule & AI Food Recommendations */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Tablet Schedule Card */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
            borderLeft: '4px solid #3B82F6',
            background: '#FFFFFF',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={20} color="#2563EB" />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#1E40AF',
                  background: '#EFF6FF',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                Active Schedule
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Medicine &amp; Tablet Reminder
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
              Stay on track with scheduled daily tablet alarms, dosage tracking, and meal timing guidelines.
            </p>
          </div>

          <Link
            to="/medications"
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.86rem',
              padding: '0.65rem 1rem',
              textDecoration: 'none',
              marginTop: '0.5rem',
            }}
          >
            <span>Open Tablet Schedule</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* AI Food & Nutrition Card */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
            borderLeft: '4px solid var(--accent-mint)',
            background: '#FFFFFF',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--accent-mint-soft)',
                  border: '1px solid var(--accent-mint-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Utensils size={20} color="#2B8A62" />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#15573d',
                  background: 'var(--accent-mint-soft)',
                  border: '1px solid var(--accent-mint-light)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                {user?.health_issue ? user.health_issue : 'AI Nutrition'}
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Disease-Specific Food Suggestions
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
              AI tailored food suggestions, beneficial superfoods, triggers to avoid, and meal blueprints.
            </p>
          </div>

          <Link
            to="/nutrition"
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.86rem',
              padding: '0.65rem 1rem',
              textDecoration: 'none',
              marginTop: '0.5rem',
            }}
          >
            <span>View Food Recommendations</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Recharts Trends Section (All 6 Trends) */}
      <div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Health Trend Analysis
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Interactive Recharts monitoring your 14-day trajectory
            </span>
          </div>

          {/* View Tab Selectors */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid var(--panel-border)',
              gap: '4px',
            }}
          >
            {[
              { id: 'all', label: 'All Trends' },
              { id: 'sleep', label: 'Sleep & Recovery' },
              { id: 'activity', label: 'Steps & Cardio' },
              { id: 'vitals', label: 'Vitals & Weight' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setChartViewTab(tab.id)}
                style={{
                  background: chartViewTab === tab.id ? '#FFFFFF' : 'transparent',
                  color: chartViewTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                  border: chartViewTab === tab.id ? '1px solid var(--accent-mint)' : '1px solid transparent',
                  boxShadow: chartViewTab === tab.id ? 'var(--shadow-subtle)' : 'none',
                  borderRadius: '7px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Recharts Charts Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* 1. Sleep Trend */}
          {(chartViewTab === 'all' || chartViewTab === 'sleep') && (
            <HealthChart
              title="Sleep Duration"
              data={trends}
              dataKey="sleep_duration"
              color="#72a7ff"
              secondaryColor="#3b82f6"
              unit="hrs"
              type="area"
              targetValue={7.5}
              targetLabel="7.5h Target"
              isDemo={isDemo}
            />
          )}

          {/* 2. Steps Trend */}
          {(chartViewTab === 'all' || chartViewTab === 'activity') && (
            <HealthChart
              title="Daily Steps"
              data={trends}
              dataKey="steps"
              color="#58e0bd"
              secondaryColor="#10b981"
              unit="steps"
              type="bar"
              targetValue={8000}
              targetLabel="8k Goal"
              isDemo={isDemo}
            />
          )}

          {/* 3. Heart Rate Trend */}
          {(chartViewTab === 'all' || chartViewTab === 'vitals') && (
            <HealthChart
              title="Resting Heart Rate"
              data={trends}
              dataKey="heart_rate"
              color="#fb7185"
              secondaryColor="#e11d48"
              unit="bpm"
              type="line"
              targetValue={70}
              targetLabel="Baseline"
              isDemo={isDemo}
            />
          )}

          {/* 4. Weight Trend */}
          {(chartViewTab === 'all' || chartViewTab === 'vitals') && (
            <HealthChart
              title="Body Weight"
              data={trends}
              dataKey="weight"
              color="#38bdf8"
              secondaryColor="#0284c7"
              unit="kg"
              type="line"
              isDemo={isDemo}
            />
          )}

          {/* 5. Exercise Duration */}
          {(chartViewTab === 'all' || chartViewTab === 'activity') && (
            <HealthChart
              title="Exercise Duration"
              data={trends}
              dataKey="exercise_duration"
              color="#fbbf24"
              secondaryColor="#d97706"
              unit="min"
              type="bar"
              targetValue={30}
              targetLabel="30m Target"
              isDemo={isDemo}
            />
          )}

          {/* 6. Stress Trend */}
          {(chartViewTab === 'all' || chartViewTab === 'sleep') && (
            <HealthChart
              title="Reported Stress"
              data={trends}
              dataKey="stress_level"
              color="#a78bfa"
              secondaryColor="#7c3aed"
              unit="/ 10"
              type="area"
              targetValue={4}
              targetLabel="Optimal Zone"
              isDemo={isDemo}
            />
          )}
        </div>
      </div>

      {/* Mandatory Regulatory & Medical Disclaimer */}
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
