import React, { useState } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, 
  addMonths, subMonths, format, isSameMonth, differenceInDays
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, X } from 'lucide-react';
import { DayCell } from './DayCell';
import { useProgress } from '../context/ProgressContext';
import { formatDateKey } from '../utils/dateUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function Calendar({ onDateSelect, goals: goalsOverride, reflections: reflectionsOverride, readOnly = false }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(new Date()));
  const [hideCalendarHint, setHideCalendarHint] = useLocalStorage('calendar_click_hint_dismissed', false);
  const progress = useProgress();
  const goals = goalsOverride || progress.goals;
  const reflections = reflectionsOverride || progress.reflections;

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    const todayKey = formatDateKey(today);
    setCurrentMonth(today);
    setSelectedDateKey(todayKey);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleSelectDate = (day, dateKey) => {
    setSelectedDateKey(dateKey);
    onDateSelect(day, dateKey);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-pink-100/80 bg-[linear-gradient(to_right,_rgba(251,194,235,0.14),_rgba(166,193,238,0.16))] shadow-lg backdrop-blur-sm flex flex-col">
      <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-pink-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-indigo-200/30 blur-3xl" />
      {/* Header */}
      <div className="relative px-4 sm:px-6 py-4 border-b border-pink-100/80 bg-white/70">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[linear-gradient(to_right,_#fbc2eb,_#a6c1ee)] text-white grid place-items-center border border-white/80 shadow-md shadow-pink-200/50">
              <CalendarIcon size={18} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 min-w-[160px]">
                {format(currentMonth, dateFormat)}
              </h2>
              <p className="inline-block mt-1 rounded-full bg-[linear-gradient(to_right,_rgba(251,194,235,0.28),_rgba(166,193,238,0.28))] px-2 py-0.5 text-[11px] sm:text-xs text-slate-600">
                Plan your month with clean daily focus
              </p>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <button 
              onClick={goToToday}
              hidden={isSameMonth(currentMonth, new Date())}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-pink-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow hover:bg-[linear-gradient(to_right,_rgba(251,194,235,0.2),_rgba(166,193,238,0.2))]"
            >
              Today
            </button>

            <button 
              onClick={prevMonth}
              className="p-2 rounded-xl border border-pink-200 bg-white/95 text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow hover:bg-[linear-gradient(to_right,_rgba(251,194,235,0.2),_rgba(166,193,238,0.2))]"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 rounded-xl border border-pink-200 bg-white/95 text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow hover:bg-[linear-gradient(to_right,_rgba(251,194,235,0.2),_rgba(166,193,238,0.2))]"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {!hideCalendarHint && (
        <div className="mx-3 sm:mx-4 mt-3 mb-1 rounded-2xl border border-pink-200/70 bg-[linear-gradient(to_right,_rgba(251,194,235,0.3),_rgba(166,193,238,0.3))] px-3 py-3 sm:px-4 sm:py-3.5 flex items-start justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-2.5 text-slate-700">
            <span className="mt-0.5 text-pink-700"><Sparkles size={15} /></span>
            <p className="text-xs sm:text-sm leading-relaxed">
              New here? Click any day box to add tasks, reflections, and your end-of-day summary.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHideCalendarHint(true)}
            className="shrink-0 rounded-lg p-1 text-slate-500 transition-all duration-200 hover:text-slate-700 hover:bg-white/60 hover:rotate-90"
            aria-label="Dismiss calendar hint"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-7 border-b border-pink-100/80 bg-[linear-gradient(to_right,_rgba(251,194,235,0.2),_rgba(166,193,238,0.2))]">
        {weekDays.map(day => (
          <div key={day} className="py-2.5 text-center text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-[0.12em]">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 p-2 sm:gap-2.5 sm:p-2.5 bg-white/70 auto-rows-fr animate-in fade-in zoom-in-95 duration-300">
        {days.map((day, idx) => {
          const dateKey = formatDateKey(day);
          const dayGoals = goals[dateKey] || [];
          const dayReflection = reflections[dateKey] || {};
          
          const today = new Date();
          const daysAgo = differenceInDays(today, day);
          const hasData = dayGoals.length > 0 || Object.keys(dayReflection).length > 0;
          const isClickable = readOnly ? true : daysAgo <= 3 || (daysAgo > 3 && hasData);

          return (
            <DayCell 
              key={idx} 
              day={day} 
              currentMonth={currentMonth} 
              dateKey={dateKey}
              dayGoals={dayGoals}
              dayReflection={dayReflection}
              isSelected={selectedDateKey === dateKey}
              onClick={handleSelectDate}
              isClickable={isClickable}
            />
          );
        })}
      </div>
    </div>
  );
}
