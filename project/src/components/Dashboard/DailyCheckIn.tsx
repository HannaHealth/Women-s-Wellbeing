import React, { useState } from 'react';
import { Sun, Moon, CloudRain } from 'lucide-react';
import { useHealthData } from '../../contexts/HealthDataContext';
import toast from 'react-hot-toast';

const DailyCheckIn: React.FC = () => {
  const { addHealthMetric } = useHealthData();
  const [energyLevel, setEnergyLevel] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(6);
  const [stressLevel, setStressLevel] = useState(5);
  const [saving, setSaving] = useState(false);

  const handleSaveCheckIn = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await addHealthMetric({
        date: today,
        mood: Math.round((energyLevel + (10 - stressLevel) + sleepQuality) / 3),
        notes: `Energy: ${energyLevel}/10, Sleep: ${sleepQuality}/10, Stress: ${stressLevel}/10`,
        weight: null,
        blood_glucose: null,
        blood_pressure_systolic: null,
        blood_pressure_diastolic: null,
        steps: null,
        sleep_hours: sleepQuality / 2 // Convert 1-10 scale to hours
      });

      toast.success('Daily check-in saved successfully');
    } catch (error) {
      console.error('Error saving check-in:', error);
      toast.error('Failed to save check-in');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Check-in</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
  );
};

export default DailyCheckIn;