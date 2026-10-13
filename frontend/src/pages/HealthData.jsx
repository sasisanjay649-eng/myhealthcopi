import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getHealthRecords,
  addHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  seedDemoData
} from '../services/api';
import Loading from '../components/Loading';
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Moon,
  Activity,
  Heart,
  Droplets,
  Flame,
  Brain,
  Scale,
  Sparkles,
  X,
  CheckCircle2,
  Database
} from 'lucide-react';

export default function HealthData() {
  const { addToast } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    sleep_duration: 7.5,
    steps: 7500,
    heart_rate: 72,
    water_intake: 2.4,
    exercise_duration: 30,
    stress_level: 4,
    weight: 70.0,
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHealthRecords();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load health records:', err);
      setError(err.message || 'Could not retrieve health records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleOpenAdd = () => {
    setEditingRecordId(null);
    setFormData({
      ...initialFormState,
      date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecordId(rec.id);
    setFormData({
      date: rec.date,
      sleep_duration: rec.sleep_duration,
      steps: rec.steps,
      heart_rate: rec.heart_rate,
      water_intake: rec.water_intake,
      exercise_duration: rec.exercise_duration,
      stress_level: rec.stress_level,
      weight: rec.weight,
      notes: rec.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteHealthRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      addToast('Health record deleted successfully.', 'info');
    } catch (err) {
      addToast(err.message || 'Could not delete record.', 'error');
    }
  };

  const handleSeedDemo = async () => {
    try {
      setLoading(true);
      await seedDemoData();
      addToast('Populated 14 realistic health logs into your database!', 'success');
      await fetchRecords();
    } catch (err) {
      addToast(err.message || 'Failed to seed demo data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        date: formData.date,
        sleep_duration: parseFloat(formData.sleep_duration),
        steps: parseInt(formData.steps, 10),
        heart_rate: parseInt(formData.heart_rate, 10),
        water_intake: parseFloat(formData.water_intake),
        exercise_duration: parseInt(formData.exercise_duration, 10),
        stress_level: parseInt(formData.stress_level, 10),
        weight: parseFloat(formData.weight),
        notes: formData.notes?.trim() || null,
      };

      if (editingRecordId) {
        const updated = await updateHealthRecord(editingRecordId, payload);
        setRecords((prev) => prev.map((r) => (r.id === editingRecordId ? updated : r)));
        addToast('Health record updated successfully.', 'success');
      } else {
        const created = await addHealthRecord(payload);
        setRecords((prev) => [created, ...prev.filter((r) => r.date !== created.date)]);
        addToast('New health record logged successfully.', 'success');
      }

      setIsModalOpen(false);
    } catch (err) {
      addToast(err.message || 'Failed to save health record.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loading text="Fetching stored health entries..." fullPage={true} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem 2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderLeft: '4px solid var(--accent-mint)',
          background: '#FFFFFF',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Health Records &amp; Logs
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Add, update, and manage your day-to-day biometrics and lifestyle entries
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {records.length === 0 && (
            <button
              onClick={handleSeedDemo}
              className="btn-outline"
              style={{ fontSize: '0.86rem', padding: '0.65rem 1rem', borderColor: 'var(--panel-border)', color: 'var(--text-main)' }}
            >
              <Database size={15} /> Seed 14 Demo Logs
            </button>
          )}
          <button onClick={handleOpenAdd} className="btn-primary" style={{ fontSize: '0.88rem', padding: '0.65rem 1.25rem' }}>
            <Plus size={16} /> Log Today's Metrics
          </button>
        </div>
      </div>

      {/* Records Table / List */}
      {records.length === 0 ? (
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
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'var(--accent-mint-soft)',
              border: '1px solid var(--accent-mint-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={28} color="#2B8A62" />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>No Health Records Logged Yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '460px', fontSize: '0.9rem' }}>
            Track your sleep, daily steps, hydration, and stress levels to unlock predictive wellness insights and trends.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button onClick={handleOpenAdd} className="btn-primary">
              <Plus size={16} /> Log First Entry
            </button>
            <button onClick={handleSeedDemo} className="btn-secondary">
              <Sparkles size={16} color="#2B8A62" /> Populate Demo Logs
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden', padding: '1rem', background: '#FFFFFF' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-main)', background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Sleep</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Steps</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Heart Rate</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Hydration</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Exercise</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Stress</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Weight</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr
                    key={rec.id}
                    style={{
                      borderBottom: '1px solid var(--panel-border)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-mint-soft)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.95rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {rec.date}
                    </td>
                    <td style={{ padding: '0.95rem 1rem', color: '#2563EB', fontWeight: 700 }}>
                      {rec.sleep_duration}h
                    </td>
                    <td style={{ padding: '0.95rem 1rem', color: '#2B8A62', fontWeight: 700 }}>
                      {rec.steps?.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.95rem 1rem', color: '#E11D48', fontWeight: 600 }}>
                      {rec.heart_rate} bpm
                    </td>
                    <td style={{ padding: '0.95rem 1rem', color: '#0284C7', fontWeight: 600 }}>
                      {rec.water_intake}L
                    </td>
                    <td style={{ padding: '0.95rem 1rem', color: '#D97706', fontWeight: 600 }}>
                      {rec.exercise_duration} min
                    </td>
                    <td style={{ padding: '0.95rem 1rem', color: '#7C3AED', fontWeight: 600 }}>
                      {rec.stress_level} / 10
                    </td>
                    <td style={{ padding: '0.95rem 1rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      {rec.weight} kg
                    </td>
                    <td style={{ padding: '0.95rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          style={{
                            background: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            color: '#2563EB',
                            padding: '6px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                          title="Edit Record"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          style={{
                            background: 'var(--accent-red-soft)',
                            border: '1px solid var(--accent-red-border)',
                            color: '#DC2626',
                            padding: '6px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
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
              maxWidth: '560px',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--panel-border)',
              background: '#FFFFFF',
              boxShadow: '0 20px 60px rgba(24, 57, 43, 0.15)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {editingRecordId ? 'Edit Health Entry' : 'Log New Health Entry'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Sleep Duration (hours)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    required
                    className="input-field"
                    value={formData.sleep_duration}
                    onChange={(e) => setFormData({ ...formData, sleep_duration: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Daily Steps
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    required
                    className="input-field"
                    value={formData.steps}
                    onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Resting Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    min="35"
                    max="220"
                    required
                    className="input-field"
                    value={formData.heart_rate}
                    onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Water Intake (liters)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="15"
                    required
                    className="input-field"
                    value={formData.water_intake}
                    onChange={(e) => setFormData({ ...formData, water_intake: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Exercise Duration (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    required
                    className="input-field"
                    value={formData.exercise_duration}
                    onChange={(e) => setFormData({ ...formData, exercise_duration: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Stress Level (1 - 10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    className="input-field"
                    value={formData.stress_level}
                    onChange={(e) => setFormData({ ...formData, stress_level: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Body Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="25"
                    max="350"
                    required
                    className="input-field"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Daily Notes (Optional)
                </label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="e.g. Felt well rested, completed evening yoga session"
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
                  {isSubmitting ? 'Saving...' : editingRecordId ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
