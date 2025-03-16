import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, MessageCircle, LineChart, Heart, ClipboardCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useHealthData } from '../contexts/HealthDataContext';

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { healthProfile } = useHealthData();

  // Check if user has completed assessment
  const hasCompletedAssessment = healthProfile && (
    healthProfile.height || 
    (healthProfile.medical_conditions && Array.isArray(healthProfile.medical_conditions) && 
     healthProfile.medical_conditions.length > 0) ||
    (healthProfile.lifestyle_factors && Object.values(healthProfile.lifestyle_factors).some(value => value))
  );
  
  const features = [
    {
      icon: <MessageCircle className="h-6 w-6 text-blue-500" />,
      title: t('home.features.aiAssistant.title'),
      description: t('home.features.aiAssistant.description'),
      link: '/chat',
    },
    {
      icon: <Activity className="h-6 w-6 text-green-500" />,
      title: t('home.features.carePlans.title'),
      description: t('home.features.carePlans.description'),
      link: '/care-plan',
    },
    {
      icon: <LineChart className="h-6 w-6 text-purple-500" />,
      title: t('home.features.healthTracking.title'),
      description: t('home.features.healthTracking.description'),
      link: '/dashboard',
    },
    {
      icon: <Heart className="h-6 w-6 text-red-500" />,
      title: t('home.features.mentalHealth.title'),
      description: t('home.features.mentalHealth.description'),
      link: '/mental-health',
    }
  ];
  
  // Add assessment feature only if not completed
  if (!hasCompletedAssessment) {
    features.push({
      icon: <ClipboardCheck className="h-6 w-6 text-orange-500" />,
      title: t('home.features.assessment.title'),
      description: t('home.features.assessment.description'),
      link: '/assessment',
    });
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('home.welcome', { name: user?.email?.split('@')[0] || t('home.friend') })}
        </h1>
        <p className="text-blue-100 mb-6">{t('home.subtitle')}</p>
        <div className="flex space-x-4">
          <Link to="/chat" className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            {t('home.talkToAssistant')}
          </Link>
          {!hasCompletedAssessment && (
            <Link to="/assessment" className="bg-blue-700 bg-opacity-30 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-opacity-40 transition-colors">
              {t('home.takeAssessment')}
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
          >
            <div className="rounded-full bg-gray-100 p-3 w-fit mb-4">{feature.icon}</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h2>
            <p className="text-gray-600 flex-grow">{feature.description}</p>
            <div className="text-blue-600 font-medium mt-4">{t('home.getStarted')} →</div>
          </Link>
        ))}
      </div>

      <div className="bg-indigo-50 rounded-xl p-6 mb-8">
        <div className="flex items-start">
          <div className="mr-6">
            <div className="bg-indigo-500 text-white p-3 rounded-xl">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{t('home.dailyTip.title')}</h3>
            <p className="text-gray-600">{t('home.dailyTip.content')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('home.quickActions.title')}</h3>
          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">{t('home.quickActions.logHealth')}</span>
              <span className="text-blue-600">→</span>
            </Link>
            <Link
              to="/chat"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">{t('home.quickActions.askQuestion')}</span>
              <span className="text-blue-600">→</span>
            </Link>
            <Link
              to="/care-plan"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">{t('home.quickActions.viewPlan')}</span>
              <span className="text-blue-600">→</span>
            </Link>
            {!hasCompletedAssessment && (
              <Link
                to="/assessment"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700">{t('home.takeAssessment')}</span>
                <span className="text-blue-600">→</span>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('home.resources.title')}</h3>
          <div className="space-y-3">
            <a
              href="#"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">{t('home.resources.diabetesGuide')}</span>
              <span className="text-blue-600">→</span>
            </a>
            <a
              href="#"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">{t('home.resources.nutritionBasics')}</span>
              <span className="text-blue-600">→</span>
            </a>
            <a
              href="#"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">{t('home.resources.mentalWellbeing')}</span>
              <span className="text-blue-600">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;