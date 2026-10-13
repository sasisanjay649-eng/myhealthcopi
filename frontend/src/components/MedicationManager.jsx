import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getUserMedications,
  addUserMedication,
  updateUserMedication,
  deleteUserMedication,
  toggleUserMedicationTaken,
  searchMedication
} from '../services/api';
import {
  Pill,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Check,
  X,
  RotateCcw,
  CalendarDays,
  FileText,
  Info,
  Layers,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  Coffee,
  HelpCircle
} from 'lucide-react';

export default function MedicationManager({ onOpenDrugSafety, onSelectMedForQuestion }) {
  const { addToast, isAuthenticated } = useAuth();

  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('all'); // 'all' | 'today' | 'upcoming' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'morning' | 'afternoon' | 'evening' | 'night'

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const todayDateStr = new Date().toISOString().split('T')[0];

  const defaultForm = {
    medication_name: '',
    dosage: '1 tablet',
    frequency: 'Once daily',
    time: '08:00 AM',
    start_date: todayDateStr,
    end_date: '',
    is_ongoing: true,
    notes: '',
  };

  const [formData, setFormData] = useState(defaultForm);

  // Drug Safety preview modal
  const [selectedSafetyMed, setSelectedSafetyMed] = useState(null);
  const [isSafetyLoading, setIsSafetyLoading] = useState(false);

  // Common Medication Suggestions
  const commonSuggestions = [
    { name: 'Vitamin D3', dosage: '2000 IU (1 Capsule)', freq: 'Once daily', time: '08:30 AM' },
    { name: 'Metformin', dosage: '500 mg Tablet', freq: 'Twice daily', time: '07:30 PM' },
    { name: 'Amoxicillin', dosage: '500 mg Capsule', freq: 'Three times daily', time: '09:00 AM' },
    { name: 'Omega-3 Fish Oil', dosage: '1000 mg Softgel', freq: 'Once daily', time: '01:00 PM' },
    { name: 'Cetirizine', dosage: '10 mg Tablet', freq: 'Once daily', time: '09:00 PM' },
    { name: 'Lisinopril', dosage: '10 mg Tablet', freq: 'Once daily', time: '08:00 AM' },
    { name: 'Ibuprofen', dosage: '400 mg Tablet', freq: 'As needed (PRN)', time: '01:00 PM' },
    { name: 'Omeprazole', dosage: '20 mg Capsule', freq: 'Once daily before breakfast', time: '07:30 AM' },
  ];

  // Dosage Quick Chips
  const dosageChips = ['1 tablet', '2 tablets', '500 mg', '1 capsule', '10 ml', '250 mg', '1000 IU'];

  // Frequency Options
  const frequencyOptions = [
    'Once daily',
    'Twice daily (Morning & Evening)',
    'Three times daily (Every 8 hours)',
    'Four times daily (Every 6 hours)',
    'Every 12 hours',
    'Once a week',
    'Every alternate day',
    'As needed (PRN)',
  ];

  // Time Quick Presets
  const timePresets = [
    { label: 'Morning (08:00 AM)', time: '08:00 AM', icon: <Coffee size={13} /> },
    { label: 'Noon (01:00 PM)', time: '01:00 PM', icon: <Sun size={13} /> },
    { label: 'Evening (07:30 PM)', time: '07:30 PM', icon: <Sunset size={13} /> },
    { label: 'Bedtime (10:00 PM)', time: '10:00 PM', icon: <Moon size={13} /> },
  ];

  // Initial Sample Data Generator (for empty or demo states)
  const getDemoMedications = () => {
    const today = new Date();
    const formatDate = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    return [
      {
        id: 101,
        medication_name: 'Vitamin D3 (Cholecalciferol)',
        dosage: '2000 IU (1 Capsule)',
        frequency: 'Once daily',
        time: '08:30 AM',
        start_date: formatDate(-7),
        end_date: formatDate(23),
        notes: 'Take with breakfast containing healthy fats for optimal absorption.',
        last_taken_date: todayDateStr,
        status: 'active',
      },
      {
        id: 102,
        medication_name: 'Metformin Hydrochloride',
        dosage: '500 mg Tablet',
        frequency: 'Twice daily',
        time: '07:30 PM',
        start_date: formatDate(-30),
        end_date: formatDate(60),
        notes: 'Take immediately following dinner with a glass of water.',
        last_taken_date: null,
        status: 'active',
      },
      {
        id: 103,
        medication_name: 'Omega-3 Fish Oil',
        dosage: '1000 mg Softgel',
        frequency: 'Once daily',
        time: '01:00 PM',
        start_date: formatDate(-14),
        end_date: null, // Ongoing
        notes: 'Supports cardiovascular resilience and joint lubrication.',
        last_taken_date: todayDateStr,
        status: 'active',
      },
      {
        id: 104,
        medication_name: 'Amoxicillin Trihydrate',
        dosage: '500 mg Capsule',
        frequency: 'Three times daily',
        time: '09:00 AM',
        start_date: formatDate(3),
        end_date: formatDate(10),
        notes: 'Scheduled 7-day post-dental antibiotic course. Must finish full course.',
        last_taken_date: null,
        status: 'upcoming',
      },
      {
        id: 105,
        medication_name: 'Cetirizine Hydrochloride',
        dosage: '10 mg Tablet',
        frequency: 'Once daily',
        time: '09:00 PM',
        start_date: formatDate(-21),
        end_date: formatDate(-3),
        notes: 'Seasonal pollen allergy relief course completed successfully.',
        last_taken_date: null,
        status: 'completed',
      },
    ];
  };

  // Fetch / Initialize Medications
  const fetchMedications = async () => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        try {
          const data = await getUserMedications();
          if (data && data.length > 0) {
            setMedications(data);
            return;
          }
        } catch (apiErr) {
          console.warn('API fetch returned empty or error, falling back to local storage:', apiErr);
        }
      }

      // Local storage fallback for guests or initial setups
      const stored = localStorage.getItem('vitamind_medications_v2');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMedications(parsed);
            return;
          }
        } catch (e) {
          console.error('Error parsing stored medications:', e);
        }
      }

      // Default sample setup so page is never empty
      const demoData = getDemoMedications();
      setMedications(demoData);
      localStorage.setItem('vitamind_medications_v2', JSON.stringify(demoData));
    } catch (err) {
      console.error('Failed to load medications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, [isAuthenticated]);

  // Persist locally whenever medications change
  const saveToLocalAndState = (updatedList) => {
    setMedications(updatedList);
    try {
      localStorage.setItem('vitamind_medications_v2', JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to save medications to localStorage:', e);
    }
  };

  // Reset to Sample Regimen
  const handleSeedSamples = async () => {
    const demoData = getDemoMedications();
    saveToLocalAndState(demoData);
    addToast('Sample medication schedule loaded with Today, Upcoming, and Completed courses!', 'success');
  };

  // Date Classification Logic
  // 1. Today's medications: startDate <= today AND (no endDate OR endDate >= today) AND status !== 'completed'
  // 2. Upcoming medications: startDate > today AND status !== 'completed'
  // 3. Completed medications: (endDate < today) OR status === 'completed'
  const categorizedMedications = useMemo(() => {
    const today = todayDateStr;

    const todayMeds = [];
    const upcomingMeds = [];
    const completedMeds = [];

    medications.forEach((med) => {
      const start = med.start_date || today;
      const end = med.end_date;
      const isCompletedStatus = med.status === 'completed';

      // Has course already ended by date?
      const isDateCompleted = end && end < today;

      if (isCompletedStatus || isDateCompleted) {
        completedMeds.push(med);
      } else if (start > today) {
        upcomingMeds.push(med);
      } else {
        // start <= today AND (!end OR end >= today)
        todayMeds.push(med);
      }
    });

    return {
      today: todayMeds,
      upcoming: upcomingMeds,
      completed: completedMeds,
    };
  }, [medications, todayDateStr]);

  // Time of Day Helper
  const getTimeCategory = (timeStr) => {
    if (!timeStr) return 'morning';
    const lower = timeStr.toLowerCase();
    const isPM = lower.includes('pm');
    const parts = lower.replace(/[^\d:]/g, '').split(':');
    let hour = parseInt(parts[0], 10) || 8;
    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;

    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  // Filter application
  const filterList = (list) => {
    return list.filter((med) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = med.medication_name?.toLowerCase().includes(q);
        const matchDosage = med.dosage?.toLowerCase().includes(q);
        const matchNotes = med.notes?.toLowerCase().includes(q);
        if (!matchName && !matchDosage && !matchNotes) return false;
      }

      // Time Filter
      if (timeFilter !== 'all') {
        const medTimeCat = getTimeCategory(med.time);
        if (medTimeCat !== timeFilter) return false;
      }

      return true;
    });
  };

  const filteredToday = filterList(categorizedMedications.today);
  const filteredUpcoming = filterList(categorizedMedications.upcoming);
  const filteredCompleted = filterList(categorizedMedications.completed);

  // Adherence Calculation for Today
  const todayTakenCount = categorizedMedications.today.filter(
    (m) => m.last_taken_date === todayDateStr
  ).length;
  const todayTotalCount = categorizedMedications.today.length;
  const adherencePercent =
    todayTotalCount > 0 ? Math.round((todayTakenCount / todayTotalCount) * 100) : 0;

  // Form Open Helpers
  const handleOpenAddModal = () => {
    setEditingMedId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med) => {
    setEditingMedId(med.id);
    setFormData({
      medication_name: med.medication_name,
      dosage: med.dosage || '1 tablet',
      frequency: med.frequency || 'Once daily',
      time: med.time || '08:00 AM',
      start_date: med.start_date || todayDateStr,
      end_date: med.end_date || '',
      is_ongoing: !med.end_date,
      notes: med.notes || '',
    });
    setIsModalOpen(true);
  };

  // Form Submit (Add or Edit)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.medication_name.trim()) {
      addToast('Please enter a medication name.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        medication_name: formData.medication_name.trim(),
        dosage: formData.dosage.trim() || '1 tablet',
        frequency: formData.frequency.trim() || 'Once daily',
        time: formData.time.trim() || '08:00 AM',
        start_date: formData.start_date || todayDateStr,
        end_date: formData.is_ongoing ? null : (formData.end_date || null),
        notes: formData.notes.trim() || null,
        status: 'active',
      };

      if (editingMedId) {
        // Edit existing
        if (isAuthenticated) {
          try {
            await updateUserMedication(editingMedId, payload);
          } catch (err) {
            console.warn('API edit fallback to local:', err);
          }
        }
        const updatedList = medications.map((m) =>
          m.id === editingMedId ? { ...m, ...payload } : m
        );
        saveToLocalAndState(updatedList);
        addToast(`Updated details for ${payload.medication_name}.`, 'success');
      } else {
        // Create new
        let newRecord = {
          id: Date.now(),
          ...payload,
          last_taken_date: null,
          created_at: new Date().toISOString(),
        };

        if (isAuthenticated) {
          try {
            const apiRes = await addUserMedication(payload);
            if (apiRes && apiRes.id) {
              newRecord = apiRes;
            }
          } catch (err) {
            console.warn('API add fallback to local:', err);
          }
        }

        saveToLocalAndState([newRecord, ...medications]);
        addToast(`Added ${payload.medication_name} to medication schedule.`, 'success');
      }

      setIsModalOpen(false);
      setFormData(defaultForm);
      setEditingMedId(null);
    } catch (err) {
      addToast(err.message || 'Error saving medication', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Taken Today
  const handleToggleTaken = async (med) => {
    const isCurrentlyTaken = med.last_taken_date === todayDateStr;
    const newTakenDate = isCurrentlyTaken ? null : todayDateStr;

    if (isAuthenticated) {
      try {
        await toggleUserMedicationTaken(med.id);
      } catch (err) {
        console.warn('API toggle fallback:', err);
      }
    }

    const updatedList = medications.map((m) =>
      m.id === med.id ? { ...m, last_taken_date: newTakenDate } : m
    );
    saveToLocalAndState(updatedList);

    if (!isCurrentlyTaken) {
      addToast(`Dose recorded as taken for ${med.medication_name} ✓`, 'success');
    } else {
      addToast(`Marked ${med.medication_name} as pending for today.`, 'info');
    }
  };

  // Delete Medication
  const handleDeleteMedication = async (med) => {
    if (!window.confirm(`Are you sure you want to remove ${med.medication_name} from your medications?`)) {
      return;
    }

    if (isAuthenticated) {
      try {
        await deleteUserMedication(med.id);
      } catch (err) {
        console.warn('API delete fallback:', err);
      }
    }

    const updatedList = medications.filter((m) => m.id !== med.id);
    saveToLocalAndState(updatedList);
    addToast(`Removed ${med.medication_name} from your schedule.`, 'info');
  };

  // Start Upcoming Medication Today
  const handleStartToday = async (med) => {
    const updatedPayload = {
      ...med,
      start_date: todayDateStr,
      status: 'active',
    };

    if (isAuthenticated) {
      try {
        await updateUserMedication(med.id, { start_date: todayDateStr, status: 'active' });
      } catch (err) {
        console.warn('API update fallback:', err);
      }
    }

    const updatedList = medications.map((m) =>
      m.id === med.id ? updatedPayload : m
    );
    saveToLocalAndState(updatedList);
    addToast(`Treatment course for ${med.medication_name} started today!`, 'success');
  };

  // Restart / Refill Completed Medication
  const handleRestartCourse = (med) => {
    setEditingMedId(null);
    setFormData({
      medication_name: med.medication_name,
      dosage: med.dosage || '1 tablet',
      frequency: med.frequency || 'Once daily',
      time: med.time || '08:00 AM',
      start_date: todayDateStr,
      end_date: '',
      is_ongoing: true,
      notes: med.notes ? `${med.notes} (Refilled course)` : 'Refilled course',
    });
    setIsModalOpen(true);
    addToast(`Setting up new treatment course for ${med.medication_name}`, 'info');
  };

  // Mark Active Medication as Completed
  const handleMarkAsCompleted = async (med) => {
    const updatedPayload = {
      ...med,
      end_date: todayDateStr,
      status: 'completed',
    };

    if (isAuthenticated) {
      try {
        await updateUserMedication(med.id, { end_date: todayDateStr, status: 'completed' });
      } catch (err) {
        console.warn('API status fallback:', err);
      }
    }

    const updatedList = medications.map((m) =>
      m.id === med.id ? updatedPayload : m
    );
    saveToLocalAndState(updatedList);
    addToast(`Course for ${med.medication_name} marked as completed.`, 'success');
  };

  // Check Drug Safety Info (Queries database)
  const handleCheckDrugSafety = async (medName) => {
    try {
      setIsSafetyLoading(true);
      const results = await searchMedication(medName);
      if (results && results.length > 0) {
        setSelectedSafetyMed(results[0]);
      } else {
        setSelectedSafetyMed({
          name: medName,
          generic_name: 'Pharmaceutical Compound',
          class_name: 'Therapeutic Agent',
          general_uses: `Commonly used under physician direction for therapeutic condition management. Consult your doctor for specifics regarding ${medName}.`,
          common_side_effects: 'Side effects may include mild gastrointestinal upset, headache, or fatigue depending on individual tolerance.',
          precautions: 'Take strictly according to prescribed dosage guidelines. Do not alter dose without consulting your physician.',
          interaction_warnings: 'Review concurrent medications, supplements, and foods with your pharmacist to prevent adverse interactions.',
          trusted_sources: 'FDA Drug Safety Portal, MedlinePlus Health Reference',
        });
      }
    } catch (err) {
      addToast('Could not load pharmacological monograph', 'error');
    } finally {
      setIsSafetyLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Header Card */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 2.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F3FAF5 100%)',
          border: '1px solid #DFEAE2',
          borderLeft: '5px solid #57C99A',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#2B8A62',
                background: '#E8F7EE',
                border: '1px solid #A8E6C1',
                padding: '2px 10px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Rx &amp; Supplement Tracker
            </span>
            <span style={{ fontSize: '0.8rem', color: '#718579' }}>
              &bull; VitaMind Adherence System
            </span>
          </div>

          <h1
            style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              color: '#18392B',
              marginBottom: '0.4rem',
              letterSpacing: '-0.02em',
            }}
          >
            Medication Management
          </h1>

          <p style={{ color: '#718579', fontSize: '0.94rem', maxWidth: '640px', lineHeight: 1.5 }}>
            Manage today's doses, scheduled future treatments, and completed courses with accurate dosage,
            timings, and adherence tracking.
          </p>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={handleOpenAddModal}
            className="btn-primary"
            style={{
              fontSize: '0.92rem',
              padding: '0.75rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Plus size={18} />
            <span>Add Medication</span>
          </button>

          {medications.length === 0 && (
            <button
              onClick={handleSeedSamples}
              className="btn-secondary"
              style={{ fontSize: '0.88rem', padding: '0.75rem 1.2rem', gap: '8px' }}
            >
              <Sparkles size={16} color="#D97706" />
              <span>Load Sample Plan</span>
            </button>
          )}

          {onOpenDrugSafety && (
            <button
              onClick={onOpenDrugSafety}
              className="btn-outline"
              style={{ fontSize: '0.88rem', padding: '0.75rem 1.2rem', gap: '8px' }}
            >
              <ShieldCheck size={16} color="#2B8A62" />
              <span>Drug Safety Library</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI & Adherence Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Card 1: Today's Medications */}
        <div
          className="glass-panel"
          style={{
            padding: '1.4rem',
            border: '1px solid #DFEAE2',
            background: '#FFFFFF',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2B8A62', textTransform: 'uppercase' }}>
              Today's Schedule
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#E8F7EE',
                border: '1px solid #A8E6C1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={16} color="#2B8A62" />
            </div>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#18392B', lineHeight: 1.1, marginBottom: '6px' }}>
            {todayTakenCount}{' '}
            <span style={{ fontSize: '1.15rem', color: '#718579', fontWeight: 500 }}>
              / {todayTotalCount} Taken
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#718579', marginBottom: '0.85rem' }}>
            {todayTotalCount === 0
              ? 'No doses scheduled for today'
              : todayTakenCount === todayTotalCount
              ? '🎉 100% complete for today! Excellent!'
              : `${todayTotalCount - todayTakenCount} dose(s) remaining today`}
          </div>

          {/* Adherence Mini Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '999px',
              background: '#DFEAE2',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${adherencePercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #57C99A 0%, #38AD7D 100%)',
                borderRadius: '999px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Card 2: Upcoming Medications */}
        <div
          className="glass-panel"
          style={{
            padding: '1.4rem',
            border: '1px solid #DFEAE2',
            background: '#FFFFFF',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2B8A62', textTransform: 'uppercase' }}>
              Upcoming Courses
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#E8F7EE',
                border: '1px solid #A8E6C1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarDays size={16} color="#2B8A62" />
            </div>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#18392B', lineHeight: 1.1, marginBottom: '6px' }}>
            {categorizedMedications.upcoming.length}
          </div>

          <div style={{ fontSize: '0.82rem', color: '#718579' }}>
            {categorizedMedications.upcoming.length > 0
              ? `Next starting ${categorizedMedications.upcoming[0]?.start_date}`
              : 'No future regimens queued'}
          </div>
        </div>

        {/* Card 3: Completed Medications */}
        <div
          className="glass-panel"
          style={{
            padding: '1.4rem',
            border: '1px solid #DFEAE2',
            background: '#FFFFFF',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2B8A62', textTransform: 'uppercase' }}>
              Completed Regimens
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#E8F7EE',
                border: '1px solid #A8E6C1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={16} color="#2B8A62" />
            </div>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#18392B', lineHeight: 1.1, marginBottom: '6px' }}>
            {categorizedMedications.completed.length}
          </div>

          <div style={{ fontSize: '0.82rem', color: '#718579' }}>
            Finished courses logged in health history
          </div>
        </div>

        {/* Card 4: Quick Action / Adherence Streak */}
        <div
          className="glass-panel"
          style={{
            padding: '1.4rem',
            border: '1px solid #DFEAE2',
            background: '#FFFFFF',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2B8A62', textTransform: 'uppercase' }}>
              Total Catalog
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#E8F7EE',
                border: '1px solid #A8E6C1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Pill size={16} color="#2B8A62" />
            </div>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#18392B', lineHeight: 1.1, marginBottom: '6px' }}>
            {medications.length}
          </div>

          <div style={{ fontSize: '0.82rem', color: '#718579' }}>
            Medications &amp; supplements tracked
          </div>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
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
        {/* Navigation Segments */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveView('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeView === 'all' ? '1px solid #57C99A' : '1px solid #DFEAE2',
              background: activeView === 'all' ? '#E8F7EE' : '#FFFFFF',
              color: activeView === 'all' ? '#18392B' : '#718579',
              transition: 'all 0.2s',
            }}
          >
            <Layers size={15} color={activeView === 'all' ? '#2B8A62' : '#718579'} />
            <span>All Categories ({medications.length})</span>
          </button>

          <button
            onClick={() => setActiveView('today')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeView === 'today' ? '1px solid #57C99A' : '1px solid #DFEAE2',
              background: activeView === 'today' ? '#E8F7EE' : '#FFFFFF',
              color: activeView === 'today' ? '#18392B' : '#718579',
              transition: 'all 0.2s',
            }}
          >
            <Clock size={15} color={activeView === 'today' ? '#2B8A62' : '#718579'} />
            <span>Today's Medications ({categorizedMedications.today.length})</span>
          </button>

          <button
            onClick={() => setActiveView('upcoming')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeView === 'upcoming' ? '1px solid #57C99A' : '1px solid #DFEAE2',
              background: activeView === 'upcoming' ? '#E8F7EE' : '#FFFFFF',
              color: activeView === 'upcoming' ? '#18392B' : '#718579',
              transition: 'all 0.2s',
            }}
          >
            <CalendarDays size={15} color={activeView === 'upcoming' ? '#2B8A62' : '#718579'} />
            <span>Upcoming Medications ({categorizedMedications.upcoming.length})</span>
          </button>

          <button
            onClick={() => setActiveView('completed')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeView === 'completed' ? '1px solid #57C99A' : '1px solid #DFEAE2',
              background: activeView === 'completed' ? '#E8F7EE' : '#FFFFFF',
              color: activeView === 'completed' ? '#18392B' : '#718579',
              transition: 'all 0.2s',
            }}
          >
            <CheckCircle2 size={15} color={activeView === 'completed' ? '#2B8A62' : '#718579'} />
            <span>Completed Medications ({categorizedMedications.completed.length})</span>
          </button>
        </div>

        {/* Search & Time Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search
              size={15}
              color="#718579"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Filter by name..."
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', paddingRight: '12px', height: '38px', fontSize: '0.84rem' }}
            />
          </div>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="input-field"
            style={{ width: '135px', height: '38px', fontSize: '0.82rem', padding: '0 8px' }}
          >
            <option value="all">All Times</option>
            <option value="morning">🌅 Morning</option>
            <option value="afternoon">☀️ Afternoon</option>
            <option value="evening">🌆 Evening</option>
            <option value="night">🌙 Night</option>
          </select>
        </div>
      </div>

      {/* SECTION 1: TODAY'S MEDICATIONS */}
      {(activeView === 'all' || activeView === 'today') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                <Clock size={20} color="#2B8A62" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#18392B' }}>
                  Today's Medications
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#718579' }}>
                  Scheduled for active intake today &bull; Check off doses as you take them
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#2B8A62',
                background: '#E8F7EE',
                padding: '4px 12px',
                borderRadius: '999px',
                border: '1px solid #A8E6C1',
              }}
            >
              {todayTakenCount} of {filteredToday.length} Completed Today
            </span>
          </div>

          {filteredToday.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#FFFFFF',
                border: '1px solid #DFEAE2',
              }}
            >
              <Pill size={36} color="#718579" />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18392B' }}>
                No active medications for today
              </div>
              <p style={{ color: '#718579', fontSize: '0.86rem', maxWidth: '420px', lineHeight: 1.5 }}>
                You have no scheduled medications active for today. Add a new prescription or supplement to begin tracking.
              </p>
              <button onClick={handleOpenAddModal} className="btn-primary" style={{ marginTop: '0.5rem', fontSize: '0.86rem' }}>
                <Plus size={16} /> Add Medication for Today
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filteredToday.map((med) => {
                const isTaken = med.last_taken_date === todayDateStr;
                return (
                  <div
                    key={med.id}
                    className="glass-panel"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      borderRadius: '16px',
                      border: isTaken
                        ? '1px solid #57C99A'
                        : '1px solid #DFEAE2',
                      background: '#FFFFFF',
                      boxShadow: 'var(--shadow-card)',
                      transition: 'all 0.25s ease',
                      position: 'relative',
                    }}
                  >
                    {/* Header Row: Time Badge & Status Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#E8F7EE',
                          border: '1px solid #A8E6C1',
                          color: '#2B8A62',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}
                      >
                        <Clock size={13} color="#2B8A62" />
                        <span>{med.time || '08:00 AM'}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isTaken ? '#E8F7EE' : '#FFFBEB',
                            color: isTaken ? '#2B8A62' : '#92400E',
                            border: isTaken ? '1px solid #A8E6C1' : '1px solid #FDE68A',
                          }}
                        >
                          {isTaken ? 'TAKEN TODAY ✓' : 'DUE TODAY'}
                        </span>

                        {/* Action buttons */}
                        <button
                          onClick={() => handleOpenEditModal(med)}
                          style={{ background: 'transparent', border: 'none', color: '#718579', cursor: 'pointer', padding: '3px' }}
                          title="Edit Medication"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          onClick={() => handleDeleteMedication(med)}
                          style={{ background: 'transparent', border: 'none', color: '#718579', cursor: 'pointer', padding: '3px' }}
                          title="Delete Medication"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Medication Core Info */}
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18392B', marginBottom: '3px' }}>
                        {med.medication_name}
                      </h3>
                      <div style={{ fontSize: '0.86rem', color: '#718579', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span>
                          Dosage: <strong style={{ color: '#2B8A62' }}>{med.dosage}</strong>
                        </span>
                        <span>&bull;</span>
                        <span>
                          Frequency: <strong style={{ color: '#18392B' }}>{med.frequency}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Course Date Info */}
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: '#718579',
                        background: '#F3FAF5',
                        border: '1px solid #DFEAE2',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>
                        📅 Started: {med.start_date || 'Ongoing'}
                      </span>
                      <span>
                        {med.end_date ? `Ends: ${med.end_date}` : 'Ongoing Regimen'}
                      </span>
                    </div>

                    {/* Notes if present */}
                    {med.notes && (
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#718579',
                          background: '#F3FAF5',
                          borderLeft: '3px solid #57C99A',
                          padding: '6px 10px',
                          borderRadius: '0 8px 8px 0',
                          fontStyle: 'italic',
                        }}
                      >
                        "{med.notes}"
                      </div>
                    )}

                    {/* Bottom Buttons: Take Dose + Drug Facts */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
                      <button
                        onClick={() => handleToggleTaken(med)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '0.7rem',
                          borderRadius: '10px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: isTaken
                            ? '#E8F7EE'
                            : '#F3FAF5',
                          border: isTaken
                            ? '1px solid #57C99A'
                            : '1px solid #DFEAE2',
                          color: '#18392B',
                        }}
                      >
                        {isTaken ? <CheckCircle2 size={18} color="#2B8A62" /> : <Circle size={18} color="#718579" />}
                        <span>{isTaken ? 'Dose Taken Today ✓' : 'Mark as Taken'}</span>
                      </button>

                      <button
                        onClick={() => handleCheckDrugSafety(med.medication_name)}
                        className="btn-outline"
                        style={{ padding: '0.7rem', fontSize: '0.82rem', borderColor: '#DFEAE2', color: '#2B8A62' }}
                        title="View pharmacological monographs, interactions, and precautions"
                      >
                        <ShieldCheck size={16} color="#2B8A62" />
                      </button>

                      <button
                        onClick={() => handleMarkAsCompleted(med)}
                        className="btn-outline"
                        style={{ padding: '0.7rem', fontSize: '0.82rem', borderColor: '#DFEAE2', color: '#718579' }}
                        title="Mark course as finished"
                      >
                        Finish Course
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: UPCOMING MEDICATIONS */}
      {(activeView === 'all' || activeView === 'upcoming') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: activeView === 'all' ? '1rem' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                <CalendarDays size={20} color="#2B8A62" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#18392B' }}>
                  Upcoming Medications
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#718579' }}>
                  Scheduled treatment courses with start dates in the future
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#2B8A62',
                background: '#E8F7EE',
                padding: '4px 12px',
                borderRadius: '999px',
                border: '1px solid #A8E6C1',
              }}
            >
              {filteredUpcoming.length} Upcoming Course(s)
            </span>
          </div>

          {filteredUpcoming.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#FFFFFF',
                border: '1px solid #DFEAE2',
              }}
            >
              <Calendar size={36} color="#718579" />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18392B' }}>
                No upcoming medications scheduled
              </div>
              <p style={{ color: '#718579', fontSize: '0.86rem', maxWidth: '420px', lineHeight: 1.5 }}>
                You have no pending courses scheduled for future dates. Schedule post-treatment regimens or future prescriptions ahead of time.
              </p>
              <button onClick={handleOpenAddModal} className="btn-secondary" style={{ marginTop: '0.5rem', fontSize: '0.86rem' }}>
                <Plus size={16} /> Schedule Future Medication
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filteredUpcoming.map((med) => {
                return (
                  <div
                    key={med.id}
                    className="glass-panel"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      borderRadius: '16px',
                      border: '1px solid #DFEAE2',
                      background: '#FFFFFF',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    {/* Header: Scheduled badge & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '999px',
                          background: '#E8F7EE',
                          color: '#2B8A62',
                          border: '1px solid #A8E6C1',
                        }}
                      >
                        STARTS ON {med.start_date}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEditModal(med)}
                          style={{ background: 'transparent', border: 'none', color: '#718579', cursor: 'pointer', padding: '3px' }}
                          title="Edit Medication"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteMedication(med)}
                          style={{ background: 'transparent', border: 'none', color: '#718579', cursor: 'pointer', padding: '3px' }}
                          title="Delete Medication"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Core details */}
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18392B', marginBottom: '3px' }}>
                        {med.medication_name}
                      </h3>
                      <div style={{ fontSize: '0.86rem', color: '#718579', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span>Dosage: <strong style={{ color: '#2B8A62' }}>{med.dosage}</strong></span>
                        <span>&bull;</span>
                        <span>Frequency: <strong style={{ color: '#18392B' }}>{med.frequency}</strong></span>
                        <span>&bull;</span>
                        <span>Time: <strong style={{ color: '#18392B' }}>{med.time}</strong></span>
                      </div>
                    </div>

                    {/* Schedule range */}
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: '#718579',
                        background: '#F3FAF5',
                        border: '1px solid #DFEAE2',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Scheduled Start: {med.start_date}</span>
                      <span>{med.end_date ? `Ends: ${med.end_date}` : 'Ongoing'}</span>
                    </div>

                    {med.notes && (
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#718579',
                          background: '#F3FAF5',
                          borderLeft: '3px solid #57C99A',
                          padding: '6px 10px',
                          borderRadius: '0 8px 8px 0',
                          fontStyle: 'italic',
                        }}
                      >
                        "{med.notes}"
                      </div>
                    )}

                    {/* Quick action: Start Early Today */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
                      <button
                        onClick={() => handleStartToday(med)}
                        className="btn-primary"
                        style={{
                          flex: 1,
                          fontSize: '0.86rem',
                          padding: '0.65rem',
                          fontWeight: 700,
                        }}
                      >
                        <span>Start Today</span>
                        <ChevronRight size={16} />
                      </button>

                      <button
                        onClick={() => handleCheckDrugSafety(med.medication_name)}
                        className="btn-outline"
                        style={{ padding: '0.65rem 0.85rem', fontSize: '0.82rem', borderColor: '#DFEAE2', color: '#2B8A62' }}
                        title="Drug safety info"
                      >
                        <ShieldCheck size={16} color="#2B8A62" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: COMPLETED MEDICATIONS */}
      {(activeView === 'all' || activeView === 'completed') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: activeView === 'all' ? '1rem' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                <CheckCircle2 size={20} color="#2B8A62" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#18392B' }}>
                  Completed Medications
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#718579' }}>
                  Archived prescription history &bull; Finished antibiotic or therapy courses
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#2B8A62',
                background: '#E8F7EE',
                padding: '4px 12px',
                borderRadius: '999px',
                border: '1px solid #A8E6C1',
              }}
            >
              {filteredCompleted.length} Completed Course(s)
            </span>
          </div>

          {filteredCompleted.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#FFFFFF',
                border: '1px solid #DFEAE2',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <CheckCircle2 size={36} color="#718579" />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18392B' }}>
                No completed medications in history
              </div>
              <p style={{ color: '#718579', fontSize: '0.86rem', maxWidth: '420px' }}>
                When scheduled courses finish or you manually mark an active medication complete, it will be cataloged here for long-term clinical reference.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filteredCompleted.map((med) => {
                return (
                  <div
                    key={med.id}
                    className="glass-panel"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      borderRadius: '16px',
                      border: '1px solid #DFEAE2',
                      background: '#FFFFFF',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#E8F7EE',
                          color: '#2B8A62',
                          border: '1px solid #A8E6C1',
                        }}
                      >
                        FINISHED COURSE ✓
                      </span>

                      <button
                        onClick={() => handleDeleteMedication(med)}
                        style={{ background: 'transparent', border: 'none', color: '#718579', cursor: 'pointer', padding: '3px' }}
                        title="Delete from archive"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Core details */}
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18392B', marginBottom: '3px' }}>
                        {med.medication_name}
                      </h3>
                      <div style={{ fontSize: '0.86rem', color: '#718579', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span>Dosage: <strong style={{ color: '#2B8A62' }}>{med.dosage}</strong></span>
                        <span>&bull;</span>
                        <span>Frequency: <span>{med.frequency}</span></span>
                      </div>
                    </div>

                    {/* Completed range */}
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: '#718579',
                        background: '#F3FAF5',
                        border: '1px solid #DFEAE2',
                        padding: '6px 10px',
                        borderRadius: '8px',
                      }}
                    >
                      Duration: {med.start_date || 'Start'} to {med.end_date || 'Completed'}
                    </div>

                    {med.notes && (
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#718579',
                          fontStyle: 'italic',
                        }}
                      >
                        "{med.notes}"
                      </div>
                    )}

                    {/* Restart / Refill CTA */}
                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <button
                        onClick={() => handleRestartCourse(med)}
                        className="btn-outline"
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: '0.86rem',
                          borderColor: '#57C99A',
                          color: '#18392B',
                          background: '#F3FAF5',
                        }}
                      >
                        <RotateCcw size={15} />
                        <span>Refill / Restart Course</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT MEDICATION MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(24, 57, 43, 0.45)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '580px',
              padding: '2rem',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              border: '1px solid #DFEAE2',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(24, 57, 43, 0.18)',
            }}
          >
            {/* Modal Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
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
                  <Pill size={20} color="#2B8A62" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#18392B' }}>
                    {editingMedId ? 'Edit Medication' : 'Add Medication'}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#718579' }}>
                    Complete prescription and dosage details
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#718579', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Field 1: Medication Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#18392B', marginBottom: '0.35rem' }}>
                  Medication Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Vitamin D3, Metformin, Amoxicillin, Omega-3..."
                  value={formData.medication_name}
                  onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                />

                {/* Suggestions */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {commonSuggestions.slice(0, 6).map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          medication_name: item.name,
                          dosage: item.dosage,
                          frequency: item.freq,
                          time: item.time,
                        })
                      }
                      style={{
                        background: '#F3FAF5',
                        border: '1px solid #DFEAE2',
                        borderRadius: '999px',
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        color: '#2B8A62',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      + {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 2: Dosage */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#18392B', marginBottom: '0.35rem' }}>
                  Dosage *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. 500 mg, 1 tablet, 10 ml, 2 capsules..."
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                />

                {/* Quick Dosage Chips */}
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {dosageChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setFormData({ ...formData, dosage: chip })}
                      style={{
                        background: '#E8F7EE',
                        border: '1px solid #A8E6C1',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        color: '#2B8A62',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 3: Frequency & Time Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#18392B', marginBottom: '0.35rem' }}>
                    Frequency *
                  </label>
                  <select
                    className="input-field"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    style={{ cursor: 'pointer' }}
                  >
                    {frequencyOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#18392B', marginBottom: '0.35rem' }}>
                    Scheduled Time *
                  </label>
                  <select
                    className="input-field"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="07:00 AM">07:00 AM (Early Morning)</option>
                    <option value="08:00 AM">08:00 AM (Breakfast)</option>
                    <option value="08:30 AM">08:30 AM (Morning)</option>
                    <option value="12:00 PM">12:00 PM (Midday)</option>
                    <option value="01:00 PM">01:00 PM (Lunch)</option>
                    <option value="04:00 PM">04:00 PM (Afternoon)</option>
                    <option value="07:30 PM">07:30 PM (Dinner)</option>
                    <option value="09:00 PM">09:00 PM (Evening)</option>
                    <option value="10:00 PM">10:00 PM (Bedtime)</option>
                  </select>
                </div>
              </div>

              {/* Field 4 & 5: Start Date & End Date Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#18392B', marginBottom: '0.35rem' }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#18392B' }}>
                      End Date
                    </label>
                    <label style={{ fontSize: '0.74rem', color: '#2B8A62', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={formData.is_ongoing}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_ongoing: e.target.checked,
                            end_date: e.target.checked ? '' : formData.end_date,
                          })
                        }
                      />
                      Ongoing treatment
                    </label>
                  </div>

                  <input
                    type="date"
                    disabled={formData.is_ongoing}
                    className="input-field"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    style={{ opacity: formData.is_ongoing ? 0.4 : 1 }}
                    placeholder={formData.is_ongoing ? 'Ongoing' : ''}
                  />
                </div>
              </div>

              {/* Field 6: Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#18392B', marginBottom: '0.35rem' }}>
                  Doctor's Instructions &amp; Dietary Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  className="input-field"
                  placeholder="e.g. Take with a large glass of water after meals. Avoid taking with dairy or citrus juices."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ minWidth: '140px' }}
                >
                  {isSubmitting ? 'Saving...' : editingMedId ? 'Update Medication' : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRUG FACTS & SAFETY MONOGRAPH PREVIEW MODAL */}
      {selectedSafetyMed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(24, 57, 43, 0.45)',
            backdropFilter: 'blur(10px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '620px',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              border: '1px solid #DFEAE2',
              boxShadow: '0 25px 60px rgba(24, 57, 43, 0.18)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#2B8A62',
                    background: '#E8F7EE',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    border: '1px solid #A8E6C1',
                  }}
                >
                  Pharmacological Safety Factsheet
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18392B', marginTop: '4px' }}>
                  {selectedSafetyMed.name}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#718579' }}>
                  {selectedSafetyMed.generic_name} &bull; {selectedSafetyMed.class_name}
                </div>
              </div>

              <button
                onClick={() => setSelectedSafetyMed(null)}
                style={{ background: 'transparent', border: 'none', color: '#718579', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
              <div style={{ background: '#F3FAF5', border: '1px solid #DFEAE2', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontWeight: 700, color: '#2B8A62', marginBottom: '4px' }}>General Therapeutic Uses:</div>
                <div style={{ color: '#18392B', lineHeight: 1.5 }}>{selectedSafetyMed.general_uses}</div>
              </div>

              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontWeight: 700, color: '#92400E', marginBottom: '4px' }}>Common Side Effects:</div>
                <div style={{ color: '#78350F', lineHeight: 1.5 }}>{selectedSafetyMed.common_side_effects}</div>
              </div>

              <div style={{ background: '#FDF2F2', border: '1px solid #F8B4B4', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontWeight: 700, color: '#9B1C1C', marginBottom: '4px' }}>Precautions &amp; Interactions:</div>
                <div style={{ color: '#771D1D', lineHeight: 1.5 }}>
                  {selectedSafetyMed.precautions}
                  {selectedSafetyMed.interaction_warnings && (
                    <div style={{ marginTop: '6px' }}>{selectedSafetyMed.interaction_warnings}</div>
                  )}
                </div>
              </div>

              <div style={{ fontSize: '0.76rem', color: '#718579', fontStyle: 'italic' }}>
                Sources: {selectedSafetyMed.trusted_sources || 'FDA, MedlinePlus, NHS Health'}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              {onSelectMedForQuestion && (
                <button
                  onClick={() => {
                    onSelectMedForQuestion(selectedSafetyMed.name);
                    setSelectedSafetyMed(null);
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.84rem' }}
                >
                  <HelpCircle size={15} /> Ask AI Question
                </button>
              )}
              <button
                onClick={() => setSelectedSafetyMed(null)}
                className="btn-primary"
                style={{ fontSize: '0.84rem' }}
              >
                Close Factsheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="disclaimer-banner">
        <div style={{ fontWeight: 700, color: '#18392B', marginBottom: '4px' }}>
          Educational Pharmacological Disclaimer
        </div>
        VitaMind AI provides medication tracking and general wellness information for personal organizational purposes only.
        It does not prescribe medications, calculate medical dosages, or replace professional healthcare consultations.
        Always consult a licensed physician or clinical pharmacist regarding prescription instructions, changes, or contraindications.
      </div>
    </div>
  );
}
