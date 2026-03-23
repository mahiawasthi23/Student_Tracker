import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, LayoutDashboard, Mail, Sparkles, LogOut } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

export function Layout({ children, view, setView, userName, userRole, userCampus, showStudentSections = false }) {
  const { logout, getUnseenFeedbackCount, isAuthenticated } = useProgress();
  const [unseenCount, setUnseenCount] = useState(0);
  const isMentor = String(userRole || '').toLowerCase() === 'mentor';
  const canAccessStudentSections = !isMentor || showStudentSections;

  useEffect(() => {
    // Only fetch for authenticated students, not for mentors
    if (!isAuthenticated || !canAccessStudentSections) {
      console.log('Skipping unseen feedback check:', { isAuthenticated, canAccessStudentSections });
      return;
    }

    const checkUnseenFeedback = async () => {
      try {
        const count = await getUnseenFeedbackCount();
        console.log('Unseen feedback count:', count);
        setUnseenCount(count || 0);
      } catch (err) {
        console.error('Failed to load unseen feedback count:', err);
        setUnseenCount(0);
      }
    };

    checkUnseenFeedback();
    // Check every 10 seconds for new feedback
    const interval = setInterval(checkUnseenFeedback, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, canAccessStudentSections, getUnseenFeedbackCount]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 hidden md:flex">
        <div className="mb-8">
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs">P</span>
            Progress Tracker
          </h1>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {canAccessStudentSections && (
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <CalendarIcon size={18} />
              Calendar
            </button>
          )}
          <button
            onClick={() => setView('dashboard')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          {canAccessStudentSections && (
            <>
              <div className="my-2 border-t border-slate-100"></div>

              <button
                onClick={() => setView('ai')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'ai' ? 'bg-indigo-50 text-indigo-700' : 'text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50'}`}
              >
                <Sparkles size={18} />
                AI Review
              </button>

              <button
                onClick={() => setView('feedback')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'feedback' ? 'bg-amber-50 text-amber-700' : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'}`}
              >
                <span className="relative inline-flex">
                  <Mail size={18} />
                  {unseenCount > 0 && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-xs font-bold text-white shadow-md border-2 border-white">
                      {unseenCount > 9 ? '9+' : unseenCount}
                    </span>
                  )}
                </span>
                Feedback
              </button>
            </>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-800">Hi {userName} 👋</p>
          <p className="mt-1 text-xs text-slate-500">
            {(userRole || 'Student')} • {(userCampus || 'Campus N/A')}
          </p>
          <button
            onClick={logout}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs">P</span>
            Progress
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {canAccessStudentSections && (
                <button
                  onClick={() => setView('calendar')}
                  className={`p-1.5 rounded-md transition-colors ${view === 'calendar' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                >
                  <CalendarIcon size={18} />
                </button>
              )}
              <button
                onClick={() => setView('dashboard')}
                className={`p-1.5 rounded-md transition-colors ${view === 'dashboard' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                <LayoutDashboard size={18} />
              </button>
              {canAccessStudentSections && (
                <>
                  <button
                    onClick={() => setView('ai')}
                    className={`p-1.5 rounded-md transition-colors ${view === 'ai' ? 'bg-white shadow-sm text-indigo-600' : 'text-indigo-400'}`}
                  >
                    <Sparkles size={18} />
                  </button>
                  <button
                    onClick={() => setView('feedback')}
                    className={`p-1.5 rounded-md transition-colors ${view === 'feedback' ? 'bg-white shadow-sm text-amber-600' : 'text-amber-400'}`}
                  >
                    <span className="relative inline-flex">
                      <Mail size={18} />
                      {unseenCount > 0 && (
                        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-[10px] font-bold text-white shadow-md border border-white">
                          {unseenCount > 9 ? '9+' : unseenCount}
                        </span>
                      )}
                    </span>
                  </button>
                </>
              )}
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full h-full min-h-[500px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
