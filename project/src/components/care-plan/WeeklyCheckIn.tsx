import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Clipboard,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WeeklyCheckInProps {
  goals: string[];
  onUpdateProgress: (goalIndex: number, value: number) => void;
  progressData: Record<string, number>;
}

const WeeklyCheckIn: React.FC<WeeklyCheckInProps> = ({ 
  goals, 
  onUpdateProgress, 
  progressData 
}) => {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [challenges, setChallenges] = useState('');

  const handleResponseChange = (goalIndex: number, value: number) => {
    setResponses(prev => ({
      ...prev,
      [goalIndex]: value
    }));
  };

  const handleSubmit = () => {
    // Update progress for each goal
    Object.entries(responses).forEach(([goalIndex, value]) => {
      onUpdateProgress(parseInt(goalIndex), value);
    });
    
    toast.success('Weekly check-in completed successfully!');
    setShowCheckIn(false);
    setResponses({});
    setChallenges('');
  };

  // Calculate overall progress
  const overallProgress = goals.length > 0 
    ? Math.round(
        Object.values(progressData).reduce((sum, val) => sum + (val || 0), 0) / 
        (goals.length * 100) * 100
      ) 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Weekly Check-In</h3>
        <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
          <Clipboard className="h-4 w-4 mr-1" />
          <span>Week {Math.ceil(Math.random() * 8)}</span>
        </div>
      </div>
      
      {!showCheckIn ? (
        <>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-gray-700 font-medium">Overall Progress</div>
              <div className="text-sm font-medium text-gray-500">
                {overallProgress}% complete
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  overallProgress > 75 ? 'bg-green-500' :
                  overallProgress > 40 ? 'bg-blue-500' :
                  'bg-orange-500'
                }`}
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            {overallProgress > 75 ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : overallProgress > 40 ? (
              <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            )}
            
            <p className="text-gray-600">
              {overallProgress > 75 
                ? "You're making excellent progress on your care plan!"
                : overallProgress > 40
                ? "You're making good progress. Keep it up!"
                : "You're just getting started. Stay committed to your goals!"}
            </p>
          </div>
          
          <button 
            onClick={() => setShowCheckIn(true)}
            className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete Weekly Check-In
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            Review your progress on each goal this week. How well were you able to follow through?
          </p>
          
          {goals.map((goal, index) => (
            <div key={index} className="border rounded-lg p-4">
              <p className="font-medium text-gray-800 mb-2">{goal}</p>
              <div>
                <p className="text-sm text-gray-600 mb-2">Your progress on this goal:</p>
                <div className="flex items-center">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="10"
                    value={responses[index] ?? progressData[`goal-${index}`] ?? 0}
                    onChange={(e) => handleResponseChange(index, parseInt(e.target.value))}
                    className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 text-gray-700 w-10">
                    {responses[index] ?? progressData[`goal-${index}`] ?? 0}%
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="border rounded-lg p-4">
            <p className="font-medium text-gray-800 mb-2">Challenges & Notes</p>
            <textarea
              placeholder="Share any challenges you faced or notes about your progress..."
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            ></textarea>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCheckIn(false)}
              className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Weekly Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCheckIn;