import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ChevronRight, 
  Calendar, 
  Clock, 
  BarChart,
  Apple, 
  Utensils, 
  Dumbbell, 
  Heart,
  AlertCircle,
  Award,
  CheckCircle,
  Plus,
  FileText,
  User,
  Coffee,
  Brain,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useHealthData } from '../contexts/HealthDataContext';
import toast from 'react-hot-toast';
import ProgressChart from '../components/care-plan/ProgressChart';
import WeeklyCheckIn from '../components/care-plan/WeeklyCheckIn';
import ResourceCard from '../components/care-plan/ResourceCard';
import { 
  getUserActivePlan, 
  createUserCarePlan, 
  getCarePlanProgress, 
  updateGoalProgress,
  formatProgressData,
  type CarePlan,
  type CarePlanProgress
} from '../utils/care-plan';

const CarePlanPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { healthProfile } = useHealthData();
  const navigate = useNavigate();
  
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [progressHistory, setProgressHistory] = useState<CarePlanProgress[]>([]);

  useEffect(() => {
    const fetchCarePlan = async () => {
      setLoading(true);
      try {
        if (user) {
          // Get the active care plan for this user
          const plan = await getUserActivePlan(user.id);
          setCarePlan(plan);
          
          // If we have a plan, get its progress data
          if (plan) {
            const progress = await getCarePlanProgress(plan.id);
            setProgressHistory(progress);
            
            // Format progress data for UI display
            const formattedProgress = formatProgressData(progress);
            setProgressData(formattedProgress);
          }
        }
      } catch (error) {
        console.error('Error fetching care plan:', error);
        toast.error('Error loading your care plan. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchCarePlan();
  }, [user]);

  const handleCreateCarePlan = async () => {
    if (!user) {
      toast.error('You must be logged in to create a care plan');
      return;
    }
    
    // Check if user has completed a health assessment
    if (!healthProfile) {
      toast.error('Please complete your health assessment first');
      navigate('/assessment');
      return;
    }
    
    setCreatingPlan(true);
    try {
      const newPlan = await createUserCarePlan(user.id);
      if (newPlan) {
        setCarePlan(newPlan);
        setActiveTab('overview');
        toast.success('Your personalized care plan has been created!');
      }
    } catch (error) {
      console.error('Error creating care plan:', error);
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleUpdateProgress = async (goalIndex: number, value: number) => {
    if (!carePlan || !user) return;
    
    try {
      // Update the goal progress in the database
      const goalId = `goal-${goalIndex}`;
      const success = await updateGoalProgress(carePlan.id, goalId, value);
      
      if (success) {
        // Update local state with the new progress value
        setProgressData(prev => ({
          ...prev,
          [goalId]: value
        }));
        
        // Add to progress history
        const today = new Date().toISOString().split('T')[0];
        setProgressHistory(prev => [
          ...prev,
          {
            id: Date.now().toString(), // Temporary ID
            care_plan_id: carePlan.id,
            goal_id: goalId,
            date: today,
            value: value
          }
        ]);
        
        toast.success('Progress updated successfully!');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!carePlan) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Care Plan Available</h2>
          <p className="text-gray-600 mb-6">
            We need to create your personalized care plan based on your health profile.
          </p>
          <button 
            onClick={handleCreateCarePlan}
            disabled={creatingPlan || !healthProfile}
            className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors ${
              (creatingPlan || !healthProfile) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {creatingPlan ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Creating Your Plan...
              </>
            ) : !healthProfile ? (
              'Complete Health Assessment First'
            ) : (
              'Create My Care Plan'
            )}
          </button>
          {!healthProfile && (
            <p className="mt-4 text-sm text-gray-500">
              Please complete your health assessment first to get a personalized care plan.{' '}
              <button 
                onClick={() => navigate('/assessment')}
                className="text-blue-600 hover:underline"
              >
                Go to Health Assessment
              </button>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Personalized Care Plan</h1>
          <p className="text-gray-600">
            AI-generated recommendations based on your health profile and goals
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center text-sm">
          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
          <span className="text-gray-500 mr-4">
            {new Date(carePlan.start_date).toLocaleDateString()} - {carePlan.end_date ? new Date(carePlan.end_date).toLocaleDateString() : 'Ongoing'}
          </span>
          <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="font-medium">Active Plan</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-start">
          <Award className="h-12 w-12 mr-6 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold mb-2">{carePlan.title}</h2>
            <p className="text-blue-100 mb-4">
              This plan is tailored to your specific health profile and goals. Follow these recommendations and track your progress to achieve better health outcomes.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-lg text-sm">
                <Clock className="h-4 w-4 mr-1" />
                <span>8-week plan</span>
              </div>
              <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-lg text-sm">
                <BarChart className="h-4 w-4 mr-1" />
                <span>Progress tracking</span>
              </div>
              <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-lg text-sm">
                <Activity className="h-4 w-4 mr-1" />
                <span>Adaptive recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-xl shadow-sm sticky top-20">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800">Plan Navigation</h3>
            </div>
            <nav className="p-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center p-3 rounded-lg text-left ${
                  activeTab === 'overview'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Activity className="h-5 w-5 mr-3" />
                <span>Overview</span>
                {activeTab === 'overview' && (
                  <ChevronRight className="h-5 w-5 ml-auto" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('nutrition')}
                className={`w-full flex items-center p-3 rounded-lg text-left ${
                  activeTab === 'nutrition'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Apple className="h-5 w-5 mr-3" />
                <span>Nutrition</span>
                {activeTab === 'nutrition' && (
                  <ChevronRight className="h-5 w-5 ml-auto" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('exercise')}
                className={`w-full flex items-center p-3 rounded-lg text-left ${
                  activeTab === 'exercise'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Dumbbell className="h-5 w-5 mr-3" />
                <span>Physical Activity</span>
                {activeTab === 'exercise' && (
                  <ChevronRight className="h-5 w-5 ml-auto" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('monitoring')}
                className={`w-full flex items-center p-3 rounded-lg text-left ${
                  activeTab === 'monitoring'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart className="h-5 w-5 mr-3" />
                <span>Monitoring</span>
                {activeTab === 'monitoring' && (
                  <ChevronRight className="h-5 w-5 ml-auto" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('mental')}
                className={`w-full flex items-center p-3 rounded-lg text-left ${
                  activeTab === 'mental'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart className="h-5 w-5 mr-3" />
                <span>Mental Wellbeing</span>
                {activeTab === 'mental' && (
                  <ChevronRight className="h-5 w-5 ml-auto" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`w-full flex items-center p-3 rounded-lg text-left ${
                  activeTab === 'progress'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart className="h-5 w-5 mr-3" />
                <span>My Progress</span>
                {activeTab === 'progress' && (
                  <ChevronRight className="h-5 w-5 ml-auto" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`w-full flex items-center p-3 rounded-lg text-left ${
                  activeTab === 'resources'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="h-5 w-5 mr-3" />
                <span>Resources</span>
                {activeTab === 'resources' && (
                  <ChevronRight className="h-5 w-5 ml-auto" />
                )}
              </button>
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3 order-1 lg:order-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Weekly Goals</h2>
                  <div className="space-y-4">
                    {carePlan.content.weeklyGoals.map((goal, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-gray-700 font-medium">{goal}</div>
                          <div className="text-sm font-medium text-gray-500">
                            {progressData[`goal-${index}`] || 0}% complete
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${progressData[`goal-${index}`] || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Plan Summary</h2>
                  <div className="space-y-4">
                    {carePlan.content.sections.map((section, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-800 mb-2">{section.title}</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {section.content.slice(0, 2).map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                        {section.content.length > 2 && (
                          <button 
                            onClick={() => {
                              const tabMapping: Record<string, string> = {
                                'Nutritional Guidelines': 'nutrition',
                                'Physical Activity': 'exercise',
                                'Blood Glucose Monitoring': 'monitoring',
                                'Stress Management': 'mental'
                              };
                              setActiveTab(tabMapping[section.title] || 'overview');
                            }}
                            className="text-blue-600 text-sm font-medium mt-2"
                          >
                            See all {section.content.length} recommendations →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="rounded-full bg-green-100 p-3 mr-4">
                    <Utensils className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Nutrition Guidelines</h2>
                    <p className="text-gray-600">Personalized dietary recommendations for diabetes management</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Key Principles</h3>
                    <ul className="space-y-3">
                      {carePlan.content.sections.find(s => s.title === 'Nutritional Guidelines')?.content.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="bg-green-100 rounded-full p-1 mt-0.5 mr-3">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">Meal Planning Tips</h3>
                    <ul className="space-y-2 text-blue-700">
                      <li className="flex items-start">
                        <div className="min-w-4 mt-1 mr-2">•</div>
                        <span>Use the plate method: ½ non-starchy vegetables, ¼ lean protein, ¼ complex carbs</span>
                      </li>
                      <li className="flex items-start">
                        <div className="min-w-4 mt-1 mr-2">•</div>
                        <span>Include a source of protein with each meal to slow glucose absorption</span>
                      </li>
                      <li className="flex items-start">
                        <div className="min-w-4 mt-1 mr-2">•</div>
                        <span>Healthy fats like avocado, nuts, and olive oil help improve satiety</span>
                      </li>
                      <li className="flex items-start">
                        <div className="min-w-4 mt-1 mr-2">•</div>
                        <span>Stay hydrated with water instead of sugary beverages</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Sample Meal Ideas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Breakfast</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Greek yogurt with berries and nuts</li>
                          <li>• Vegetable omelet with whole grain toast</li>
                          <li>• Overnight oats with cinnamon and apple</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Lunch</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Grilled chicken salad with olive oil dressing</li>
                          <li>• Lentil soup with mixed vegetables</li>
                          <li>• Tuna wrap with leafy greens</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Dinner</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Baked fish with roasted vegetables</li>
                          <li>• Vegetable stir-fry with tofu</li>
                          <li>• Turkey chili with mixed beans</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-800">Track Your Nutrition</h3>
                      <button onClick={() => navigate('/dashboard')} className="text-blue-600 font-medium text-sm">View Food Log →</button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600 mb-4">
                        Record your meals and see how they affect your blood glucose levels. This will help identify which foods work best for your body.
                      </p>
                      <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Log Today's Meals
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exercise' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="rounded-full bg-orange-100 p-3 mr-4">
                    <Dumbbell className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Physical Activity Plan</h2>
                    <p className="text-gray-600">Customized exercise recommendations for diabetes management</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Activity Guidelines</h3>
                    <ul className="space-y-3">
                      {carePlan.content.sections.find(s => s.title === 'Physical Activity')?.content.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="bg-orange-100 rounded-full p-1 mt-0.5 mr-3">
                            <CheckCircle className="h-4 w-4 text-orange-600" />
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-orange-800 mb-2">Benefits of Regular Exercise</h3>
                    <ul className="space-y-2 text-orange-700">
                      <li className="flex items-start">
                        <div className="min-w-4 mt-1 mr-2">•</div>
                        <span>Improves insulin sensitivity and helps lower blood glucose levels</span>
                      </li>
                      <li className="flex items-start">
                        <div className="min-w-4 mt-1 mr-2">•</div>
                        <span>Supports weight management and fat loss</span>
                      </li>
                      <li className="flex items-start">
                        <div className="min-w-4 mt-1 mr-2">•</div>
                        <span>Reduces risk of cardiovascular complications</span>
                      </li>
                      <li className="flex items-start">
                        <div className="min-w-4 mt-1 mr-2">•</div>
                        <span>Improves mood and reduces stress levels</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Weekly Activity Planner</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intensity</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Monday</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Walking</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">30 min</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Moderate</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Tuesday</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Strength Training</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">20 min</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Moderate</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Wednesday</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rest/Light Stretching</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15 min</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Low</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Thursday</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Swimming/Cycling</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">30 min</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Moderate</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Friday</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Strength Training</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">20 min</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Moderate</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Saturday</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Longer Walk/Hike</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">45 min</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Moderate</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sunday</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rest/Light Activity</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">As desired</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Low</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-800">Track Your Activity</h3>
                      <button onClick={() => navigate('/dashboard')} className="text-blue-600 font-medium text-sm">View Activity Log →</button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600 mb-4">
                        Record your physical activities to track your progress and see how exercise affects your glucose levels.
                      </p>
                      <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Log Today's Activity
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="rounded-full bg-purple-100 p-3 mr-4">
                    <BarChart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Monitoring Guidelines</h2>
                    <p className="text-gray-600">How to track and understand your health metrics</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Blood Glucose Monitoring</h3>
                    <ul className="space-y-3">
                      {carePlan.content.sections.find(s => s.title === 'Blood Glucose Monitoring')?.content.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="bg-purple-100 rounded-full p-1 mt-0.5 mr-3">
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-purple-800 mb-2">Target Ranges</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-purple-200">
                        <thead className="bg-purple-100">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Metric</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Target Range</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">When to Test</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-purple-100">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Fasting Glucose</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">80-130 mg/dL</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">First thing in the morning</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Post-meal Glucose</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">&lt;180 mg/dL</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2 hours after meals</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Blood Pressure</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">&lt;140/90 mmHg</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Same time each day</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">HbA1c</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">&lt;7.0%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Every 3-6 months</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">What to Record</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Daily Metrics</h4>
                        <ul className="text-gray-600 text-sm space-y-2">
                          <li className="flex items-start">
                            <div className="min-w-4 mt-1 mr-2">•</div>
                            <span>Blood glucose readings</span>
                          </li>
                          <li className="flex items-start">
                            <div className="min-w-4 mt-1 mr-2">•</div>
                            <span>Food intake and carbohydrates</span>
                          </li>
                          <li className="flex items-start">
                            <div className="min-w-4 mt-1 mr-2">•</div>
                            <span>Physical activity</span>
                          </li>
                          <li className="flex items-start">
                            <div className="min-w-4 mt-1 mr-2">•</div>
                            <span>Medication taken</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Weekly Metrics</h4>
                        <ul className="text-gray-600 text-sm space-y-2">
                          <li className="flex items-start">
                            <div className="min-w-4 mt-1 mr-2">•</div>
                            <span>Weight</span>
                          </li>
                          <li className="flex items-start">
                            <div className="min-w-4 mt-1 mr-2">•</div>
                            <span>Blood pressure</span>
                          </li>
                          <li className="flex items-start">
                            <div className="min-w-4 mt-1 mr-2">•</div>
                            <span>Overall mood and energy levels</span>
                          </li>
                          <li className="flex items-start">
                            <div className="min-w-4 mt-1 mr-2">•</div>
                            <span>Sleep quality and duration</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-800">Track Your Metrics</h3>
                      <button onClick={() => navigate('/dashboard')} className="text-blue-600 font-medium text-sm">View Dashboard →</button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600 mb-4">
                        Consistently recording your health metrics is one of the most important aspects of diabetes management. It helps you and your healthcare team make informed decisions.
                      </p>
                      <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Record New Measurements
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mental' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="rounded-full bg-blue-100 p-3 mr-4">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Mental Wellbeing</h2>
                    <p className="text-gray-600">Strategies for managing stress and improving mental health</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Stress Management</h3>
                    <ul className="space-y-3">
                      {carePlan.content.sections.find(s => s.title === 'Stress Management')?.content.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="bg-blue-100 rounded-full p-1 mt-0.5 mr-3">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">The Mind-Body Connection</h3>
                    <p className="text-blue-700 mb-3">
                      Stress and diabetes are closely connected. When you're stressed, your body releases hormones that can raise blood sugar levels. Managing stress is an important part of diabetes care.
                    </p>
                    <ul className="space-y-2 text-blue-700">
                      <li className="flex items-start">
                        <div className="min-w-4 mt-1 mr-2">•</div>
                        <span>Chronic stress can contribute to insulin resistance</span>
                      </li>
                      <li className="flex items-start">
                        <div className="min-w-4 mt-1 mr-2">•</div>
                        <span>Stress can lead to poor food choices and skipped exercise</span>
                      </li>
                      <li className="flex items-start">
                        <div className="min-w-4 mt-1 mr-2">•</div>
                        <span>Diabetes distress and burnout can affect self-management</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Daily Practices</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Mindfulness</h4>
                        <p className="text-gray-600 text-sm">
                          Practice being present in the moment without judgment. Try these techniques:
                        </p>
                        <ul className="text-gray-600 text-sm mt-2 space-y-1">
                          <li>• 5-minute focused breathing</li>
                          <li>• Body scan meditation</li>
                          <li>• Mindful walking</li>
                          <li>• Mindful eating practice</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Stress Reduction</h4>
                        <p className="text-gray-600 text-sm">
                          Simple techniques to reduce stress in your daily life:
                        </p>
                        <ul className="text-gray-600 text-sm mt-2 space-y-1">
                          <li>• Progressive muscle relaxation</li>
                          <li>• Guided imagery</li>
                          <li>• Journaling thoughts and feelings</li>
                          <li>• Gentle yoga or stretching</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-800">Emotional Support</h3>
                      <button onClick={() => navigate('/mental-health')} className="text-blue-600 font-medium text-sm">Find Resources →</button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600 mb-4">
                        Managing diabetes can sometimes feel overwhelming. It's important to have emotional support and resources to help you cope.
                      </p>
                      <button onClick={() => navigate('/chat')} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Talk to Health Assistant
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <WeeklyCheckIn 
                goals={carePlan.content.weeklyGoals}
                onUpdateProgress={handleUpdateProgress}
                progressData={progressData}
              />
              
              <ProgressChart 
                data={progressHistory}
                goals={carePlan.content.weeklyGoals}
              />
              
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Progress Insights</h3>
                  
                  {Object.keys(progressData).length > 0 ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <Brain className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-blue-800">AI-Generated Insights</h4>
                            <p className="text-blue-700 text-sm mt-1">
                              {Object.values(progressData).some(val => val > 60)
                                ? "You're making good progress on several goals! Keep up the momentum and focus on consistency."
                                : "You're in the early stages of your care plan. Focus on building sustainable habits and celebrate small victories."}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-medium text-green-800 mb-2">Your Strengths</h4>
                          <ul className="text-green-700 text-sm space-y-2">
                            {Object.entries(progressData).map(([goalId, value]) => {
                              if (value >= 70) {
                                const index = parseInt(goalId.split('-')[1]);
                                return (
                                  <li key={goalId} className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                                    <span>You're doing well with: {carePlan.content.weeklyGoals[index]}</span>
                                  </li>
                                );
                              }
                              return null;
                            })}
                            {!Object.values(progressData).some(val => val >= 70) && (
                              <li className="flex items-start">
                                <span>Keep working on your goals. You'll see your strengths emerge as you progress!</span>
                              </li>
                            )}
                          </ul>
                        </div>
                        
                        <div className="bg-orange-50 rounded-lg p-4">
                          <h4 className="font-medium text-orange-800 mb-2">Areas for Improvement</h4>
                          <ul className="text-orange-700 text-sm space-y-2">
                            {Object.entries(progressData).map(([goalId, value]) => {
                              if (value < 30) {
                                const index = parseInt(goalId.split('-')[1]);
                                return (
                                  <li key={goalId} className="flex items-start">
                                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                                    <span>Focus more on: {carePlan.content.weeklyGoals[index]}</span>
                                  </li>
                                );
                              }
                              return null;
                            })}
                            {!Object.values(progressData).some(val => val < 30) && (
                              <li className="flex items-start">
                                <span>Great job! You're making progress across all your goals.</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-gray-500">Complete your first weekly check-in to see progress insights.</p>
                      <button 
                        onClick={() => setActiveTab('overview')}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Your Goals
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Educational Resources</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <ResourceCard 
                      title="Understanding Diabetes"
                      description="Learn about the basics of diabetes, including types, causes, symptoms, and management approaches."
                      icon={<FileText className="h-6 w-6" />}
                      link="https://www.who.int/news-room/fact-sheets/detail/diabetes"
                      backgroundColor="bg-blue-50"
                      textColor="text-blue-800"
                    />
                    
                    <ResourceCard 
                      title="Nutrition for Diabetes"
                      description="Discover how food affects your blood sugar and learn strategies for balanced meal planning."
                      icon={<Utensils className="h-6 w-6" />}
                      link="https://www.diabetes.org/healthy-living/recipes-nutrition"
                      backgroundColor="bg-green-50"
                      textColor="text-green-800"
                    />
                    
                    <ResourceCard 
                      title="Exercise Benefits"
                      description="Find out how physical activity improves diabetes management and overall health."
                      icon={<Dumbbell className="h-6 w-6" />}
                      link="https://www.cdc.gov/diabetes/managing/active.html"
                      backgroundColor="bg-orange-50"
                      textColor="text-orange-800"
                    />
                    
                    <ResourceCard 
                      title="Emotional Wellbeing"
                      description="Resources for managing the emotional aspects of living with a chronic condition."
                      icon={<Heart className="h-6 w-6" />}
                      link="https://www.diabetes.org/healthy-living/mental-health"
                      backgroundColor="bg-purple-50"
                      textColor="text-purple-800"
                    />
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Videos & Interactive Tools</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Video: Understanding Blood Glucose</h4>
                      <p className="text-gray-600 text-sm mb-3">A clear explanation of what affects your blood glucose levels and how to interpret your readings.</p>
                      <a 
                        href="https://www.youtube.com/watch?v=MGL6km1NBWE" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm font-medium"
                      >
                        Watch Video →
                      </a>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Carb Counting Tool</h4>
                      <p className="text-gray-600 text-sm mb-3">An interactive tool to help you understand carbohydrate content in common foods and practice counting.</p>
                      <a 
                        href="https://www.diabetes.org/healthy-living/recipes-nutrition/understanding-carbs/carb-counting"
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 text-sm font-medium"
                      >
                        Use Tool →
                      </a>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Stress Reduction Audio</h4>
                      <p className="text-gray-600 text-sm mb-3">Guided meditation recordings specifically designed for people managing chronic health conditions.</p>
                      <a 
                        href="https://www.diabetes.co.uk/emotions/stress-and-diabetes.html"
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 text-sm font-medium"
                      >
                        Listen Now →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Support Communities</h2>
                  <p className="text-gray-600 mb-6">
                    Connecting with others who share similar experiences can provide valuable emotional support and practical advice.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-2">Diabetes Online Community</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        A welcoming online forum for people with diabetes to share experiences, ask questions, and offer support.
                      </p>
                      <a 
                        href="https://www.diabetes.org/diabetes/online-community"
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 text-sm font-medium"
                      >
                        Join Community →
                      </a>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-2">Local Support Groups</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Find in-person or virtual support groups in your area where you can connect with others managing similar health conditions.
                      </p>
                      <a 
                        href="https://www.diabetes.org/diabetes/local-support"
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 text-sm font-medium"
                      >
                        Find Groups →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarePlanPage;