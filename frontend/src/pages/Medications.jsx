import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  searchMedication,
  askMedicationQuestion,
  getUserMedications,
  addUserMedication
} from '../services/api';
import MedicationManager from '../components/MedicationManager';
import MedicationCard from '../components/MedicationCard';
import MedicationReminders from '../components/MedicationReminders';
import Loading from '../components/Loading';
import {
  Pill,
  Search,
  HelpCircle,
  Plus,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  MessageSquare,
  Sparkles,
  Clock,
  Calendar,
  X,
  ListTodo
} from 'lucide-react';

export default function Medications() {
  const { addToast } = useAuth();
  const [activeTab, setActiveTab] = useState('manager'); // 'manager' | 'reminders' | 'monographs'
  const [searchQuery, setSearchQuery] = useState('');
  const [medications, setMedications] = useState([]);
  const [userMedications, setUserMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Ask Question Modal State
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [selectedMedName, setSelectedMedName] = useState('Ibuprofen');
  const [questionText, setQuestionText] = useState('');
  const [questionAnswer, setQuestionAnswer] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);

  // Add to My Medications Modal State
  const [isAddUserMedOpen, setIsAddUserMedOpen] = useState(false);
  const [newUserMed, setNewUserMed] = useState({
    medication_name: '',
    dosage_note: '',
    frequency_note: '',
    notes: '',
  });

  const popularMedications = [
    'Acetaminophen',
    'Ibuprofen',
    'Amoxicillin',
    'Metformin',
    'Omeprazole',
    'Cetirizine',
    'Lisinopril',
    'Melatonin',
  ];

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [allMeds, myMeds] = await Promise.all([
        searchMedication(''),
        getUserMedications().catch(() => []),
      ]);
      setMedications(allMeds);
      setUserMedications(myMeds);
    } catch (err) {
      console.error('Error fetching medications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSearch = async (query = searchQuery) => {
    try {
      setIsSearching(true);
      const results = await searchMedication(query);
      setMedications(results);
    } catch (err) {
      addToast(err.message || 'Failed to search medications', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPopular = (med) => {
    setSearchQuery(med);
    handleSearch(med);
  };

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    try {
      setIsAnswering(true);
      setQuestionAnswer(null);
      const res = await askMedicationQuestion(selectedMedName, questionText.trim());
      setQuestionAnswer(res);
      addToast('Information compiled from official pharmacological references.', 'success');
    } catch (err) {
      addToast(err.message || 'Error processing medication question', 'error');
    } finally {
      setIsAnswering(false);
    }
  };

  const handleAddUserMedSubmit = async (e) => {
    e.preventDefault();
    if (!newUserMed.medication_name) return;

    try {
      const added = await addUserMedication(newUserMed);
      setUserMedications((prev) => [...prev, added]);
      addToast(`Added ${newUserMed.medication_name} to your tracking list.`, 'success');
      setIsAddUserMedOpen(false);
      setNewUserMed({ medication_name: '', dosage_note: '', frequency_note: '', notes: '' });
    } catch (err) {
      addToast(err.message || 'Failed to add medication', 'error');
    }
  };

  if (loading) {
    return <Loading text="Loading medication management & clinical data..." fullPage={true} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Main Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid #DFEAE2',
          paddingBottom: '0.75rem',
        }}
      >
        <button
          onClick={() => setActiveTab('manager')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.4rem',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: activeTab === 'manager' ? '1px solid #57C99A' : '1px solid #DFEAE2',
            background: activeTab === 'manager' ? '#E8F7EE' : '#FFFFFF',
            color: activeTab === 'manager' ? '#18392B' : '#718579',
            boxShadow: activeTab === 'manager' ? '0 4px 12px rgba(87, 201, 154, 0.15)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Pill size={18} color={activeTab === 'manager' ? '#2B8A62' : '#718579'} />
          <span>Medication Management</span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.4rem',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: activeTab === 'reminders' ? '1px solid #57C99A' : '1px solid #DFEAE2',
            background: activeTab === 'reminders' ? '#E8F7EE' : '#FFFFFF',
            color: activeTab === 'reminders' ? '#18392B' : '#718579',
            boxShadow: activeTab === 'reminders' ? '0 4px 12px rgba(87, 201, 154, 0.15)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Clock size={18} color={activeTab === 'reminders' ? '#2B8A62' : '#718579'} />
          <span>Schedule Alarms &amp; Meal Reminders</span>
        </button>

        <button
          onClick={() => setActiveTab('monographs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.4rem',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: activeTab === 'monographs' ? '1px solid #57C99A' : '1px solid #DFEAE2',
            background: activeTab === 'monographs' ? '#E8F7EE' : '#FFFFFF',
            color: activeTab === 'monographs' ? '#18392B' : '#718579',
            boxShadow: activeTab === 'monographs' ? '0 4px 12px rgba(87, 201, 154, 0.15)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <BookOpen size={18} color={activeTab === 'monographs' ? '#2B8A62' : '#718579'} />
          <span>Drug Safety Monographs &amp; Search</span>
        </button>
      </div>

      {/* Tab 1: Central Medication Management System */}
      {activeTab === 'manager' && (
        <MedicationManager
          onOpenDrugSafety={() => setActiveTab('monographs')}
          onSelectMedForQuestion={(medName) => {
            setSelectedMedName(medName);
            setIsAskModalOpen(true);
          }}
        />
      )}

      {/* Tab 2: Daily Reminders & Alarms */}
      {activeTab === 'reminders' && <MedicationReminders />}

      {/* Tab 3: Official Pharmacological Monographs & Personal Tracked */}
      {activeTab === 'monographs' && (
        <>
          {/* Search Bar & Quick Filter Chips */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={18}
                  color="#718579"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search by brand or generic name (e.g. Ibuprofen, Metformin, Amoxicillin)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="btn-primary"
                style={{ padding: '0.75rem 1.4rem' }}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Popular chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#718579', fontWeight: 600 }}>
                Common Inquiries:
              </span>
              {popularMedications.map((name) => (
                <button
                  key={name}
                  onClick={() => handleSelectPopular(name)}
                  style={{
                    background: searchQuery.toLowerCase() === name.toLowerCase() ? '#E8F7EE' : '#FFFFFF',
                    border: searchQuery.toLowerCase() === name.toLowerCase() ? '1px solid #57C99A' : '1px solid #DFEAE2',
                    color: searchQuery.toLowerCase() === name.toLowerCase() ? '#18392B' : '#718579',
                    borderRadius: '999px',
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

      {/* User's Personal Tracked Medications */}
      {userMedications.length > 0 && (
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderLeft: '4px solid #57C99A',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18392B', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pill size={18} color="#2B8A62" /> My Tracked Health Medications
            </h3>
            <button
              onClick={() => setIsAddUserMedOpen(true)}
              className="btn-outline"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              + Add Another
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {userMedications.map((um) => (
              <div
                key={um.id}
                style={{
                  background: '#F3FAF5',
                  border: '1px solid #DFEAE2',
                  borderRadius: '12px',
                  padding: '1rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#18392B', marginBottom: '4px' }}>
                  {um.medication_name}
                </div>
                {um.dosage_note && (
                  <div style={{ fontSize: '0.82rem', color: '#718579' }}>
                    Dosage Note: <span style={{ color: '#2B8A62', fontWeight: 600 }}>{um.dosage_note}</span>
                  </div>
                )}
                {um.frequency_note && (
                  <div style={{ fontSize: '0.82rem', color: '#718579' }}>
                    Frequency: <span style={{ color: '#18392B' }}>{um.frequency_note}</span>
                  </div>
                )}
                {um.notes && (
                  <div style={{ fontSize: '0.8rem', color: '#718579', marginTop: '6px' }}>
                    {um.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication Search Results */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18392B' }}>
            Medication Monographs ({medications.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#718579' }}>
            Verified Peer-Reviewed Clinical Data
          </span>
        </div>

        {medications.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <Pill size={40} color="#718579" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ color: '#18392B', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              No medications matched your search
            </h4>
            <p style={{ color: '#718579', fontSize: '0.88rem' }}>
              Try searching by active ingredient, generic formula, or choose from common inquiries above.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {medications.map((med) => (
              <MedicationCard key={med.id || med.name} medication={med} />
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {/* Ask Question Modal */}
      {isAskModalOpen && (
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
              maxWidth: '580px',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              border: '1px solid #DFEAE2',
              boxShadow: '0 20px 50px rgba(24, 57, 43, 0.15)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18392B' }}>
                Ask Clinical Medication Question
              </h3>
              <button
                onClick={() => setIsAskModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#718579', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#18392B', marginBottom: '0.35rem' }}>
                  Medicine Name
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Ibuprofen, Metformin..."
                  value={selectedMedName}
                  onChange={(e) => setSelectedMedName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#18392B', marginBottom: '0.35rem' }}>
                  Your Question
                </label>
                <textarea
                  required
                  rows="3"
                  className="input-field"
                  placeholder="e.g. What are the common precautions when taking this with coffee or on an empty stomach?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAskModalOpen(false)}
                  className="btn-outline"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isAnswering}
                  className="btn-primary"
                >
                  {isAnswering ? 'Consulting References...' : 'Ask AI Pharmacologist'}
                </button>
              </div>
            </form>

            {/* Answer Display */}
            {questionAnswer && (
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: '#F3FAF5',
                  border: '1px solid #DFEAE2',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2B8A62', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Educational Response
                </div>
                <div style={{ fontSize: '0.9rem', color: '#18392B', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                  {questionAnswer.response}
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.74rem', color: '#718579', fontStyle: 'italic' }}>
                  {questionAnswer.disclaimer}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add User Medication Modal */}
      {isAddUserMedOpen && (
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
              maxWidth: '500px',
              padding: '2rem',
              background: '#FFFFFF',
              border: '1px solid #DFEAE2',
              boxShadow: '0 20px 50px rgba(24, 57, 43, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18392B' }}>
                Track a Medication
              </h3>
              <button
                onClick={() => setIsAddUserMedOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#718579', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUserMedSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#18392B', marginBottom: '0.35rem' }}>
                  Medication Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Cetirizine"
                  value={newUserMed.medication_name}
                  onChange={(e) => setNewUserMed({ ...newUserMed, medication_name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#18392B', marginBottom: '0.35rem' }}>
                  Dosage Note (as prescribed by your doctor)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 10mg"
                  value={newUserMed.dosage_note}
                  onChange={(e) => setNewUserMed({ ...newUserMed, dosage_note: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#18392B', marginBottom: '0.35rem' }}>
                  Frequency
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Once daily in evening"
                  value={newUserMed.frequency_note}
                  onChange={(e) => setNewUserMed({ ...newUserMed, frequency_note: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#18392B', marginBottom: '0.35rem' }}>
                  Notes
                </label>
                <textarea
                  rows="2"
                  className="input-field"
                  placeholder="e.g. Take with water after dinner"
                  value={newUserMed.notes}
                  onChange={(e) => setNewUserMed({ ...newUserMed, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddUserMedOpen(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save to My List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Prescription Disclaimer */}
      <div className="disclaimer-banner">
        <div style={{ fontWeight: 700, color: '#18392B', marginBottom: '4px' }}>
          Educational Pharmacological Disclaimer
        </div>
        VitaMind AI provides general health and wellness information for educational purposes.
        It does not diagnose conditions, prescribe medicines, or replace professional medical advice, diagnosis, or treatment.
        Consult a qualified healthcare professional before starting, stopping, or changing any medication.
      </div>
    </div>
  );
}
