import React, { useState } from 'react';
import { JournalEntry, MoodType } from '../types';
import { deleteJournalEntry } from '../services/journalService';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Calendar, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Eye, 
  ShieldCheck, 
  Download, 
  Smile, 
  Heart, 
  Compass, 
  CloudRain, 
  Activity, 
  Zap, 
  Gift, 
  Target,
  Clock,
  Plus
} from 'lucide-react';

interface JournalListProps {
  userId: string;
  entries: JournalEntry[];
  isLoading: boolean;
  onSelectEntry: (entry: JournalEntry) => void;
  onEditEntry: (entry: JournalEntry) => void;
  onCreateNew: () => void;
}

const MOOD_ICONS: Record<MoodType, any> = {
  reflective: Compass,
  peaceful: Heart,
  joyful: Smile,
  grateful: Gift,
  focused: Target,
  energized: Zap,
  melancholy: CloudRain,
  anxious: Activity,
};

export const JournalList: React.FC<JournalListProps> = ({
  userId,
  entries,
  isLoading,
  onSelectEntry,
  onEditEntry,
  onCreateNew
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract unique tags
  const allTags = Array.from(new Set(entries.flatMap(e => e.tags || [])));

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.aiReflection && entry.aiReflection.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMood = selectedMoodFilter === 'all' || entry.mood === selectedMoodFilter;
    const matchesTag = selectedTagFilter === 'all' || (entry.tags && entry.tags.includes(selectedTagFilter));

    return matchesSearch && matchesMood && matchesTag;
  });

  const handleDelete = async (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this private journal entry? This action cannot be undone.')) {
      return;
    }

    setDeletingId(entryId);
    try {
      await deleteJournalEntry(userId, entryId);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete the journal entry. Please check your connection.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `personal_journal_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* List Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif-journal flex items-center gap-2">
            <span>My Private Journals</span>
            <span className="text-xs font-sans-ui font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </h1>
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5 font-sans-ui">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Isolated under Firestore path: <code className="font-mono text-[10px] bg-stone-100 px-1 py-0.5 rounded">/users/{userId.slice(0, 8)}.../journals</code>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {entries.length > 0 && (
            <button
              id="export-backup-btn"
              onClick={handleExportBackup}
              title="Export all journals as private JSON backup"
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Export Backup</span>
            </button>
          )}

          <button
            id="create-new-journal-btn"
            onClick={onCreateNew}
            className="px-4 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Journal</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mt-6 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="journal-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries by title, thoughts, or AI themes..."
            className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-800 focus:outline-none placeholder-stone-400"
          />
        </div>

        {/* Mood Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <select
            id="mood-filter-select"
            value={selectedMoodFilter}
            onChange={(e) => setSelectedMoodFilter(e.target.value)}
            className="text-xs py-2 px-3 border border-stone-300 rounded-xl bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-800"
          >
            <option value="all">All Moods</option>
            <option value="reflective">Reflective</option>
            <option value="peaceful">Peaceful</option>
            <option value="joyful">Joyful</option>
            <option value="grateful">Grateful</option>
            <option value="focused">Focused</option>
            <option value="energized">Energized</option>
            <option value="melancholy">Melancholy</option>
            <option value="anxious">Anxious</option>
          </select>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <select
              id="tag-filter-select"
              value={selectedTagFilter}
              onChange={(e) => setSelectedTagFilter(e.target.value)}
              className="text-xs py-2 px-3 border border-stone-300 rounded-xl bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-800"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
              <div className="h-4 bg-stone-200 rounded w-3/4"></div>
              <div className="h-3 bg-stone-100 rounded w-1/2"></div>
              <div className="h-16 bg-stone-100 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredEntries.length === 0 && (
        <div className="mt-12 text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 shadow-2xs max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-amber-800" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-serif-journal">
            {searchQuery || selectedMoodFilter !== 'all' ? 'No matching entries found' : 'Your Journal is Empty'}
          </h3>
          <p className="mt-1.5 text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            {searchQuery || selectedMoodFilter !== 'all'
              ? 'Try resetting the search filters to explore other private entries.'
              : 'Begin your mindful reflection journey. Your entries are isolated strictly to your authenticated session.'}
          </p>
          <div className="mt-5">
            <button
              id="empty-state-create-btn"
              onClick={onCreateNew}
              className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-medium transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write First Journal</span>
            </button>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && filteredEntries.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntries.map((entry) => {
            const MoodIcon = MOOD_ICONS[entry.mood] || Compass;
            return (
              <div
                key={entry.id}
                id={`journal-card-${entry.id}`}
                onClick={() => onSelectEntry(entry)}
                className="group bg-white p-5 rounded-2xl border border-stone-200/80 hover:border-amber-700/60 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer relative"
              >
                <div>
                  {/* Top Bar: Mood & Date */}
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200 capitalize">
                      <MoodIcon className="w-3 h-3 mr-1 text-amber-800" />
                      {entry.mood}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-stone-900 font-serif-journal group-hover:text-amber-950 transition-colors line-clamp-1">
                    {entry.title || 'Untitled Reflection'}
                  </h3>

                  {/* Content snippet */}
                  <p className="mt-2 text-xs text-stone-600 font-serif-journal leading-relaxed line-clamp-3">
                    {entry.isClientEncrypted ? '•••••••• •••••••• (Masked for privacy)' : entry.content}
                  </p>

                  {/* AI Reflection Indicator */}
                  {entry.aiReflection && (
                    <div className="mt-3.5 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-950 flex items-start space-x-1.5 font-sans-ui">
                      <Sparkles className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                      <div className="line-clamp-2 italic">
                        "{entry.aiReflection}"
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {entry.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                      {entry.tags.length > 3 && (
                        <span className="text-[10px] text-stone-400">+{entry.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="font-mono text-[11px]">{entry.wordCount} words</span>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      id={`edit-btn-${entry.id}`}
                      onClick={(e) => { e.stopPropagation(); onEditEntry(entry); }}
                      title="Edit journal"
                      className="p-1.5 rounded-md text-stone-500 hover:text-amber-900 hover:bg-amber-50 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      id={`delete-btn-${entry.id}`}
                      onClick={(e) => handleDelete(e, entry.id)}
                      disabled={deletingId === entry.id}
                      title="Delete journal"
                      className="p-1.5 rounded-md text-stone-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
