import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface ProgressItem {
  id: string;
  goal_id: string;
  date: string;
  value: number;
}

interface ProgressChartProps {
  data: ProgressItem[];
  goals: string[];
}

const colors = [
  '#2563eb', // blue-600
  '#16a34a', // green-600
  '#9333ea', // purple-600
  '#ea580c', // orange-600
  '#dc2626', // red-600
];

const ProgressChart: React.FC<ProgressChartProps> = ({ data, goals }) => {
  // Process the raw data into a format suitable for Recharts
  const getChartData = () => {
    // Group progress data by date
    const progressByDate: Record<string, Record<string, number>> = {};
    
    data.forEach(item => {
      const { date, goal_id, value } = item;
      if (!progressByDate[date]) {
        progressByDate[date] = {};
      }
      progressByDate[date][goal_id] = value;
    });
    
    // Convert to array format for Recharts
    return Object.entries(progressByDate)
      .map(([date, values]) => ({
        date,
        ...values
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const chartData = getChartData();

  if (chartData.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">No progress data available yet. Start tracking your goals to see your progress here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Progress Trends</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => format(parseISO(value), 'MMM d')}
            />
            <YAxis 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, '']}
              labelFormatter={(value) => format(parseISO(value as string), 'MMMM d, yyyy')}
            />
            <Legend />
            
            {goals.map((goal, index) => {
              const goalId = `goal-${index}`;
              return (
                <Line
                  key={goalId}
                  type="monotone"
                  dataKey={goalId}
                  name={goal.length > 30 ? goal.substring(0, 30) + '...' : goal}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-500 text-center">
        Track your progress over time to see your improvement and identify patterns
      </div>
    </div>
  );
};

export default ProgressChart;