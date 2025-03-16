import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, CheckCircle, Clipboard } from 'lucide-react';
import { useHealthData } from '../../contexts/HealthDataContext';

interface HealthDataSummaryProps {
  className?: string;
}

const HealthDataSummary: React.FC<HealthDataSummaryProps> = ({ className = '' }) => {
  const { healthProfile } = useHealthData();
  const navigate = useNavigate();

  const hasCompletedAssessment = healthProfile && (
    healthProfile.height && 
    healthProfile.medical_conditions && 
    Array.isArray(healthProfile.medical_conditions) && 
    healthProfile.medical_conditions.length > 0
  );

  // Extract health profile data for display
  const getMedicalConditions = () => {
    if (!healthProfile?.medical_conditions) return [];
    
    return Array.isArray(healthProfile.medical_conditions) 
      ? healthProfile.medical_conditions 
      : typeof healthProfile.medical_conditions === 'string'
        ? JSON.parse(healthProfile.medical_conditions)
        : [];
  };

  const getLifestyleInfo = () => {
    if (!healthProfile?.lifestyle_factors) return {};
    
    return typeof healthProfile.lifestyle_factors === 'string'
      ? JSON.parse(healthProfile.lifestyle_factors)
      : healthProfile.lifestyle_factors;
  };

  const medicalConditions = getMedicalConditions();
  const lifestyle = getLifestyleInfo();

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Health Assessment
        </h2>
        {hasCompletedAssessment ? (
          <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </span>
        ) : (
          <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">
            Incomplete
          </span>
        )}
      </div>

      {hasCompletedAssessment ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {healthProfile?.age && (
                <div>
                  <span className="text-xs text-gray-500">Age:</span>
                  <p className="text-sm font-medium">{healthProfile.age} years</p>
                </div>
              )}
              {healthProfile?.height && (
                <div>
                  <span className="text-xs text-gray-500">Height:</span>
                  <p className="text-sm font-medium">{healthProfile.height} cm</p>
                </div>
              )}
            </div>
          </div>
          
          {medicalConditions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Medical Conditions</h3>
              <div className="flex flex-wrap gap-2">
                {medicalConditions.slice(0, 3).map((condition, index) => (
                  <span key={index} className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">
                    {condition}
                  </span>
                ))}
                {medicalConditions.length > 3 && (
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                    +{medicalConditions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          {lifestyle && (Object.keys(lifestyle).length > 0) && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Lifestyle</h3>
              <div className="grid grid-cols-2 gap-4">
                {lifestyle.activity_level && (
                  <div>
                    <span className="text-xs text-gray-500">Activity:</span>
                    <p className="text-sm font-medium">{lifestyle.activity_level}</p>
                  </div>
                )}
                {lifestyle.diet_type && (
                  <div>
                    <span className="text-xs text-gray-500">Diet:</span>
                    <p className="text-sm font-medium">{lifestyle.diet_type}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <button
            onClick={() => navigate('/assessment')}
            className="mt-2 text-blue-600 text-sm font-medium flex items-center hover:text-blue-800"
          >
            View full assessment
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      ) : (
        <div className="text-center py-6">
          <Clipboard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">
            Complete your health assessment to get personalized recommendations and insights.
          </p>
          <button
            onClick={() => navigate('/assessment')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <Activity className="h-4 w-4 mr-2" />
            Take Assessment
          </button>
        </div>
      )}
    </div>
  );
};

export default HealthDataSummary;