import React, { useEffect } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';
import { useAuth } from '../contexts/AuthContext';
import DailyCheckIn from '../components/Dashboard/DailyCheckIn';
import ChatWidget from '../components/chat/ChatWidget';

const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { state: { from: location } });
    }
  }, [user, loading, navigate, location]);
  
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Daily Check-in always visible at the top */}
          <DailyCheckIn />
          {children || <Outlet />}
        </div>
      </div>
      <ChatWidget />
    </div>
  );
};

export default MainLayout;