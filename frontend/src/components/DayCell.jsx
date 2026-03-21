import React from 'react';
import { isSameMonth, isToday } from 'date-fns';

export function DayCell({ day, currentMonth, dateKey, dayGoals = [], dayReflection = {}, isSelected = false, onClick, isClickable = true }) {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isCurrentDay = isToday(day);

  // Determine if there's any reflection for this day
  const hasReflection = (dayReflection.goals && dayReflection.goals.length > 0) || 
                        (dayReflection.extra && dayReflection.extra.text);

  const completedGoals = dayGoals.filter((goal) => {
    const goalRef = dayReflection?.goals?.find(r => r.goalId === goal.id);
    return goalRef && (goalRef.text?.trim() || goalRef.hours > 0);
  }).length;

  const hoursFromGoals = (dayReflection?.goals || []).reduce(
    (sum, goal) => sum + Number(goal.hours || 0),
    0
  );
  const totalHours = Number(hoursFromGoals + Number(dayReflection?.extra?.hours || 0));
  const hasGoals = dayGoals.length > 0;
  const hasActivity = hasGoals || hasReflection || totalHours > 0;

  return (
    <div
      onClick={() => isClickable && onClick(day, dateKey)}
      className={`relative min-h-[94px] sm:min-h-[112px] lg:min-h-[124px] h-full rounded-xl border p-2 sm:p-2.5 flex flex-col transition-all duration-200 group
        ${!isCurrentMonth ? 'bg-slate-50 opacity-65 border-slate-100' : 'bg-white hover:shadow-md hover:-translate-y-0.5'}
        ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' : 'border-slate-200'}
        ${hasActivity && !isSelected && isCurrentMonth ? 'border-emerald-200 bg-emerald-50/30' : ''}
        ${isClickable ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
      `}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full transition-colors
          ${isCurrentDay 
            ? 'bg-indigo-600 text-white font-bold shadow-sm' 
            : isSelected
              ? 'bg-indigo-100 text-indigo-700 font-bold'
              : isCurrentMonth 
              ? 'text-slate-700 font-semibold group-hover:text-indigo-600' 
              : 'text-slate-400 font-medium'}
        `}>
          {day.getDate()}
        </span>

        <div className="flex items-center gap-1 mt-1">
          {hasReflection && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Reflection saved"></div>
          )}
          {hasGoals && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {dayGoals.length}
            </span>
          )}
        </div>
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

        {!hasGoals && isCurrentMonth && (
          <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="inline-block text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-1">
              + Add Goal
            </span>
          </div>
        )}

        {dayGoals.length > 3 && (
          <div className="text-[10px] font-medium text-slate-500 pl-1">
            + {dayGoals.length - 3} more
          </div>
        )}
      </div>

      {isCurrentMonth && (
        <div className="pointer-events-none absolute left-2 right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
          <div className="rounded-lg border border-slate-200/90 bg-white/95 backdrop-blur-sm px-2 py-1.5 shadow-lg">
            <p className="text-[10px] text-slate-600 font-medium">{completedGoals}/{dayGoals.length} done • {totalHours.toFixed(1)}h</p>
          </div>
        </div>
      )}
    </div>
  );
}
