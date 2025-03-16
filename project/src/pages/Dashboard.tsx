import React, { useState, useEffect } from 'react';
import { 
  BarChart as BarChartIcon, 
  Activity, 
  Heart, 
  Plus, 
  Info, 
  ArrowDown, 
  ArrowUp,
  Calendar
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { format, subDays, parseISO } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useHealthData } from '../contexts/HealthDataContext';
import { analyzeHealthData } from '../utils/openai';
import toast from 'react-hot-toast';
import HealthDataSummary from '../components/Dashboard/HealthDataSummary';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { healthMetrics, healthProfile, addHealthMetric, loading } = useHealthData();
  
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  const [insights, setInsights] = useState<any[]>([]);
  const [riskFactors, setRiskFactors] = useState<any>({});
  const [progressToGoals, setProgressToGoals] = useState<any>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [newMetric, setNewMetric] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    blood_glucose: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    mood: 3,
    steps: '',
    sleep_hours: '',
    notes: ''
  });
  
  // Fetch health insights on component mount
  useEffect(() => {
    if (user && healthMetrics && healthMetrics.length > 0) {
      fetchHealthInsights();
    }
  }, [user, healthMetrics]);
  
  const fetchHealthInsights = async () => {
    if (!user) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeHealthData(user.id);
      setInsights(analysis.insights || []);
      setRiskFactors(analysis.riskFactors || {});
      setProgressToGoals(analysis.progressToGoals || {});
    } catch (error) {
      console.error('Error fetching health insights:', error);
      toast.error('Failed to analyze health data');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to add health metrics');
      return;
    }
    
    try {
      // Convert string values to appropriate types
      await addHealthMetric({
        date: newMetric.date,
        weight: newMetric.weight ? parseFloat(newMetric.weight) : null,
        blood_glucose: newMetric.blood_glucose ? parseFloat(newMetric.blood_glucose) : null,
        blood_pressure_systolic: newMetric.blood_pressure_systolic ? parseInt(newMetric.blood_pressure_systolic) : null,
        blood_pressure_diastolic: newMetric.blood_pressure_diastolic ? parseInt(newMetric.blood_pressure_diastolic) : null,
        mood: newMetric.mood,
        steps: newMetric.steps ? parseInt(newMetric.steps) : null,
        sleep_hours: newMetric.sleep_hours ? parseFloat(newMetric.sleep_hours) : null,
        notes: newMetric.notes
      });
      
      // Reset form and close modal
      setNewMetric({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        blood_glucose: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        mood: 3,
        steps: '',
        sleep_hours: '',
        notes: ''
      });
      setShowAddMetric(false);
      
      toast.success('Health metric added successfully');
    } catch (error) {
      console.error('Error adding health metric:', error);
      toast.error('Failed to add health metric');
    }
  };
  
  // Filter metrics based on selected time range
  const getFilteredMetrics = () => {
    if (!healthMetrics || healthMetrics.length === 0) return [];
    
    const today = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'week':
        startDate = subDays(today, 7);
        break;
      case 'month':
        startDate = subDays(today, 30);
        break;
      case 'year':
        startDate = subDays(today, 365);
        break;
      default:
        startDate = subDays(today, 7);
    }
    
    return healthMetrics.filter(metric => {
      const metricDate = new Date(metric.date);
      return metricDate >= startDate && metricDate <= today;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  const filteredMetrics = getFilteredMetrics();
  
  // Prepare data for charts
  const prepareChartData = (metricKey: keyof typeof healthMetrics[0], label: string, color: string) => {
    if (!filteredMetrics || filteredMetrics.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label,
            data: [],
            borderColor: color,
            backgroundColor: `${color}33`,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: color,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      };
    }
    
    const dates = filteredMetrics.map(metric => format(new Date(metric.date), 'MMM d'));
    const values = filteredMetrics.map(metric => metric[metricKey] || null);
    
    return {
      labels: dates,
      datasets: [
        {
          label,
          data: values,
          borderColor: color,
          backgroundColor: `${color}33`, // Add transparency to the color
          fill: true,
          tension: 0.4,
          pointBackgroundColor: color,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  };
  
  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          precision: 0
        }
      }
    },
    maintainAspectRatio: false
  };
  
  // Calculate averages for metrics
  const calculateAverage = (metricKey: keyof typeof healthMetrics[0]) => {
    if (!filteredMetrics || filteredMetrics.length === 0) return 'N/A';
    
    const validValues = filteredMetrics
      .map(metric => metric[metricKey])
      .filter(value => value !== null && value !== undefined) as number[];
    
    if (validValues.length === 0) return 'N/A';
    
    const sum = validValues.reduce((acc, value) => acc + value, 0);
    return (sum / validValues.length).toFixed(1);
  };
  
  // Calculate trends
  const calculateTrend = (metricKey: keyof typeof healthMetrics[0]) => {
    if (!filteredMetrics || filteredMetrics.length < 2) return { value: 0, direction: 'neutral' };
    
    const validMetrics = filteredMetrics
      .filter(metric => metric[metricKey] !== null && metric[metricKey] !== undefined);
    
    if (validMetrics.length < 2) return { value: 0, direction: 'neutral' };
    
    // Compare first and last value
    const firstValue = validMetrics[0][metricKey] as number;
    const lastValue = validMetrics[validMetrics.length - 1][metricKey] as number;
    
    const difference = lastValue - firstValue;
    const percentChange = (difference / firstValue) * 100;
    
    return {
      value: Math.abs(percentChange).toFixed(1),
      direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'neutral'
    };
  };
  
  // Get appropriate color based on blood glucose value
  const getGlucoseColor = (value: number) => {
    if (value < 70) return 'text-red-500'; // Low
    if (value > 180) return 'text-red-500'; // High
    if (value > 140) return 'text-yellow-500'; // Elevated
    return 'text-green-500'; // Normal
  };
  
  // Get emoji for mood value
  const getMoodEmoji = (value: number | null) => {
    if (value === null) return '😐';
    if (value <= 1) return '😢';
    if (value === 2) return '🙁';
    if (value === 3) return '😐';
    if (value === 4) return '🙂';
    return '😄';
  };
  
  // Get blood pressure category
  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic >= 180 || diastolic >= 120) return { label: 'Crisis', color: 'text-red-600' };
    if (systolic >= 140 || diastolic >= 90) return { label: 'High', color: 'text-red-500' };
    if (systolic >= 130 || diastolic >= 80) return { label: 'Elevated', color: 'text-yellow-500' };
    return { label: 'Normal', color: 'text-green-500' };
  };
  
  // Render a loading state if data is still loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-600">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            onClick={() => setShowAddMetric(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="mr-2 h-5 w-5" />
            {t('dashboard.addEntry')}
          </button>
        </div>
      </div>
      
      {/* Time range selector */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700">Time range:</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === 'week' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              7 days
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === 'month' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              30 days
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === 'year' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Year
            </button>
          </div>
        </div>
      </div>
      
      {/* Health metrics summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
        {/* Blood Glucose */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('dashboard.bloodGlucose')}</h3>
              <p className="text-2xl font-bold mt-1">
                {calculateAverage('blood_glucose') !== 'N/A' 
                  ? <span className={getGlucoseColor(parseFloat(calculateAverage('blood_glucose')))}>
                      {calculateAverage('blood_glucose')}
                    </span> 
                  : <span className="text-gray-400">N/A</span>
                }
                <span className="text-gray-400 text-sm"> mg/dL</span>
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          {calculateAverage('blood_glucose') !== 'N/A' && (
            <div className="flex items-center mt-1">
              {calculateTrend('blood_glucose').direction === 'down' ? (
                <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
              ) : calculateTrend('blood_glucose').direction === 'up' ? (
                <ArrowUp className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <span className="h-4 w-4 text-gray-500 mr-1">-</span>
              )}
              <span className="text-xs text-gray-500">
                {calculateTrend('blood_glucose').value}% {
                  calculateTrend('blood_glucose').direction === 'down' ? 'lower' : 
                  calculateTrend('blood_glucose').direction === 'up' ? 'higher' : 
                  'change'
                }
              </span>
            </div>
          )}
        </div>
        
        {/* Weight */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('dashboard.weight')}</h3>
              <p className="text-2xl font-bold mt-1">
                {calculateAverage('weight') !== 'N/A' 
                  ? <span>{calculateAverage('weight')}</span> 
                  : <span className="text-gray-400">N/A</span>
                }
                <span className="text-gray-400 text-sm"> kg</span>
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <BarChartIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
          {calculateAverage('weight') !== 'N/A' && (
            <div className="flex items-center mt-1">
              {calculateTrend('weight').direction === 'down' ? (
                <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
              ) : calculateTrend('weight').direction === 'up' ? (
                <ArrowUp className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <span className="h-4 w-4 text-gray-500 mr-1">-</span>
              )}
              <span className="text-xs text-gray-500">
                {calculateTrend('weight').value}% {
                  calculateTrend('weight').direction === 'down' ? 'decrease' : 
                  calculateTrend('weight').direction === 'up' ? 'increase' : 
                  'change'
                }
              </span>
            </div>
          )}
        </div>
        
        {/* Blood Pressure */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('dashboard.bloodPressure')}</h3>
              <p className="text-2xl font-bold mt-1">
                {calculateAverage('blood_pressure_systolic') !== 'N/A' && calculateAverage('blood_pressure_diastolic') !== 'N/A' ? (
                  <span className={getBPCategory(
                    parseFloat(calculateAverage('blood_pressure_systolic')), 
                    parseFloat(calculateAverage('blood_pressure_diastolic'))
                  ).color}>
                    {Math.round(parseFloat(calculateAverage('blood_pressure_systolic')))}/{Math.round(parseFloat(calculateAverage('blood_pressure_diastolic')))}
                  </span>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
          </div>
          {calculateAverage('blood_pressure_systolic') !== 'N/A' && (
            <div className="flex items-center mt-1">
              <span className="text-xs py-0.5 px-1.5 rounded bg-gray-100 text-gray-700">
                {getBPCategory(
                  parseFloat(calculateAverage('blood_pressure_systolic')), 
                  parseFloat(calculateAverage('blood_pressure_diastolic'))
                ).label}
              </span>
            </div>
          )}
        </div>
        
        {/* Daily Steps */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Steps</h3>
              <p className="text-2xl font-bold mt-1">
                {calculateAverage('steps') !== 'N/A' 
                  ? Math.round(parseFloat(calculateAverage('steps'))).toLocaleString()
                  : <span className="text-gray-400">N/A</span>
                }
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          {calculateAverage('steps') !== 'N/A' && (
            <div className="flex items-center mt-1">
              {calculateTrend('steps').direction === 'up' ? (
                <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              ) : calculateTrend('steps').direction === 'down' ? (
                <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <span className="h-4 w-4 text-gray-500 mr-1">-</span>
              )}
              <span className="text-xs text-gray-500">
                {calculateTrend('steps').value}% {
                  calculateTrend('steps').direction === 'up' ? 'increase' : 
                  calculateTrend('steps').direction === 'down' ? 'decrease' : 
                  'change'
                }
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Health trends charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Blood Glucose Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Blood Glucose Trends</h2>
            {filteredMetrics && filteredMetrics.some(metric => metric.blood_glucose !== null) ? (
              <div className="h-64">
                <Line 
                  data={prepareChartData('blood_glucose', 'Blood Glucose', '#3b82f6')} 
                  options={lineChartOptions} 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
                <Info className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-gray-500">No blood glucose data available</p>
                <button 
                  onClick={() => setShowAddMetric(true)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                  Add your first reading
                </button>
              </div>
            )}
          </div>
          
          {/* Weight Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Weight History</h2>
            {filteredMetrics && filteredMetrics.some(metric => metric.weight !== null) ? (
              <div className="h-64">
                <Line 
                  data={prepareChartData('weight', 'Weight', '#10b981')} 
                  options={lineChartOptions} 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
                <Info className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-gray-500">No weight data available</p>
                <button 
                  onClick={() => setShowAddMetric(true)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                  Add your first reading
                </button>
              </div>
            )}
          </div>
          
          {/* Blood Pressure Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Blood Pressure History</h2>
            {filteredMetrics && filteredMetrics.some(metric => metric.blood_pressure_systolic !== null) ? (
              <div className="h-64">
                <Bar 
                  data={{
                    labels: filteredMetrics.map(metric => format(new Date(metric.date), 'MMM d')),
                    datasets: [
                      {
                        label: 'Systolic',
                        data: filteredMetrics.map(metric => metric.blood_pressure_systolic),
                        backgroundColor: '#ef4444',
                      },
                      {
                        label: 'Diastolic',
                        data: filteredMetrics.map(metric => metric.blood_pressure_diastolic),
                        backgroundColor: '#f97316',
                      }
                    ]
                  }} 
                  options={{
                    ...lineChartOptions,
                    plugins: {
                      ...lineChartOptions.plugins,
                      legend: {
                        display: true
                      }
                    }
                  }} 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
                <Info className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-gray-500">No blood pressure data available</p>
                <button 
                  onClick={() => setShowAddMetric(true)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                  Add your first reading
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Health Assessment Summary */}
          <HealthDataSummary />
          
          {/* Health insights */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Health Insights</h2>
              <button 
                onClick={fetchHealthInsights}
                disabled={isAnalyzing}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {isAnalyzing ? 'Analyzing...' : 'Refresh'}
              </button>
            </div>
            
            {insights && insights.length > 0 ? (
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-3">
                    <h3 className="font-medium text-gray-800">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">{insight.description}</p>
                    <p className="text-sm text-blue-600">{insight.recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-lg">
                <Info className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-gray-500 text-center">
                  {(!healthMetrics || healthMetrics.length === 0) 
                    ? "Add health metrics to get personalized insights" 
                    : isAnalyzing 
                      ? "Analyzing your health data..." 
                      : "No insights available yet"}
                </p>
              </div>
            )}
          </div>
          
          {/* Recent entries */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Entries</h2>
            
            {healthMetrics && healthMetrics.length > 0 ? (
              <div className="space-y-4">
                {healthMetrics.slice(0, 3).map((metric) => (
                  <div key={metric.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium text-gray-800">
                        {format(new Date(metric.date), 'MMMM d, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(metric.created_at), 'h:mm a')}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {metric.blood_glucose && (
                        <div className="text-xs">
                          <span className="text-gray-500">Glucose:</span> 
                          <span className={`ml-1 ${getGlucoseColor(metric.blood_glucose)}`}>
                            {metric.blood_glucose} mg/dL
                          </span>
                        </div>
                      )}
                      {metric.weight && (
                        <div className="text-xs">
                          <span className="text-gray-500">Weight:</span> 
                          <span className="ml-1">{metric.weight} kg</span>
                        </div>
                      )}
                      {metric.blood_pressure_systolic && metric.blood_pressure_diastolic && (
                        <div className="text-xs">
                          <span className="text-gray-500">BP:</span> 
                          <span className="ml-1">
                            {metric.blood_pressure_systolic}/{metric.blood_pressure_diastolic}
                          </span>
                        </div>
                      )}
                      {metric.mood && (
                        <div className="text-xs">
                          <span className="text-gray-500">Mood:</span> 
                          <span className="ml-1">{getMoodEmoji(metric.mood)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-lg">
                <Info className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-gray-500">No entries found</p>
                <button 
                  onClick={() => setShowAddMetric(true)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                  Add your first entry
                </button>
              </div>
            )}
          </div>
          
          {/* Risk assessment */}
          {Object.keys(riskFactors).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Health Risk Assessment</h2>
              
              <div className="space-y-3">
                {Object.entries(riskFactors).map(([factor, level]) => (
                  <div key={factor} className="flex items-center justify-between">
                    <div className="text-gray-700">
                      {factor.charAt(0).toUpperCase() + factor.slice(1).replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                      level === 'Low' ? 'bg-green-100 text-green-800' :
                      level === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {level}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Goals progress */}
      {Object.keys(progressToGoals).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Progress to Goals</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(progressToGoals).map(([goal, progress]) => (
              <div key={goal} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <div className="text-gray-700 font-medium">
                    {goal === 'bloodGlucose' ? 'Blood Glucose' :
                     goal === 'weight' ? 'Weight Management' :
                     goal === 'activity' ? 'Physical Activity' : goal}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {progress}% complete
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div 
                    className={`h-2.5 rounded-full ${
                      (progress as number) > 75 ? 'bg-green-500' :
                      (progress as number) > 40 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add health metric modal */}
      {showAddMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">{t('dashboard.addNewEntry')}</h2>
                <button 
                  onClick={() => setShowAddMetric(false)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddMetric}>
                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.form.date')}
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={newMetric.date}
                    onChange={(e) => setNewMetric({...newMetric, date: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="blood_glucose" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.form.bloodGlucose')} (mg/dL)
                    </label>
                    <input
                      type="number"
                      id="blood_glucose"
                      value={newMetric.blood_glucose}
                      onChange={(e) => setNewMetric({...newMetric, blood_glucose: e.target.value})}
                      placeholder="e.g., 120"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.form.weight')} (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      id="weight"
                      value={newMetric.weight}
                      onChange={(e) => setNewMetric({...newMetric, weight: e.target.value})}
                      placeholder="e.g., 65.5"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="blood_pressure_systolic" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.form.systolic')} (mmHg)
                    </label>
                    <input
                      type="number"
                      id="blood_pressure_systolic"
                      value={newMetric.blood_pressure_systolic}
                      onChange={(e) => setNewMetric({...newMetric, blood_pressure_systolic: e.target.value})}
                      placeholder="e.g., 120"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="blood_pressure_diastolic" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.form.diastolic')} (mmHg)
                    </label>
                    <input
                      type="number"
                      id="blood_pressure_diastolic"
                      value={newMetric.blood_pressure_diastolic}
                      onChange={(e) => setNewMetric({...newMetric, blood_pressure_diastolic: e.target.value})}
                      placeholder="e.g., 80"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.form.mood')}
                  </label>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setNewMetric({...newMetric, mood: 1})}
                      className={`p-2 rounded-full ${newMetric.mood === 1 ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    >
                      <span role="img" aria-label="Very Bad" className="text-xl">😢</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMetric({...newMetric, mood: 2})}
                      className={`p-2 rounded-full ${newMetric.mood === 2 ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    >
                      <span role="img" aria-label="Bad" className="text-xl">🙁</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMetric({...newMetric, mood: 3})}
                      className={`p-2 rounded-full ${newMetric.mood === 3 ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    >
                      <span role="img" aria-label="Neutral" className="text-xl">😐</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMetric({...newMetric, mood: 4})}
                      className={`p-2 rounded-full ${newMetric.mood === 4 ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    >
                      <span role="img" aria-label="Good" className="text-xl">🙂</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMetric({...newMetric, mood: 5})}
                      className={`p-2 rounded-full ${newMetric.mood === 5 ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    >
                      <span role="img" aria-label="Very Good" className="text-xl">😄</span>
                    </button>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                    <span>{t('dashboard.form.moodVeryBad')}</span>
                    <span>{t('dashboard.form.moodBad')}</span>
                    <span>{t('dashboard.form.moodNeutral')}</span>
                    <span>{t('dashboard.form.moodGood')}</span>
                    <span>{t('dashboard.form.moodVeryGood')}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="steps" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.form.steps')}
                    </label>
                    <input
                      type="number"
                      id="steps"
                      value={newMetric.steps}
                      onChange={(e) => setNewMetric({...newMetric, steps: e.target.value})}
                      placeholder="e.g., 8000"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="sleep_hours" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.form.sleep')} ({t('dashboard.form.hours')})
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      id="sleep_hours"
                      value={newMetric.sleep_hours}
                      onChange={(e) => setNewMetric({...newMetric, sleep_hours: e.target.value})}
                      placeholder="e.g., 7.5"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.form.notes')}
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={newMetric.notes}
                    onChange={(e) => setNewMetric({...newMetric, notes: e.target.value})}
                    placeholder="Any notable events, symptoms, or observations..."
                    className="w-full p-2 border border-gray-300 rounded-md"
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddMetric(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    {t('dashboard.form.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('dashboard.form.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;