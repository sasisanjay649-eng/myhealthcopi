// Mock Fallback Service for VitaMind AI
// Activates seamlessly when backend is offline or during static GitHub Pages deployment

const MOCK_USER = {
  id: 1,
  name: 'Alex Rivera',
  email: 'demo.wellness@vitamind.ai',
  age: 28,
  gender: 'Non-binary',
  height: 176,
  weight: 69.6,
  health_goal: 'Optimize restorative sleep and lower evening stress',
  activity_level: 'Moderately Active',
  allergies: 'Seasonal pollen',
  current_medications: 'Magnesium Glycinate 200mg',
};

const MOCK_LOGS = [
  { id: 1, date: '2026-10-12', sleep_hours: 7.8, sleep_quality: 'Deep', steps: 9420, heart_rate: 64, water_liters: 2.6, stress_level: 2, weight_kg: 69.5, exercise_minutes: 45, notes: 'Morning jog + evening chamomile' },
  { id: 2, date: '2026-10-11', sleep_hours: 7.2, sleep_quality: 'Good', steps: 8100, heart_rate: 68, water_liters: 2.2, stress_level: 4, weight_kg: 69.6, exercise_minutes: 30, notes: 'Pilates core workout' },
  { id: 3, date: '2026-10-10', sleep_hours: 6.9, sleep_quality: 'Fair', steps: 7200, heart_rate: 71, water_liters: 2.0, stress_level: 5, weight_kg: 69.8, exercise_minutes: 20, notes: 'Busy project work' },
  { id: 4, date: '2026-10-09', sleep_hours: 8.1, sleep_quality: 'Deep', steps: 10450, heart_rate: 62, water_liters: 2.8, stress_level: 2, weight_kg: 69.5, exercise_minutes: 50, notes: 'Outdoor hike in sunshine' },
  { id: 5, date: '2026-10-08', sleep_hours: 7.5, sleep_quality: 'Good', steps: 8890, heart_rate: 65, water_liters: 2.4, stress_level: 3, weight_kg: 69.7, exercise_minutes: 35, notes: 'Strength training session' },
  { id: 6, date: '2026-10-07', sleep_hours: 6.8, sleep_quality: 'Fair', steps: 6700, heart_rate: 72, water_liters: 1.9, stress_level: 6, weight_kg: 69.9, exercise_minutes: 15, notes: 'Late conference call' },
  { id: 7, date: '2026-10-06', sleep_hours: 8.0, sleep_quality: 'Deep', steps: 9800, heart_rate: 63, water_liters: 2.7, stress_level: 2, weight_kg: 69.6, exercise_minutes: 40, notes: 'Restorative yoga evening' },
];

const MOCK_MEDICATIONS = [
  {
    id: 1,
    name: 'Magnesium Glycinate',
    generic_name: 'Magnesium Bisglycinate',
    category: 'Essential Mineral Supplement',
    purpose: 'Promotes muscle relaxation and improves restorative slow-wave sleep quality.',
    side_effects: 'Mild loose stools if taken in excess of upper tolerable limits.',
    contraindications: 'Severe renal impairment without physician clearance.',
    monograph_source: 'NIH Office of Dietary Supplements / NHS Monograph'
  },
  {
    id: 2,
    name: 'Vitamin D3 (Cholecalciferol)',
    generic_name: 'Cholecalciferol',
    category: 'Secosteroid Vitamin',
    purpose: 'Supports innate immune modulation, bone mineralization, and circadian rhythm health.',
    side_effects: 'Hypercalcemia only at sustained ultra-high dosages.',
    contraindications: 'Hypercalcemia or hypervitaminosis D.',
    monograph_source: 'NHS Guidelines / Endocrine Society Clinical Guidelines'
  },
  {
    id: 3,
    name: 'Melatonin',
    generic_name: 'N-acetyl-5-methoxytryptamine',
    category: 'Circadian Hormone',
    purpose: 'Assists circadian phase shifts and jet-lag adaptation.',
    side_effects: 'Next-day grogginess or vivid dreams at higher doses (>3mg).',
    contraindications: 'Autoimmune disorders without physician oversight.',
    monograph_source: 'FDA Pharmacologic Reference / American Academy of Sleep Medicine'
  }
];

export function handleMockFallback(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  // Auth endpoints
  if (endpoint.includes('/api/auth/login') || endpoint.includes('/api/auth/register') || endpoint.includes('/api/auth/google')) {
    return {
      access_token: 'demo-live-token-' + Date.now(),
      token_type: 'bearer',
      user: MOCK_USER
    };
  }

  if (endpoint.includes('/api/auth/me') || endpoint.includes('/api/users/profile')) {
    return MOCK_USER;
  }

  // Health summary & trends
  if (endpoint.includes('/api/health/summary')) {
    return {
      wellness_score: 87,
      wellness_status: 'Optimal Baseline',
      avg_sleep: 7.5,
      avg_steps: 8650,
      avg_resting_hr: 66,
      avg_water: 2.4,
      avg_stress: 3.2,
      trend_summary: 'Your sleep quality and autonomic stress recovery have stabilized notably over the past 7 days.',
      logs: MOCK_LOGS
    };
  }

  if (endpoint.includes('/api/health/trends') || endpoint === '/api/health') {
    if (method === 'POST') {
      try {
        const payload = JSON.parse(options.body || '{}');
        const newRecord = { id: Date.now(), date: new Date().toISOString().split('T')[0], ...payload };
        return newRecord;
      } catch (e) {
        return { id: Date.now(), success: true };
      }
    }
    return MOCK_LOGS;
  }

  if (endpoint.includes('/api/health/analysis')) {
    return {
      wellness_score: 87,
      sleep_consistency_score: 91,
      activity_rhythm_score: 84,
      hydration_balance_score: 88,
      stress_recovery_score: 85,
      correlations: [
        { factor: 'Sleep & Stress', observation: 'Days with >7.5 hours of sleep correspond to a 42% lower self-reported stress score.' },
        { factor: 'Hydration & Resting HR', observation: 'Days reaching 2.5L water intake showed an average resting heart rate reduction of 4 bpm.' },
        { factor: 'Steps & Sleep Latency', observation: 'Surpassing 8,000 steps correlates with faster sleep onset and higher deep sleep cycles.' }
      ],
      recommendations: [
        'Maintain a consistent wake-up time within a 30-minute window across both weekdays and weekends.',
        'Target morning natural sunlight exposure within 45 minutes of waking to anchor circadian cortisol rhythms.',
        'Keep caffeine consumption strictly before 1:00 PM to protect slow-wave restorative sleep cycles.'
      ]
    };
  }

  // Copilot Chat
  if (endpoint.includes('/api/copilot/chat')) {
    return {
      response: {
        summary: "Based on your recent 7-day health trends, your sleep duration averages 7.5 hours with positive deep sleep patterns and balanced autonomic recovery.",
        data_synthesis: "Your records show an average resting heart rate of 66 bpm and an activity baseline of 8,650 steps. Evenings following regular hydration and moderate exercise show significantly lower stress markers.",
        medical_context: "Evidence in peer-reviewed clinical sleep literature highlights that stable sleep onset times and consistent hydration are key drivers of cardiovascular recovery and metabolic resilience.",
        actionable_steps: [
          "Continue taking your Magnesium Glycinate supplement in the evening as tolerated.",
          "Aim for a gentle wind-down routine 45 minutes prior to sleep without blue-light emitting devices.",
          "Drink 500ml of water upon waking to kickstart autonomic hydration after overnight respiration."
        ],
        urgent_care_alert: null,
        when_to_seek_care: "If you ever experience sudden chest discomfort, shortness of breath, or persistent irregular palpitations, contact emergency medical services (911/112) immediately.",
        sources: [
          { title: "Sleep Foundation – Physiological Recovery Guidelines", url: "https://www.sleepfoundation.org" },
          { title: "NIH Office of Dietary Supplements – Magnesium Health Monograph", url: "https://ods.od.nih.gov" },
          { title: "NHS – Healthy Sleep and Heart Health Evidence", url: "https://www.nhs.uk" }
        ]
      }
    };
  }

  if (endpoint.includes('/api/copilot/chat/history')) {
    return [
      {
        id: 1,
        sender: 'user',
        text: 'How is my sleep consistency looking this week?'
      },
      {
        id: 2,
        sender: 'copilot',
        text: 'Your sleep consistency has improved by 14% compared to last week. You averaged 7.5 hours per night with steady restorative slow-wave intervals.'
      }
    ];
  }

  // Medications
  if (endpoint.includes('/api/medications/search') || endpoint.includes('/api/medications/user/list')) {
    return MOCK_MEDICATIONS;
  }

  if (endpoint.includes('/api/medications/user/seed-sample') || endpoint.includes('/api/medications/user/add')) {
    return { message: 'Sample medications loaded', items: MOCK_MEDICATIONS };
  }

  // Symptoms
  if (endpoint.includes('/api/symptoms/checklist')) {
    return [
      { id: 'fatigue', name: 'Mild Fatigue', category: 'Energy' },
      { id: 'headache', name: 'Tension Headache', category: 'Head' },
      { id: 'sleep_disturb', name: 'Difficulty Falling Asleep', category: 'Sleep' },
      { id: 'muscle_sore', name: 'Post-Workout Muscle Soreness', category: 'Musculoskeletal' },
      { id: 'dry_eyes', name: 'Digital Eye Strain', category: 'Eyes' }
    ];
  }

  if (endpoint.includes('/api/symptoms/analyze')) {
    return {
      severity: 'Mild',
      is_emergency: false,
      educational_summary: 'Reported symptoms are consistent with common lifestyle-related fatigue or screen-related strain.',
      self_care_suggestions: [
        'Practice 20-20-20 breaks during screen work (look 20 feet away for 20 seconds every 20 minutes).',
        'Ensure steady electrolyte and water intake throughout the day.',
        'Schedule a 10-15 minute relaxing evening walk outdoors.'
      ],
      when_to_see_physician: 'If headache or fatigue intensifies or persists beyond 7 days, schedule an evaluation with your primary physician.'
    };
  }

  if (endpoint.includes('/api/reminders')) {
    return [
      { id: 1, medication_name: 'Magnesium Glycinate', dosage: '200mg', scheduled_time: '21:30', taken: false },
      { id: 2, medication_name: 'Vitamin D3', dosage: '1000 IU', scheduled_time: '08:30', taken: true }
    ];
  }

  if (endpoint.includes('/api/nutrition')) {
    return {
      daily_calories_target: 2200,
      protein_target_g: 130,
      carbs_target_g: 220,
      fats_target_g: 70,
      recommendations: [
        'Include a protein source and colorful cruciferous vegetables in your lunch.',
        'Enjoy a handful of walnuts or pumpkin seeds for evening zinc and magnesium support.'
      ]
    };
  }

  // Default fallback
  return { status: 'success', mock: true, timestamp: new Date().toISOString() };
}
