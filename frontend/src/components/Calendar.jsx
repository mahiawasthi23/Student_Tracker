import React, { useState } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, 
  addMonths, subMonths, format, isSameMonth
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { DayCell } from './DayCell';
import { useProgress } from '../context/ProgressContext';
import { formatDateKey } from '../utils/dateUtils';

export function Calendar({ onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(new Date()));
  const { goals, reflections } = useProgress();

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center border border-indigo-100">
              <CalendarIcon size={18} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 min-w-[140px]">
                {format(currentMonth, dateFormat)}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Plan your month with clean daily focus</p>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <button 
              onClick={goToToday}
              hidden={isSameMonth(currentMonth, new Date())}
              className="text-xs font-semibold px-3 py-1.5 bg-white text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Today
            </button>

            <button 
              onClick={prevMonth}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-sm"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-sm"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">
        {weekDays.map(day => (
          <div key={day} className="py-2.5 text-center text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7 gap-1.5 p-1.5 sm:p-2 bg-white auto-rows-fr animate-in fade-in duration-200">
        {days.map((day, idx) => {
          const dateKey = formatDateKey(day);
          const dayGoals = goals[dateKey] || [];
          const dayReflection = reflections[dateKey] || {};

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
            />
          );
        })}
      </div>
    </div>
  );
}
