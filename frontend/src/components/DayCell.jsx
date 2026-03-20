import React from 'react';
import { isSameMonth, isToday } from 'date-fns';

export function DayCell({ day, currentMonth, dateKey, dayGoals = [], dayReflection = {}, onClick }) {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isCurrentDay = isToday(day);

  // Determine if there's any reflection for this day
  const hasReflection = (dayReflection.goals && dayReflection.goals.length > 0) || 
                        (dayReflection.extra && dayReflection.extra.text);

  return (
    <div
      onClick={() => onClick(day, dateKey)}
      className={`min-h-[120px] h-full border-r border-b border-slate-100 p-2 flex flex-col cursor-pointer transition-colors group
        ${!isCurrentMonth ? 'bg-slate-100 opacity-60' : 'bg-white hover:bg-slate-50'}
      `}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full
          ${isCurrentDay 
            ? 'bg-indigo-600 text-white font-bold shadow-sm' 
            : isCurrentMonth 
              ? 'text-slate-700 font-semibold group-hover:text-indigo-600' 
              : 'text-slate-400 font-medium'}
        `}>
          {day.getDate()}
        </span>
        {hasReflection && (
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" title="Reflection saved"></div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
        {dayGoals.slice(0, 3).map((goal) => {
          const goalRef = dayReflection?.goals?.find(r => r.goalId === goal.id);
          const isCompleted = goalRef && (goalRef.text?.trim() || goalRef.hours > 0);
          
          return (
            <div 
              key={goal.id} 
              className={`text-[10px] leading-tight px-1.5 py-1 rounded truncate border shadow-sm
                ${isCompleted 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                }`}
              title={goal.text}
            >
              {goal.text}
            </div>
          );
        })}
        {dayGoals.length > 3 && (
          <div className="text-[10px] font-medium text-slate-500 pl-1">
            + {dayGoals.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}
