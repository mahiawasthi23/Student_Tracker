import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, LayoutDashboard, Mail, Sparkles, LogOut } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

export function Layout({ children, view, setView, userName, userRole, userCampus, showStudentSections = false }) {
  const { logout, getUnseenFeedbackCount, isAuthenticated } = useProgress();
  const [unseenCount, setUnseenCount] = useState(0);
  const isMentor = String(userRole || '').toLowerCase() === 'mentor';
  const canAccessStudentSections = !isMentor || showStudentSections;
  const appPanelTitle = isMentor ? 'Mentor Dashboard' : 'Student Dashboard';

  useEffect(() => {
    // Only fetch for authenticated students, not for mentors
    if (!isAuthenticated || !canAccessStudentSections) {
      return;
    }

    const checkUnseenFeedback = async () => {
      try {
        const count = await getUnseenFeedbackCount();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/30 to-slate-100 flex flex-col">
      {/* Global Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-pink-100/50 shadow-sm m-0 px-4 md:px-8 md:h-[68px] md:flex md:items-center min-h-[68px]">
        <div className="w-full flex items-center justify-between md:h-full">
          <div className="flex items-center gap-3">
            <img src="/navgurukul-logo.svg" alt="NavGurukul" className="h-8 w-auto" />
          </div>
          <div className="flex-1"></div>
          <span className="text-lg md:text-xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">{appPanelTitle}</span>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between gap-2 w-full mt-2">
          <div className="flex gap-1 bg-gradient-to-r from-slate-100 to-slate-50 p-1.5 rounded-xl flex-grow">
            {canAccessStudentSections && (
              <button
                onClick={() => setView('calendar')}
                className={`flex-1 p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                  view === 'calendar' 
                    ? 'bg-white/90 shadow-md text-slate-900 font-semibold' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <CalendarIcon size={18} />
              </button>
            )}
            <button
              onClick={() => setView('dashboard')}
              className={`flex-1 p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                view === 'dashboard' 
                  ? 'bg-white/90 shadow-md text-slate-900 font-semibold' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutDashboard size={18} />
            </button>
            {canAccessStudentSections && (
              <>
                <button
                  onClick={() => setView('ai')}
                  className={`flex-1 p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                    view === 'ai' 
                      ? 'bg-white/90 shadow-md text-purple-600 font-semibold' 
                      : 'text-purple-400 hover:text-purple-600'
                  }`}
                >
                  <Sparkles size={18} />
                </button>
                <button
                  onClick={() => setView('feedback')}
                  className={`flex-1 p-2 rounded-lg transition-all duration-200 flex items-center justify-center relative ${
                    view === 'feedback' 
                      ? 'bg-white/90 shadow-md text-pink-600 font-semibold' 
                      : 'text-pink-400 hover:text-pink-600'
                  }`}
                >
                  <Mail size={18} />
                  {unseenCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-[10px] font-bold text-white shadow-md border border-white">
                      {unseenCount > 9 ? '9+' : unseenCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
          <button
            onClick={logout}
            className="p-2.5 rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 text-rose-600 hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar - Fixed */}
        <aside className="fixed left-0 top-[68px] h-[calc(100vh-68px)] w-72 bg-gradient-to-b from-white/90 via-pink-50/40 to-purple-50/40 border-r border-pink-100/50 flex flex-col p-6 hidden md:flex backdrop-blur-sm shadow-sm overflow-y-auto z-30">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 text-white flex items-center justify-center font-bold shadow-lg">
                P
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900">Progress</h1>
                <p className="text-xs text-slate-500 font-medium">Tracker</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1 flex-grow">
          {canAccessStudentSections && (
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                view === 'calendar' 
                  ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-md shadow-pink-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CalendarIcon size={19} />
              <span>Calendar</span>
            </button>
          )}
          <button
            onClick={() => setView('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              view === 'dashboard' 
                ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-md shadow-pink-200' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
            >
              <LayoutDashboard size={19} />
              <span>Dashboard</span>
            </button>

            {canAccessStudentSections && (
              <>
                <div className="my-3 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>

                <button
                  onClick={() => setView('ai')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    view === 'ai' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md shadow-purple-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                  >
                  <Sparkles size={19} />
                  <span>AI Review</span>
                </button>

                <button
                  onClick={() => setView('feedback')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative group ${
                    view === 'feedback' 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                  >
                  <span className="relative inline-flex">
                    <Mail size={19} />
                    {unseenCount > 0 && (
                      <span className="absolute -top-3 -right-3 inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-xs font-bold text-white shadow-md border-2 border-white">
                        {unseenCount > 9 ? '9+' : unseenCount}
                      </span>
                    )}
                  </span>
                  <span>Feedback</span>
                </button>
              </>
            )}
          </nav>

          <div className="mt-auto pt-6 border-t border-pink-100/50">
            <div className="rounded-3xl bg-gradient-to-br from-white via-pink-50/40 to-purple-50/40 border border-pink-200/60 p-5 mb-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white flex items-center justify-center text-lg font-bold shadow-md flex-shrink-0">
                  {userName?.charAt(0).toUpperCase() || 'M'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 leading-snug">Hi, {userName}! 👋</p>
                  <div className="mt-2.5 space-y-1.5">
                    <p className="text-xs font-semibold text-slate-600 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                      {userRole || 'Student'}
                    </p>
                    <p className="text-xs font-medium text-slate-500">📍 {userCampus || 'Campus N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-700 transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-72 flex flex-col min-w-0 overflow-hidden">
          {/* Dynamic Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto w-full max-w-6xl min-h-[500px]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
