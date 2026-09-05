import { auth } from '../firebase/config';

// Helper to retrieve current Firebase ID token
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Authentication required. User is not signed in.');
  }
  return await user.getIdToken();
}

export async function checkServerHealth() {
  const response = await fetch('/api/health');
  if (!response.ok) {
    throw new Error('Failed to reach backend service');
  }
  return response.json();
}

export async function fetchSecurityPosture() {
  const response = await fetch('/api/security/audit');
  if (!response.ok) {
    throw new Error('Failed to fetch security posture');
  }
  return response.json();
}

export async function requestAiReflection(payload: {
  title: string;
  content: string;
  mood?: string;
  prompt?: string;
}) {
  const token = await getAuthToken();
  const response = await fetch('/api/gemini/reflect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to generate AI reflection');
  }

  return response.json();
}

export async function requestPeriodicSynthesis(payload: {
  entries: Array<{
    title: string;
    content: string;
    mood: string;
    createdAt: string;
  }>;
  period: string;
}) {
  const token = await getAuthToken();
  const response = await fetch('/api/gemini/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to synthesize periodic insights');
  }

  return response.json();
}

export async function sendReflectiveChatMessage(payload: {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}) {
  const token = await getAuthToken();
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to process chat message');
  }

  return response.json();
}

export async function runPromptInjectionTest(attackPayload: string) {
  const token = await getAuthToken();
  const response = await fetch('/api/gemini/penetration-test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ payload: attackPayload }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to execute injection test');
  }

  return response.json();
}
