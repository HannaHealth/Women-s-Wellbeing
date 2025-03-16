import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface ExerciseTimerProps {
  duration: number; // Duration in seconds
  onComplete?: () => void;
}

const ExerciseTimer: React.FC<ExerciseTimerProps> = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-4xl font-bold mb-4 text-blue-600">
        {formatTime(timeLeft)}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-4 py-2 rounded-lg flex items-center ${
            isRunning 
              ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="h-5 w-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              {timeLeft === duration ? 'Start' : 'Resume'}
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default ExerciseTimer;