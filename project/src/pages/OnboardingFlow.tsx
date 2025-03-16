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
  Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useHealthData } from '../contexts/HealthDataContext';
import toast from 'react-hot-toast';

interface OnboardingFlowProps {
  onComplete?: () => void; // Callback when onboarding is complete
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { updateHealthProfile, addHealthMetric } = useHealthData();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic info
    fullName: '',
    dateOfBirth: '',
    country: '',
    
    // Health profile
    height: '',
    weight: '',
    medicalConditions: [] as string[],
    medications: [] as string[],
    
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
      // Calculate age from date of birth
      const age = formData.dateOfBirth 
        ? calculateAge(formData.dateOfBirth) 
        : null;
      
      // Save profile data to Supabase - IMPORTANT: weight is NOT a field in health_profiles
      const healthProfileData = {
        age,
        height: formData.height ? parseFloat(formData.height) : null,
        medical_conditions: formData.medicalConditions,
        medications: formData.medications,
        family_history: [],
        lifestyle_factors: {
          diet_type: formData.dietType,
          activity_level: formData.activityLevel,
          stress_level: formData.stressLevel,
          sleep_quality: formData.sleepQuality
        },
        goals: formData.healthGoals
      };
      
      // Update health profile (without weight)
      await updateHealthProfile(healthProfileData);
      
      // If weight is provided, save it as a health metric instead
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
          notes: "Initial weight from onboarding"
        });
      }
      
      // Signal completion
      if (onComplete) {
        onComplete();
      }
      
      // Navigate to dashboard after successful completion
      toast.success('Profile created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile data:', error);
      toast.error('There was an error creating your profile. Please try again.');
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
  
  // Render different steps of the onboarding flow
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Welcome to OpenHanna AI</h2>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-medium text-blue-800 mb-3">Your AI-powered health companion</h3>
              <p className="text-blue-700 mb-4">
                OpenHanna AI helps you manage your health with personalized guidance, focused on diabetes and obesity management. Let's set up your profile to provide you with tailored support.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg flex flex-col items-center text-center">
                  <Activity className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-gray-800">Health Tracking</span>
                </div>
                <div className="bg-white p-3 rounded-lg flex flex-col items-center text-center">
                  <MessageCircle className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-gray-800">AI Assistant</span>
                </div>
                <div className="bg-white p-3 rounded-lg flex flex-col items-center text-center">
                  <Heart className="h-8 w-8 text-red-600 mb-2" />
                  <span className="text-gray-800">Care Plans</span>
                </div>
                <div className="bg-white p-3 rounded-lg flex flex-col items-center text-center">
                  <Database className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-gray-800">Nutrition Guidance</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Why we need your information</h3>
              <p className="text-gray-600 mb-4">
                The information you provide helps us personalize your experience and give you more accurate health guidance. All your data is private and securely stored.
              </p>
              
              <div className="flex items-start mb-4">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-gray-700">Personalized health recommendations</p>
              </div>
              <div className="flex items-start mb-4">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-gray-700">More accurate tracking and analysis</p>
              </div>
              <div className="flex items-start mb-4">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-gray-700">Better support from the AI assistant</p>
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
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 165"
                  />
                </div>
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 65"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select country</option>
                    <option value="us">United States</option>
                    <option value="ca">Canada</option>
                    <option value="mx">Mexico</option>
                    <option value="in">India</option>
                    <option value="ng">Nigeria</option>
                    <option value="ke">Kenya</option>
                    <option value="za">South Africa</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p>
                <User className="inline-block h-4 w-4 mr-1 text-gray-500" />
                This information helps us provide more accurate health guidance and recommendations.
              </p>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Health Information</h2>
            
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h3 className="font-medium text-gray-800 mb-4">Medical Conditions</h3>
              <p className="text-gray-600 mb-3">Select any conditions that apply to you:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                {[
                  'Type 2 Diabetes', 
                  'Pre-diabetes', 
                  'Hypertension', 
                  'High Cholesterol', 
                  'Obesity', 
                  'Heart Disease', 
                  'Thyroid Disorder', 
                  'Polycystic Ovary Syndrome', 
                  'Asthma'
                ].map(condition => (
                  <label key={condition} className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      value={condition}
                      checked={formData.medicalConditions.includes(condition)}
                      onChange={(e) => handleCheckboxChange(e, 'medicalConditions')}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-gray-700">{condition}</span>
                  </label>
                ))}
              </div>
              
              <h3 className="font-medium text-gray-800 mb-4">Current Medications</h3>
              <p className="text-gray-600 mb-3">Select any medications you're currently taking:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'Metformin', 
                  'Insulin', 
                  'GLP-1 agonists', 
                  'DPP-4 inhibitors', 
                  'SGLT2 inhibitors', 
                  'Blood pressure medication', 
                  'Cholesterol medication', 
                  'Thyroid medication'
                ].map(medication => (
                  <label key={medication} className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      value={medication}
                      checked={formData.medications.includes(medication)}
                      onChange={(e) => handleCheckboxChange(e, 'medications')}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-gray-700">{medication}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p>
                <Heart className="inline-block h-4 w-4 mr-1 text-gray-500" />
                This information helps us tailor health recommendations specific to your conditions.
              </p>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Lifestyle Information</h2>
            
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="dietType" className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Preference
                  </label>
                  <select
                    id="dietType"
                    name="dietType"
                    value={formData.dietType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a diet type</option>
                    <option value="omnivore">Omnivore (meat and plants)</option>
                    <option value="pescatarian">Pescatarian</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="keto">Keto</option>
                    <option value="paleo">Paleo</option>
                    <option value="mediterranean">Mediterranean</option>
                    <option value="low-carb">Low-carb</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Level
                  </label>
                  <select
                    id="activityLevel"
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select activity level</option>
                    <option value="sedentary">Sedentary (little to no exercise)</option>
                    <option value="lightly-active">Lightly active (1-3 days/week)</option>
                    <option value="moderately-active">Moderately active (3-5 days/week)</option>
                    <option value="very-active">Very active (6-7 days/week)</option>
                    <option value="extremely-active">Extremely active (physical job or twice daily training)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="stressLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Stress Level
                  </label>
                  <select
                    id="stressLevel"
                    name="stressLevel"
                    value={formData.stressLevel}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low (rarely feel stressed)</option>
                    <option value="moderate">Moderate (occasionally stressed)</option>
                    <option value="high">High (frequently stressed)</option>
                    <option value="very-high">Very high (constantly stressed)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="sleepQuality" className="block text-sm font-medium text-gray-700 mb-1">
                    Sleep Quality
                  </label>
                  <select
                    id="sleepQuality"
                    name="sleepQuality"
                    value={formData.sleepQuality}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="poor">Poor (less than 5 hours or interrupted)</option>
                    <option value="fair">Fair (5-6 hours, some interruptions)</option>
                    <option value="good">Good (7-8 hours, few interruptions)</option>
                    <option value="excellent">Excellent (7-9 hours, uninterrupted)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h3 className="font-medium text-gray-800 mb-4">Health Goals</h3>
              <p className="text-gray-600 mb-3">Select your main health goals:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'Manage blood sugar levels',
                  'Lose weight',
                  'Improve fitness',
                  'Eat healthier',
                  'Reduce medication dependence',
                  'Manage stress better',
                  'Improve sleep quality',
                  'Increase daily activity',
                  'Better understand my condition'
                ].map(goal => (
                  <label key={goal} className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      value={goal}
                      checked={formData.healthGoals.includes(goal)}
                      onChange={(e) => handleCheckboxChange(e, 'healthGoals')}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-gray-700">{goal}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p>
                <Activity className="inline-block h-4 w-4 mr-1 text-gray-500" />
                Your lifestyle information helps us create personalized recommendations and care plans.
              </p>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Almost Done!</h2>
            
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-green-800 text-center mb-3">Your profile is ready</h3>
              <p className="text-green-700 text-center mb-4">
                Thank you for completing your profile. OpenHanna AI is now ready to provide you with personalized health support.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h3 className="font-medium text-gray-800 mb-4">What's Next?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-4">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Track Your Health</h4>
                    <p className="text-gray-600 text-sm">
                      Monitor your key health metrics like blood glucose, weight, and activity in the dashboard.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Chat with AI Assistant</h4>
                    <p className="text-gray-600 text-sm">
                      Ask questions and get personalized guidance from your AI health assistant.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-4">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Get Your Care Plan</h4>
                    <p className="text-gray-600 text-sm">
                      Receive a personalized care plan with health recommendations tailored to your needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p>
                <Heart className="inline-block h-4 w-4 mr-1 text-gray-500" />
                Your health journey starts now. You can update your profile information anytime from the Profile page.
              </p>
            </div>
          </div>
        );
        
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
                  Get Started
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

export default OnboardingFlow;