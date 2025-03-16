import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Brain, 
  CloudRain, 
  Moon, 
  Clock, 
  Sun, 
  Activity,
  Smile,
  Frown,
  Meh,
  LineChart,
  Calendar,
  ArrowRight,
  X
} from 'lucide-react';
import ExerciseTimer from '../components/mental-health/ExerciseTimer';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useHealthData } from '../contexts/HealthDataContext';
import toast from 'react-hot-toast';

const MentalHealth: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { healthMetrics, addHealthMetric } = useHealthData();
  const [moodToday, setMoodToday] = useState<number | null>(null);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [moodNotes, setMoodNotes] = useState('');
  const [energyLevel, setEnergyLevel] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(6);
  const [stressLevel, setStressLevel] = useState(5);
  const [saving, setSaving] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  const [exercises] = useState({
    'breathing': {
      title: 'Deep Breathing Exercise',
      steps: [
        'Find a comfortable, quiet place to sit or lie down',
        'Place one hand on your chest and the other on your stomach',
        'Breathe in slowly through your nose for a count of 4, feeling your stomach rise',
        'Hold your breath for a count of 2',
        'Exhale slowly through your mouth for a count of 6',
        'Repeat this cycle 10 times, focusing on your breath'
      ],
      duration: 300 // 5 minutes
    },
    'grounding': {
      title: '5-4-3-2-1 Grounding Technique',
      steps: [
        'Acknowledge 5 things you can see around you',
        'Acknowledge 4 things you can touch or feel',
        'Acknowledge 3 things you can hear',
        'Acknowledge 2 things you can smell (or like to smell)',
        'Acknowledge 1 thing you can taste (or like to taste)',
        'Take a deep breath and notice how you feel more present'
      ],
      duration: 180 // 3 minutes
    },
    'pmr': {
      title: 'Progressive Muscle Relaxation',
      steps: [
        'Find a comfortable position sitting or lying down',
        'Start with your feet - tense the muscles for 5 seconds, then relax',
        'Move upward to your calves - tense for 5 seconds, then relax',
        'Continue with thighs, abdomen, hands, arms, shoulders, neck, and face',
        'Focus on the feeling of relaxation in each muscle group',
        'When finished, sit quietly for a moment and notice how your body feels'
      ],
      duration: 420 // 7 minutes
    }
  });

  // Check if user has already logged mood today
  useEffect(() => {
    if (healthMetrics.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const todayMoodRecord = healthMetrics.find(
        metric => metric.date === today && metric.mood !== null
      );
      
      if (todayMoodRecord) {
        setMoodToday(todayMoodRecord.mood);
      }
    }
  }, [healthMetrics]);

  const handleSaveCheckIn = async () => {
    if (!user) {
      toast.error('Please sign in to save your check-in');
      return;
    }

    if (!moodToday) {
      toast.error('Please select your mood');
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await addHealthMetric({
        date: today,
        mood: moodToday,
        notes: moodNotes || null,
        weight: null,
        blood_glucose: null,
        blood_pressure_systolic: null,
        blood_pressure_diastolic: null,
        steps: null,
        sleep_hours: sleepQuality / 2 // Convert 1-10 scale to hours (0.5-5)
      });

      toast.success('Daily check-in saved successfully');
      setShowMoodTracker(false);
      setMoodNotes('');
    } catch (error) {
      console.error('Error saving check-in:', error);
      toast.error('Failed to save check-in');
    } finally {
      setSaving(false);
    }
  };

  const renderExerciseSteps = (exerciseId: string) => {
    const exercise = exercises[exerciseId as keyof typeof exercises];
    if (!exercise) return null;

    const handleTimerComplete = () => {
      toast.success('Exercise completed! Great job!');
      setShowTimer(false);
    };

    return (
      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">{exercise.title}</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-700 ml-2">
          {exercise.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
        <div className="flex justify-between mt-6">
          <button 
            onClick={() => setActiveExercise(null)}
            className="text-blue-600 font-medium"
          >
            Close
          </button>
          <button 
            onClick={() => setShowTimer(!showTimer)} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showTimer ? 'Hide Timer' : 'Start Timer'}
          </button>
        </div>
        {showTimer && (
          <div className="mt-4 p-4 bg-white rounded-lg">
            <ExerciseTimer 
              duration={exercise.duration}
              onComplete={handleTimerComplete}
            />
          </div>
        )}
      </div>
    );
  };

  // Get emoji for mood value
  const getMoodEmoji = (value: number | null): string => {
    if (value === null) return '😐';
    if (value <= 1) return '😢';
    if (value === 2) return '🙁';
    if (value === 3) return '😐';
    if (value === 4) return '🙂';
    return '😄';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mental Wellbeing</h1>
          <p className="text-gray-600">Track your mood and practice mindfulness exercises</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Mood Tracker */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Mood Tracker</h2>
              <button
                onClick={() => setShowMoodTracker(true)}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Log Today's Mood
              </button>
            </div>
            
            {moodToday ? (
              <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <p className="text-5xl mb-2">{getMoodEmoji(moodToday)}</p>
                  <p className="text-blue-800">Your mood today</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-2">You haven't logged your mood today</p>
                <button
                  onClick={() => setShowMoodTracker(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Log Now
                </button>
              </div>
            )}
          </div>
          
          {/* Breathing Exercises */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Mindfulness Exercises</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setActiveExercise('breathing');
                  setShowTimer(false);
                }}
                className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <h3 className="font-medium text-blue-800 mb-2">Deep Breathing</h3>
                <p className="text-sm text-blue-600 mb-2">5 minutes</p>
                <p className="text-xs text-gray-600">Reduce stress and anxiety with controlled breathing techniques</p>
              </button>
              
              <button
                onClick={() => {
                  setActiveExercise('grounding');
                  setShowTimer(false);
                }}
                className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <h3 className="font-medium text-green-800 mb-2">Grounding Exercise</h3>
                <p className="text-sm text-green-600 mb-2">3 minutes</p>
                <p className="text-xs text-gray-600">Reconnect with the present moment using your senses</p>
              </button>
              
              <button
                onClick={() => {
                  setActiveExercise('pmr');
                  setShowTimer(false);
                }}
                className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
              >
                <h3 className="font-medium text-purple-800 mb-2">Progressive Relaxation</h3>
                <p className="text-sm text-purple-600 mb-2">7 minutes</p>
                <p className="text-xs text-gray-600">Release physical tension through targeted muscle relaxation</p>
              </button>
            </div>
            
            {activeExercise && renderExerciseSteps(activeExercise)}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Check-in</h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Sun className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Energy Level</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-green-800 w-8">Low</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-green-800 w-8 text-right">High</span>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Moon className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="font-medium text-purple-800">Sleep Quality</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-purple-800 w-8">Poor</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-purple-800 w-8 text-right">Great</span>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <CloudRain className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="font-medium text-orange-800">Stress Level</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-orange-800 w-8">Low</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={stressLevel}
                    onChange={(e) => setStressLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-orange-800 w-8 text-right">High</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSaveCheckIn}
              disabled={saving}
              className="w-full mt-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Check-in'}
            </button>
          </div>
          
          {/* Mental Health Resources */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Wellbeing Resources</h2>
            <div className="space-y-3">
              <a href="https://www.mind.org.uk/" target="_blank" rel="noreferrer" className="flex items-start p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Brain className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">Stress Management</h3>
                  <p className="text-xs text-gray-600">Techniques for managing stress and anxiety</p>
                </div>
              </a>
              <a href="https://www.sleepfoundation.org/" target="_blank" rel="noreferrer" className="flex items-start p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Moon className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-purple-800">Sleep Hygiene</h3>
                  <p className="text-xs text-gray-600">Tips for better sleep quality</p>
                </div>
              </a>
              <a href="https://www.headspace.com/" target="_blank" rel="noreferrer" className="flex items-start p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Heart className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800">Meditation Guide</h3>
                  <p className="text-xs text-gray-600">Introduction to meditation and mindfulness</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mood Tracker Modal */}
      {showMoodTracker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">How are you feeling today?</h2>
                <button 
                  onClick={() => setShowMoodTracker(false)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setMoodToday(1)}
                  className={`p-3 rounded-full ${moodToday === 1 ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <span role="img" aria-label="Very Bad" className="text-3xl">😢</span>
                </button>
                <button
                  onClick={() => setMoodToday(2)}
                  className={`p-3 rounded-full ${moodToday === 2 ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <span role="img" aria-label="Bad" className="text-3xl">🙁</span>
                </button>
                <button
                  onClick={() => setMoodToday(3)}
                  className={`p-3 rounded-full ${moodToday === 3 ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <span role="img" aria-label="Neutral" className="text-3xl">😐</span>
                </button>
                <button
                  onClick={() => setMoodToday(4)}
                  className={`p-3 rounded-full ${moodToday === 4 ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <span role="img" aria-label="Good" className="text-3xl">🙂</span>
                </button>
                <button
                  onClick={() => setMoodToday(5)}
                  className={`p-3 rounded-full ${moodToday === 5 ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <span role="img" aria-label="Very Good" className="text-3xl">😄</span>
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={moodNotes}
                  onChange={(e) => setMoodNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What's contributing to your mood today?"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowMoodTracker(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCheckIn}
                  disabled={!moodToday || saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentalHealth;