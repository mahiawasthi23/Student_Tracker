import React, { useEffect, useState } from 'react';
import { useProgress } from './context/ProgressContext';
import { Layout } from './components/Layout';
import { Calendar } from './components/Calendar';
import { DateModal } from './components/DateModal';
import { Dashboard } from './components/Dashboard';
import { MentorDashboard } from './components/MentorDashboard';
import { AIReview } from './components/AIReview';
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

  const handleDateSelect = (day, dateKey) => {
    setSelectedDate({ day, dateKey });
  };

  useEffect(() => {
    if (isAuthenticated) {
      setView('dashboard');
      setShowAuthModal(false);
    }
  }, [isAuthenticated]);

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

  return (
    <>
      <Layout
        view={view}
        setView={setView}
        userName={user?.name || 'Student'}
        userRole={user?.role || ''}
        userCampus={user?.campus || ''}
      >
        {view === 'calendar' ? (
          <div className="relative">
            <Calendar onDateSelect={handleDateSelect} />
            {selectedDate && (
              <DateModal 
                date={selectedDate.day} 
                dateKey={selectedDate.dateKey} 
                onClose={() => setSelectedDate(null)} 
              />
            )}
          </div>
        ) : view === 'dashboard' ? (
          user?.role === 'Mentor' ? <MentorDashboard /> : <Dashboard setView={setView} />
        ) : view === 'ai' ? (
          <AIReview setView={setView} />
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
