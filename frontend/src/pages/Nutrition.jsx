import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getNutritionRecommendations,
  getNutritionConditions,
  sendCopilotMessage
} from '../services/api';
import Loading from '../components/Loading';
import {
  Utensils,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Apple,
  Coffee,
  Sun,
  Moon,
  Droplets,
  Heart,
  Activity,
  HelpCircle,
  Send,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Flame,
  ChevronRight
} from 'lucide-react';

export default function Nutrition() {
  const { user, addToast } = useAuth();
  const [data, setData] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState('');
  const [loading, setLoading] = useState(true);
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [copilotAnswer, setCopilotAnswer] = useState(null);
  const [isAskingCopilot, setIsAskingCopilot] = useState(false);

  const fetchConditions = async () => {
    try {
      const res = await getNutritionConditions();
      setConditions(Array.isArray(res) ? res : res.conditions || []);
    } catch (err) {
      console.error('Failed to load conditions:', err);
    }
  };

  const fetchRecommendations = async (conditionKey = '') => {
    try {
      setLoading(true);
      const res = await getNutritionRecommendations(conditionKey || undefined);
      setData(res);
      if (!selectedCondition && res?.health_issue) {
        setSelectedCondition(res.health_issue);
      }
    } catch (err) {
      addToast(err.message || 'Error loading nutrition suggestions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
    fetchRecommendations();
  }, []);

  const handleConditionChange = (e) => {
    const val = e.target.value;
    setSelectedCondition(val);
    fetchRecommendations(val);
  };

  const handleAskCopilot = async (e) => {
    e.preventDefault();
    if (!copilotQuestion.trim()) return;

    try {
      setIsAskingCopilot(true);
      setCopilotAnswer(null);

      const promptWithCondition = `[Nutrition & Diet Inquiry for ${data?.health_issue || data?.condition_label || 'health issue'}]: ${copilotQuestion.trim()}`;
      const res = await sendCopilotMessage(promptWithCondition);

      setCopilotAnswer(res.reply);
      addToast('AI Dietitian tailored response generated.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to query AI Dietitian', 'error');
    } finally {
      setIsAskingCopilot(false);
    }
  };

  if (loading && !data) {
    return <Loading text="Personalizing clinical nutrition database for your health profile..." fullPage={true} />;
  }

  const mealPlan = data?.sample_daily_meal_plan;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Banner with condition overview */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 2.25rem',
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
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#2B8A62',
                background: '#E8F7EE',
                border: '1px solid #A8E6C1',
                padding: '3px 10px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={12} /> AI Disease-Specific Nutrition Copilot
            </span>

            {user?.health_issue ? (
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#2B8A62',
                  background: '#E8F7EE',
                  border: '1px solid #A8E6C1',
                  padding: '3px 10px',
                  borderRadius: '999px',
                }}
              >
                Profile Condition: <strong>{user.health_issue}</strong>
              </span>
            ) : null}
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#18392B', marginBottom: '0.5rem' }}>
            Personalized Food &amp; Nutrition Intelligence
          </h1>
          <p style={{ color: '#718579', fontSize: '0.94rem', lineHeight: 1.6 }}>
            {data?.clinical_rationale ||
              'Evidence-based nutritional suggestions crafted for your metabolic and health considerations.'}
          </p>
        </div>

        {/* Condition Selector Switcher */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #DFEAE2',
            borderRadius: '16px',
            padding: '1.25rem',
            minWidth: '280px',
            boxShadow: '0 4px 12px rgba(24, 57, 43, 0.05)',
          }}
        >
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#718579', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Health Issue Focus
          </label>
          <select
            className="input-field"
            value={selectedCondition}
            onChange={handleConditionChange}
            style={{ cursor: 'pointer', fontWeight: 600 }}
          >
            {conditions.map((c) => (
              <option key={c.key || c.id || c.label} value={c.key || c.id || c.label}>
                {c.label}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.74rem', color: '#718579' }}>
            <Activity size={12} color="#2B8A62" />
            <span>Select any issue to view specific dietary protocols</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Beneficial Foods vs Foods to Avoid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Beneficial Foods Column */}
        <div className="glass-panel" style={{ background: '#FFFFFF', border: '1px solid #DFEAE2', boxShadow: 'var(--shadow-card)', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #DFEAE2', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#E8F7EE',
                  border: '1px solid #A8E6C1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Apple size={20} color="#2B8A62" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#18392B' }}>
                  Superfoods to Prioritize
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#2B8A62', fontWeight: 600 }}>
                  Therapeutic &amp; Protective Foods
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data?.beneficial_foods?.map((food, idx) => (
              <div
                key={idx}
                style={{
                  background: '#F3FAF5',
                  border: '1px solid #DFEAE2',
                  borderRadius: '12px',
                  padding: '1rem 1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#18392B' }}>
                    {food.name}
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#2B8A62',
                      background: '#E8F7EE',
                      border: '1px solid #A8E6C1',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {food.category}
                  </span>
                </div>

                <div style={{ fontSize: '0.86rem', color: '#18392B', lineHeight: 1.5 }}>
                  <strong style={{ color: '#2B8A62' }}>Why it helps: </strong>
                  {food.why_it_helps}
                </div>

                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#718579',
                    background: '#FFFFFF',
                    border: '1px solid #DFEAE2',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Utensils size={13} color="#2B8A62" />
                  <span><strong>How to enjoy:</strong> {food.how_to_consume}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Foods to Avoid & Healthier Swaps Column */}
        <div className="glass-panel" style={{ background: '#FFFFFF', border: '1px solid #DFEAE2', boxShadow: 'var(--shadow-card)', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F8B4B4', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#FDF2F2',
                  border: '1px solid #F8B4B4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={20} color="#9B1C1C" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#18392B' }}>
                  Foods to Limit or Avoid
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#9B1C1C', fontWeight: 600 }}>
                  Potential Triggers &amp; Healthier Swaps
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data?.foods_to_avoid?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFF8F8',
                  border: '1px solid #F8B4B4',
                  borderRadius: '12px',
                  padding: '1rem 1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#9B1C1C' }}>
                  {item.name}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#718579', lineHeight: 1.5 }}>
                  <strong style={{ color: '#9B1C1C' }}>Trigger Rationale: </strong>
                  {item.reason}
                </div>

                {/* Healthier Swap Badge */}
                <div
                  style={{
                    background: '#E8F7EE',
                    border: '1px solid #A8E6C1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.82rem',
                  }}
                >
                  <ArrowRight size={14} color="#2B8A62" style={{ flexShrink: 0 }} />
                  <div>
                    <span style={{ color: '#2B8A62', fontWeight: 700 }}>Healthier Swap: </span>
                    <span style={{ color: '#18392B' }}>{item.healthier_alternative}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sample Daily Meal Plan Section */}
      {mealPlan && (
        <div className="glass-panel" style={{ background: '#FFFFFF', border: '1px solid #DFEAE2', boxShadow: 'var(--shadow-card)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#E8F7EE',
                border: '1px solid #A8E6C1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Utensils size={20} color="#2B8A62" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#18392B' }}>
                Sample 1-Day Clinical Meal Blueprint
              </h3>
              <div style={{ fontSize: '0.82rem', color: '#718579' }}>
                Balanced macronutrient distribution optimized for {data?.condition_label}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Breakfast */}
            <div
              style={{
                background: '#F3FAF5',
                border: '1px solid #DFEAE2',
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E', fontWeight: 700, fontSize: '0.9rem' }}>
                <Sun size={18} />
                <span>BREAKFAST</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#18392B', lineHeight: 1.55 }}>
                {mealPlan.breakfast}
              </div>
            </div>

            {/* Lunch */}
            <div
              style={{
                background: '#F3FAF5',
                border: '1px solid #DFEAE2',
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2B8A62', fontWeight: 700, fontSize: '0.9rem' }}>
                <Utensils size={18} />
                <span>LUNCH</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#18392B', lineHeight: 1.55 }}>
                {mealPlan.lunch}
              </div>
            </div>

            {/* Afternoon Snack */}
            <div
              style={{
                background: '#F3FAF5',
                border: '1px solid #DFEAE2',
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B21A8', fontWeight: 700, fontSize: '0.9rem' }}>
                <Coffee size={18} />
                <span>AFTERNOON SNACK</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#18392B', lineHeight: 1.55 }}>
                {mealPlan.afternoon_snack}
              </div>
            </div>

            {/* Dinner */}
            <div
              style={{
                background: '#F3FAF5',
                border: '1px solid #DFEAE2',
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E40AF', fontWeight: 700, fontSize: '0.9rem' }}>
                <Moon size={18} />
                <span>DINNER</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#18392B', lineHeight: 1.55 }}>
                {mealPlan.dinner}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lifestyle & Hydration Guidelines */}
      {data?.lifestyle_and_hydration_rules && (
        <div
          className="glass-panel"
          style={{
            padding: '1.75rem',
            background: '#FFFFFF',
            border: '1px solid #DFEAE2',
            borderLeft: '4px solid #57C99A',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Droplets size={20} color="#2B8A62" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#18392B' }}>
              Lifestyle, Digestion &amp; Hydration Protocols
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {data.lifestyle_and_hydration_rules.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  background: '#F3FAF5',
                  border: '1px solid #DFEAE2',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <CheckCircle2 size={18} color="#2B8A62" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.88rem', color: '#18392B', lineHeight: 1.5 }}>
                  {rule}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ask AI Copilot for Custom Recipe / Food Substitutions */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          border: '1px solid #DFEAE2',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F3FAF5 100%)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
          <Sparkles size={22} color="#2B8A62" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18392B' }}>
            Ask AI Dietitian About Recipes &amp; Substitutions
          </h3>
        </div>
        <p style={{ color: '#718579', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Have a specific food question regarding your {data?.health_issue || data?.condition_label || 'condition'}? Ask for grocery lists, restaurant choices, or recipe modifications.
        </p>

        <form onSubmit={handleAskCopilot} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input-field"
            placeholder={`e.g. What can I substitute for white rice if I have ${data?.health_issue || data?.condition_label || 'this condition'}?`}
            value={copilotQuestion}
            onChange={(e) => setCopilotQuestion(e.target.value)}
            style={{ flex: 1, minWidth: '280px' }}
          />
          <button
            type="submit"
            disabled={isAskingCopilot || !copilotQuestion.trim()}
            className="btn-primary"
            style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isAskingCopilot ? (
              'Formulating...'
            ) : (
              <>
                <Send size={16} /> Ask AI Dietitian
              </>
            )}
          </button>
        </form>

        {copilotAnswer && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              borderRadius: '12px',
              background: '#FFFFFF',
              border: '1px solid #A8E6C1',
              boxShadow: '0 4px 15px rgba(24, 57, 43, 0.06)',
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#2B8A62', textTransform: 'uppercase', marginBottom: '6px' }}>
              AI Clinical Nutrition Analysis
            </div>
            <div style={{ fontSize: '0.92rem', color: '#18392B', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {copilotAnswer}
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Disclaimer */}
      <div className="disclaimer-banner">
        <div style={{ fontWeight: 700, color: '#18392B', marginBottom: '4px' }}>
          Nutritional Education Notice
        </div>
        {data?.disclaimer ||
          'Nutrition recommendations in VitaMind AI are based on peer-reviewed clinical guidelines and are strictly for educational and wellness guidance. Please consult a registered dietitian or licensed medical professional for medical nutrition therapy.'}
      </div>
    </div>
  );
}
