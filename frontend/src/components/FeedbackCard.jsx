import React from 'react';
import { 
  TrendingUp, Zap, Target, Clock, AlertCircle, 
  BookOpenCheck, AlertTriangle, Lightbulb 
} from 'lucide-react';

const categoryConfig = {
  productivity: {
    icon: TrendingUp,
    title: '💪 Productivity',
    color: 'emerald',
  },
  consistency: {
    icon: Zap,
    title: '⛓️ Consistency',
    color: 'blue',
  },
  goalQuality: {
    icon: Target,
    title: '🎯 Goal Quality',
    color: 'purple',
  },
  timeUsage: {
    icon: Clock,
    title: '⏱️ Time Usage',
    color: 'orange',
  },
  pattern: {
    icon: AlertCircle,
    title: '📊 Patterns',
    color: 'rose',
  },
  reflection: {
    icon: BookOpenCheck,
    title: '💭 Reflection',
    color: 'indigo',
  },
  challenges: {
    icon: AlertTriangle,
    title: '⚠️ Challenges & Fix',
    color: 'amber',
  },
  nextAction: {
    icon: Lightbulb,
    title: '🚀 Next Steps',
    color: 'cyan',
  },
};

export function FeedbackCard({ category, items = [] }) {
  if (!items || items.length === 0) return null;

  const config = categoryConfig[category];
  if (!config) return null;

  const Icon = config.icon;
  const colorClass = {
    emerald: 'from-emerald-200 to-emerald-100 border-emerald-500',
    blue: 'from-blue-200 to-blue-100 border-blue-500',
    purple: 'from-purple-200 to-purple-100 border-purple-600',
    orange: 'from-orange-200 to-orange-100 border-orange-500',
    rose: 'from-rose-200 to-rose-100 border-rose-500',
    indigo: 'from-indigo-200 to-indigo-100 border-indigo-600',
    amber: 'from-yellow-200 to-yellow-100 border-yellow-500',
    cyan: 'from-cyan-200 to-cyan-100 border-cyan-500',
  };

  const iconClass = {
    emerald: 'text-emerald-800 bg-emerald-300 ring-2 ring-emerald-400',
    blue: 'text-blue-800 bg-blue-300 ring-2 ring-blue-400',
    purple: 'text-purple-800 bg-purple-300 ring-2 ring-purple-400',
    orange: 'text-orange-800 bg-orange-300 ring-2 ring-orange-400',
    rose: 'text-rose-800 bg-rose-300 ring-2 ring-rose-400',
    indigo: 'text-indigo-800 bg-indigo-300 ring-2 ring-indigo-400',
    amber: 'text-yellow-800 bg-yellow-300 ring-2 ring-yellow-400',
    cyan: 'text-cyan-800 bg-cyan-300 ring-2 ring-cyan-400',
  };

  const shadowColor = {
    emerald: 'shadow-lg shadow-emerald-300',
    blue: 'shadow-lg shadow-blue-300',
    purple: 'shadow-lg shadow-purple-300',
    orange: 'shadow-lg shadow-orange-300',
    rose: 'shadow-lg shadow-rose-300',
    indigo: 'shadow-lg shadow-indigo-300',
    amber: 'shadow-lg shadow-yellow-300',
    cyan: 'shadow-lg shadow-cyan-300',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClass[config.color]} p-6 rounded-2xl border-3 ${shadowColor[config.color]} hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 -skew-x-12 group-hover:translate-x-full transition-all duration-700 pointer-events-none rounded-2xl"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`${iconClass[config.color]} p-3 rounded-lg shadow-md transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
            <Icon size={22} />
          </div>
          <h3 className="font-black text-slate-800 text-base group-hover:text-slate-900 transition-colors">{config.title}</h3>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 group/item">
              <span className={`${iconClass[config.color].split(' ')[0]} text-sm font-black mt-0.5 flex-shrink-0 opacity-70 group-hover/item:opacity-100 transition-opacity`}>▸</span>
              <p className="text-slate-700 text-sm leading-snug font-semibold group-hover/item:text-slate-900 group-hover/item:translate-x-1 transition-all duration-200">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
