import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  sendCopilotMessage,
  streamCopilotMessage,
  getChatHistory,
  clearChatHistory,
  getAIConfig,
  updateAIConfig,
  testAIConnection,
  getHealthSummary,
  getUserMedications
} from '../services/api';
import { SUGGESTED_COPILOT_QUESTIONS } from '../services/ai';
import ChatMessage from '../components/ChatMessage';
import Loading from '../components/Loading';
import {
  Send,
  Square,
  Sparkles,
  Bot,
  Trash2,
  RefreshCw,
  Info,
  ShieldAlert,
  HelpCircle,
  Activity,
  Settings,
  Plus,
  Key,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronDown,
  Zap,
  Sliders,
  RotateCcw,
  Heart,
  Moon,
  Footprints,
  Utensils,
  Dumbbell,
  Target
} from 'lucide-react';

const PROMPT_CARDS = [
  {
    title: 'Personalized Wellness Plan',
    prompt: 'Create a personalized wellness plan.',
    desc: 'Customized daily and weekly schedule tailored to your health goals',
    icon: Target,
    color: '#58e0bd'
  },
  {
    title: 'Sleep Optimization',
    prompt: 'Help me improve my sleep.',
    desc: 'Circadian anchoring, evening routines, and recovery insights',
    icon: Moon,
    color: '#72a7ff'
  },
  {
    title: 'Balanced Meal Planning',
    prompt: 'Suggest a balanced daily meal plan.',
    desc: 'Whole-food nutrition aligned with your dietary preferences and vitals',
    icon: Utensils,
    color: '#34d399'
  },
  {
    title: 'Beginner Workout Routine',
    prompt: 'Help me build a beginner workout routine.',
    desc: 'Low-impact progressive strength and cardio plan',
    icon: Dumbbell,
    color: '#f59e0b'
  },
  {
    title: 'Habit Formation Strategy',
    prompt: 'Explain how to improve my daily habits.',
    desc: 'Small actionable micro-habits grounded in behavioral science',
    icon: Heart,
    color: '#a78bfa'
  }
];

export default function Copilot() {
  const { user, addToast } = useAuth();
  const location = useLocation();

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [lastUserPrompt, setLastUserPrompt] = useState('');

  // Health Profile Context Snapshot
  const [healthSummary, setHealthSummary] = useState(null);
  const [activeMedsList, setActiveMedsList] = useState([]);

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState({
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    is_configured: false,
    masked_api_key: null,
    endpoint_url: '',
    available_providers: []
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState({
    provider: 'openai',
    model: 'gpt-4o-mini',
    api_key: '',
    temperature: 0.7,
    endpoint_url: ''
  });
  const [showKeyText, setShowKeyText] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // References
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history & AI configuration on mount
  useEffect(() => {
    const initializeCopilot = async () => {
      try {
        setLoadingHistory(true);
        const [historyData, configData] = await Promise.allSettled([
          getChatHistory(),
          getAIConfig()
        ]);

        if (historyData.status === 'fulfilled') {
          setMessages(historyData.value || []);
        }

        if (configData.status === 'fulfilled' && configData.value) {
          const cfg = configData.value;
          setAiConfig(cfg);
          setConfigForm({
            provider: cfg.provider || 'openai',
            model: cfg.model || 'gpt-4o-mini',
            api_key: '',
            temperature: cfg.temperature ?? 0.7,
            endpoint_url: cfg.endpoint_url || ''
          });
        }
      } catch (err) {
        console.error('Failed to initialize Copilot:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    const loadProfileData = async () => {
      try {
        const [sumRes, medsRes] = await Promise.allSettled([
          getHealthSummary(),
          getUserMedications()
        ]);
        if (sumRes.status === 'fulfilled') setHealthSummary(sumRes.value);
        if (medsRes.status === 'fulfilled' && Array.isArray(medsRes.value)) {
          setActiveMedsList(medsRes.value.filter(m => m.status === 'active').map(m => m.medication_name));
        }
      } catch (err) {
        console.error('Error fetching user health snapshot:', err);
      }
    };

    initializeCopilot();
    loadProfileData();
  }, []);

  // Handle incoming initial prompt from navigation state (e.g. from Medications or Health Analysis)
  useEffect(() => {
    if (location.state?.initialQuery && !loadingHistory) {
      setInputValue(location.state.initialQuery);
    }
  }, [location.state, loadingHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating, streamingStatus]);

  // Handle Send with live streaming
  const handleSend = async (textToSend = null) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isGenerating) return;

    setLastUserPrompt(query);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMessageId = Date.now();
    const userMsg = {
      id: userMessageId,
      role: 'user',
      content: query,
      created_at: new Date().toISOString()
    };

    // Temporary streaming assistant message
    const assistantTempId = userMessageId + 1;
    const assistantMsg = {
      id: assistantTempId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      created_at: new Date().toISOString(),
      model_name: aiConfig.model ? `${aiConfig.provider?.toUpperCase()} (${aiConfig.model})` : 'AI Copilot'
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsGenerating(true);
    setStreamingStatus('Connecting to live AI model...');

    // Create abort controller for stop generation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let accumulatedContent = '';

    await streamCopilotMessage({
      message: query,
      model: aiConfig.model,
      temperature: aiConfig.temperature,
      signal: abortController.signal,
      onStatus: (statusData) => {
        setStreamingStatus(statusData.message || 'Processing health intelligence...');
      },
      onToken: (delta) => {
        setStreamingStatus('');
        accumulatedContent += delta;
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantTempId
              ? { ...m, content: accumulatedContent, isStreaming: true }
              : m
          )
        );
      },
      onDone: (doneData) => {
        setIsGenerating(false);
        setStreamingStatus('');
        abortControllerRef.current = null;
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantTempId
              ? {
                  ...m,
                  id: doneData.id || m.id,
                  content: doneData.content || accumulatedContent,
                  structured_data: doneData.structured_data,
                  sources: doneData.sources,
                  is_emergency: doneData.is_emergency,
                  model_name: doneData.model_name || m.model_name,
                  isStreaming: false
                }
              : m
          )
        );
      },
      onError: (err) => {
        setIsGenerating(false);
        setStreamingStatus('');
        abortControllerRef.current = null;

        const isKeyRequired = err?.detail?.error_code === 'AI_API_KEY_REQUIRED';
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantTempId
              ? {
                  ...m,
                  content: isKeyRequired
                    ? 'No API key is configured for the AI provider. Please configure an API key in AI Settings or backend/.env to connect to live model intelligence.'
                    : (err.message || 'Failed to complete AI generation. Please check your network or API settings.'),
                  isStreaming: false,
                  isError: true,
                  errorDetail: err.detail,
                  retryText: query
                }
              : m
          )
        );

        if (isKeyRequired) {
          setShowConfigModal(true);
        }
      }
    });
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setStreamingStatus('');
    setMessages(prev =>
      prev.map(m => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
    addToast('Generation stopped.', 'info');
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your conversation history?')) return;
    try {
      await clearChatHistory();
      setMessages([]);
      addToast('Conversation history cleared.', 'info');
    } catch (err) {
      addToast(err.message || 'Could not clear history', 'error');
    }
  };

  const handleNewChat = () => {
    if (isGenerating) handleStopGeneration();
    setMessages([]);
    setInputValue('');
    addToast('Started fresh conversation thread.', 'info');
  };

  const handleRetry = (queryToRetry) => {
    const text = queryToRetry || lastUserPrompt;
    if (text) {
      handleSend(text);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e) => {
    setInputValue(e.target.value);
    // Auto-adjust height
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  // AI Configuration Modal Handlers
  const handleOpenConfig = async () => {
    try {
      const cfg = await getAIConfig();
      setAiConfig(cfg);
      setConfigForm({
        provider: cfg.provider || 'openai',
        model: cfg.model || 'gpt-4o-mini',
        api_key: '',
        temperature: cfg.temperature ?? 0.7,
        endpoint_url: cfg.endpoint_url || ''
      });
      setTestResult(null);
    } catch (err) {
      console.error('Error loading AI config:', err);
    }
    setShowConfigModal(true);
  };

  const handleProviderChange = (providerId) => {
    const prov = aiConfig.available_providers?.find(p => p.id === providerId);
    setConfigForm(prev => ({
      ...prev,
      provider: providerId,
      model: prov ? prov.default_model : 'gpt-4o-mini',
      endpoint_url: providerId === 'ollama' ? 'http://127.0.0.1:11434/v1/chat/completions' : ''
    }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testAIConnection({
        provider: configForm.provider,
        api_key: configForm.api_key || undefined,
        model: configForm.model,
        endpoint_url: configForm.endpoint_url || undefined
      });
      setTestResult(res);
      if (res.success) {
        addToast(res.message || 'Connection test successful!', 'success');
      } else {
        addToast(res.message || 'Connection test failed', 'error');
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed to respond'
      });
      addToast(err.message || 'Connection test failed', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const updated = await updateAIConfig({
        provider: configForm.provider,
        api_key: configForm.api_key ? configForm.api_key.trim() : undefined,
        model: configForm.model,
        temperature: parseFloat(configForm.temperature),
        endpoint_url: configForm.endpoint_url || undefined
      });
      setAiConfig(updated);
      addToast(`AI configuration saved! Active provider: ${updated.provider?.toUpperCase()} (${updated.model})`, 'success');
      setShowConfigModal(false);
    } catch (err) {
      addToast(err.message || 'Failed to save configuration', 'error');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const selectedProviderInfo = aiConfig.available_providers?.find(p => p.id === configForm.provider) || {
    name: configForm.provider,
    models: [configForm.model],
    key_hint: 'Enter your API key'
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 125px)',
        maxHeight: '940px',
        position: 'relative',
      }}
    >
      {/* Top Header Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '0.9rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem',
          borderLeft: '4px solid var(--accent-mint)',
          background: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--accent-mint-soft)',
              border: '1px solid var(--accent-mint-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <Bot size={24} color="#2B8A62" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.1 }}>
                VitaMind AI Copilot
              </h2>
              {/* Active Model Indicator Tag */}
              <button
                onClick={handleOpenConfig}
                title="Click to change model or configure API key"
                style={{
                  background: aiConfig.is_configured
                    ? 'var(--accent-mint-soft)'
                    : '#FEF3C7',
                  border: `1px solid ${aiConfig.is_configured ? 'var(--accent-mint-light)' : '#FDE68A'}`,
                  borderRadius: '999px',
                  padding: '0.15rem 0.6rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: aiConfig.is_configured ? '#15573d' : '#92400E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: aiConfig.is_configured ? '#2B8A62' : '#D97706',
                  }}
                />
                <span>
                  {aiConfig.provider?.toUpperCase()} &bull; {aiConfig.model}
                </span>
                <ChevronDown size={11} />
              </button>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Personalized Health Coaching &bull; Evidence-Aware &bull; Live LLM
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={handleNewChat}
            className="btn-outline"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', gap: '5px' }}
            title="Start a fresh conversation thread"
          >
            <Plus size={14} /> New Chat
          </button>

          <button
            onClick={handleOpenConfig}
            className="btn-outline"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', gap: '5px' }}
            title="Configure AI Model, API Key, and Provider"
          >
            <Settings size={14} /> AI Settings
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="btn-outline"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', gap: '5px', color: '#DC2626', borderColor: '#FCA5A5' }}
              title="Delete stored chat messages"
            >
              <Trash2 size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Message Stream Container */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '0.75rem',
          position: 'relative',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--panel-border)',
        }}
      >
        {loadingHistory ? (
          <Loading text="Connecting to VitaMind health copilot..." />
        ) : messages.length === 0 ? (
          /* Welcome Screen Hero */
          <div
            style={{
              margin: 'auto',
              maxWidth: '680px',
              padding: '1.5rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Glowing Logo Badge */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'var(--accent-mint-soft)',
                border: '1px solid var(--accent-mint-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.2rem',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <Sparkles size={34} color="#2B8A62" />
            </div>

            <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
              Welcome to VitaMind AI Health Copilot
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.55, marginBottom: '1.25rem', maxWidth: '580px' }}>
              Your intelligent, 24/7 personal health companion. Powered by a real live Large Language Model,
              VitaMind integrates your health logs, activity, and goals to provide evidence-based lifestyle coaching.
            </p>

            {/* User Profile Sync Pill */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--panel-border)',
                borderRadius: '14px',
                padding: '0.65rem 1rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                color: 'var(--text-main)',
                marginBottom: '1.75rem',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <span style={{ color: '#2B8A62', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} color="#2B8A62" /> Synced Profile:
              </span>
              <span><strong>User:</strong> {user?.name || 'Logged In'}</span>
              {user?.age && <span>&bull; <strong>Age:</strong> {user.age}</span>}
              {user?.health_goal && <span>&bull; <strong>Goal:</strong> {user.health_goal}</span>}
              {healthSummary?.sleep_avg && <span>&bull; <strong>Sleep:</strong> {healthSummary.sleep_avg}h</span>}
              {activeMedsList.length > 0 && <span>&bull; <strong>Active Meds:</strong> {activeMedsList.length}</span>}
            </div>

            {/* Missing Configuration Notice if applicable */}
            {!aiConfig.is_configured && (
              <div
                style={{
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  borderRadius: '12px',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  width: '100%',
                  marginBottom: '1.75rem',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={18} color="#D97706" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '0.82rem', color: '#92400E' }}>
                    <strong>Live AI Key Needed:</strong> Connect your OpenAI, Gemini, or Groq API key to activate genuine real-time responses.
                  </div>
                </div>
                <button
                  onClick={handleOpenConfig}
                  className="btn-primary"
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.4rem 0.85rem',
                    whiteSpace: 'nowrap',
                    background: 'var(--accent-mint)',
                    color: 'var(--text-main)',
                  }}
                >
                  Configure Key
                </button>
              </div>
            )}

            {/* 5 Suggested Prompts Cards */}
            <div style={{ width: '100%', textAlign: 'left' }}>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#2B8A62',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={13} color="#2B8A62" /> Suggested Health Consultations
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {PROMPT_CARDS.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(card.prompt)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid var(--panel-border)',
                        borderRadius: '14px',
                        padding: '0.9rem 1.1rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        boxShadow: 'var(--shadow-subtle)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-mint)';
                        e.currentTarget.style.background = 'var(--accent-mint-soft)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--panel-border)';
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'var(--accent-mint-soft)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={16} color="#2B8A62" />
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {card.title}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                        {card.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Render Messages Feed */
          messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id || idx}
              message={msg}
              onRetry={handleRetry}
              onOpenConfig={handleOpenConfig}
            />
          ))
        )}

        {/* Live Status indicator when generating */}
        {isGenerating && streamingStatus && (
          <div
            style={{
              display: 'flex',
              gap: '0.85rem',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingLeft: '3rem',
            }}
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                border: '2px solid var(--accent-mint)',
                borderTopColor: 'transparent',
                animation: 'orbit-cw 0.8s linear infinite',
              }}
            />
            <span style={{ fontSize: '0.82rem', color: '#2B8A62', fontStyle: 'italic', fontWeight: 600 }}>
              {streamingStatus}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips when actively chatting */}
      {messages.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.4rem',
            marginBottom: '0.4rem',
            scrollbarWidth: 'none',
          }}
        >
          {SUGGESTED_COPILOT_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isGenerating}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--panel-border)',
                borderRadius: '999px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                color: 'var(--text-main)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-subtle)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.color = '#15573d';
                  e.currentTarget.style.borderColor = 'var(--accent-mint)';
                  e.currentTarget.style.background = 'var(--accent-mint-soft)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.color = 'var(--text-main)';
                  e.currentTarget.style.borderColor = 'var(--panel-border)';
                  e.currentTarget.style.background = '#FFFFFF';
                }
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Control Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '0.65rem 0.85rem',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0.75rem',
          border: '1px solid var(--panel-border-bright)',
          boxShadow: 'var(--shadow-card)',
          background: '#FFFFFF',
          borderRadius: '16px',
        }}
      >
        <textarea
          ref={textareaRef}
          rows="1"
          className="input-field"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            resize: 'none',
            padding: '0.45rem 0.65rem',
            fontSize: '0.94rem',
            lineHeight: 1.45,
            color: 'var(--text-main)',
            maxHeight: '160px',
            overflowY: 'auto',
          }}
          placeholder="Ask VitaMind AI (e.g. 'Help me improve my sleep', 'Suggest a balanced daily meal plan')..."
          value={inputValue}
          onChange={handleTextareaInput}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
        />

        {/* Send / Stop Generation Toggle Button */}
        {isGenerating ? (
          <button
            onClick={handleStopGeneration}
            className="btn-outline"
            style={{
              padding: '0.65rem 1.1rem',
              borderColor: '#F8B4B4',
              color: '#9B1C1C',
              background: '#FDE8E8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Stop generation"
          >
            <Square size={16} fill="#DC2626" />
            <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Stop</span>
          </button>
        ) : (
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className="btn-primary"
            style={{
              padding: '0.65rem 1.1rem',
              opacity: !inputValue.trim() ? 0.45 : 1,
              cursor: !inputValue.trim() ? 'not-allowed' : 'pointer',
            }}
            aria-label="Send message"
          >
            <Send size={17} />
          </button>
        )}
      </div>

      {/* AI Configuration Modal */}
      {showConfigModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowConfigModal(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '1.75rem',
              borderRadius: '20px',
              border: '1px solid var(--panel-border)',
              background: '#FFFFFF',
              boxShadow: '0 20px 60px rgba(24, 57, 43, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--accent-mint-soft)',
                    border: '1px solid var(--accent-mint-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sliders size={18} color="#2B8A62" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    AI Model Configuration
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Connect and manage live Large Language Model providers
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Provider Tabs */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Select LLM Provider
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {aiConfig.available_providers?.map((prov) => {
                  const isSelected = configForm.provider === prov.id;
                  return (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => handleProviderChange(prov.id)}
                      style={{
                        background: isSelected ? 'var(--accent-mint-soft)' : 'var(--bg-secondary)',
                        border: `1px solid ${isSelected ? 'var(--accent-mint)' : 'var(--panel-border)'}`,
                        borderRadius: '10px',
                        padding: '0.6rem 0.4rem',
                        color: isSelected ? '#15573d' : 'var(--text-muted)',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {prov.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Model Selection Dropdown */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Model
              </label>
              <select
                className="input-field"
                value={configForm.model}
                onChange={(e) => setConfigForm({ ...configForm, model: e.target.value })}
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  border: '1px solid var(--panel-border)',
                  color: 'var(--text-main)',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                }}
              >
                {selectedProviderInfo.models?.map((m) => (
                  <option key={m} value={m}>
                    {m} {m === selectedProviderInfo.default_model ? '(Recommended)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* API Key Input */}
            <div style={{ marginBottom: '1.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                  {selectedProviderInfo.name} API Key
                </label>
                {selectedProviderInfo.doc_url && (
                  <a
                    href={selectedProviderInfo.doc_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.72rem', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    Get API key <ExternalLink size={10} />
                  </a>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showKeyText ? 'text' : 'password'}
                  className="input-field"
                  placeholder={aiConfig.masked_api_key ? `Current: ${aiConfig.masked_api_key}` : selectedProviderInfo.key_hint}
                  value={configForm.api_key}
                  onChange={(e) => setConfigForm({ ...configForm, api_key: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid var(--panel-border)',
                    color: 'var(--text-main)',
                    padding: '0.6rem 2.5rem 0.6rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowKeyText(!showKeyText)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  {showKeyText ? 'Hide' : 'Show'}
                </button>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Stored securely on the backend server. Never exposed to browser queries.
              </div>
            </div>

            {/* Temperature Slider */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                  Sampling Temperature
                </label>
                <span style={{ fontSize: '0.8rem', color: '#2B8A62', fontWeight: 700 }}>
                  {configForm.temperature}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={configForm.temperature}
                onChange={(e) => setConfigForm({ ...configForm, temperature: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#57C99A' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>0.0 (Clinical precision)</span>
                <span>0.7 (Balanced coaching)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

            {/* Test Connection Result Box if present */}
            {testResult && (
              <div
                style={{
                  background: testResult.success ? 'var(--accent-mint-soft)' : 'var(--accent-red-soft)',
                  border: `1px solid ${testResult.success ? 'var(--accent-mint-light)' : 'var(--accent-red-border)'}`,
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: testResult.success ? '#15573d' : '#9B1C1C', marginBottom: '4px' }}>
                  {testResult.success ? <CheckCircle2 size={15} color="#2B8A62" /> : <AlertCircle size={15} color="#DC2626" />}
                  <span>{testResult.message}</span>
                </div>
                {testResult.latency_ms && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Response latency: {testResult.latency_ms} ms &bull; Model: {testResult.model_name}
                  </div>
                )}
                {testResult.sample_reply && (
                  <div style={{ color: 'var(--text-main)', marginTop: '4px', fontStyle: 'italic', fontSize: '0.78rem' }}>
                    "{testResult.sample_reply}"
                  </div>
                )}
              </div>
            )}

            {/* Modal Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="btn-outline"
                style={{ fontSize: '0.84rem', padding: '0.55rem 1rem', gap: '6px' }}
              >
                {isTesting ? (
                  <>
                    <RefreshCw size={14} className="spin" /> Testing...
                  </>
                ) : (
                  <>
                    <Zap size={14} color="#2B8A62" /> Test Connection
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
                className="btn-primary"
                style={{ fontSize: '0.84rem', padding: '0.55rem 1.25rem' }}
              >
                {isSavingConfig ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
