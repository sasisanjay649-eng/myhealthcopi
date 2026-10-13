import { handleMockFallback } from './mockFallback';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function getAuthHeader() {
  const token = localStorage.getItem('vitamind_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.warn(`[VitaMind AI] Backend offline or unreachable at ${url}. Activating graceful mock demo fallback for ${endpoint}`);
      return handleMockFallback(endpoint, options);
    }
    throw error;
  }
}

// --- Auth Endpoints ---
export async function registerUser(userData) {
  const data = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  if (data?.access_token) {
    localStorage.setItem('vitamind_token', data.access_token);
  }
  return data;
}

export async function loginUser(credentials) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (data?.access_token) {
    localStorage.setItem('vitamind_token', data.access_token);
  }
  return data;
}

export async function googleAuth(googleData) {
  const data = await request('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify(googleData),
  });
  if (data?.access_token) {
    localStorage.setItem('vitamind_token', data.access_token);
  }
  return data;
}

export async function getCurrentUser() {
  return request('/api/auth/me');
}

export function logoutUser() {
  localStorage.removeItem('vitamind_token');
}

// --- Profile Endpoints ---
export async function getProfile() {
  return request('/api/users/profile');
}

export async function updateProfile(profileData) {
  return request('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

// --- Health Data Endpoints ---
export async function addHealthRecord(recordData) {
  return request('/api/health', {
    method: 'POST',
    body: JSON.stringify(recordData),
  });
}

export async function getHealthRecords() {
  return request('/api/health');
}

export async function updateHealthRecord(id, recordData) {
  return request(`/api/health/${id}`, {
    method: 'PUT',
    body: JSON.stringify(recordData),
  });
}

export async function deleteHealthRecord(id) {
  return request(`/api/health/${id}`, {
    method: 'DELETE',
  });
}

export async function getHealthSummary() {
  return request('/api/health/summary');
}

export async function getHealthTrends() {
  return request('/api/health/trends');
}

export async function seedDemoData() {
  return request('/api/health/seed-demo', {
    method: 'POST',
  });
}

export async function addSleepRecord(sleepData) {
  return request('/api/health/sleep', {
    method: 'POST',
    body: JSON.stringify(sleepData),
  });
}

export async function addActivityRecord(activityData) {
  return request('/api/health/activity', {
    method: 'POST',
    body: JSON.stringify(activityData),
  });
}

// --- Copilot Chat & Insights Endpoints ---
export async function sendCopilotMessage(message, options = {}) {
  return request('/api/copilot/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      model: options.model || null,
      temperature: options.temperature || null,
    }),
  });
}

export async function streamCopilotMessage({
  message,
  model = null,
  temperature = null,
  onStatus = () => {},
  onToken = () => {},
  onDone = () => {},
  onError = () => {},
  signal = null,
}) {
  const url = `${API_BASE_URL}/api/copilot/chat/stream`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, model, temperature }),
      signal,
    });

    if (!response.ok) {
      let errData = {};
      try {
        errData = await response.json();
      } catch (e) {}
      const errorMsg = errData?.detail?.message || errData?.detail || `Request failed with status ${response.status}`;
      const err = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      err.detail = errData?.detail || errData;
      onError(err);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop();

      for (const eventStr of events) {
        if (!eventStr.trim()) continue;
        const lines = eventStr.split('\n');
        let eventType = 'message';
        let dataStr = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            dataStr = line.slice(6).trim();
          }
        }

        if (dataStr) {
          try {
            const parsedData = JSON.parse(dataStr);
            if (eventType === 'status') {
              onStatus(parsedData);
            } else if (eventType === 'token') {
              onToken(parsedData.delta || '');
            } else if (eventType === 'done') {
              onDone(parsedData);
            } else if (eventType === 'error') {
              const err = new Error(parsedData.detail || parsedData.message || 'Stream error');
              err.detail = parsedData;
              onError(err);
              return;
            }
          } catch (jsonErr) {
            console.error('Failed to parse SSE event data:', jsonErr, dataStr);
          }
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Stream generation aborted by user.');
      return;
    }
    if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
      console.warn('[VitaMind AI] Live streaming offline. Simulating mock copilot stream response.');
      onStatus({ stage: 'synthesis', detail: 'Synthesizing verified wellness guidelines...' });
      const mockResult = handleMockFallback('/api/copilot/chat');
      const textToStream = `${mockResult.response.summary}\n\n${mockResult.response.data_synthesis}`;
      onToken(textToStream);
      onDone(mockResult);
      return;
    }
    onError(err);
  }
}

export async function getChatHistory() {
  return request('/api/copilot/chat/history');
}

export async function clearChatHistory() {
  return request('/api/copilot/chat/history', {
    method: 'DELETE',
  });
}

export async function getAIConfig() {
  return request('/api/copilot/config');
}

export async function updateAIConfig(configData) {
  return request('/api/copilot/config', {
    method: 'POST',
    body: JSON.stringify(configData),
  });
}

export async function testAIConnection(configData) {
  return request('/api/copilot/test-connection', {
    method: 'POST',
    body: JSON.stringify(configData),
  });
}

export async function getInsights() {
  return request('/api/copilot/insights');
}

// --- Medication Endpoints ---
export async function searchMedication(query = '') {
  return request(`/api/medications/search?q=${encodeURIComponent(query)}`);
}

export async function getMedicationInfo(name) {
  return request(`/api/medications/${encodeURIComponent(name)}`);
}

export async function askMedicationQuestion(medicationName, question) {
  return request('/api/medications/question', {
    method: 'POST',
    body: JSON.stringify({ medication_name: medicationName, question }),
  });
}

export async function getUserMedications() {
  return request('/api/medications/user/list');
}

export async function addUserMedication(data) {
  return request('/api/medications/user/add', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUserMedication(id, data) {
  return request(`/api/medications/user/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUserMedication(id) {
  return request(`/api/medications/user/${id}`, {
    method: 'DELETE',
  });
}

export async function toggleUserMedicationTaken(id) {
  return request(`/api/medications/user/${id}/take`, {
    method: 'POST',
  });
}

export async function updateUserMedicationStatus(id, status) {
  return request(`/api/medications/user/${id}/status?status_str=${encodeURIComponent(status)}`, {
    method: 'POST',
  });
}

export async function seedSampleUserMedications() {
  return request('/api/medications/user/seed-sample', {
    method: 'POST',
  });
}

// --- Symptom Endpoints ---
export async function analyzeSymptoms(symptoms, severity = 'mild', durationDays = 1, additionalContext = '') {
  return request('/api/symptoms/analyze', {
    method: 'POST',
    body: JSON.stringify({
      symptoms,
      severity,
      duration_days: durationDays,
      additional_context: additionalContext,
    }),
  });
}

export async function getSymptomHistory() {
  return request('/api/symptoms/history');
}

// --- Search Endpoints ---
export async function searchMedicalInformation(query, limit = 5) {
  return request(`/api/search/medical?q=${encodeURIComponent(query)}&limit=${limit}`);
}

// --- Medication & Tablet Reminder Endpoints ---
export async function getMedicationReminders() {
  return request('/api/reminders');
}

export async function createMedicationReminder(reminderData) {
  return request('/api/reminders', {
    method: 'POST',
    body: JSON.stringify(reminderData),
  });
}

export async function updateMedicationReminder(id, reminderData) {
  return request(`/api/reminders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reminderData),
  });
}

export async function deleteMedicationReminder(id) {
  return request(`/api/reminders/${id}`, {
    method: 'DELETE',
  });
}

export async function toggleMedicationReminder(id) {
  return request(`/api/reminders/${id}/toggle`, {
    method: 'POST',
  });
}

export async function markMedicationReminderTaken(id) {
  return request(`/api/reminders/${id}/take`, {
    method: 'POST',
  });
}

export async function seedSampleMedicationReminders() {
  return request('/api/reminders/seed-sample', {
    method: 'POST',
  });
}

// --- AI Food & Nutrition Suggestions Endpoints ---
export async function getNutritionRecommendations(healthIssue = null) {
  const query = healthIssue ? `?issue=${encodeURIComponent(healthIssue)}` : '';
  return request(`/api/nutrition/recommendations${query}`);
}

export async function getNutritionConditions() {
  return request('/api/nutrition/conditions');
}

