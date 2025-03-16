import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, ArrowDown, ArrowUp, FileBadge as FileBar, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useHealthData } from '../contexts/HealthDataContext';
import { analyzeNutrition, getNutritionData, addFoodEntry } from '../utils/nutrition';
import toast from 'react-hot-toast';

// Types for nutrition data
interface FoodEntry {
  id: string;
  user_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  portion: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  glycemic_index?: number;
  created_at: string;
}

interface NutritionSummary {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
}

interface Recommendation {
  name: string;
  description: string;
  benefits: string[];
  glycemic_index: number;
}

const NutritionPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { healthProfile } = useHealthData();
  
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [nutritionSummary, setNutritionSummary] = useState<NutritionSummary>({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    fiber: 0
  });
  
  const [showAddFood, setShowAddFood] = useState(false);
  const [newFood, setNewFood] = useState({
    meal_type: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    name: '',
    portion: '',
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    fiber: 0
  });
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sortBy, setSortBy] = useState('time');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Load nutrition data
  useEffect(() => {
    if (!user) return;
    
    const fetchNutritionData = async () => {
      setLoading(true);
      try {
        const data = await getNutritionData(user.id, selectedDate);
        setFoodEntries(data);
        
        // Calculate nutrition summary from entries
        const summary = data.reduce((acc, entry) => {
          return {
            calories: acc.calories + entry.calories,
            carbs: acc.carbs + entry.carbs,
            protein: acc.protein + entry.protein,
            fat: acc.fat + entry.fat,
            fiber: acc.fiber + entry.fiber,
          };
        }, { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 });
        
        setNutritionSummary(summary);
        
        // Get personalized recommendations
        const recs = await analyzeNutrition(user.id, healthProfile);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error fetching nutrition data:', error);
        toast.error('Failed to load nutrition data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNutritionData();
  }, [user, selectedDate, healthProfile]);
  
  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to add food entries');
      return;
    }
    
    if (!newFood.name || !newFood.portion) {
      toast.error('Please provide both food name and portion');
      return;
    }
    
    try {
      const entry = await addFoodEntry({
        ...newFood,
        user_id: user.id,
        date: selectedDate
      });
      
      setFoodEntries([entry, ...foodEntries]);
      
      // Update summary
      setNutritionSummary({
        calories: nutritionSummary.calories + newFood.calories,
        carbs: nutritionSummary.carbs + newFood.carbs,
        protein: nutritionSummary.protein + newFood.protein,
        fat: nutritionSummary.fat + newFood.fat,
        fiber: nutritionSummary.fiber + newFood.fiber
      });
      
      // Reset form
      setNewFood({
        meal_type: 'breakfast',
        name: '',
        portion: '',
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
        fiber: 0
      });
      
      setShowAddFood(false);
      toast.success('Food entry added successfully');
    } catch (error) {
      console.error('Error adding food entry:', error);
      toast.error('Failed to add food entry');
    }
  };
  
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  // Sort the food entries based on current sort settings
  const sortedEntries = [...foodEntries].sort((a, b) => {
    if (sortBy === 'time') {
      return sortDirection === 'asc' 
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'calories') {
      return sortDirection === 'asc' ? a.calories - b.calories : b.calories - a.calories;
    } else if (sortBy === 'carbs') {
      return sortDirection === 'asc' ? a.carbs - b.carbs : b.carbs - a.carbs;
    }
    return 0;
  });
  
  // Display macronutrient breakdown
  const MacronutrientChart = () => {
    const total = nutritionSummary.carbs + nutritionSummary.protein + nutritionSummary.fat;
    const carbsPercent = total > 0 ? (nutritionSummary.carbs / total) * 100 : 0;
    const proteinPercent = total > 0 ? (nutritionSummary.protein / total) * 100 : 0;
    const fatPercent = total > 0 ? (nutritionSummary.fat / total) * 100 : 0;
    
    return (
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-blue-500" 
          style={{ width: `${carbsPercent}%` }}
        ></div>
        <div 
          className="absolute h-full bg-purple-500" 
          style={{ left: `${carbsPercent}%`, width: `${proteinPercent}%` }}
        ></div>
        <div 
          className="absolute h-full bg-yellow-500" 
          style={{ left: `${carbsPercent + proteinPercent}%`, width: `${fatPercent}%` }}
        ></div>
      </div>
    );
  };
  
  // Meal type badge component
  const MealTypeBadge = ({ type }: { type: string }) => {
    const colors = {
      breakfast: 'bg-orange-100 text-orange-800',
      lunch: 'bg-green-100 text-green-800',
      dinner: 'bg-blue-100 text-blue-800',
      snack: 'bg-purple-100 text-purple-800'
    };
    const colorClass = colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('nutrition.title')}</h1>
          <p className="text-gray-600">
            {t('nutrition.subtitle')}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            onClick={() => setShowAddFood(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="mr-2 h-5 w-5" />
            {t('nutrition.addFood')}
          </button>
        </div>
      </div>
      
      {/* Date selector */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-0 p-1 focus:ring-0"
            />
          </div>
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <select 
              className="border-0 p-1 focus:ring-0"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="time">Time</option>
              <option value="calories">Calories</option>
              <option value="carbs">Carbs</option>
            </select>
            <button onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
              {sortDirection === 'asc' ? 
                <ArrowUp className="h-5 w-5 text-gray-500 ml-1" /> : 
                <ArrowDown className="h-5 w-5 text-gray-500 ml-1" />
              }
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {/* Daily summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Summary</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-sm text-blue-600 font-medium">Calories</p>
                <p className="text-xl font-bold text-blue-800">{nutritionSummary.calories}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-sm text-blue-600 font-medium">Carbs</p>
                <p className="text-xl font-bold text-blue-800">{nutritionSummary.carbs}g</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-sm text-blue-600 font-medium">Protein</p>
                <p className="text-xl font-bold text-blue-800">{nutritionSummary.protein}g</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-sm text-blue-600 font-medium">Fat</p>
                <p className="text-xl font-bold text-blue-800">{nutritionSummary.fat}g</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-sm text-blue-600 font-medium">Fiber</p>
                <p className="text-xl font-bold text-blue-800">{nutritionSummary.fiber}g</p>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Macronutrient Breakdown</span>
                <div className="flex space-x-4 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span>Carbs</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                    <span>Protein</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                    <span>Fat</span>
                  </div>
                </div>
              </div>
              <MacronutrientChart />
            </div>
          </div>
          
          {/* Food entries */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Food Entries</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search entries..."
                  className="pl-8 pr-4 py-1 border border-gray-300 rounded-lg text-sm"
                />
                <Search className="absolute left-2 top-1.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : sortedEntries.length > 0 ? (
              <div className="space-y-4">
                {sortedEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium text-gray-800 mr-2">{entry.name}</h3>
                          <MealTypeBadge type={entry.meal_type} />
                        </div>
                        <p className="text-sm text-gray-600">{entry.portion}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{entry.calories} cal</p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Carbs:</span> 
                        <span className="font-medium ml-1">{entry.carbs}g</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Protein:</span> 
                        <span className="font-medium ml-1">{entry.protein}g</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Fat:</span> 
                        <span className="font-medium ml-1">{entry.fat}g</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Fiber:</span> 
                        <span className="font-medium ml-1">{entry.fiber}g</span>
                      </div>
                    </div>
                    {entry.glycemic_index && (
                      <div className="mt-2 flex items-center">
                        <span className="text-xs text-gray-500 mr-2">Glycemic Index:</span>
                        <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                          entry.glycemic_index < 55 ? 'bg-green-100 text-green-800' :
                          entry.glycemic_index < 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {entry.glycemic_index < 55 ? 'Low' :
                           entry.glycemic_index < 70 ? 'Medium' : 'High'} ({entry.glycemic_index})
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <FileBar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No food entries for this day</p>
                <button 
                  onClick={() => setShowAddFood(true)}
                  className="mt-4 text-blue-600 font-medium"
                >
                  Add your first entry
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Nutritional insights */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Nutritional Insights</h2>
            
            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-3">
                    <h3 className="font-medium text-gray-800">{rec.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      rec.glycemic_index < 55 ? 'bg-green-100 text-green-800' :
                      rec.glycemic_index < 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      GI: {rec.glycemic_index} - {
                        rec.glycemic_index < 55 ? 'Low' :
                        rec.glycemic_index < 70 ? 'Medium' : 'High'
                      }
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Add more food entries to get personalized insights</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Glycemic index guide */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Glycemic Index Guide</h2>
            
            <div className="space-y-3">
              <div className="flex items-center p-2 bg-green-50 rounded-lg">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <p className="font-medium text-green-800">Low (0-55)</p>
                  <p className="text-xs text-green-700">Recommended for blood sugar management</p>
                </div>
              </div>
              <div className="flex items-center p-2 bg-yellow-50 rounded-lg">
                <div className="w-4 h-4 rounded-full bg-yellow-500 mr-3"></div>
                <div>
                  <p className="font-medium text-yellow-800">Medium (56-69)</p>
                  <p className="text-xs text-yellow-700">Moderate impact on blood sugar</p>
                </div>
              </div>
              <div className="flex items-center p-2 bg-red-50 rounded-lg">
                <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
                <div>
                  <p className="font-medium text-red-800">High (70+)</p>
                  <p className="text-xs text-red-700">May cause rapid blood sugar spikes</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick add popular foods */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Add</h2>
            
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Oatmeal with Berries</span>
                  <span className="text-gray-500 text-sm">280 cal</span>
                </div>
              </button>
              <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Greek Yogurt</span>
                  <span className="text-gray-500 text-sm">150 cal</span>
                </div>
              </button>
              <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Grilled Chicken Salad</span>
                  <span className="text-gray-500 text-sm">320 cal</span>
                </div>
              </button>
              <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Apple</span>
                  <span className="text-gray-500 text-sm">95 cal</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add food modal */}
      {showAddFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Add Food Entry</h2>
                <button 
                  onClick={() => setShowAddFood(false)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddFood}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meal Type
                  </label>
                  <select
                    value={newFood.meal_type}
                    onChange={(e) => setNewFood({...newFood, meal_type: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Food Name
                  </label>
                  <input
                    type="text"
                    value={newFood.name}
                    onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Grilled Chicken Breast"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portion/Serving Size
                  </label>
                  <input
                    type="text"
                    value={newFood.portion}
                    onChange={(e) => setNewFood({...newFood, portion: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 100g or 1 cup"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calories
                    </label>
                    <input
                      type="number"
                      value={newFood.calories}
                      onChange={(e) => setNewFood({...newFood, calories: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={newFood.carbs}
                      onChange={(e) => setNewFood({...newFood, carbs: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={newFood.protein}
                      onChange={(e) => setNewFood({...newFood, protein: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      value={newFood.fat}
                      onChange={(e) => setNewFood({...newFood, fat: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fiber (g)
                    </label>
                    <input
                      type="number"
                      value={newFood.fiber}
                      onChange={(e) => setNewFood({...newFood, fiber: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddFood(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Entry
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

export default NutritionPage;