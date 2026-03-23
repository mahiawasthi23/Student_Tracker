import React, { useEffect, useMemo, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Sparkles, Loader2, Key } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { buildProgressStats } from '../utils/progressStats';
import { buildAiFeedbackPrompt } from '../utils/aiPromptBuilder';
import { FeedbackCard } from './FeedbackCard';

const AI_WINDOW_START_MINUTES = 20 * 60 + 30; // 8:30 PM
const AI_WINDOW_END_MINUTES = 24 * 60; // 12:00 AM

export function AIReview({ goals: goalsOverride, reflections: reflectionsOverride }) {
  const progress = useProgress();
  const goals = goalsOverride || progress.goals;
  const reflections = reflectionsOverride || progress.reflections;
  const { isAuthenticated, getAiFeedback, saveAiFeedback } = progress;
  const [filter, setFilter] = useState('month'); 
  const [customRange, setCustomRange] = useState({ 
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'), 
    end: format(new Date(), 'yyyy-MM-dd') 
  });
  
  const [geminiKey, setGeminiKey] = useLocalStorage('gemini_api_key', '');
  const [isEditingKey, setIsEditingKey] = useState(!geminiKey);
  const [keyInput, setKeyInput] = useState(geminiKey || '');

  const [aiFeedback, setAiFeedback] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [tickNow, setTickNow] = useState(Date.now());
  const [latestGeneratedDateKey, setLatestGeneratedDateKey] = useState('');

  const now = new Date(tickNow);
  const todayDateKey = format(now, 'yyyy-MM-dd');
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isWithinAiWindow = currentMinutes >= AI_WINDOW_START_MINUTES && currentMinutes < AI_WINDOW_END_MINUTES;
  const hasGeneratedToday = latestGeneratedDateKey === todayDateKey;
  const generationLocked = !isWithinAiWindow || hasGeneratedToday;
  const lockMessage = !isWithinAiWindow
    ? 'AI feedback can be generated only between 8:30 PM and 12:00 AM.'
    : hasGeneratedToday
      ? 'You have already generated AI feedback today. Please come back tomorrow after 8:30 PM.'
      : '';

  const stats = useMemo(
    () => buildProgressStats({ goals, reflections, filter, customRange, includeReviewTexts: true }),
    [goals, reflections, filter, customRange]
  );

  useEffect(() => {
    setAiFeedback(null);
    setError(null);
  }, [goals, reflections, filter, customRange]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickNow(Date.now());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLatestGeneratedDateKey('');
      return;
    }

    let ignore = false;

    const loadTodayGenerationStatus = async () => {
      try {
        const allAiFeedback = await getAiFeedback();
        const alreadyGenerated = (Array.isArray(allAiFeedback) ? allAiFeedback : []).some(
          (item) => item?.dateKey === todayDateKey
        );

        if (!ignore) {
          setLatestGeneratedDateKey(alreadyGenerated ? todayDateKey : '');
        }
      } catch {
        if (!ignore) {
          setLatestGeneratedDateKey('');
        }
      }
    };

    loadTodayGenerationStatus();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, getAiFeedback, todayDateKey]);

  const handleSaveKey = () => {
    setGeminiKey(keyInput.trim());
    setIsEditingKey(false);
  };

  const generateAiFeedback = async () => {
    if (!isWithinAiWindow) {
      setError('AI feedback can be generated only between 8:30 PM and 12:00 AM.');
      return;
    }

    if (hasGeneratedToday) {
      setError('You can generate AI feedback only once per day. Please come back tomorrow after 8:30 PM.');
      return;
    }

    if (!geminiKey) {
      setIsEditingKey(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAiFeedback(null);

    try {
      const { totalHours, activeDays, goalsCompleted, totalGoalsCount, totalReflections, chartData, reviewTexts } = stats;
      const totalDays = chartData.length || 1;

      const prompt = buildAiFeedbackPrompt({
        totalHours: parseFloat(totalHours),
        activeDays,
        totalDays,
        goalsCompleted,
        totalGoalsCount,
        totalReflections,
        chartData,
        reviewTexts,
        filter,
      });

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.6, maxOutputTokens: 2000 },
          }),
        }
      );

      if (!res.ok) {
        let apiMessage = '';
        try {
          const errorPayload = await res.json();
          apiMessage = errorPayload?.error?.message || '';
        } catch {
          apiMessage = '';
        }

        if (res.status === 429) {
          throw new Error('Gemini quota/rate limit hit (429). Please wait a bit and try again.');
        }

        if (res.status === 401 || res.status === 403) {
          throw new Error('API key invalid or blocked. Please verify your Gemini key.');
        }

        throw new Error(apiMessage || `Gemini request failed (${res.status}). Please try again.`);
      }

      const data = await res.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) throw new Error('Invalid response from Gemini.');

      // Clean response
      let cleanedText = textResponse
        .replace(/^```json/g, '')
        .replace(/^```/g, '')
        .replace(/```$/g, '')
        .trim();

      // Try to extract JSON if there's extra text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }

      let parsedFeedback;
      try {
        parsedFeedback = JSON.parse(cleanedText);
      } catch (parseErr) {
        console.error('JSON Parse Error:', parseErr, 'Raw text:', cleanedText);
        throw new Error('AI response was incomplete. Please try again.');
      }

      // Validate all required fields exist
      const defaultFeedback = {
        productivity: ['Visit your dashboard for details'],
        consistency: ['Keep logging daily'],
        goalQuality: ['Review your goal-setting'],
        timeUsage: ['Try to reach 8 hrs/day'],
        pattern: ['Check for weekly patterns'],
        reflection: ['Reflect on your progress'],
        challenges: ['Identify and address blockers'],
        nextAction: ['Keep up the momentum'],
      };

      // Ensure all fields are arrays
      Object.keys(defaultFeedback).forEach(key => {
        if (!parsedFeedback[key] || !Array.isArray(parsedFeedback[key])) {
          parsedFeedback[key] = defaultFeedback[key];
        }
      });

      await saveAiFeedback({
        dateKey: todayDateKey,
        feedback: parsedFeedback,
      });

      setLatestGeneratedDateKey(todayDateKey);
      setAiFeedback(parsedFeedback);
    } catch (err) {
      console.error('Error generating feedback:', err);
      setError(err.message || 'Failed to generate feedback. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-3xl border-2 border-slate-200 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shrink-0">
            <Sparkles size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">AI Coach Feedback</h2>
            <p className="text-slate-600 mt-1 max-w-md text-sm">Personalized insights based on your study patterns and 8-hour daily benchmark.</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 min-w-[200px]">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            disabled={isGenerating}
            className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-indigo-500 block p-3 cursor-pointer transition-all"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Range</option>
          </select>

          {filter === 'custom' && (
            <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <input 
                type="date" 
                value={customRange.start} 
                onChange={e => setCustomRange(prev => ({...prev, start: e.target.value}))}
                className="text-sm px-3 py-2 text-slate-700 bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg w-full"
              />
              <input 
                type="date" 
                value={customRange.end} 
                onChange={e => setCustomRange(prev => ({...prev, end: e.target.value}))}
                className="text-sm px-3 py-2 text-slate-700 bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {isEditingKey ? (
        // API Key Setup
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-10 max-w-2xl mx-auto text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-6">
            <Key size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Setup Gemini API</h3>
          <p className="text-slate-600 mb-8 text-sm leading-relaxed max-w-lg">
            To get AI-powered feedback, please add your Google Gemini API key. Your key is stored securely in your browser and never sent to our servers.
          </p>
          <div className="w-full flex flex-col gap-4 max-w-xl">
            <input 
              type="password" 
              value={keyInput} 
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste your Google Gemini API key..." 
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-center font-mono text-sm" 
            />
            <p className="text-xs text-slate-500">
              Get free API key at <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline">ai.google.dev</a>
            </p>
            <div className="flex gap-3 w-full pt-2">
              {geminiKey && (
                <button 
                  onClick={() => { setKeyInput(geminiKey); setIsEditingKey(false); }}
                  className="flex-1 py-3 text-slate-700 font-bold bg-slate-200 rounded-xl hover:bg-slate-300 transition-all"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={handleSaveKey} 
                disabled={!keyInput.trim()}
                className="flex-[geminiKey ? 1 : 2] py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {geminiKey ? 'Update Key' : 'Save Key'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Generate Button */}
          <div className="flex justify-between items-center gap-4">
            <h3 className="text-lg font-semibold text-slate-700">
              {aiFeedback ? 'Your Personalized Feedback' : 'Generate AI Feedback'}
            </h3>
            <div className="flex gap-2">
              {!aiFeedback && (
                <button 
                  onClick={generateAiFeedback}
                  disabled={isGenerating || generationLocked}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <><Loader2 className="animate-spin" size={18}/> Analyzing...</>
                  ) : generationLocked ? (
                    'Locked'
                  ) : (
                    <><Sparkles size={18}/> Generate Feedback</>
                  )}
                </button>
              )}
              <button 
                onClick={() => setIsEditingKey(true)} 
                className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <Key size={18} />
                {geminiKey && aiFeedback ? 'Change Key' : 'API Key'}
              </button>
            </div>
          </div>

          {lockMessage && !isGenerating && (
            <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${hasGeneratedToday ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
              {lockMessage}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-12 flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 opacity-20 animate-pulse"></div>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Analyzing your progress...</h4>
              <p className="text-slate-500 text-sm">Gemini is processing {stats.totalReflections} reflections and {stats.totalHours}+ hours of data...</p>
            </div>
          )}

          {/* Feedback Grid */}
          {aiFeedback && !isGenerating && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-6 duration-500 fade-in">
              <FeedbackCard category="productivity" items={aiFeedback.productivity} />
              <FeedbackCard category="consistency" items={aiFeedback.consistency} />
              <FeedbackCard category="goalQuality" items={aiFeedback.goalQuality} />
              <FeedbackCard category="timeUsage" items={aiFeedback.timeUsage} />
              <FeedbackCard category="pattern" items={aiFeedback.pattern} />
              <FeedbackCard category="reflection" items={aiFeedback.reflection} />
              <FeedbackCard category="challenges" items={aiFeedback.challenges} />
              <FeedbackCard category="nextAction" items={aiFeedback.nextAction} />
            </div>
          )}

          {/* Empty State */}
          {!aiFeedback && !isGenerating && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <Sparkles size={40} className="text-indigo-600 opacity-60" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Ready for AI Feedback?</h4>
              <p className="text-slate-600 max-w-lg mx-auto mb-6">
                Click "Generate Feedback" to get personalized AI insights based on your study patterns, goals completed, and how close you are to the 8-hour daily benchmark.
              </p>
              <button 
                onClick={generateAiFeedback}
                disabled={generationLocked}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg transition-all inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Sparkles size={20} />
                {generationLocked ? 'Generation Locked' : 'Get Started'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
