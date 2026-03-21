import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useProgress } from '../context/ProgressContext';
import { Sparkles, Clock, CheckCircle2, CalendarDays, ArrowRight, Flame } from 'lucide-react';
import { 
  format, parseISO, startOfMonth, endOfMonth, isWithinInterval, 
  startOfWeek, endOfWeek, subDays, eachDayOfInterval
} from 'date-fns';

const StatsCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className={`p-4 rounded-xl ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export function Dashboard({ setView }) {
  const { goals, reflections, streak } = useProgress();
  const [filter, setFilter] = useState('month'); 
  const [customRange, setCustomRange] = useState({ 
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'), 
    end: format(new Date(), 'yyyy-MM-dd') 
  });

  // Derive stats
  const stats = useMemo(() => {
    let totalHours = 0;
    let activeDaysCount = 0;
    let goalsCompleted = 0;
    let totalGoalsCount = 0;
    
    const today = new Date();
    
    let intervalStart, intervalEnd;
    if (filter === 'month') {
      intervalStart = startOfMonth(today);
      intervalEnd = endOfMonth(today);
    } else if (filter === 'week') {
      intervalStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
      intervalEnd = endOfWeek(today, { weekStartsOn: 1 });
    } else if (filter === 'custom' && customRange.start && customRange.end) {
      intervalStart = parseISO(customRange.start);
      intervalEnd = parseISO(customRange.end);
    }

    let chartData = [];
    const allKeys = new Set([...Object.keys(goals), ...Object.keys(reflections)]);
    
    // Build days array
    if (filter === 'all') {
      const sortedKeys = Array.from(allKeys).sort();
      if (sortedKeys.length > 0) {
        intervalStart = parseISO(sortedKeys[0]);
        intervalEnd = parseISO(sortedKeys[sortedKeys.length - 1] > format(today, 'yyyy-MM-dd') ? sortedKeys[sortedKeys.length - 1] : format(today, 'yyyy-MM-dd'));
      } else {
        intervalStart = subDays(today, 7);
        intervalEnd = today;
      }
    }

    if (intervalStart && intervalEnd && intervalStart <= intervalEnd) {
      const days = eachDayOfInterval({ start: intervalStart, end: intervalEnd });
      
      chartData = days.map(d => {
        const dateKey = format(d, 'yyyy-MM-dd');
        const dayGoalsArr = goals[dateKey] || [];
        const dayRef = reflections[dateKey] || {};
        
        let dayHours = 0;
        let dayCompletedGoals = 0;
        
        totalGoalsCount += dayGoalsArr.length;

        if (dayRef.goals) {
          dayRef.goals.forEach(g => {
            dayHours += Number(g.hours || 0);
            if (g.text?.trim() || g.hours > 0) dayCompletedGoals += 1;
          });
        }
        if (dayRef.extra) {
          dayHours += Number(dayRef.extra.hours || 0);
        }

        if (dayHours > 0 || dayCompletedGoals > 0) activeDaysCount += 1;
        totalHours += dayHours;
        goalsCompleted += dayCompletedGoals;

        return {
          dateKey,
          name: format(d, days.length > 14 ? 'MMM d' : 'EEE, MMM d'),
          hours: Number(dayHours.toFixed(1))
        };
      });
    }

    return {
      totalHours: totalHours.toFixed(1),
      activeDays: activeDaysCount,
      goalsCompleted,
      totalGoalsCount,
      chartData: chartData
    };
  }, [goals, reflections, filter, customRange]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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

    </div>
  );
}
