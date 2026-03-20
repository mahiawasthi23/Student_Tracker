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
  const { goals, reflections } = useProgress();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h2 className="text-xl font-bold text-slate-800 min-w-[140px]">
            {format(currentMonth, dateFormat)}
          </h2>
          <button 
            onClick={goToToday}
            hidden={isSameMonth(currentMonth, new Date())}
            className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
          >
            Today
          </button>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-1.5 8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {weekDays.map(day => (
          <div key={day} className="py-2.5 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7 flex-1 bg-white border-l border-slate-100 auto-rows-fr">
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
              onClick={onDateSelect}
            />
          );
        })}
      </div>
    </div>
  );
}
