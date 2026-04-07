import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Edit2, Trash2, Check, Play, Square, Save, Lock, Clock, MessageSquare } from 'lucide-react';
import { getDisplayDate } from '../utils/dateUtils';
import { useProgress } from '../context/ProgressContext';

const TIMER_SESSION_PREFIX = 'students_tracker_timer_session_';
const ACTIVE_TIMER_KEY = 'students_tracker_active_timer_key';
const ACTIVE_TIMER_EVENT = 'students-tracker-active-timer-changed';

const Timer = ({ value, onChange, disabled, timerKey }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState((value || 0) * 3600);
  const [activeTimerKey, setActiveTimerKey] = useState('');
  const intervalRef = useRef(null);
  const runningBaseSecondsRef = useRef((value || 0) * 3600);
  const startedAtRef = useRef(null);
  const hasHydratedSessionRef = useRef(false);
  const skipNextValueSyncRef = useRef(false);

  const getStorageKey = () => `${TIMER_SESSION_PREFIX}${timerKey || 'default'}`;

  const readActiveTimerKey = () => {
    try {
      return window.localStorage.getItem(ACTIVE_TIMER_KEY) || '';
    } catch {
      return '';
    }
  };

  const writeActiveTimerKey = (nextValue) => {
    try {
      if (nextValue) {
        window.localStorage.setItem(ACTIVE_TIMER_KEY, nextValue);
      } else {
        window.localStorage.removeItem(ACTIVE_TIMER_KEY);
      }
    } catch {
      // Ignore storage write failures.
    }
    setActiveTimerKey(nextValue || '');
    window.dispatchEvent(new Event(ACTIVE_TIMER_EVENT));
  };

  const saveTimerSession = (session) => {
    if (!timerKey) return;
    try {
      window.localStorage.setItem(getStorageKey(), JSON.stringify(session));
    } catch {
      // Ignore storage write failures and keep timer functional in-memory.
    }
  };

  const loadTimerSession = () => {
    if (!timerKey) return null;
    try {
      const raw = window.localStorage.getItem(getStorageKey());
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const computeElapsedSeconds = () => {
    if (!startedAtRef.current) return runningBaseSecondsRef.current;
    const diff = Math.floor((Date.now() - startedAtRef.current) / 1000);
    return Math.max(0, runningBaseSecondsRef.current + diff);
  };

  useEffect(() => {
    setActiveTimerKey(readActiveTimerKey());

    const syncActiveTimer = () => {
      setActiveTimerKey(readActiveTimerKey());
    };

    const onStorage = (event) => {
      if (event.key === ACTIVE_TIMER_KEY) {
        syncActiveTimer();
      }
    };

    window.addEventListener(ACTIVE_TIMER_EVENT, syncActiveTimer);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(ACTIVE_TIMER_EVENT, syncActiveTimer);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    hasHydratedSessionRef.current = false;
    const session = loadTimerSession();

    if (!session) {
      setIsRunning(false);
      setSeconds((value || 0) * 3600);
      runningBaseSecondsRef.current = (value || 0) * 3600;
      startedAtRef.current = null;
      hasHydratedSessionRef.current = true;
      return;
    }

    runningBaseSecondsRef.current = Number(session.baseSeconds || 0);
    startedAtRef.current = session.isRunning ? Number(session.startedAt || Date.now()) : null;
    skipNextValueSyncRef.current = true;
    const currentlyActive = readActiveTimerKey();

    if (session.isRunning && (!currentlyActive || currentlyActive === timerKey)) {
      if (!currentlyActive) {
        writeActiveTimerKey(timerKey || '');
      }
      setIsRunning(true);
      setSeconds(computeElapsedSeconds());
    } else {
      setIsRunning(false);
      setSeconds(runningBaseSecondsRef.current);
      saveTimerSession({ isRunning: false, baseSeconds: runningBaseSecondsRef.current, startedAt: null });
    }

    hasHydratedSessionRef.current = true;
  }, [timerKey]);

  useEffect(() => {
    if (!hasHydratedSessionRef.current) return;
    if (skipNextValueSyncRef.current) {
      skipNextValueSyncRef.current = false;
      return;
    }

    if (!isRunning) {
      const nextSeconds = (value || 0) * 3600;
      setSeconds(nextSeconds);
      runningBaseSecondsRef.current = nextSeconds;
      startedAtRef.current = null;
      saveTimerSession({ isRunning: false, baseSeconds: nextSeconds, startedAt: null });
    }
  }, [value, isRunning]);

  const toggleTimer = () => {
    if (disabled) return;
    const currentlyActive = readActiveTimerKey();
    const hasOtherRunningTimer = Boolean(currentlyActive && currentlyActive !== timerKey);

    if (!isRunning && hasOtherRunningTimer) {
      window.alert('Only one timer can run at a time. Please stop the currently running timer first.');
      return;
    }

    if (isRunning) {
      const finalSeconds = computeElapsedSeconds();
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setSeconds(finalSeconds);
      runningBaseSecondsRef.current = finalSeconds;
      startedAtRef.current = null;
      saveTimerSession({ isRunning: false, baseSeconds: finalSeconds, startedAt: null });
      if (readActiveTimerKey() === timerKey) {
        writeActiveTimerKey('');
      }
      onChange(parseFloat((finalSeconds / 3600).toFixed(2)));
      setIsRunning(false);
    } else {
      runningBaseSecondsRef.current = seconds;
      startedAtRef.current = Date.now();
      saveTimerSession({
        isRunning: true,
        baseSeconds: runningBaseSecondsRef.current,
        startedAt: startedAtRef.current,
      });
      writeActiveTimerKey(timerKey || '');
      intervalRef.current = setInterval(() => {
        setSeconds(computeElapsedSeconds());
      }, 1000);
      setIsRunning(true);
    }
  };

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds(computeElapsedSeconds());
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning]);

  useEffect(() => () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const hrs = Math.floor(seconds / 3600);
  const mims = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const displayTime = `${hrs.toString().padStart(2, '0')}:${mims.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const isOtherTimerRunning = Boolean(activeTimerKey && activeTimerKey !== timerKey);
  const canStartThisTimer = !disabled && !isOtherTimerRunning;

  return (
    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
      {!disabled && (
        <button
          onClick={toggleTimer}
          disabled={!isRunning && !canStartThisTimer}
          className={`p-1.5 rounded-md flex items-center justify-center transition-colors relative ${isRunning ? 'bg-red-50 text-red-600 hover:bg-red-100 ring-1 ring-red-200' : canStartThisTimer ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          title={isRunning ? "Stop timer and save hours" : isOtherTimerRunning ? "Another timer is running" : "Start study timer"}
        >
          {isRunning && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
            </span>
          )}
          {isRunning ? <Square size={14} className="fill-current" /> : <Play size={14} className="fill-current" />}
        </button>
      )}
      <span className="text-xs font-mono text-slate-500 w-16">{displayTime}</span>
      <input
        type="number" step="0.1" min="0" value={value || ''}
        onChange={(e) => {
          const val = parseFloat(e.target.value) || 0;
          onChange(val);
          const nextSeconds = val * 3600;
          setSeconds(nextSeconds);
          runningBaseSecondsRef.current = nextSeconds;
          startedAtRef.current = null;
          saveTimerSession({ isRunning: false, baseSeconds: nextSeconds, startedAt: null });
        }}
        placeholder="Hours"
        className={`w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 ${disabled ? 'bg-slate-50/50 text-slate-500 border-slate-100 cursor-not-allowed' : 'bg-white border-slate-200'}`}
        disabled={isRunning || disabled}
      />
    </div>
  );
};


const GoalItem = ({ goal, dateKey, updateGoal, deleteGoal, dayReflection, updateReflection, isSubmitted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(goal.text);
  
  const goalReflection = dayReflection.goals?.find(r => r.goalId === goal.id) || { text: '', hours: 0 };
  const hasReflection = goalReflection.text?.trim() || goalReflection.hours > 0;

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== goal.text) {
      updateGoal(dateKey, goal.id, { text: editText });
    }
    setIsEditing(false);
  };

  const handleReflectionChange = (field, value) => {
    const currentGoals = dayReflection.goals || [];
    const existingIndex = currentGoals.findIndex(r => r.goalId === goal.id);
    let newGoals = [...currentGoals];
    
    if (existingIndex >= 0) {
      newGoals[existingIndex] = { ...newGoals[existingIndex], [field]: value };
    } else {
      newGoals.push({ goalId: goal.id, text: '', hours: 0, [field]: value });
    }
    updateReflection(dateKey, { ...dayReflection, goals: newGoals });
  };

  return (
    <div className={`bg-white border rounded-xl shadow-sm mb-4 overflow-hidden transition-all duration-200 ${hasReflection && !isSubmitted ? 'border-emerald-200 bg-emerald-50/10' : isSubmitted ? 'border-slate-100 opacity-90' : 'border-slate-100'}`}>
      <div className="flex items-start gap-3 p-3.5 group border-b border-slate-50">
        <div className="flex-1 min-w-0">
          {isEditing && !isSubmitted ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              onBlur={handleSaveEdit}
              className="w-full px-2 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              autoFocus
            />
          ) : (
            <p className={`text-sm tracking-wide transition-colors ${hasReflection && !isSubmitted ? 'text-emerald-700 font-medium' : isSubmitted ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>
              {goal.text}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
          {!isEditing && !isSubmitted && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
              >
                <Edit2 size={15} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteGoal(dateKey, goal.id); }} 
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`p-3 sm:p-4 flex flex-col gap-3 ${isSubmitted ? 'bg-white' : 'bg-slate-50/50'}`}>
        <textarea
          value={goalReflection.text}
          onChange={(e) => handleReflectionChange('text', e.target.value)}
          placeholder={isSubmitted ? "No reflection notes provided." : "Write your reflection for this goal..."}
          disabled={isSubmitted}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none resize-none h-16 ${isSubmitted ? 'bg-slate-50/50 border-slate-100 text-slate-600 cursor-not-allowed' : 'bg-white border-slate-200 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400'}`}
        />
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
            <Clock size={14} /> Time Logged
          </h4>
          <Timer 
            value={goalReflection.hours} 
            onChange={(val) => handleReflectionChange('hours', val)} 
            timerKey={`${dateKey}-goal-${goal.id}`}
            disabled={isSubmitted}
          />
        </div>
      </div>
    </div>
  );
};


export function DateModal({ date, dateKey, onClose, readOnly = false, goals: goalsOverride, reflections: reflectionsOverride }) {
  const progress = useProgress();
  const goals = goalsOverride || progress.goals;
  const reflections = reflectionsOverride || progress.reflections;
  const addGoal = progress.addGoal;
  const deleteGoal = progress.deleteGoal;
  const updateGoal = progress.updateGoal;
  const updateReflection = progress.updateReflection;
  const [newGoalText, setNewGoalText] = useState('');
  
  const dayGoals = goals[dateKey] || [];
  const dayReflection = reflections[dateKey] || { goals: [], challenge: '', extra: { text: '', hours: 0 } };
  const isSubmitted = dayReflection.submitted || false;
  const isLocked = isSubmitted || readOnly;

  const handleAdd = (e) => {
    if (readOnly) return;
    if (e && e.preventDefault) e.preventDefault();
    if (newGoalText.trim()) {
      addGoal(dateKey, newGoalText.trim());
      setNewGoalText('');
    }
  };

  const handleExtraChange = (field, value) => {
    if (readOnly) return;
    updateReflection(dateKey, {
      ...dayReflection,
      extra: { ...(dayReflection.extra || {}), [field]: value }
    });
  };

  const handleSubmitDay = () => {
    if (readOnly) return;
    if (window.confirm("Are you sure you want to submit this day? You will not be able to edit these goals or reflections again.")) {
      updateReflection(dateKey, { ...dayReflection, submitted: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={onClose}></div>

      <div className="bg-[#f8fafc] rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col relative z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
      
        <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {getDisplayDate(date)}
            {isLocked && (
              <span className="text-xs tracking-normal bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ml-2">
                <Lock size={12}/> {readOnly ? 'Read Only' : 'Locked'}
              </span>
            )}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Today's Goals</h3>
              <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                {dayGoals.filter(g => {
                  const ref = dayReflection.goals?.find(r => r.goalId === g.id);
                  return ref && (ref.text?.trim() || ref.hours > 0);
                }).length}/{dayGoals.length} Reflected
              </span>
            </div>

            <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2.5 text-xs text-indigo-800">
              <p className="font-semibold flex items-center gap-1.5">
                <Clock size={13} /> Set Hours with reflections for Better Feedback.
              </p>
              <p className="mt-1 leading-relaxed">
                Hours help AI and mentors understand your actual effort. You can use the timer (Start -&gt; Stop) or enter hours manually.
              </p>
            </div>

            {!isLocked && (
              <div className="flex gap-2 mb-6 shadow-sm">
                <input
                  type="text" value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd(e);
                  }}
                  placeholder="What do you want to accomplish?"
                  className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAdd} disabled={!newGoalText.trim()}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl flex items-center gap-1.5 hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors font-medium text-sm"
                >
                  <Plus size={16} /> <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            )}

            <div className="space-y-1">
              {dayGoals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-70 border-2 border-dashed border-slate-200 rounded-xl">
                  <span className="text-3xl mb-3">🌱</span>
                  <p className="text-sm text-slate-500 font-medium">No goals planned for this day.</p>
                </div>
              ) : (
                dayGoals.map((goal) => (
                  <GoalItem 
                    key={goal.id} goal={goal} dateKey={dateKey} 
                    updateGoal={updateGoal} deleteGoal={deleteGoal}
                    dayReflection={dayReflection} updateReflection={updateReflection}
                    isSubmitted={isLocked}
                  />
                ))
              )}
            </div>
          </section>

          <section className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-rose-500" /> You Faced Any Challenges?
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Mention blockers you hit today so your mentor can help faster.
            </p>
            <textarea
              value={dayReflection.challenge || ''}
              onChange={(e) => updateReflection(dateKey, { ...dayReflection, challenge: e.target.value })}
              placeholder={isLocked ? 'No challenges were added for this day.' : 'Example: DSA recursion me dikkat aayi, or API debugging me 2 hours lag gaye...'}
              disabled={isLocked}
              className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none resize-y h-24 ${isLocked ? 'bg-slate-50/50 border-slate-100 text-slate-600 cursor-not-allowed' : 'bg-white border-slate-200 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400'}`}
            />
          </section>

          <section className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-500" /> Unplanned Work
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <p className="text-xs text-slate-500">Write any extra work, learning, or tasks you did that were not planned earlier.</p>
              <Timer value={dayReflection.extra?.hours} onChange={(val) => handleExtraChange('hours', val)} timerKey={`${dateKey}-extra`} disabled={isLocked} />
            </div>
            <textarea
              value={dayReflection.extra?.text || ''}
              onChange={(e) => handleExtraChange('text', e.target.value)}
              placeholder={isLocked ? "No extra summary provided." : "Did anything else happen today?"}
              disabled={isLocked}
              className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none resize-y h-24 ${isLocked ? 'bg-slate-50/50 border-slate-100 text-slate-600 cursor-not-allowed' : 'bg-white border-slate-200 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400'}`}
            />
          </section>

          {!isLocked && dayGoals.length > 0 && (
            <div className="pt-2 pb-6 flex justify-end">
              <button
                onClick={handleSubmitDay}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all font-medium text-sm flex items-center gap-2"
              >
                <Lock size={16} /> Lock & Submit Day
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
