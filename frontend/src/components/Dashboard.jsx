import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useProgress } from '../context/ProgressContext';
import { Sparkles, Clock, CheckCircle2, CalendarDays, ArrowRight, Flame, MessageSquare } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { buildProgressStats, buildSubmissionHeatmap } from '../utils/progressStats';

const StatsCard = ({ title, value, icon, colorClass }) => (
  <div className="group bg-white/90 backdrop-blur p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
    <div className={`p-3.5 sm:p-4 rounded-xl ${colorClass} transition-transform duration-300 group-hover:scale-105`}>
      {React.createElement(icon, { size: 22 })}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-slate-800 truncate">{value}</p>
    </div>
  </div>
);

export function Dashboard({ setView }) {
  const { goals, reflections, streak } = useProgress();
  const [filter, setFilter] = useState('month'); 
  const [heatmapRange, setHeatmapRange] = useState('6');
  const [customRange, setCustomRange] = useState({ 
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'), 
    end: format(new Date(), 'yyyy-MM-dd') 
  });

  const stats = useMemo(
    () => buildProgressStats({ goals, reflections, filter, customRange }),
    [goals, reflections, filter, customRange]
  );

  const heatmap = useMemo(
    () => buildSubmissionHeatmap({ goals, reflections, months: Number(heatmapRange) }),
    [goals, reflections, heatmapRange]
  );

  const monthLabelByWeek = useMemo(() => {
    const labels = Array.from({ length: heatmap.weeks.length }, () => '');
    heatmap.monthLabels.forEach((month) => {
      if (month.weekIndex >= 0 && month.weekIndex < labels.length) {
        labels[month.weekIndex] = month.label;
      }
    });
    return labels;
  }, [heatmap.monthLabels, heatmap.weeks.length]);

  const getHeatColor = (submissions, inRange) => {
    if (!inRange) return 'bg-slate-100';
    if (submissions <= 0) return 'bg-slate-200';
    if (submissions === 1) return 'bg-emerald-200';
    if (submissions <= 3) return 'bg-emerald-400';
    if (submissions <= 5) return 'bg-emerald-600';
    return 'bg-emerald-800';
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Your Dashboard</h2>
          <p className="text-slate-500 text-sm">Track your progress and insights.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl focus:ring-2 focus:ring-indigo-500 block p-2.5 shadow-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Range</option>
          </select>

          {filter === 'custom' && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
              <input 
                type="date" 
                value={customRange.start} 
                onChange={e => setCustomRange(prev => ({...prev, start: e.target.value}))}
                className="text-sm px-2 py-1.5 text-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
              />
              <span className="text-slate-400 text-sm">to</span>
              <input 
                type="date" 
                value={customRange.end} 
                onChange={e => setCustomRange(prev => ({...prev, end: e.target.value}))}
                className="text-sm px-2 py-1.5 text-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4 sm:gap-6">
        <StatsCard 
          title="Total Hours" 
          value={`${stats.totalHours}h`} 
          icon={Clock} 
          colorClass="bg-blue-50 text-blue-600" 
        />
        <StatsCard 
          title="Current Streak" 
          value={`${streak?.currentStreak || 0} days`} 
          icon={Flame} 
          colorClass="bg-orange-50 text-orange-600" 
        />
        <StatsCard 
          title="Active Days" 
          value={stats.activeDays} 
          icon={CalendarDays} 
          colorClass="bg-emerald-50 text-emerald-600" 
        />
        <StatsCard 
          title="Goals Completed" 
          value={`${stats.goalsCompleted}/${stats.totalGoalsCount}`} 
          icon={CheckCircle2} 
          colorClass="bg-purple-50 text-purple-600" 
        />
        <StatsCard 
          title="Reflections" 
          value={stats.totalReflections} 
          icon={MessageSquare} 
          colorClass="bg-amber-50 text-amber-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 text-lg">Hours by Day</h3>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg tracking-wide uppercase">Total</span>
          </div>
          <div className="flex-1">
            {Number(stats.totalHours) === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-70 pb-10">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
                  <Clock size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-700 mb-2">No logged hours in this range</h3>
                <p className="text-slate-500 text-sm max-w-xs text-center">Start your timer in the Calendar to see activity chart populate here.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }}
                    tickMargin={10}
                    height={44}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} />
                  <Tooltip 
                    formatter={(value) => [`${value} hrs`, 'Logged Time']}
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Call to action for new AI Review page */}
        <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-8 rounded-3xl shadow-lg shadow-indigo-200 text-white flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
              <Sparkles size={32} className="text-indigo-100 animate-pulse" />
            </div>
            
            <h3 className="font-bold text-2xl mb-3">Gemini Analysis</h3>
            <p className="text-indigo-100/90 text-sm mb-8 leading-relaxed max-w-[250px]">
              Ready for a deep dive? Let Gemini 2.5 Flash precisely analyze your productivity habits and generate actionable advice.
            </p>
            
            <button 
              onClick={() => setView('ai')}
              className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold shadow-xl shadow-indigo-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 w-full justify-center group/btn"
            >
              Open AI Insights
              <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Submissions Heat Map</h3>
            <p className="text-slate-500 text-sm mt-1">
              {heatmap.totalSubmissions} tasks logged across {heatmap.totalDaysWithSubmissions} active days.
            </p>
          </div>
          <select
            value={heatmapRange}
            onChange={(event) => setHeatmapRange(event.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl focus:ring-2 focus:ring-indigo-500 block p-2.5 shadow-sm"
          >
            <option value="3">Last 3 Months</option>
            <option value="6">Last 6 Months</option>
            <option value="12">Last 12 Months</option>
          </select>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[560px] sm:min-w-[700px]">
            <div className="ml-10 sm:ml-12 mb-2 h-5 grid grid-flow-col auto-cols-[13px] sm:auto-cols-[16px] gap-[3px] sm:gap-1">
              {monthLabelByWeek.map((label, index) => (
                <span
                  key={`month-col-${index}`}
                  className="text-[11px] sm:text-xs text-slate-500 whitespace-nowrap"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="flex gap-2 sm:gap-3">
              <div className="w-8 sm:w-9 pt-[1px] text-[11px] sm:text-xs text-slate-500">
                <div className="h-[15px] sm:h-4 mb-1 opacity-0">Sun</div>
                <div className="h-[15px] sm:h-4 mb-1">Mon</div>
                <div className="h-[15px] sm:h-4 mb-1 opacity-0">Tue</div>
                <div className="h-[15px] sm:h-4 mb-1">Wed</div>
                <div className="h-[15px] sm:h-4 mb-1 opacity-0">Thu</div>
                <div className="h-[15px] sm:h-4 mb-1">Fri</div>
                <div className="h-[15px] sm:h-4 opacity-0">Sat</div>
              </div>

              <div className="flex gap-[3px] sm:gap-1">
                {heatmap.weeks.map((week, weekIndex) => (
                  <div key={`week-${weekIndex}`} className="flex flex-col gap-[3px] sm:gap-1">
                    {week.map((day) => (
                      <div
                        key={day.dateKey}
                        className={`w-[13px] h-[13px] sm:w-4 sm:h-4 rounded-[3px] sm:rounded-[4px] transition-transform duration-150 hover:scale-110 ${getHeatColor(day.submissions, day.inRange)}`}
                        title={`${format(day.date, 'EEE, MMM d, yyyy')} • ${day.submissions} submissions`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-500">
          <span>Less</span>
          <span className="w-3.5 h-3.5 rounded-[3px] bg-slate-200" />
          <span className="w-3.5 h-3.5 rounded-[3px] bg-emerald-200" />
          <span className="w-3.5 h-3.5 rounded-[3px] bg-emerald-400" />
          <span className="w-3.5 h-3.5 rounded-[3px] bg-emerald-600" />
          <span className="w-3.5 h-3.5 rounded-[3px] bg-emerald-800" />
          <span>More</span>
        </div>
      </div>

    </div>
  );
}
