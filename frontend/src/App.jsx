import React, { useEffect, useState } from 'react';
import { useProgress } from './context/ProgressContext';
import { Layout } from './components/Layout';
import { Calendar } from './components/Calendar';
import { DateModal } from './components/DateModal';
import { Dashboard } from './components/Dashboard';
import { MentorDashboard } from './components/MentorDashboard';
import { AIReview } from './components/AIReview';
import { FeedbackPage } from './components/FeedbackPage';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { ProfileSetupModal } from './components/ProfileSetupModal';

function App() {
  const {
    user,
    isAuthenticated,
    authLoading,
    signup,
    login,
    forgotPassword,
    loginWithGoogle,
    completeProfileSetup,
    profileSetupPending,
  } = useProgress();
  const [view, setView] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSavingProfileSetup, setIsSavingProfileSetup] = useState(false);
  const [mentorViewingStudent, setMentorViewingStudent] = useState(null);

  const handleDateSelect = (day, dateKey) => {
    setSelectedDate({ day, dateKey });
  };

  useEffect(() => {
    if (isAuthenticated) {
      setView('dashboard');
      setShowAuthModal(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const isMentor = String(user?.role || '').toLowerCase() === 'mentor';
    if (isMentor && !mentorViewingStudent && view !== 'dashboard') {
      setView('dashboard');
    }
  }, [user?.role, view, mentorViewingStudent]);

  const handleMentorViewStudent = ({ student, state }) => {
    setMentorViewingStudent({
      student,
      state,
    });
    setSelectedDate(null);
    setView('dashboard');
  };

  const handleBackToMentorList = () => {
    setMentorViewingStudent(null);
    setSelectedDate(null);
    setView('dashboard');
  };

  const handleProfileSetup = async ({ role, campus }) => {
    try {
      setIsSavingProfileSetup(true);
      await completeProfileSetup({ role, campus });
      setView('dashboard');
    } finally {
      setIsSavingProfileSetup(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-700">
        <p className="text-sm font-semibold">Preparing your workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowAuthModal(true)} />
        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSignup={signup}
          onLogin={login}
          onForgotPassword={forgotPassword}
          onGoogleAuth={loginWithGoogle}
        />
      </>
    );
  }

  const isMentor = String(user?.role || '').toLowerCase() === 'mentor';
  const isMentorViewingStudent = isMentor && Boolean(mentorViewingStudent?.state);
  const studentState = mentorViewingStudent?.state || null;

  return (
    <>
      <Layout
        view={view}
        setView={setView}
        userName={user?.name || 'Student'}
        userRole={user?.role || ''}
        userCampus={user?.campus || ''}
        showStudentSections={isMentorViewingStudent}
      >
        {isMentor && !isMentorViewingStudent ? (
          <MentorDashboard onViewStudent={handleMentorViewStudent} />
        ) : view === 'calendar' ? (
          <div className="relative">
            {isMentorViewingStudent && (
              <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                Viewing {mentorViewingStudent?.student?.name}&apos;s calendar in read-only mode.
                <button
                  type="button"
                  onClick={handleBackToMentorList}
                  className="ml-3 rounded-md border border-sky-300 bg-white px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                >
                  Back To Student List
                </button>
              </div>
            )}
            <Calendar
              onDateSelect={handleDateSelect}
              goals={studentState?.goals}
              reflections={studentState?.reflections}
              readOnly={isMentorViewingStudent}
            />
            {selectedDate && (
              <DateModal 
                date={selectedDate.day} 
                dateKey={selectedDate.dateKey} 
                onClose={() => setSelectedDate(null)} 
                readOnly={isMentorViewingStudent}
                goals={studentState?.goals}
                reflections={studentState?.reflections}
              />
            )}
          </div>
        ) : view === 'dashboard' ? (
          <>
            {isMentorViewingStudent && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Viewing {mentorViewingStudent?.student?.name}&apos;s dashboard in read-only mode.
                <button
                  type="button"
                  onClick={handleBackToMentorList}
                  className="ml-3 rounded-md border border-amber-300 bg-white px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                >
                  Back To Student List
                </button>
              </div>
            )}
            <Dashboard
              setView={setView}
              goals={studentState?.goals}
              reflections={studentState?.reflections}
              streak={studentState?.streak}
            />
          </>
        ) : view === 'ai' ? (
          <>
            {isMentorViewingStudent && (
              <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
                Viewing {mentorViewingStudent?.student?.name}&apos;s AI insights in read-only mode.
                <button
                  type="button"
                  onClick={handleBackToMentorList}
                  className="ml-3 rounded-md border border-indigo-300 bg-white px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  Back To Student List
                </button>
              </div>
            )}
            <AIReview
              goals={studentState?.goals}
              reflections={studentState?.reflections}
              readOnly={isMentorViewingStudent}
            />
          </>
        ) : view === 'feedback' ? (
          <FeedbackPage
            onBack={() => setView('dashboard')}
            mentorStudentId={isMentorViewingStudent ? mentorViewingStudent?.student?.id || '' : ''}
          />
        ) : null}
      </Layout>
      <ProfileSetupModal
        open={isAuthenticated && profileSetupPending}
        onSubmit={handleProfileSetup}
        isSaving={isSavingProfileSetup}
      />
    </>
  );
}

export default App;
