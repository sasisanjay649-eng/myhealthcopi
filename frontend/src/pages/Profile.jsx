import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import Loading from '../components/Loading';
import {
  User,
  Shield,
  Save,
  Lock,
  Heart,
  LogOut,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Profile() {
  const { user, refreshProfile, logout, addToast } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Prefer not to say',
    height: '',
    height_unit: 'cm',
    weight: '',
    weight_unit: 'kg',
    contact_number: '',
    health_issue: 'General Wellness',
    health_goal: '',
    activity_level: 'Moderately Active',
    allergies: '',
    current_medications: '',
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setFormData({
          name: data.name || '',
          age: data.age || '',
          gender: data.gender || 'Prefer not to say',
          height: data.height ?? '',
          height_unit: data.height_unit || 'cm',
          weight: data.weight ?? '',
          weight_unit: data.weight_unit || 'kg',
          contact_number: data.contact_number || '',
          health_issue: data.health_issue || 'General Wellness',
          health_goal: data.health_goal || '',
          activity_level: data.activity_level || 'Moderately Active',
          allergies: data.allergies || '',
          current_medications: data.current_medications || '',
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age, 10) : null,
        gender: formData.gender,
        height: formData.height ? parseFloat(formData.height) : null,
        height_unit: formData.height_unit || 'cm',
        weight: formData.weight ? parseFloat(formData.weight) : null,
        weight_unit: formData.weight_unit || 'kg',
        contact_number: formData.contact_number?.trim() || null,
        health_issue: formData.health_issue?.trim() || 'General Wellness',
        health_goal: formData.health_goal.trim() || null,
        activity_level: formData.activity_level,
        allergies: formData.allergies.trim() || null,
        current_medications: formData.current_medications.trim() || null,
      };

      await updateProfile(payload);
      await refreshProfile();
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loading text="Loading user profile..." fullPage={true} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '850px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          borderLeft: '4px solid var(--accent-mint)',
          background: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--accent-mint-soft)',
              border: '1px solid var(--accent-mint-light)',
              color: '#2B8A62',
              fontWeight: 800,
              fontSize: '1.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'V'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {formData.name || 'User Profile'}
            </h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {user?.email} &bull; Member since {user?.created_at?.split('T')[0] || '2026'}
            </div>
          </div>
        </div>

        <button onClick={logout} className="btn-outline" style={{ fontSize: '0.86rem' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', background: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
            Biometrics &amp; Health Background
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                name="name"
                className="input-field"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Contact Number (Optional)
              </label>
              <input
                type="tel"
                name="contact_number"
                className="input-field"
                placeholder="+1 (555) 019-2834"
                value={formData.contact_number}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Age
              </label>
              <input
                type="number"
                name="age"
                className="input-field"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Gender
              </label>
              <select
                name="gender"
                className="input-field"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Height
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="height"
                  className="input-field"
                  placeholder="175"
                  value={formData.height}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                />
                <select
                  name="height_unit"
                  value={formData.height_unit || 'cm'}
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: '90px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)' }}
                >
                  <option value="cm">cm</option>
                  <option value="ft/in">ft/in</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Weight
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="weight"
                  className="input-field"
                  placeholder="70"
                  value={formData.weight}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                />
                <select
                  name="weight_unit"
                  value={formData.weight_unit || 'kg'}
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: '90px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)' }}
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Activity Level
              </label>
              <select
                name="activity_level"
                className="input-field"
                value={formData.activity_level}
                onChange={handleChange}
              >
                <option value="Sedentary">Sedentary</option>
                <option value="Lightly Active">Lightly Active</option>
                <option value="Moderately Active">Moderately Active</option>
                <option value="Very Active">Very Active</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', background: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
            Health Conditions &amp; AI Nutrition Personalization
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Health Issue / Condition */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--panel-border)',
                borderRadius: '12px',
                padding: '1.25rem',
              }}
            >
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Type of Health Issue or Condition
              </label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Used by the AI Copilot and Nutrition Guide to suggest foods, avoidances, and sample meal plans.
              </p>
              <input
                type="text"
                name="health_issue"
                className="input-field"
                placeholder="e.g. Diabetes, Hypertension, Acid Reflux / GERD, Thyroid..."
                value={formData.health_issue}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Primary Health &amp; Wellness Goal
              </label>
              <input
                type="text"
                name="health_goal"
                className="input-field"
                placeholder="e.g. Optimize restorative sleep and lower evening stress"
                value={formData.health_goal}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Known Allergies (Helps AI Copilot safety filter)
              </label>
              <input
                type="text"
                name="allergies"
                className="input-field"
                placeholder="e.g. Penicillin, pollen (or None)"
                value={formData.allergies}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Current Medications (Disclosed to Copilot for cross-checks)
              </label>
              <input
                type="text"
                name="current_medications"
                className="input-field"
                placeholder="e.g. Cetirizine 10mg, or None"
                value={formData.current_medications}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}
            >
              <Save size={16} /> {isSubmitting ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>
      </form>

      {/* Privacy & Encryption Guarantee Card */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          background: '#FFFFFF',
          border: '1px solid var(--panel-border)',
        }}
      >
        <Shield size={32} color="#2B8A62" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem', marginBottom: '2px' }}>
            Privacy-First Architecture
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.45 }}>
            Your biometric logs and conversation history are isolated to your user ID and secured behind
            hashed authentication. VitaMind AI never sells or shares sensitive personal health data.
          </p>
        </div>
      </div>
    </div>
  );
}
