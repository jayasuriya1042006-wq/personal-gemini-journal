import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy,
  onSnapshot 
} from '../firebase/config';
import { JournalEntry, PeriodicInsight, Conversation } from '../types';

/**
 * Journal Service enforcing multi-tenant Firestore isolation under /users/{userId}
 */

// Subscribe to real-time changes in user's private journals
export function subscribeToUserJournals(
  userId: string, 
  onSuccess: (entries: JournalEntry[]) => void, 
  onError: (error: Error) => void
) {
  if (!userId) {
    onError(new Error('User ID is required for accessing journals'));
    return () => {};
  }

  // Path: /users/{userId}/journals
  const journalsRef = collection(db, 'users', userId, 'journals');
  const q = query(journalsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const entries: JournalEntry[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      entries.push({
        id: docSnapshot.id,
        userId: userId,
        title: data.title || '',
        content: data.content || '',
        mood: data.mood || 'reflective',
        tags: Array.isArray(data.tags) ? data.tags : [],
        prompt: data.prompt || '',
        aiReflection: data.aiReflection,
        aiThemes: data.aiThemes,
        aiActionItems: data.aiActionItems,
        sentiment: data.sentiment,
        wordCount: typeof data.wordCount === 'number' ? data.wordCount : (data.content?.split(/\s+/).filter(Boolean).length || 0),
        isClientEncrypted: Boolean(data.isClientEncrypted),
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    });
    onSuccess(entries);
  }, (err) => {
    console.error('Firestore isolated read error:', err);
    onError(err);
  });
}

// Create or Save a new journal entry
export async function saveJournalEntry(
  userId: string,
  entry: Omit<JournalEntry, 'id' | 'userId'> & { id?: string }
): Promise<string> {
  if (!userId) throw new Error('Unauthenticated user cannot create journal');

  const journalsRef = collection(db, 'users', userId, 'journals');
  const entryId = entry.id || doc(journalsRef).id;
  const docRef = doc(db, 'users', userId, 'journals', entryId);

  const now = new Date().toISOString();
  const wordCount = entry.content.trim().split(/\s+/).filter(Boolean).length;

  const dataToSave = {
    title: entry.title.trim() || 'Untitled Reflection',
    content: entry.content.trim(),
    mood: entry.mood,
    tags: entry.tags || [],
    prompt: entry.prompt || '',
    aiReflection: entry.aiReflection || null,
    aiThemes: entry.aiThemes || [],
    aiActionItems: entry.aiActionItems || [],
    sentiment: entry.sentiment || 'neutral',
    wordCount,
    isClientEncrypted: Boolean(entry.isClientEncrypted),
    createdAt: entry.createdAt || now,
    updatedAt: now,
  };

  await setDoc(docRef, dataToSave, { merge: true });
  return entryId;
}

// Delete a journal entry
export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  if (!userId || !entryId) throw new Error('Invalid arguments for deletion');
  const docRef = doc(db, 'users', userId, 'journals', entryId);
  await deleteDoc(docRef);
}

// Save Periodic Insight
export async function savePeriodicInsight(
  userId: string,
  insight: Omit<PeriodicInsight, 'id' | 'userId'>
): Promise<string> {
  if (!userId) throw new Error('Authentication required');
  const insightsRef = collection(db, 'users', userId, 'insights');
  const insightId = doc(insightsRef).id;
  const docRef = doc(db, 'users', userId, 'insights', insightId);

  await setDoc(docRef, {
    ...insight,
    generatedAt: new Date().toISOString()
  });

  return insightId;
}

// Fetch User's Periodic Insights
export async function getUserInsights(userId: string): Promise<PeriodicInsight[]> {
  if (!userId) return [];
  const insightsRef = collection(db, 'users', userId, 'insights');
  const q = query(insightsRef, orderBy('generatedAt', 'desc'));
  const snapshot = await getDocs(q);
  
  const insights: PeriodicInsight[] = [];
  snapshot.forEach((d) => {
    const data = d.data();
    insights.push({
      id: d.id,
      userId,
      period: data.period || 'General',
      summary: data.summary || '',
      keyThemes: data.keyThemes || [],
      growthOpportunities: data.growthOpportunities || [],
      emotionalLandscape: data.emotionalLandscape || '',
      entryCountAnalyzed: data.entryCountAnalyzed || 0,
      generatedAt: data.generatedAt || new Date().toISOString()
    });
  });
  return insights;
}

// Save Conversation Message History
export async function saveConversation(
  userId: string,
  conversation: Conversation
): Promise<void> {
  if (!userId) return;
  const docRef = doc(db, 'users', userId, 'conversations', conversation.id);
  await setDoc(docRef, {
    title: conversation.title,
    messages: conversation.messages,
    createdAt: conversation.createdAt,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

// Get User's Conversations
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  if (!userId) return [];
  const colRef = collection(db, 'users', userId, 'conversations');
  const q = query(colRef, orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  const result: Conversation[] = [];
  snapshot.forEach((d) => {
    const data = d.data();
    result.push({
      id: d.id,
      userId,
      title: data.title || 'Journal Reflection Session',
      messages: data.messages || [],
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    });
  });
  return result;
}
