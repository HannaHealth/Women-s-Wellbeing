import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  User, 
  Activity, 
  Heart, 
  Calendar,
  MessageCircle,
  Database,
  Globe,
  MapPin,
  Sun
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useHealthData } from '../contexts/HealthDataContext';
import toast from 'react-hot-toast';

interface OnboardingFlowProps {
  onComplete?: () => void;
}

const HealthAssessment: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { updateHealthProfile, addHealthMetric } = useHealthData();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic info
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    countryOfResidence: '',
    region: '', // For specific regions/cities
    
    // Health profile
    height: '',
    weight: '',
    medicalConditions: [] as string[],
    medications: [] as string[],
    
    // Cultural & Environmental Factors
    climateType: '', // e.g., hot, cold, temperate
    dietaryRestrictions: [] as string[],
    culturalConsiderations: [] as string[],
    
    // Lifestyle
    activityLevel: '',
    dietType: '',
    stressLevel: 'moderate',
    sleepQuality: 'fair',
    
    // Goals
    healthGoals: [] as string[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const { value, checked } = e.target;
    const currentValues = formData[field as keyof typeof formData] as string[];
    
    if (checked) {
      setFormData({ 
        ...formData, 
        [field]: [...currentValues, value] 
      });
    } else {
      setFormData({ 
        ...formData, 
        [field]: currentValues.filter(item => item !== value)
      });
    }
  };

  const handleNext = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const age = formData.dateOfBirth 
        ? calculateAge(formData.dateOfBirth) 
        : null;
      
      const healthProfileData = {
        age,
        height: formData.height ? parseFloat(formData.height) : null,
        medical_conditions: formData.medicalConditions,
        medications: formData.medications,
        nationality: formData.nationality,
        country_of_residence: formData.countryOfResidence,
        region: formData.region,
        climate_type: formData.climateType,
        dietary_restrictions: formData.dietaryRestrictions,
        cultural_considerations: formData.culturalConsiderations,
        lifestyle_factors: {
          diet_type: formData.dietType,
          activity_level: formData.activityLevel,
          stress_level: formData.stressLevel,
          sleep_quality: formData.sleepQuality
        },
        goals: formData.healthGoals
      };
      
      // Save health profile to database
      await updateHealthProfile(healthProfileData);
      
      // If weight is provided, add it as a health metric
      if (formData.weight && parseFloat(formData.weight) > 0) {
        const today = new Date().toISOString().split('T')[0];
        await addHealthMetric({
          date: today,
          weight: parseFloat(formData.weight),
          blood_glucose: null,
          blood_pressure_systolic: null,
          blood_pressure_diastolic: null,
          mood: null,
          steps: null,
          sleep_hours: null,
          notes: "Initial weight from health assessment"
        });
      }
      
      if (onComplete) {
        onComplete();
      }
      
      toast.success('Health profile updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile data:', error);
      toast.error('Failed to save health profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthdate: string): number => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Welcome to Your Health Assessment</h2>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-medium text-blue-800 mb-3">Why complete this assessment?</h3>
              <p className="text-blue-700 mb-4">
                This assessment helps us understand your health status, cultural background, and local environment 
                to provide personalized recommendations that work for you.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg flex flex-col items-center text-center">
                  <Activity className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-gray-800">Personalized Care</span>
                </div>
                <div className="bg-white p-3 rounded-lg flex flex-col items-center text-center">
                  <Globe className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-gray-800">Cultural Context</span>
                </div>
                <div className="bg-white p-3 rounded-lg flex flex-col items-center text-center">
                  <Heart className="h-8 w-8 text-red-600 mb-2" />
                  <span className="text-gray-800">Health Insights</span>
                </div>
                <div className="bg-white p-3 rounded-lg flex flex-col items-center text-center">
                  <Database className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-gray-800">Track Progress</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h2>
            
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality
                  </label>
                  <select
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select your nationality</option>
                    <option value="us">United States</option>
                    <option value="ca">Canada</option>
                    <option value="mx">Mexico</option>
                    <option value="in">India</option>
                    <option value="ng">Nigeria</option>
                    <option value="ke">Kenya</option>
                    <option value="sa">Saudi Arabia</option>
                    <option value="ae">United Arab Emirates</option>
                    <option value="kw">Kuwait</option>
                    <option value="qa">Qatar</option>
                    <option value="bh">Bahrain</option>
                    <option value="om">Oman</option>
                    <option value="za">South Africa</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="countryOfResidence" className="block text-sm font-medium text-gray-700 mb-1">
                    Country of Residence
                  </label>
                  <select
                    id="countryOfResidence"
                    name="countryOfResidence"
                    value={formData.countryOfResidence}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select current country</option>
                    <option value="us">United States</option>
                    <option value="ca">Canada</option>
                    <option value="mx">Mexico</option>
                    <option value="in">India</option>
                    <option value="ng">Nigeria</option>
                    <option value="ke">Kenya</option>
                    <option value="sa">Saudi Arabia</option>
                    <option value="ae">United Arab Emirates</option>
                    <option value="kw">Kuwait</option>
                    <option value="qa">Qatar</option>
                    <option value="bh">Bahrain</option>
                    <option value="om">Oman</option>
                    <option value="za">South Africa</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                    Region/City
                  </label>
                  <input
                    type="text"
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Dubai, Riyadh, Lagos"
                  />
                </div>
                <div>
                  <label htmlFor="climateType" className="block text-sm font-medium text-gray-700 mb-1">
                    Local Climate
                  </label>
                  <select
                    id="climateType"
                    name="climateType"
                    value={formData.climateType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select climate type</option>
                    <option value="hot-arid">Hot and Arid</option>
                    <option value="hot-humid">Hot and Humid</option>
                    <option value="temperate">Temperate</option>
                    <option value="cold">Cold</option>
                    <option value="tropical">Tropical</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p>
                <Globe className="inline-block h-4 w-4 mr-1 text-gray-500" />
                Your location and climate help us provide culturally appropriate recommendations and activities suitable for your environment.
              </p>
            </div>
          </div>
        );

      // ... Continue with other steps (3, 4, 5) as before, but update them to include cultural considerations
      // I'll continue with the next steps in the following messages due to length

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Getting Started</span>
            <span>Complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            {[1, 2, 3, 4, 5].map(stepNumber => (
              <div
                key={stepNumber}
                className={`flex flex-col items-center ${
                  step >= stepNumber ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
                    step >= stepNumber
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {stepNumber}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Step content */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {renderStep()}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ${
              step === 1 ? 'invisible' : ''
            }`}
          >
            Back
          </button>
          
          {step < 5 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              Next Step
              <ArrowRight className="ml-1 h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Complete Assessment
                  <ArrowRight className="ml-1 h-5 w-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthAssessment;