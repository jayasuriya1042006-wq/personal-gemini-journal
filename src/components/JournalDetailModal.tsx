import React from 'react';
import { JournalEntry, MoodType } from '../types';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Edit3, 
  Tag, 
  Check, 
  Heart, 
  Smile, 
  Compass, 
  CloudRain, 
  Activity, 
  Zap, 
  Gift, 
  Target 
} from 'lucide-react';

interface JournalDetailModalProps {
  entry: JournalEntry;
  onClose: () => void;
  onEdit: (entry: JournalEntry) => void;
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

export const JournalDetailModal: React.FC<JournalDetailModalProps> = ({
  entry,
  onClose,
  onEdit
}) => {
  const MoodIcon = MOOD_ICONS[entry.mood] || Compass;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl max-w-3xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-stone-200 flex items-start justify-between bg-stone-50/60">
          <div>
            <div className="flex items-center space-x-2 text-xs text-stone-500 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-100/70 text-amber-900 border border-amber-200 capitalize">
                <MoodIcon className="w-3 h-3 mr-1 text-amber-800" />
                {entry.mood}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3 h-3" />
                {formatDate(entry.createdAt)}
              </span>
              <span>•</span>
              <span className="font-mono text-[11px]">{entry.wordCount} words</span>
            </div>

            <h2 className="text-2xl font-bold text-stone-900 font-serif-journal">
              {entry.title || 'Untitled Reflection'}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="detail-edit-btn"
              onClick={() => onEdit(entry)}
              className="p-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              id="detail-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Prompt banner if applicable */}
          {entry.prompt && (
            <div className="p-3.5 rounded-xl bg-stone-100 text-stone-800 text-xs font-medium border border-stone-200 italic">
              Writing Prompt: "{entry.prompt}"
            </div>
          )}

          {/* Main Journal Content */}
          <div className="prose max-w-none font-serif-journal text-base sm:text-lg text-stone-800 leading-relaxed whitespace-pre-wrap">
            {entry.content}
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400 mr-1" />
              {entry.tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* AI Empathetic Reflection & Themes Section */}
          {entry.aiReflection && (
            <div className="mt-6 p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-800" />
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider font-sans-ui">
                    Gemini AI Psychological Reflection
                  </h4>
                </div>
                {entry.sentiment && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white text-stone-700 border border-stone-200 font-sans-ui">
                    Sentiment: {entry.sentiment}
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-serif-journal italic">
                "{entry.aiReflection}"
              </p>

              {/* Extracted Themes */}
              {entry.aiThemes && entry.aiThemes.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-stone-600 block mb-1.5 font-sans-ui">
                    Emotional & Cognitive Themes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.aiThemes.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {entry.aiActionItems && entry.aiActionItems.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-stone-600 block mb-1.5 font-sans-ui">
                    Suggested Mindful Reflections:
                  </span>
                  <ul className="space-y-1.5 font-sans-ui">
                    {entry.aiActionItems.map((item, i) => (
                      <li key={i} className="text-xs text-stone-800 flex items-start space-x-2 bg-white/70 p-2 rounded-lg border border-amber-100">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Privacy & Isolation Stamp */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs text-stone-500 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Document ID: {entry.id.slice(0, 12)}...
            </span>
            <span>Isolated in Cloud Firestore</span>
          </div>

        </div>

      </div>
    </div>
  );
};
