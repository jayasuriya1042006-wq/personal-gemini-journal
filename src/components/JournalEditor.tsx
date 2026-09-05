import React, { useState, useEffect } from 'react';
import { JournalEntry, MoodType } from '../types';
import { saveJournalEntry } from '../services/journalService';
import { requestAiReflection } from '../services/api';
import { 
  Sparkles, 
  Save, 
  X, 
  ShieldCheck, 
  Tag, 
  HelpCircle, 
  EyeOff, 
  Eye, 
  AlertCircle, 
  Check, 
  RefreshCw,
  Heart,
  Smile,
  Compass,
  CloudRain,
  Activity,
  Zap,
  Gift,
  Target
} from 'lucide-react';

interface JournalEditorProps {
  userId: string;
  entryToEdit?: JournalEntry | null;
  onSaveSuccess: (entryId: string) => void;
  onCancel: () => void;
}

const MOODS: { type: MoodType; label: string; icon: any; color: string }[] = [
  { type: 'reflective', label: 'Reflective', icon: Compass, color: 'text-amber-800 bg-amber-50 border-amber-200' },
  { type: 'peaceful', label: 'Peaceful', icon: Heart, color: 'text-teal-800 bg-teal-50 border-teal-200' },
  { type: 'joyful', label: 'Joyful', icon: Smile, color: 'text-amber-700 bg-amber-100 border-amber-300' },
  { type: 'grateful', label: 'Grateful', icon: Gift, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
  { type: 'focused', label: 'Focused', icon: Target, color: 'text-sky-800 bg-sky-50 border-sky-200' },
  { type: 'energized', label: 'Energized', icon: Zap, color: 'text-orange-800 bg-orange-50 border-orange-200' },
  { type: 'melancholy', label: 'Melancholy', icon: CloudRain, color: 'text-indigo-800 bg-indigo-50 border-indigo-200' },
  { type: 'anxious', label: 'Anxious', icon: Activity, color: 'text-rose-800 bg-rose-50 border-rose-200' },
];

const WRITING_PROMPTS = [
  "What is one quiet moment that brought you peace or clarity today?",
  "What emotional challenge did you encounter, and how did you navigate it?",
  "What is something you learned about yourself recently?",
  "What are you ready to gently release or forgive?",
  "Describe an experience that gave you a fresh perspective.",
  "What is a personal boundary or value that guided you today?"
];

export const JournalEditor: React.FC<JournalEditorProps> = ({
  userId,
  entryToEdit,
  onSaveSuccess,
  onCancel
}) => {
  const [title, setTitle] = useState(entryToEdit?.title || '');
  const [content, setContent] = useState(entryToEdit?.content || '');
  const [mood, setMood] = useState<MoodType>(entryToEdit?.mood || 'reflective');
  const [tags, setTags] = useState<string[]>(entryToEdit?.tags || ['reflection']);
  const [tagInput, setTagInput] = useState('');
  const [prompt, setPrompt] = useState(entryToEdit?.prompt || '');
  
  // AI Reflection State
  const [aiReflection, setAiReflection] = useState(entryToEdit?.aiReflection || '');
  const [aiThemes, setAiThemes] = useState<string[]>(entryToEdit?.aiThemes || []);
  const [aiActionItems, setAiActionItems] = useState<string[]>(entryToEdit?.aiActionItems || []);
  const [sentiment, setSentiment] = useState(entryToEdit?.sentiment || 'neutral');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Editor states
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPrivateMasked, setIsPrivateMasked] = useState(false);
  const [showPromptList, setShowPromptList] = useState(false);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (cleaned && !tags.includes(cleaned) && tags.length < 6) {
        setTags([...tags, cleaned]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleRequestAiReflection = async () => {
    if (!content.trim()) {
      setAiError('Please write some journal thoughts before requesting AI reflection.');
      return;
    }

    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const response = await requestAiReflection({
        title,
        content,
        mood,
        prompt
      });

      if (response.data) {
        setAiReflection(response.data.reflection || '');
        setAiThemes(response.data.themes || []);
        setAiActionItems(response.data.actionItems || []);
        setSentiment(response.data.sentiment || 'neutral');
      }
    } catch (err: any) {
      console.error('AI reflection error:', err);
      setAiError(err.message || 'Unable to generate reflection. Server proxy returned an error.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setSaveError('Please enter some journal content before saving.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const entryId = await saveJournalEntry(userId, {
        id: entryToEdit?.id,
        title: title || 'Untitled Reflection',
        content,
        mood,
        tags,
        prompt,
        aiReflection: aiReflection || undefined,
        aiThemes: aiThemes.length ? aiThemes : undefined,
        aiActionItems: aiActionItems.length ? aiActionItems : undefined,
        sentiment: sentiment as any,
        wordCount,
        isClientEncrypted: isPrivateMasked,
        createdAt: entryToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      onSaveSuccess(entryId);
    } catch (err: any) {
      console.error('Save journal error:', err);
      setSaveError(err.message || 'Failed to save journal to your isolated Firestore document.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Editor Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
            {entryToEdit ? '✎' : '+'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900 font-serif-journal">
              {entryToEdit ? 'Edit Journal Entry' : 'New Private Journal Entry'}
            </h2>
            <p className="text-xs text-stone-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Isolated under <code className="font-mono text-[10px] bg-stone-100 px-1 py-0.5 rounded">/users/{userId.slice(0, 8)}.../journals</code>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Privacy Screen Blur Toggle */}
          <button
            type="button"
            id="editor-privacy-mask-btn"
            onClick={() => setIsPrivateMasked(!isPrivateMasked)}
            title={isPrivateMasked ? "Reveal journal text" : "Mask journal text for screen privacy"}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
              isPrivateMasked 
                ? 'bg-amber-900 text-amber-50 border-amber-950' 
                : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
            }`}
          >
            {isPrivateMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPrivateMasked ? 'Masked' : 'Privacy Shield'}</span>
          </button>

          <button
            id="editor-cancel-btn"
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            id="editor-save-btn"
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-medium shadow-sm transition-colors flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Entry</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Errors */}
      {saveError && (
        <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Main Form Fields */}
      <div className="mt-6 space-y-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        
        {/* Title */}
        <div>
          <input
            id="journal-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry Title (e.g., Morning Reflections on Clarity)..."
            className="w-full text-xl font-semibold text-stone-900 border-b border-stone-200 pb-2 focus:border-amber-800 focus:outline-none placeholder-stone-400 font-serif-journal"
          />
        </div>

        {/* Mood Selector */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
            Current Emotional Resonance / Mood
          </label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => {
              const Icon = m.icon;
              const isSelected = mood === m.type;
              return (
                <button
                  key={m.type}
                  id={`mood-btn-${m.type}`}
                  type="button"
                  onClick={() => setMood(m.type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition-all ${
                    isSelected 
                      ? `${m.color} ring-2 ring-amber-800/30 font-semibold shadow-xs` 
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt Inspiration Drawer */}
        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-amber-800" />
              <span className="text-xs font-medium text-stone-800">
                {prompt ? `Guided Prompt: "${prompt}"` : 'Reflective Writing Prompts'}
              </span>
            </div>
            <button
              type="button"
              id="toggle-prompts-btn"
              onClick={() => setShowPromptList(!showPromptList)}
              className="text-xs text-amber-900 font-medium hover:underline cursor-pointer"
            >
              {showPromptList ? 'Hide Ideas' : 'Browse Ideas'}
            </button>
          </div>

          {showPromptList && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-200">
              {WRITING_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setPrompt(p); setShowPromptList(false); }}
                  className="text-left p-2 rounded-lg text-xs text-stone-700 bg-white border border-stone-200 hover:border-amber-700 hover:bg-amber-50/50 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Journal Content Textarea */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Your Private Reflections</span>
            <span className="font-mono">{wordCount} words</span>
          </div>

          <div className="relative">
            <textarea
              id="journal-content-textarea"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Begin writing freely. Your thoughts are private, strictly isolated to your user identity, and never shared with other accounts..."
              className={`w-full p-4 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-amber-800 focus:border-amber-800 focus:outline-none placeholder-stone-400 font-serif-journal text-base leading-relaxed bg-stone-50/30 transition-all ${
                isPrivateMasked ? 'filter blur-sm select-none' : ''
              }`}
            />
            {isPrivateMasked && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-900/10 backdrop-blur-[2px] rounded-xl pointer-events-none">
                <span className="bg-stone-900 text-stone-100 text-xs px-3 py-1.5 rounded-lg shadow-md font-sans-ui flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5" />
                  Privacy Mask Active
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center">
            <Tag className="w-3.5 h-3.5 mr-1 text-stone-500" />
            Tags
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((t) => (
              <span 
                key={t}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="ml-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              id="journal-tag-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag and press enter..."
              className="text-xs px-2.5 py-1 rounded-md border border-stone-300 focus:outline-none focus:border-amber-800 bg-white"
            />
          </div>
        </div>

        {/* AI Reflection Trigger & Display */}
        <div className="pt-4 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 p-4 rounded-xl border border-amber-200/80">
            <div>
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-800" />
                <h3 className="text-sm font-semibold text-amber-950 font-sans-ui">
                  Gemini AI Empathetic Reflection
                </h3>
              </div>
              <p className="text-xs text-amber-900/80 mt-0.5">
                Processed via secure authenticated server-side proxy with prompt injection defenses.
              </p>
            </div>

            <button
              id="request-ai-reflection-btn"
              type="button"
              onClick={handleRequestAiReflection}
              disabled={isGeneratingAi || !content.trim()}
              className="px-3.5 py-2 rounded-lg bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-medium shadow-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Reflecting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiReflection ? 'Regenerate Reflection' : 'Reflect with Gemini'}</span>
                </>
              )}
            </button>
          </div>

          {aiError && (
            <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {/* Generated Reflection Card */}
          {aiReflection && (
            <div className="mt-4 p-5 rounded-xl bg-white border border-stone-200 shadow-xs space-y-3 font-sans-ui">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  Gemini Psychological Insights & Themes
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  Sentiment: {sentiment}
                </span>
              </div>

              {/* Reflection Prose */}
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-serif-journal italic">
                "{aiReflection}"
              </p>

              {/* Themes */}
              {aiThemes.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-stone-500 block mb-1">Identified Themes:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiThemes.map((theme, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100/80 text-amber-900">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {aiActionItems.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-stone-500 block mb-1">Mindful Follow-up Prompts:</span>
                  <ul className="space-y-1">
                    {aiActionItems.map((item, i) => (
                      <li key={i} className="text-xs text-stone-700 flex items-start space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
