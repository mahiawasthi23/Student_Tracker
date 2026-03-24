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
  const cellTitle = isClickable
    ? `Click to add or update tasks for ${dateKey}`
    : `Past date locked. Open recent days or days with existing data.`;

  return (
    <div
      onClick={() => isClickable && onClick(day, dateKey)}
      title={cellTitle}
      className={`relative min-h-[94px] sm:min-h-[112px] lg:min-h-[124px] h-full rounded-2xl border p-2 sm:p-2.5 flex flex-col transition-all duration-300 group
        ${!isCurrentMonth ? 'bg-slate-50/70 opacity-60 border-slate-100' : 'bg-white/90'}
        ${isSelected ? 'border-transparent bg-[linear-gradient(to_right,_#f58fcb,_#9ea9ef)] text-slate-900 ring-2 ring-pink-300/45 shadow-lg shadow-pink-200/50' : 'border-pink-100'}
        ${hasActivity && !isSelected && isCurrentMonth ? 'border-purple-200 bg-[linear-gradient(to_right,_rgba(251,194,235,0.14),_rgba(166,193,238,0.14))]' : ''}
        ${isCurrentDay && !isSelected ? 'ring-2 ring-pink-200/80 border-pink-300' : ''}
        ${isClickable ? 'cursor-pointer hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md hover:bg-[linear-gradient(to_right,_rgba(251,194,235,0.2),_rgba(166,193,238,0.2))]' : 'opacity-55 cursor-not-allowed'}
      `}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full transition-colors
          ${isCurrentDay 
            ? isSelected
              ? 'bg-white/85 text-slate-900 font-bold border border-white/90'
              : 'bg-[linear-gradient(to_right,_#f58fcb,_#9ea9ef)] text-white font-bold shadow-sm' 
            : isSelected
              ? 'bg-white/80 text-slate-900 font-bold border border-white/90'
              : isCurrentMonth 
              ? 'text-slate-700 font-semibold group-hover:text-pink-700' 
              : 'text-slate-400 font-medium'}
        `}>
          {day.getDate()}
        </span>

        <div className="flex items-center gap-1 mt-1">
          {hasReflection && (
            <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-800/80' : 'bg-pink-500'}`} title="Reflection saved"></div>
          )}
          {hasGoals && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${isSelected ? 'bg-white/80 text-slate-900 border border-white/90' : 'bg-purple-50 text-purple-700 border border-purple-100'}`}>
              {dayGoals.length}
            </span>
          )}
          {hasActivity && !hasReflection && !hasGoals && (
            <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-800/80' : 'bg-purple-500'}`} title="Activity available"></div>
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
                  ? isSelected
                    ? 'bg-white/80 text-slate-900 border-white/90'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : isSelected
                    ? 'bg-white/80 text-slate-900 border-white/90'
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
            <span className={`inline-block text-[10px] font-semibold border rounded-md px-2 py-1 ${isSelected ? 'text-slate-900 bg-white/80 border-white/90' : 'text-pink-700 bg-pink-50 border-pink-100'}`}>
              + Add Goal
            </span>
          </div>
        )}

        {dayGoals.length > 3 && (
          <div className={`text-[10px] font-medium pl-1 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
            + {dayGoals.length - 3} more
          </div>
        )}
      </div>

      {isCurrentMonth && (
        <div className="pointer-events-none absolute left-2 right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
          <div className={`rounded-lg backdrop-blur-sm px-2 py-1.5 shadow-lg border ${isSelected ? 'border-white/80 bg-white/85' : 'border-pink-100/90 bg-white/95'}`}>
            <p className={`text-[10px] font-medium ${isSelected ? 'text-slate-800' : 'text-slate-600'}`}>{completedGoals}/{dayGoals.length} done • {totalHours.toFixed(1)}h</p>
          </div>
        </div>
      )}

      {!isClickable && (
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center rounded-2xl group-hover:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-red-500 bg-red-50 shadow-md">
            <span className="relative block h-4 w-4 rounded-full border-2 border-red-500">
              <span className="absolute left-1/2 top-1/2 h-0.5 w-3 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-red-500" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
