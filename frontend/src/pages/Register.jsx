import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Lock,
  Mail,
  User,
  Heart,
  ShieldCheck,
  ArrowRight,
  Phone,
  Ruler,
  Weight,
  Sparkles
} from 'lucide-react';

export default function Register() {
  // Core Account Credentials State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Demographics & Biometrics State (Requirement 4: React state for height, height unit, weight, weight unit)
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('cm'); // 'cm' or 'ft/in'
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg'); // 'kg' or 'lbs'

  // Health Profile & Lifestyle State
  const [healthGoal, setHealthGoal] = useState('Optimize restorative sleep and lower evening stress');
  const [healthIssue, setHealthIssue] = useState('General Wellness');
  const [healthIssueDetails, setHealthIssueDetails] = useState('');
  const [activityLevel, setActivityLevel] = useState('Moderately Active');
  const [allergies, setAllergies] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Dynamic Real-Time BMI Calculation for Live Feedback
  let bmiInfo = null;
  const hNum = parseFloat(height);
  const wNum = parseFloat(weight);
  if (!isNaN(hNum) && hNum > 0 && !isNaN(wNum) && wNum > 0) {
    const hMeters = heightUnit === 'cm' ? hNum / 100 : hNum * 0.3048;
    const wKg = weightUnit === 'kg' ? wNum : wNum * 0.453592;
    if (hMeters > 0.4 && wKg > 10) {
      const bmiVal = (wKg / (hMeters * hMeters)).toFixed(1);
      let category = 'Healthy / Normal Weight';
      let color = '#58e0bd';
      if (bmiVal < 18.5) {
        category = 'Underweight';
        color = '#72a7ff';
      } else if (bmiVal >= 25 && bmiVal < 30) {
        category = 'Overweight';
        color = '#fbbf24';
      } else if (bmiVal >= 30) {
        category = 'Obese (High Range)';
        color = '#f43f5e';
      }
      bmiInfo = { bmi: bmiVal, category, color };
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Validate required account credentials
    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Please complete all required account fields (Full Name, Email Address, and Password).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    // 2. Validate Height (positive numeric value when provided)
    let parsedHeight = null;
    if (height !== '') {
      const parsedH = parseFloat(height);
      if (isNaN(parsedH) || parsedH <= 0) {
        setErrorMsg('Please enter a valid positive numeric value for Height.');
        return;
      }
      if (heightUnit === 'cm' && (parsedH < 30 || parsedH > 300)) {
        setErrorMsg('Please enter a realistic height between 30 cm and 300 cm.');
        return;
      }
      if (heightUnit === 'ft/in' && (parsedH < 1 || parsedH > 10)) {
        setErrorMsg('Please enter a realistic height between 1 ft and 10 ft (e.g. 5.9).');
        return;
      }
      parsedHeight = parsedH;
    }

    // 3. Validate Weight (positive numeric value when provided)
    let parsedWeight = null;
    if (weight !== '') {
      const parsedW = parseFloat(weight);
      if (isNaN(parsedW) || parsedW <= 0) {
        setErrorMsg('Please enter a valid positive numeric value for Weight.');
        return;
      }
      if (weightUnit === 'kg' && (parsedW < 15 || parsedW > 500)) {
        setErrorMsg('Please enter a realistic weight between 15 kg and 500 kg.');
        return;
      }
      if (weightUnit === 'lbs' && (parsedW < 33 || parsedW > 1100)) {
        setErrorMsg('Please enter a realistic weight between 33 lbs and 1100 lbs.');
        return;
      }
      parsedWeight = parsedW;
    }

    // 4. Validate Age when provided
    let parsedAge = null;
    if (age !== '') {
      const parsedA = parseInt(age, 10);
      if (isNaN(parsedA) || parsedA < 1 || parsedA > 130) {
        setErrorMsg('Please enter a valid age between 1 and 130 years.');
        return;
      }
      parsedAge = parsedA;
    }

    try {
      setIsSubmitting(true);
      const combinedHealthIssue =
        healthIssue === 'Other' && healthIssueDetails
          ? healthIssueDetails.trim()
          : healthIssueDetails
          ? `${healthIssue} (${healthIssueDetails.trim()})`
          : healthIssue;

      // Registration payload including height, height_unit, weight, weight_unit
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password: password,
        age: parsedAge,
        gender: gender,
        height: parsedHeight,
        height_unit: heightUnit,
        weight: parsedWeight,
        weight_unit: weightUnit,
        contact_number: contactNumber.trim() || null,
        health_issue: combinedHealthIssue || 'General Wellness',
        health_goal: healthGoal.trim() || null,
        activity_level: activityLevel,
        allergies: allergies.trim() || null,
        current_medications: currentMedications.trim() || null,
      };

      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please review your input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '2.5rem',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--accent-mint-soft)',
              border: '1px solid var(--accent-mint-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Activity size={26} color="#2B8A62" />
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            Build your Health Profile
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Create an encrypted account to begin personalized health guidance
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'var(--accent-red-soft)',
              border: '1px solid var(--accent-red-border)',
              color: '#9B1C1C',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.86rem',
              marginBottom: '1.5rem',
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Row 1: Full Name and Email Address */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Contact Number (Optional) & Password */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Contact Number (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+1 (555) 019-2834"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Password * (Min 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="password"
                  required
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Age & Gender */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Age
              </label>
              <input
                type="number"
                min="1"
                max="130"
                className="input-field"
                placeholder="e.g. 28"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Gender
              </label>
              <select
                className="input-field"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Row 4: Height & Weight side by side */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* Height Field */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '0.4rem',
                }}
              >
                <Ruler size={16} color="#2B8A62" />
                <span>Height</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="input-field"
                  placeholder="Enter height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  style={{ flex: 1 }}
                />
                <select
                  value={heightUnit}
                  onChange={(e) => setHeightUnit(e.target.value)}
                  className="input-field"
                  style={{
                    width: '95px',
                    cursor: 'pointer',
                    padding: '0 0.5rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                  }}
                >
                  <option value="cm">cm</option>
                  <option value="ft/in">ft/in</option>
                </select>
              </div>
            </div>

            {/* Weight Field */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '0.4rem',
                }}
              >
                <Weight size={16} color="#2B8A62" />
                <span>Weight</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="input-field"
                  placeholder="Enter weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  style={{ flex: 1 }}
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="input-field"
                  style={{
                    width: '95px',
                    cursor: 'pointer',
                    padding: '0 0.5rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                  }}
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live BMI Callout badge */}
          {bmiInfo && (
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--panel-border)',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                <Sparkles size={14} color="#2B8A62" />
                <span>Estimated BMI: <strong>{bmiInfo.bmi} kg/m²</strong></span>
              </div>
              <span style={{ fontWeight: 700, color: '#1B6445', background: 'var(--accent-mint-soft)', padding: '2px 8px', borderRadius: '6px' }}>
                {bmiInfo.category}
              </span>
            </div>
          )}

          {/* Row 5: Primary Health Goal */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Primary Health Goal
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Optimize restorative sleep and lower evening stress"
              value={healthGoal}
              onChange={(e) => setHealthGoal(e.target.value)}
            />
          </div>

          {/* Row 6: Type of Health Issue */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--panel-border)',
              borderRadius: '12px',
              padding: '1.25rem',
            }}
          >
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Type of Health Issue or Condition *
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              VitaMind AI will personalize food suggestions, meal plans, and precautions for your condition.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Primary Health Category
                </label>
                <select
                  className="input-field"
                  value={healthIssue}
                  onChange={(e) => setHealthIssue(e.target.value)}
                  style={{ cursor: 'pointer', fontWeight: 600 }}
                >
                  <option value="General Wellness">General Wellness / No Specific Condition</option>
                  <option value="Diabetes">Diabetes / Blood Sugar Regulation</option>
                  <option value="Hypertension">Hypertension / High Blood Pressure</option>
                  <option value="Acid Reflux / GERD">Acid Reflux / GERD</option>
                  <option value="High Cholesterol">High Cholesterol / Dyslipidemia</option>
                  <option value="Thyroid Disorder">Thyroid Disorder (Hypo / Hyperthyroid)</option>
                  <option value="Asthma / Respiratory">Asthma / Respiratory Sensitivity</option>
                  <option value="Migraine">Migraine &amp; Chronic Headaches</option>
                  <option value="PCOS / Hormonal">PCOS / Hormonal Imbalance</option>
                  <option value="Arthritis / Joint Pain">Arthritis / Joint Inflammation</option>
                  <option value="Insomnia / Sleep">Insomnia / Sleep Disruption</option>
                  <option value="Other">Other / Specific Diagnosis</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Specific Details / Stage (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Type 2, mild, pre-hypertension..."
                  value={healthIssueDetails}
                  onChange={(e) => setHealthIssueDetails(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Row 7: Activity Level */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Activity Level
            </label>
            <select
              className="input-field"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="Sedentary">Sedentary (desk job, minimal movement)</option>
              <option value="Lightly Active">Lightly Active (daily light walking)</option>
              <option value="Moderately Active">Moderately Active (exercise 3-4 days/week)</option>
              <option value="Very Active">Very Active (intense workouts 5+ days/week)</option>
            </select>
          </div>

          {/* Row 8: Allergies & Medications */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Known Allergies
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Penicillin, pollen, peanuts (or none)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Current Medications
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Cetirizine 10mg, or None"
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.9rem', fontSize: '1rem' }}
          >
            {isSubmitting ? 'Creating Profile...' : 'Create Account & Begin Tracking'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '1.75rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2B8A62', fontWeight: 700, textDecoration: 'underline' }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
