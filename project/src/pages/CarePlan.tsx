import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Activity, 
  AlertCircle, 
  Book, 
  Heart, 
  Utensils, 
  Dumbbell, 
  Brain, 
  Plus,
  ArrowRight,
  RefreshCw,
  Info,
  Sun,
  Moon,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useHealthData } from '../contexts/HealthDataContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Import care plan utilities
import { 
  CarePlan as CarePlanType, 
  CarePlanProgress, 
  getUserActivePlan, 
  createUserCarePlan,
  updateCarePlanStatus,
  getCarePlanProgress,
  updateGoalProgress,
  formatProgressData
} from '../utils/care-plan';

const CarePlan: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { healthProfile } = useHealthData();
  
  const [carePlan, setCarePlan] = useState<CarePlanType | null>(null);
  const [progressData, setProgressData] = useState<CarePlanProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formattedProgress, setFormattedProgress] = useState<Record<string, number>>({});
  const [showAssessmentPrompt, setShowAssessmentPrompt] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch the user's active care plan
  useEffect(() => {
    if (!user) return;

    const fetchCarePlan = async () => {
      setIsLoading(true);
      try {
        const plan = await getUserActivePlan(user.id);
        setCarePlan(plan);
        
        if (plan) {
          const progress = await getCarePlanProgress(plan.id);
          setProgressData(progress);
          setFormattedProgress(formatProgressData(progress));
        } else {
          if (!healthProfile || !healthProfile.age) {
            setShowAssessmentPrompt(true);
          }
        }
      } catch (error) {
        console.error('Error fetching care plan:', error);
        toast.error('Failed to load your care plan. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarePlan();
  }, [user, healthProfile]);

  // Handler to create a new care plan
  const handleCreateCarePlan = async () => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      const newPlan = await createUserCarePlan(user.id);
      if (newPlan) {
        setCarePlan(newPlan);
        setProgressData([]);
        setFormattedProgress({});
        setShowAssessmentPrompt(false);
      }
    } catch (error) {
      console.error('Error creating care plan:', error);
      toast.error('Failed to create care plan. Please try again later.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handler to update goal progress
  const handleUpdateProgress = async (goalId: string, value: number) => {
    if (!carePlan || !user) return;
    
    try {
      await updateGoalProgress(carePlan.id, goalId, value);
      
      // Update local state
      setFormattedProgress(prev => ({
        ...prev,
        [goalId]: value
      }));
      
      toast.success('Progress updated successfully!');
      
      // Refresh progress data
      const progress = await getCarePlanProgress(carePlan.id);
      setProgressData(progress);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress. Please try again.');
    }
  };

  // Handler to complete the care plan
  const handleCompleteCarePlan = async () => {
    if (!carePlan || !user) return;
    
    try {
      await updateCarePlanStatus(carePlan.id, 'completed');
      toast.success('Care plan marked as completed!');
      setCarePlan(null);
    } catch (error) {
      console.error('Error completing care plan:', error);
      toast.error('Failed to complete care plan. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Render assessment prompt if no health profile
  if (showAssessmentPrompt) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
            <Info className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Health Assessment First</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            To create a personalized care plan, we need to understand your health profile better. Please complete the health assessment first so we can tailor recommendations to your specific needs.
          </p>
          <a 
            href="/assessment" 
            className="inline-flex items-center px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Health Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>
    );
  }

  // Render care plan creation prompt if no active plan
  if (!carePlan) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Your Personalized Care Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Our AI will create a tailored health care plan based on your profile and health data. This plan will include personalized recommendations for nutrition, physical activity, and lifestyle adjustments to help you achieve your health goals.
          </p>
          <button 
            onClick={handleCreateCarePlan}
            disabled={isCreating}
            className="inline-flex items-center px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <RefreshCw className="animate-spin mr-2 h-5 w-5" />
                Creating Your Plan...
              </>
            ) : (
              <>
                Create My Care Plan
                <Plus className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Extract content from the care plan
  const { title, content } = carePlan;
  const { sections, weeklyGoals } = content;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2" />
              <span>
                {new Date(carePlan.start_date).toLocaleDateString()} - {carePlan.end_date ? new Date(carePlan.end_date).toLocaleDateString() : 'Ongoing'}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleCompleteCarePlan}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Complete Plan
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Progress Tracking */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Progress</h2>
            
            <div className="space-y-4">
              {weeklyGoals.map((goal, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800">{goal}</h3>
                    <span className="text-sm text-gray-500">
                      {formattedProgress[`goal-${index}`] || 0}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formattedProgress[`goal-${index}`] || 0}
                    onChange={(e) => handleUpdateProgress(`goal-${index}`, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Care Plan Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Care Plan</h2>
            
            <div className="space-y-6">
              {sections.map((section, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 p-4">
                    <h3 className="font-medium text-gray-800">{section.title}</h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                            <Target className="h-3 w-3 text-blue-600" />
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Daily Schedule */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Schedule</h2>
            
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <Sun className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <h3 className="font-medium text-yellow-800">Morning</h3>
                  <p className="text-sm text-yellow-600">Blood sugar check & light exercise</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-blue-800">Afternoon</h3>
                  <p className="text-sm text-blue-600">Post-meal walk & stress management</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                <Moon className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-medium text-purple-800">Evening</h3>
                  <p className="text-sm text-purple-600">Relaxation & sleep routine</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Resources</h2>
            
            <div className="space-y-3">
              <a href="#" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center">
                  <Book className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-green-800">Care Plan Guide</h3>
                    <p className="text-sm text-green-600">Learn how to follow your plan</p>
                  </div>
                </div>
              </a>
              
              <a href="#" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center">
                  <Heart className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-blue-800">Health Tips</h3>
                    <p className="text-sm text-blue-600">Daily health management advice</p>
                  </div>
                </div>
              </a>
              
              <a href="#" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-purple-800">Wellness Support</h3>
                    <p className="text-sm text-purple-600">Mental health resources</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarePlan;