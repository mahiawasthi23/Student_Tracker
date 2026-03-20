import React, { useMemo, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Sparkles, TrendingUp, Loader2, Key, Calendar as CalendarIcon, Target, Clock, Zap, AlertCircle } from 'lucide-react';
import { 
  format, parseISO, startOfMonth, endOfMonth, isWithinInterval, 
  startOfWeek, endOfWeek, subDays, eachDayOfInterval
} from 'date-fns';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function AIReview() {
  const { goals, reflections } = useProgress();
  const [filter, setFilter] = useState('month'); 
  const [customRange, setCustomRange] = useState({ 
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'), 
    end: format(new Date(), 'yyyy-MM-dd') 
  });
  
  const [geminiKey, setGeminiKey] = useLocalStorage('gemini_api_key', '');
  const [isEditingKey, setIsEditingKey] = useState(!geminiKey);
  const [keyInput, setKeyInput] = useState(geminiKey || '');

  const [gbuResult, setGbuResult] = useState(null);

  // Derive stats (Same powerful logic as Dashboard)
  const stats = useMemo(() => {
    let totalHours = 0;
    let activeDaysCount = 0;
    let goalsCompleted = 0;
    let totalGoalsCount = 0;
    let totalReflections = 0;
    
    const today = new Date();
    
    let intervalStart, intervalEnd;
    if (filter === 'month') {
      intervalStart = startOfMonth(today);
      intervalEnd = endOfMonth(today);
    } else if (filter === 'week') {
      intervalStart = startOfWeek(today, { weekStartsOn: 1 });
      intervalEnd = endOfWeek(today, { weekStartsOn: 1 });
    } else if (filter === 'custom' && customRange.start && customRange.end) {
      intervalStart = parseISO(customRange.start);
      intervalEnd = parseISO(customRange.end);
    }

    let chartData = [];
    let reviewTexts = [];
    const allKeys = new Set([...Object.keys(goals), ...Object.keys(reflections)]);
    
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
            if (g.text?.trim()) {
               totalReflections += 1;
               reviewTexts.push(g.text);
            }
          });
        }
        if (dayRef.extra) {
          dayHours += Number(dayRef.extra.hours || 0);
          if (dayRef.extra.text?.trim()) {
            totalReflections += 1;
            reviewTexts.push(dayRef.extra.text);
          }
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

    setGbuResult(null);

    return {
      totalHours: totalHours.toFixed(1),
      activeDays: activeDaysCount,
      goalsCompleted,
      totalGoalsCount,
      totalReflections,
      chartData,
      reviewTexts: reviewTexts.slice(-20) // Only send latest 20 reflections to avoid blowing up token limits
    };
  }, [goals, reflections, filter, customRange]);

  const handleSaveKey = () => {
    setGeminiKey(keyInput.trim());
    setIsEditingKey(false);
  };

  const generateGBU = async () => {
    if (!geminiKey) {
      setIsEditingKey(true);
      return;
    }

    setGbuResult({ isGenerating: true });
    
    try {
      const { totalHours, activeDays, goalsCompleted, totalGoalsCount, totalReflections, chartData, reviewTexts } = stats;
      const totalDays = chartData.length || 1;
      
      const prompt = `
      You are an insightful and world-class productivity coach. Analyze the user's tracking data for the selected period (${filter}):
      - Total Hours Logged: ${totalHours}
      - Active Days Logged: ${activeDays} out of ${totalDays}
      - Goals Completed: ${goalsCompleted} out of ${totalGoalsCount}
      - Total Reflection Notes Written: ${totalReflections}

      Daily Hours Breakdown:
      ${JSON.stringify(chartData.map(d => ({date: d.name, hrs: d.hours})))}

      Recent Reflection Notes Sample:
      ${JSON.stringify(reviewTexts)}

      Please generate a highly concise, encouraging, and specific analysis.
      Do NOT wrap your response in markdown code blocks like \`\`\`json. Just give me the pure raw JSON object.
      You MUST respond ONLY with valid JSON structure with exactly three string keys:
      {
        "good": "Highlight what went well, mentioning specific streak or high hours...",
        "bad": "Be critical but fair. Mention if there were big gaps in days, crammed hours, or uncompleted tasks...",
        "improve": "Give EXACT actionable advice based on the bad patterns..."
      }
      `;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 2000 }
        })
      });

      if (!res.ok) throw new Error("API Request Failed. Check your API key.");

      const data = await res.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) throw new Error("Invalid response from Gemini.");

      const cleanedText = textResponse.replace(/^```json/g, '').replace(/^```/g, '').replace(/```$/g, '').trim();
      
      let parsedGbu;
      try {
        parsedGbu = JSON.parse(cleanedText);
      } catch (parseErr) {
        console.error("JSON Parse Error. Raw Text:", cleanedText);
        // Fallback: Make a best-effort structural parse if it's broken or cut-off
        parsedGbu = {
          good: "Successfully generated raw insights, but failed to format them.",
          bad: "Data formatting error.",
          improve: cleanedText.substring(0, 500) + "..." // show raw text as fallback
        };
      }

      setGbuResult({ 
        good: parsedGbu.good || "Data analyzed successfully.", 
        bad: parsedGbu.bad || "No specific issues detected.", 
        improve: parsedGbu.improve || "Keep up the great work!", 
        isGenerating: false,
        rawText: cleanedText // store for debugging if needed
      });

    } catch (err) {
      console.error(err);
      setGbuResult({ 
        good: "N/A", 
        bad: "Failed to connect to Gemini API.", 
        improve: err.message || "Please verify your API key and try again.", 
        isGenerating: false 
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-12">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
            <Sparkles size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Gemini Insights</h2>
            <p className="text-slate-500 mt-1 max-w-md">Your personal AI productivity coach. Select a timeframe to generate deep analysis from your recent logs.</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 min-w-[200px]">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-slate-50 border-none text-slate-700 text-sm font-medium rounded-xl focus:ring-2 focus:ring-indigo-500 block p-3 cursor-pointer transition-shadow hover:shadow-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Range</option>
          </select>

          {filter === 'custom' && (
            <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl">
              <input 
                type="date" 
                value={customRange.start} 
                onChange={e => setCustomRange(prev => ({...prev, start: e.target.value}))}
                className="text-sm px-3 py-2 text-slate-700 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg w-full"
              />
              <input 
                type="date" 
                value={customRange.end} 
                onChange={e => setCustomRange(prev => ({...prev, end: e.target.value}))}
                className="text-sm px-3 py-2 text-slate-700 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg w-full"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Hours Logged", val: stats.totalHours, icon: Clock, c: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Days", val: stats.activeDays, icon: CalendarIcon, c: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Goals Done", val: `${stats.goalsCompleted}/${stats.totalGoalsCount}`, icon: Target, c: "text-purple-600", bg: "bg-purple-50" },
          { label: "Reflections", val: stats.totalReflections, icon: Zap, c: "text-amber-600", bg: "bg-amber-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center shadow-sm">
            <div className={`p-3 rounded-xl ${s.bg} ${s.c} mb-3`}>
              <s.icon size={20} />
            </div>
            <p className="text-xl font-bold text-slate-800">{s.val}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden shadow-indigo-100/50">
        
        {isEditingKey ? (
          <div className="p-10 text-center max-w-xl mx-auto flex flex-col items-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-6">
               <Key size={32} />
             </div>
             <h3 className="text-2xl font-bold text-slate-800 mb-2">Connect to Gemini</h3>
             <p className="text-slate-500 mb-8">
               To keep your data 100% private and avoid backend servers, this application communicates directly with Google's API from your browser. 
               Please securely provide your free Gemini API key to unlock AI insights.
             </p>
             <div className="w-full flex flex-col gap-4">
               <input 
                 type="password" 
                 value={keyInput} 
                 onChange={(e) => setKeyInput(e.target.value)}
                 placeholder="Paste your Gemini AI key here..." 
                 className="w-full px-5 py-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-center font-mono" 
               />
               <div className="flex gap-3 w-full">
                  {geminiKey && (
                    <button 
                      onClick={() => { setKeyInput(geminiKey); setIsEditingKey(false); }}
                      className="flex-1 py-4 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    onClick={handleSaveKey} 
                    disabled={!keyInput.trim()}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:shadow-none"
                  >
                    Save Secret Key
                  </button>
               </div>
             </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
               <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-indigo-500/30 blur-[100px] rounded-full pointer-events-none"></div>
               <div className="absolute bottom-[-50%] left-[-10%] w-[300px] h-[300px] bg-purple-500/30 blur-[100px] rounded-full pointer-events-none"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="max-w-lg text-center md:text-left">
                   <h3 className="text-2xl font-bold mb-2">Generate Your Review</h3>
                   <p className="text-slate-300 text-sm leading-relaxed">
                     Gemini processes your logging cadence, reflection notes, and goal tracking hit-rates to map out customized advice specifically tailored to what you did {filter === 'week' ? "this week" : filter === 'month' ? "this month" : "recently"}.
                   </p>
                 </div>
                 <div className="flex flex-col items-center gap-2 shrink-0">
                    <button 
                      onClick={generateGBU}
                      disabled={gbuResult?.isGenerating}
                      className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-80 disabled:hover:scale-100 disabled:cursor-not-allowed group w-full md:w-auto min-w-[220px]"
                    >
                      {gbuResult?.isGenerating ? (
                        <><Loader2 className="animate-spin text-indigo-600" size={24}/> Analyzing...</>
                      ) : (
                        <><Sparkles className="text-indigo-600 group-hover:rotate-12 transition-transform" size={24}/> Start Analysis</>
                      )}
                    </button>
                    <button onClick={() => setIsEditingKey(true)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider font-semibold mt-1">
                      Manage API Key
                    </button>
                 </div>
               </div>
            </div>

            {/* Content Area */}
            <div className="p-8 md:p-10 bg-slate-50 flex-1 min-h-[400px]">
               {!gbuResult ? (
                 <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12">
                    <div className="w-24 h-24 mb-6 relative">
                       <div className="absolute inset-0 border-4 border-dashed border-slate-200 rounded-full animate-[spin_10s_linear_infinite]"></div>
                       <div className="absolute inset-0 flex items-center justify-center">
                         <Sparkles size={32} className="text-slate-300" />
                       </div>
                    </div>
                    <p className="text-lg font-medium text-slate-600 mb-2">Ready to crunch the numbers</p>
                    <p className="text-sm max-w-sm">Hit the button above to securely analyze your local tracking data using Gemini 2.5 Flash.</p>
                 </div>
               ) : gbuResult.isGenerating ? (
                 <div className="flex flex-col items-center justify-center h-full text-center py-16 animate-in fade-in duration-500">
                    <div className="relative mb-8">
                       <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                         <Loader2 className="animate-spin text-indigo-600" size={40}/>
                       </div>
                       <div className="absolute inset-0 rounded-full border-4 border-indigo-600 opacity-20 animate-ping"></div>
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">Gemini is thinking...</h4>
                    <p className="text-slate-500 text-sm max-w-sm">Scanning {stats.totalReflections} reflection entries and {stats.totalHours} hours of deep work patterns.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700 fade-in">
                    
                    {/* GOOD */}
                    <div className="bg-white border border-emerald-100 p-6 rounded-3xl shadow-sm shadow-emerald-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl"><TrendingUp size={20}/></div>
                          <h4 className="font-black text-slate-800 text-lg uppercase tracking-wide">The Good</h4>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{gbuResult.good}</p>
                      </div>
                    </div>

                    {/* BAD */}
                    <div className="bg-white border border-rose-100 p-6 rounded-3xl shadow-sm shadow-rose-100 relative overflow-hidden group hover:shadow-md transition-shadow md:mt-8">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-rose-100 text-rose-600 p-2 rounded-xl"><AlertCircle size={20}/></div>
                          <h4 className="font-black text-slate-800 text-lg uppercase tracking-wide">The Bad</h4>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{gbuResult.bad}</p>
                      </div>
                    </div>

                    {/* IMPROVE */}
                    <div className="bg-white border border-amber-100 p-6 rounded-3xl shadow-sm shadow-amber-100 relative overflow-hidden group hover:shadow-md transition-shadow md:mt-16">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-amber-100 text-amber-600 p-2 rounded-xl"><Target size={20}/></div>
                          <h4 className="font-black text-slate-800 text-lg uppercase tracking-wide">Improvement</h4>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-medium">{gbuResult.improve}</p>
                      </div>
                    </div>

                 </div>
               )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
