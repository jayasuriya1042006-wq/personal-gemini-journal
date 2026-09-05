import React, { useState, useEffect } from 'react';
import { JournalEntry, PeriodicInsight } from '../types';
import { requestPeriodicSynthesis } from '../services/api';
import { savePeriodicInsight, getUserInsights } from '../services/journalService';
import { 
  Sparkles, 
  TrendingUp, 
  Layers, 
  HeartHandshake, 
  Lightbulb, 
  ShieldCheck, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  PenLine,
  Quote
} from 'lucide-react';

interface InsightsHubProps {
  userId: string;
  entries: JournalEntry[];
  onCreateEntry?: () => void;
}

export const InsightsHub: React.FC<InsightsHubProps> = ({ userId, entries, onCreateEntry }) => {
  const [period, setPeriod] = useState<string>('Recent Journals');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentInsight, setCurrentInsight] = useState<PeriodicInsight | null>(null);
  const [savedInsights, setSavedInsights] = useState<PeriodicInsight[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    loadHistoricalInsights();
  }, [userId]);

  const loadHistoricalInsights = async () => {
    setIsLoadingHistory(true);
    try {
      const insights = await getUserInsights(userId);
      setSavedInsights(insights);
      if (insights.length > 0 && !currentInsight) {
        setCurrentInsight(insights[0]);
      }
    } catch (err) {
      console.error('Failed to load past insights:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSynthesize = async () => {
    if (entries.length === 0) {
      setError('You need at least 1 journal entry to generate AI insights.');
      return;
    }

    setIsSynthesizing(true);
    setError(null);

    try {
      const formattedEntries = entries.slice(0, 20).map(e => ({
        title: e.title,
        content: e.content,
        mood: e.mood,
        createdAt: e.createdAt
      }));

      const res = await requestPeriodicSynthesis({
        entries: formattedEntries,
        period
      });

      if (res.data) {
        const newInsightData: Omit<PeriodicInsight, 'id' | 'userId'> = {
          period: res.period || period,
          summary: res.data.summary || '',
          keyThemes: res.data.keyThemes || [],
          growthOpportunities: res.data.growthOpportunities || [],
          emotionalLandscape: res.data.emotionalLandscape || '',
          entryCountAnalyzed: entries.length,
          generatedAt: new Date().toISOString()
        };

        const insightId = await savePeriodicInsight(userId, newInsightData);
        const fullInsight: PeriodicInsight = {
          id: insightId,
          userId,
          ...newInsightData
        };

        setCurrentInsight(fullInsight);
        setSavedInsights([fullInsight, ...savedInsights]);
      }
    } catch (err: any) {
      console.error('Synthesis error:', err);
      setError(err.message || 'Failed to synthesize insights with Gemini.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-stone-200">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-800 text-amber-50 flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 font-serif-journal">
              AI Longitudinal Insights & Wellbeing Trends
            </h1>
            <p className="text-xs text-stone-500 font-sans-ui flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Aggregated strictly across your own private journal entries ({entries.length} available)
            </p>
          </div>
        </div>
      </div>

      {/* Synthesis Control Box */}
      <div className="mt-6 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 font-sans-ui">
              Synthesize Emotional Landscape & Growth
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Gemini will analyze your writing patterns, recurring themes, and resilience milestones server-side.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-xs py-2 px-3 border border-stone-300 rounded-xl bg-stone-50 text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-800"
            >
              <option value="Recent Journals">Recent Journals</option>
              <option value="Past 7 Days">Past 7 Days</option>
              <option value="Past 30 Days">Past 30 Days</option>
              <option value="Complete Reflection History">Complete Reflection History</option>
            </select>

            <button
              id="generate-insights-btn"
              onClick={handleSynthesize}
              disabled={isSynthesizing || entries.length === 0}
              className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-medium transition-colors shadow-xs flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate New Synthesis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Current Insight Presentation */}
      {currentInsight ? (
        <div className="mt-8 space-y-6">
          
          {/* Executive Summary Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-700" />
                Synthesis Period: {currentInsight.period}
              </span>
              <span className="text-xs font-mono text-stone-400">
                {new Date(currentInsight.generatedAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-stone-900 font-serif-journal mb-2">
                Executive Synthesis
              </h3>
              <p className="text-stone-800 font-serif-journal text-base leading-relaxed whitespace-pre-wrap">
                {currentInsight.summary}
              </p>
            </div>
          </div>

          {/* Emotional Landscape & Key Themes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Emotional Landscape */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
              <div className="flex items-center space-x-2 mb-3">
                <HeartHandshake className="w-4 h-4 text-teal-700" />
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-sans-ui">
                  Emotional Landscape & Mood Dynamics
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-serif-journal italic">
                "{currentInsight.emotionalLandscape}"
              </p>
            </div>

            {/* Recurring Themes */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-4 h-4 text-amber-800" />
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-sans-ui">
                  Identified Core Themes
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentInsight.keyThemes.map((theme, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200"
                  >
                    #{theme}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Growth Opportunities */}
          {currentInsight.growthOpportunities && currentInsight.growthOpportunities.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-sans-ui">
                  Growth Observations & Constructive Takeaways
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentInsight.growthOpportunities.map((growth, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-stone-800 leading-normal">{growth}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mindful Affirmation */}
          {currentInsight.mindfulAffirmation && (
            <div className="bg-gradient-to-br from-amber-50 to-stone-50 p-6 rounded-3xl border border-amber-200/80 shadow-2xs">
              <div className="flex items-center space-x-2 mb-2">
                <Quote className="w-4 h-4 text-amber-800" />
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider font-sans-ui">
                  Personalized Mindful Affirmation
                </h4>
              </div>
              <p className="text-sm sm:text-base font-serif-journal text-stone-800 italic">
                "{currentInsight.mindfulAffirmation}"
              </p>
            </div>
          )}

        </div>
      ) : (
        <div className="mt-8 text-center py-12 px-6 bg-white rounded-3xl border border-stone-200 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-stone-900 font-serif-journal">
            {entries.length === 0 ? 'No Journal Entries Yet' : 'No Synthesis Generated Yet'}
          </h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1.5 leading-relaxed">
            {entries.length === 0
              ? 'Longitudinal AI synthesis needs at least one journal entry to analyze your emotional landscape and growth patterns.'
              : `You have ${entries.length} journal ${entries.length === 1 ? 'entry' : 'entries'} ready! Click "Generate New Synthesis" above to analyze your personal growth with Gemini.`}
          </p>

          {entries.length === 0 && onCreateEntry && (
            <button
              onClick={onCreateEntry}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <PenLine className="w-4 h-4" />
              <span>Write Your First Journal Entry</span>
            </button>
          )}
        </div>
      )}

      {/* Historical Insights List */}
      {savedInsights.length > 1 && (
        <div className="mt-12 pt-8 border-t border-stone-200">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-sans-ui">
            <Clock className="w-4 h-4 text-stone-500" />
            Previous Synthesized Reports ({savedInsights.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedInsights.map((ins) => (
              <button
                key={ins.id}
                onClick={() => setCurrentInsight(ins)}
                className={`text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  currentInsight?.id === ins.id
                    ? 'bg-amber-50/80 border-amber-800/40 ring-1 ring-amber-800/30'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div>
                  <h5 className="text-xs font-bold text-stone-900">{ins.period}</h5>
                  <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{ins.summary}</p>
                  <span className="text-[10px] font-mono text-stone-400 mt-1 block">
                    {new Date(ins.generatedAt).toLocaleDateString()}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
