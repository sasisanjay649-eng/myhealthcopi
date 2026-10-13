import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMedicationReminders,
  createMedicationReminder,
  updateMedicationReminder,
  deleteMedicationReminder,
  toggleMedicationReminder,
  markMedicationReminderTaken,
  seedSampleMedicationReminders
} from '../services/api';
import {
  Clock,
  Pill,
  CheckCircle2,
  Plus,
  Trash2,
  Bell,
  BellRing,
  Utensils,
  Calendar,
  Sparkles,
  X,
  Volume2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function MedicationReminders() {
  const { addToast } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alarmNotice, setAlarmNotice] = useState(null);

  const initialForm = {
    medicine_name: '',
    dosage: '1 tablet',
    reminder_time: '08:00 AM',
    meal_timing: 'After Food',
    frequency: 'Daily',
    days: 'Everyday',
    notes: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const commonTablets = [
    'Vitamin D3',
    'Omega-3 Fish Oil',
    'Metformin',
    'Magnesium Glycinate',
    'Cetirizine',
    'Multivitamin',
    'Calcium + Zinc',
    'Iron Supplement',
  ];

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await getMedicationReminders();
      setReminders(data);
    } catch (err) {
      console.error('Failed to load medication reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const takenCount = reminders.filter((r) => r.last_taken_date === todayStr).length;
  const activeCount = reminders.filter((r) => r.is_active).length;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.medicine_name.trim()) return;

    try {
      setIsSubmitting(true);
      const created = await createMedicationReminder(formData);
      setReminders((prev) => [...prev, created]);
      addToast(`Reminder set for ${formData.medicine_name} at ${formData.reminder_time}`, 'success');
      setIsModalOpen(false);
      setFormData(initialForm);
    } catch (err) {
      addToast(err.message || 'Failed to create reminder', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const updated = await toggleMedicationReminder(id);
      setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
      addToast(
        updated.is_active
          ? `Reminder enabled for ${updated.medicine_name}`
          : `Reminder paused for ${updated.medicine_name}`,
        'info'
      );
    } catch (err) {
      addToast(err.message || 'Error toggling reminder', 'error');
    }
  };

  const handleTake = async (id, medName) => {
    try {
      const updated = await markMedicationReminderTaken(id);
      setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (updated.last_taken_date === todayStr) {
        addToast(`Dose marked as taken for ${medName}! Excellent consistency.`, 'success');
      } else {
        addToast(`Dose marked as pending for ${medName}.`, 'info');
      }
    } catch (err) {
      addToast(err.message || 'Error updating taken status', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMedicationReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      addToast('Medication reminder removed.', 'info');
    } catch (err) {
      addToast(err.message || 'Failed to delete reminder', 'error');
    }
  };

  const handleSeedSample = async () => {
    try {
      await seedSampleMedicationReminders();
      await fetchReminders();
      addToast('Sample daily schedule populated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Could not seed sample reminders', 'error');
    }
  };

  const handleSimulateAlert = (med) => {
    setAlarmNotice({
      name: med.medicine_name,
      dosage: med.dosage,
      time: med.reminder_time,
      meal: med.meal_timing,
    });
    addToast(`⏰ REMINDER ALERT: Time to take your ${med.dosage} of ${med.medicine_name} (${med.meal_timing})`, 'warning', 6000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Simulation Alarm Banner if active */}
      {alarmNotice && (
        <div
          style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 4px 20px rgba(217, 119, 6, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BellRing size={24} color="#D97706" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#92400E' }}>
                Tablet Reminder Due: {alarmNotice.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#B45309' }}>
                Dosage: {alarmNotice.dosage} &bull; Instruction: {alarmNotice.meal} &bull; Scheduled for {alarmNotice.time}
              </div>
            </div>
          </div>

          <button
            onClick={() => setAlarmNotice(null)}
            className="btn-outline"
            style={{ borderColor: '#FDE68A', color: '#B45309', fontSize: '0.82rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Stats Widget */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem 1.75rem',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#E8F7EE',
              border: '1px solid #A8E6C1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={24} color="#2B8A62" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18392B' }}>
              Daily Tablet &amp; Medicine Schedule
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#718579' }}>
              Never miss a dose &bull; Clean reminders with meal timing instructions
            </div>
          </div>
        </div>

        {/* Progress & Add Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              background: '#F3FAF5',
              padding: '0.4rem 1rem',
              borderRadius: '10px',
              border: '1px solid #DFEAE2',
              fontSize: '0.84rem',
              color: '#718579',
            }}
          >
            Today's Adherence:{' '}
            <span style={{ color: '#2B8A62', fontWeight: 700 }}>
              {takenCount} of {activeCount} Taken
            </span>
          </div>

          {reminders.length === 0 ? (
            <button
              onClick={handleSeedSample}
              className="btn-outline"
              style={{ fontSize: '0.84rem', borderColor: '#FDE68A', color: '#92400E', background: '#FFFBEB' }}
            >
              <Sparkles size={14} /> Populate Sample Schedule
            </button>
          ) : null}

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
            style={{ fontSize: '0.88rem', padding: '0.65rem 1.25rem' }}
          >
            <Plus size={16} /> Add Schedule Reminder
          </button>
        </div>
      </div>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            background: '#FFFFFF',
            border: '1px solid #DFEAE2',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#E8F7EE',
              border: '1px solid #A8E6C1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={26} color="#2B8A62" />
          </div>
          <h4 style={{ fontSize: '1.2rem', color: '#18392B', fontWeight: 700 }}>
            No Medicine Reminders Set Yet
          </h4>
          <p style={{ color: '#718579', maxWidth: '460px', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Set custom tablet schedules with morning, afternoon, or evening alarms, dosage amounts, and meal timing guidelines.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              <Plus size={16} /> Set First Reminder
            </button>
            <button onClick={handleSeedSample} className="btn-secondary">
              <Sparkles size={16} color="#D97706" /> Load Sample Daily Schedule
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {reminders.map((rem) => {
            const isTaken = rem.last_taken_date === todayStr;
            return (
              <div
                key={rem.id}
                className="glass-panel"
                style={{
                  padding: '1.4rem',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: isTaken
                    ? '1px solid #57C99A'
                    : '1px solid #DFEAE2',
                  background: '#FFFFFF',
                  boxShadow: 'var(--shadow-card)',
                  opacity: rem.is_active ? 1 : 0.65,
                  position: 'relative',
                  transition: 'all 0.25s ease',
                }}
              >
                {/* Top: Time badge and Active toggle */}
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
                      fontSize: '0.82rem',
                      fontWeight: 700,
                    }}
                  >
                    <Clock size={13} color="#2B8A62" />
                    <span>{rem.reminder_time}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleSimulateAlert(rem)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#718579',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                      title="Test reminder alarm notification"
                    >
                      <Volume2 size={16} />
                    </button>

                    <button
                      onClick={() => handleToggle(rem.id)}
                      style={{
                        background: rem.is_active ? '#E8F7EE' : '#F3FAF5',
                        border: rem.is_active ? '1px solid #57C99A' : '1px solid #DFEAE2',
                        color: rem.is_active ? '#18392B' : '#718579',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {rem.is_active ? 'ACTIVE' : 'PAUSED'}
                    </button>

                    <button
                      onClick={() => handleDelete(rem.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#718579',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                      title="Delete reminder"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Medicine info */}
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#18392B', marginBottom: '2px' }}>
                    {rem.medicine_name}
                  </h4>
                  <div style={{ fontSize: '0.84rem', color: '#718579' }}>
                    Dosage: <span style={{ color: '#2B8A62', fontWeight: 600 }}>{rem.dosage}</span>
                  </div>
                </div>

                {/* Timing & frequency pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.74rem',
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      color: '#92400E',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 600,
                    }}
                  >
                    <Utensils size={12} /> {rem.meal_timing}
                  </span>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.74rem',
                      background: '#F3FAF5',
                      border: '1px solid #DFEAE2',
                      color: '#718579',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    <Calendar size={12} /> {rem.days}
                  </span>
                </div>

                {rem.notes && (
                  <p style={{ fontSize: '0.8rem', color: '#718579', fontStyle: 'italic', margin: 0 }}>
                    "{rem.notes}"
                  </p>
                )}

                {/* Mark as Taken CTA button */}
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <button
                    onClick={() => handleTake(rem.id, rem.medicine_name)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '0.65rem',
                      borderRadius: '10px',
                      fontSize: '0.86rem',
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
                    <CheckCircle2 size={16} color={isTaken ? '#2B8A62' : '#718579'} />
                    <span>{isTaken ? 'Taken Today ✓' : 'Mark as Taken'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Reminder Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(24, 57, 43, 0.4)',
            backdropFilter: 'blur(8px)',
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
              maxWidth: '540px',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              border: '1px solid #DFEAE2',
              boxShadow: '0 20px 50px rgba(24, 57, 43, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="#2B8A62" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#18392B' }}>
                  Set Medicine Schedule Reminder
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#718579', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Medicine Name with quick suggestions */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#18392B', marginBottom: '0.35rem' }}>
                  Medicine / Tablet Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Vitamin D3, Metformin, Omega-3..."
                  value={formData.medicine_name}
                  onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
                />

                {/* Quick suggestions */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {commonTablets.slice(0, 5).map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => setFormData({ ...formData, medicine_name: pill })}
                      style={{
                        background: '#F3FAF5',
                        border: '1px solid #DFEAE2',
                        borderRadius: '999px',
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        color: '#18392B',
                        cursor: 'pointer',
                      }}
                    >
                      + {pill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dosage */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#18392B', marginBottom: '0.35rem' }}>
                  Dosage Amount
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 1 Tablet, 500mg, 1 Capsule, 2 Drops"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                />
              </div>

              {/* Time & Meal Timing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#18392B', marginBottom: '0.35rem' }}>
                    Scheduled Time
                  </label>
                  <select
                    className="input-field"
                    value={formData.reminder_time}
                    onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="07:00 AM">07:00 AM (Early Morning)</option>
                    <option value="08:00 AM">08:00 AM (Breakfast)</option>
                    <option value="09:00 AM">09:00 AM (Mid Morning)</option>
                    <option value="01:00 PM">01:00 PM (Lunch)</option>
                    <option value="04:00 PM">04:00 PM (Afternoon)</option>
                    <option value="07:00 PM">07:00 PM (Dinner)</option>
                    <option value="09:00 PM">09:00 PM (Night)</option>
                    <option value="10:00 PM">10:00 PM (Bedtime)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#18392B', marginBottom: '0.35rem' }}>
                    Meal Relation
                  </label>
                  <select
                    className="input-field"
                    value={formData.meal_timing}
                    onChange={(e) => setFormData({ ...formData, meal_timing: e.target.value })}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="After Food">After Food (Post Meal)</option>
                    <option value="Before Food">Before Food (Pre Meal)</option>
                    <option value="With Food">With Food / During Meal</option>
                    <option value="Empty Stomach">Empty Stomach</option>
                    <option value="Before Bed">Before Bed</option>
                  </select>
                </div>
              </div>

              {/* Days / Schedule */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#18392B', marginBottom: '0.35rem' }}>
                  Frequency / Days
                </label>
                <select
                  className="input-field"
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Everyday">Everyday (7 Days / Week)</option>
                  <option value="Weekdays Only">Weekdays Only (Mon - Fri)</option>
                  <option value="Alternate Days">Alternate Days</option>
                  <option value="As Needed (PRN)">As Needed (When Symptomatic)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#18392B', marginBottom: '0.35rem' }}>
                  Doctor's Notes / Instructions (Optional)
                </label>
                <textarea
                  rows="2"
                  className="input-field"
                  placeholder="e.g. Take with a large glass of water. Do not skip."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
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
                >
                  {isSubmitting ? 'Saving...' : 'Set Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
