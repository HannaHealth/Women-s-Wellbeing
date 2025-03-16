import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import HealthAssessment from './pages/HealthAssessment';
import CarePlan from './pages/CarePlan';
import MentalHealth from './pages/MentalHealth';
import ChatAssistant from './pages/ChatAssistant';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import NutritionPage from './pages/NutritionPage';
import OnboardingFlow from './pages/OnboardingFlow';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { HealthDataProvider } from './contexts/HealthDataContext';

// Create Supabase client once
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // First check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
      setLoading(false);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setCurrentUser(session?.user || null);
        setLoading(false);
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  // Then check if user has completed onboarding - depends on current user
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Reset onboarding status when user changes
      setHasCompletedOnboarding(null);
      
      if (!currentUser) {
        setHasCompletedOnboarding(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('health_profiles')
          .select('id')
          .eq('user_id', currentUser.id);
          
        if (error) {
          console.error('Error checking onboarding status:', error);
          setHasCompletedOnboarding(false);
          return;
        }
        
        // User has completed onboarding if they have a health profile
        setHasCompletedOnboarding(data && data.length > 0);
      } catch (error) {
        console.error('Error in checkOnboardingStatus:', error);
        setHasCompletedOnboarding(false);
      }
    };
    
    if (currentUser) {
      checkOnboardingStatus();
    } else {
      setHasCompletedOnboarding(false);
    }
  }, [currentUser]); // Re-run when the current user changes

  if (loading || hasCompletedOnboarding === null) {
    // Loading state
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <HealthDataProvider>
          <Router>
            <Toaster position="top-center" />
            <Routes>
              {/* Landing page route */}
              <Route path="/" element={!currentUser ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
              
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={
                currentUser ? (
                  hasCompletedOnboarding ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <OnboardingFlow onComplete={() => setHasCompletedOnboarding(true)} />
                  )
                ) : (
                  <Navigate to="/auth" replace />
                )
              } />
              <Route path="/dashboard/*" element={
                <RequireAuth hasCompletedOnboarding={hasCompletedOnboarding}>
                  <MainLayout />
                </RequireAuth>
              }>
                <Route index element={<Dashboard />} />
                <Route path="assessment" element={<HealthAssessment />} />
                <Route path="care-plan" element={<CarePlan />} />
                <Route path="mental-health" element={<MentalHealth />} />
                <Route path="chat" element={<ChatAssistant />} />
                <Route path="profile" element={<Profile />} />
                <Route path="nutrition" element={<NutritionPage />} />
              </Route>
              <Route path="/assessment" element={
                <RequireAuth hasCompletedOnboarding={hasCompletedOnboarding}>
                  <MainLayout><HealthAssessment /></MainLayout>
                </RequireAuth>
              } />
              <Route path="/care-plan" element={
                <RequireAuth hasCompletedOnboarding={hasCompletedOnboarding}>
                  <MainLayout><CarePlan /></MainLayout>
                </RequireAuth>
              } />
              <Route path="/mental-health" element={
                <RequireAuth hasCompletedOnboarding={hasCompletedOnboarding}>
                  <MainLayout><MentalHealth /></MainLayout>
                </RequireAuth>
              } />
              <Route path="/chat" element={
                <RequireAuth hasCompletedOnboarding={hasCompletedOnboarding}>
                  <MainLayout><ChatAssistant /></MainLayout>
                </RequireAuth>
              } />
              <Route path="/profile" element={
                <RequireAuth hasCompletedOnboarding={hasCompletedOnboarding}>
                  <MainLayout><Profile /></MainLayout>
                </RequireAuth>
              } />
              <Route path="/nutrition" element={
                <RequireAuth hasCompletedOnboarding={hasCompletedOnboarding}>
                  <MainLayout><NutritionPage /></MainLayout>
                </RequireAuth>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          <Analytics />
        </HealthDataProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

// Component to handle authentication and onboarding redirection
interface RequireAuthProps {
  children: React.ReactNode;
  hasCompletedOnboarding: boolean;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, hasCompletedOnboarding }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default App;