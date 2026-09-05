import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, User } from './firebase/config';
import { JournalEntry } from './types';
import { subscribeToUserJournals } from './services/journalService';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { JournalList } from './components/JournalList';
import { JournalEditor } from './components/JournalEditor';
import { JournalDetailModal } from './components/JournalDetailModal';
import { InsightsHub } from './components/InsightsHub';
import { ReflectiveChat } from './components/ReflectiveChat';
import { SecurityInspector } from './components/SecurityInspector';
import { ShieldCheck, BookOpen, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'journals' | 'insights' | 'chat' | 'security'>('journals');
  
  // Journals state
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [isJournalsLoading, setIsJournalsLoading] = useState(false);
  const [journalsError, setJournalsError] = useState<string | null>(null);

  // View / Edit / Create state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<JournalEntry | null>(null);
  const [selectedEntryForDetail, setSelectedEntryForDetail] = useState<JournalEntry | null>(null);

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore isolated journals collection when user logs in
  useEffect(() => {
    if (!currentUser) {
      setJournals([]);
      setIsJournalsLoading(false);
      return;
    }

    setIsJournalsLoading(true);
    setJournalsError(null);

    const unsubscribe = subscribeToUserJournals(
      currentUser.uid,
      (entries) => {
        setJournals(entries);
        setIsJournalsLoading(false);
      },
      (err) => {
        console.error('Journal subscription error:', err);
        setJournalsError('Could not load journals from Firestore.');
        setIsJournalsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Handler for converting chat dialogue into a journal draft
  const handleConvertChatToJournal = (title: string, content: string) => {
    setEntryToEdit({
      id: '',
      userId: currentUser?.uid || '',
      title,
      content,
      mood: 'reflective',
      tags: ['reflection', 'dialogue'],
      wordCount: content.split(/\s+/).filter(Boolean).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsCreatingNew(false);
    setActiveTab('journals');
  };

  // Auth Loading Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-900 text-amber-100 flex items-center justify-center mx-auto animate-pulse">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-xs font-mono text-stone-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verifying Authoritative Firebase Authentication...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in, render the secure AuthScreen
  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans-ui selection:bg-amber-100 selection:text-stone-900">
      
      {/* Navigation Header */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsCreatingNew(false);
          setEntryToEdit(null);
        }}
        onOpenNewEntry={() => {
          setEntryToEdit(null);
          setIsCreatingNew(true);
          setActiveTab('journals');
        }}
      />

      {/* Global Firestore Error notification if any */}
      {journalsError && (
        <div className="max-w-4xl mx-auto mt-4 px-4">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{journalsError}</span>
          </div>
        </div>
      )}

      {/* Main Content Areas */}
      <main className="flex-1">
        
        {/* TAB 1: Journals (List or Editor) */}
        {activeTab === 'journals' && (
          <>
            {isCreatingNew || entryToEdit ? (
              <JournalEditor
                userId={currentUser.uid}
                entryToEdit={entryToEdit}
                onSaveSuccess={() => {
                  setIsCreatingNew(false);
                  setEntryToEdit(null);
                }}
                onCancel={() => {
                  setIsCreatingNew(false);
                  setEntryToEdit(null);
                }}
              />
            ) : (
              <JournalList
                userId={currentUser.uid}
                entries={journals}
                isLoading={isJournalsLoading}
                onSelectEntry={(entry) => setSelectedEntryForDetail(entry)}
                onEditEntry={(entry) => {
                  setEntryToEdit(entry);
                  setIsCreatingNew(false);
                }}
                onCreateNew={() => {
                  setEntryToEdit(null);
                  setIsCreatingNew(true);
                }}
              />
            )}
          </>
        )}

        {/* TAB 2: AI Insights & Longitudinal Trends */}
        {activeTab === 'insights' && (
          <InsightsHub
            userId={currentUser.uid}
            entries={journals}
            onCreateEntry={() => {
              setEntryToEdit(null);
              setIsCreatingNew(true);
              setActiveTab('journals');
            }}
          />
        )}

        {/* TAB 3: Reflective Socratic Companion */}
        {activeTab === 'chat' && (
          <ReflectiveChat
            userId={currentUser.uid}
            onConvertToJournal={handleConvertChatToJournal}
          />
        )}

        {/* TAB 4: Security Constitution & Threat Modeling Inspector */}
        {activeTab === 'security' && (
          <SecurityInspector user={currentUser} />
        )}

      </main>

      {/* Detail Modal */}
      {selectedEntryForDetail && (
        <JournalDetailModal
          entry={selectedEntryForDetail}
          onClose={() => setSelectedEntryForDetail(null)}
          onEdit={(entry) => {
            setSelectedEntryForDetail(null);
            setEntryToEdit(entry);
            setIsCreatingNew(false);
            setActiveTab('journals');
          }}
        />
      )}

      {/* Footer with Security Constitution Badge */}
      <footer className="mt-auto py-6 border-t border-stone-200 text-center text-xs text-stone-500 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-stone-700">Personal Gemini Journal</span>
            <span>—</span>
            <span>Zero Client Secrets • Strict Multi-Tenant Firestore Isolation</span>
          </div>
          <div className="text-[11px] font-mono text-stone-400">
            Path: /users/{currentUser.uid.slice(0, 8)}.../journals
          </div>
        </div>
      </footer>

    </div>
  );
}
