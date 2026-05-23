import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { base44 } from '@/api/base44Client';
import Home from './pages/Home';
import CaseStart from './pages/CaseStart';
import Cases from './pages/Cases';
import AppointmentWatchPage from './pages/AppointmentWatch';
import Profile from './pages/Profile.jsx';
import Onboarding from './pages/Onboarding';
import IdentityVault from './pages/IdentityVault';
import DigitalVault from './pages/DigitalVault';
import PassportDemo from './pages/PassportDemo';
import OnboardingGate from './components/auth/OnboardingGate';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u?.email) {
        const profiles = await base44.entities.UserPrivateProfile.filter({ user_id: u.email }, '-created_date', 1);
        setProfile(profiles?.[0] || null);
      }
    } catch {}
    setProfileLoading(false);
  };

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingPublicSettings && !authError) {
      fetchProfile();
    } else if (authError) {
      setProfileLoading(false);
    }
  }, [isLoadingAuth, isLoadingPublicSettings, authError]);

  if (isLoadingPublicSettings || isLoadingAuth || profileLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  // Show onboarding gate if user hasn't completed onboarding
  if (user && !profile?.onboarding_completed) {
    return <OnboardingGate user={user} onComplete={fetchProfile} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/start" element={<CaseStart />} />
      <Route path="/cases" element={<Cases />} />
      <Route path="/appointments/watch" element={<AppointmentWatchPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/vault" element={<IdentityVault />} />
      <Route path="/digital-vault" element={<DigitalVault />} />
      <Route path="/demo/passport" element={<PassportDemo />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;