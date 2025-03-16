import { createClient } from '@supabase/supabase-js';
import { getFoodComposition, searchFoodApi } from './externalApis';
import toast from 'react-hot-toast';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Types
interface FoodEntry {
  id?: string;
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
  created_at?: string;
}

interface FoodSearchResult {
  name: string;
  portion: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  glycemic_index?: number;
}

interface Recommendation {
  name: string;
  description: string;
  benefits: string[];
  glycemic_index: number;
}

// Get nutrition data for a specific day
export async function getNutritionData(userId: string, date: string) {
  try {
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching nutrition data:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getNutritionData:', error);
    return [];
  }
}

// Get nutrition data with a date range
export async function getNutritionDataRange(userId: string, startDate: string, endDate: string) {
  try {
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching nutrition data range:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getNutritionDataRange:', error);
    return [];
  }
}

// Add a food entry
export async function addFoodEntry(entry: FoodEntry) {
  try {
    // Check if the food name exists in our database to get glycemic index
    const glycemicIndex = await getGlycemicIndex(entry.name);
    
    const fullEntry = {
      ...entry,
      glycemic_index: glycemicIndex
    };
    
    const { data, error } = await supabase
      .from('food_entries')
      .insert(fullEntry)
      .select()
      .single();

    if (error) {
      console.error('Error adding food entry:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addFoodEntry:', error);
    throw error;
  }
}

// Search for food in external API
export async function searchFood(query: string): Promise<FoodSearchResult[]> {
  try {
    // Try to search our internal database first
    const { data: internalData, error: internalError } = await supabase
      .from('food_database')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(5);
    
    if (internalError) {
      console.error('Error searching internal food database:', internalError);
    }
    
    if (internalData && internalData.length > 0) {
      return internalData.map(item => ({
        name: item.name,
        portion: item.portion,
        calories: item.calories,
        carbs: item.carbs,
        protein: item.protein,
        fat: item.fat,
        fiber: item.fiber,
        glycemic_index: item.glycemic_index
      }));
    }
    
    // If not found internally, use external API
    const externalResults = await searchFoodApi(query);
    return externalResults;
  } catch (error) {
    console.error('Error in searchFood:', error);
    
    // Return fallback data if search fails
    return [
      {
        name: 'Apple',
        portion: '1 medium (182g)',
        calories: 95,
        carbs: 25,
        protein: 0.5,
        fat: 0.3,
        fiber: 4.4,
        glycemic_index: 36
      },
      {
        name: 'Banana',
        portion: '1 medium (118g)',
        calories: 105,
        carbs: 27,
        protein: 1.3,
        fat: 0.4,
        fiber: 3.1,
        glycemic_index: 51
      },
      {
        name: 'Chicken Breast',
        portion: '100g, cooked',
        calories: 165,
        carbs: 0,
        protein: 31,
        fat: 3.6,
        fiber: 0,
      }
    ];
  }
}

// Get glycemic index for a food
async function getGlycemicIndex(foodName: string): Promise<number | undefined> {
  try {
    // Check our glycemic index database
    const { data, error } = await supabase
      .from('glycemic_index')
      .select('*')
      .ilike('food_name', `%${foodName}%`)
      .limit(1);
    
    if (error) {
      console.error('Error fetching glycemic index:', error);
      return undefined;
    }
    
    if (data && data.length > 0) {
      return data[0].glycemic_index;
    }
    
    // If not found, use a fallback value or return undefined
    return undefined;
  } catch (error) {
    console.error('Error in getGlycemicIndex:', error);
    return undefined;
  }
}

// Analyze nutrition data and provide recommendations
export async function analyzeNutrition(userId: string, healthProfile: any): Promise<Recommendation[]> {
  try {
    // Get the user's recent nutrition data
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    
    const startDate = oneWeekAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    const nutritionData = await getNutritionDataRange(userId, startDate, endDate);
    
    // Check if we have enough data to make meaningful recommendations
    if (nutritionData.length < 3) {
      return getDefaultRecommendations(healthProfile);
    }
    
    // Calculate averages
    const totalEntries = nutritionData.length;
    const averages = nutritionData.reduce((acc, entry) => {
      return {
        calories: acc.calories + entry.calories,
        carbs: acc.carbs + entry.carbs,
        protein: acc.protein + entry.protein,
        fat: acc.fat + entry.fat,
        fiber: acc.fiber + entry.fiber
      };
    }, { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 });
    
    const avgCalories = averages.calories / totalEntries;
    const avgCarbs = averages.carbs / totalEntries;
    const avgProtein = averages.protein / totalEntries;
    const avgFat = averages.fat / totalEntries;
    const avgFiber = averages.fiber / totalEntries;
    
    // Determine if user has diabetes or is at risk
    const hasDiabetes = healthProfile?.medical_conditions?.includes('Type 2 Diabetes') || 
                       healthProfile?.medical_conditions?.includes('Pre-diabetes');
    
    // Generate personalized recommendations
    const recommendations: Recommendation[] = [];
    
    if (hasDiabetes && avgCarbs > 150) {
      recommendations.push({
        name: "Reduce simple carbohydrates",
        description: "Your carbohydrate intake is higher than recommended for diabetes management.",
        benefits: [
          "Better blood glucose control",
          "Reduced insulin resistance",
          "Lower risk of blood sugar spikes"
        ],
        glycemic_index: 0 // Not applicable
      });
    }
    
    if (avgFiber < 25) {
      recommendations.push({
        name: "Increase fiber intake",
        description: "Add more high-fiber foods like leafy greens, beans, and whole grains to your diet.",
        benefits: [
          "Improved blood sugar regulation",
          "Enhanced satiety and weight management",
          "Better digestive health"
        ],
        glycemic_index: 0 // Not applicable
      });
    }
    
    // Add recommendations for specific foods based on profile
    if (hasDiabetes) {
      recommendations.push({
        name: "Add cinnamon to your diet",
        description: "Studies suggest cinnamon may help improve insulin sensitivity and lower blood sugar.",
        benefits: [
          "May improve insulin sensitivity",
          "Contains antioxidants"
        ],
        glycemic_index: 5
      });
      
      recommendations.push({
        name: "Include berries in your meals",
        description: "Berries are low on the glycemic index and rich in antioxidants and fiber.",
        benefits: [
          "Blood sugar-friendly fruit option",
          "Rich in vitamins and antioxidants"
        ],
        glycemic_index: 40
      });
    }
    
    // Weight management recommendations
    if (healthProfile?.lifestyle_factors?.activity_level === 'sedentary') {
      recommendations.push({
        name: "Choose high-protein snacks",
        description: "Protein-rich snacks can help maintain energy levels and support weight management.",
        benefits: [
          "Helps build and maintain muscle",
          "Increases satiety",
          "Supports weight management goals"
        ],
        glycemic_index: 0 // Not applicable
      });
    }
    
    // Add cultural food recommendations if available
    if (healthProfile?.country) {
      const culturalFoods = getCulturalFoodRecommendations(healthProfile.country);
      recommendations.push(...culturalFoods);
    }
    
    // If we don't have enough recommendations, add defaults
    if (recommendations.length < 3) {
      const defaultRecs = getDefaultRecommendations(healthProfile);
      recommendations.push(...defaultRecs);
    }
    
    // Return only unique recommendations (up to 5)
    return [...new Map(recommendations.map(item => [item.name, item])).values()].slice(0, 5);
  } catch (error) {
    console.error('Error in analyzeNutrition:', error);
    return getDefaultRecommendations(healthProfile);
  }
}

// Get default recommendations
function getDefaultRecommendations(healthProfile: any): Recommendation[] {
  const hasDiabetes = healthProfile?.medical_conditions?.includes('Type 2 Diabetes') || 
                     healthProfile?.medical_conditions?.includes('Pre-diabetes');
  
  const recommendations: Recommendation[] = [
    {
      name: "Non-starchy vegetables",
      description: "Fill half your plate with vegetables like broccoli, spinach, and bell peppers.",
      benefits: [
        "Low in carbohydrates",
        "High in fiber and nutrients",
        "Helps maintain healthy blood sugar"
      ],
      glycemic_index: 15
    },
    {
      name: "Quinoa instead of white rice",
      description: "Quinoa has more protein and fiber than white rice with a lower glycemic impact.",
      benefits: [
        "Higher in protein and fiber",
        "Contains all nine essential amino acids",
        "More gradual effect on blood sugar"
      ],
      glycemic_index: 53
    },
    {
      name: "Greek yogurt",
      description: "Greek yogurt is higher in protein and lower in carbs than regular yogurt.",
      benefits: [
        "High protein content",
        "Contains probiotics for gut health",
        "Versatile food for meals or snacks"
      ],
      glycemic_index: 11
    }
  ];
  
  if (hasDiabetes) {
    recommendations.push({
      name: "Nuts and seeds",
      description: "A small handful of nuts or seeds provides healthy fats and protein with minimal impact on blood sugar.",
      benefits: [
        "Rich in healthy fats and protein",
        "Contains fiber and micronutrients",
        "Minimal impact on blood glucose"
      ],
      glycemic_index: 15
    });
  }
  
  return recommendations;
}

// Get cultural food recommendations
function getCulturalFoodRecommendations(country: string): Recommendation[] {
  const culturalRecommendations: Record<string, Recommendation[]> = {
    'us': [
      {
        name: "Blackberries and blueberries",
        description: "Native North American berries that are low on the glycemic index.",
        benefits: [
          "Rich in antioxidants",
          "Low glycemic impact",
          "High in fiber"
        ],
        glycemic_index: 25
      }
    ],
    'in': [
      {
        name: "Bitter gourd (Karela)",
        description: "Traditional vegetable known for its blood sugar lowering properties.",
        benefits: [
          "May help lower blood glucose levels",
          "Rich in vitamins and minerals",
          "Low calorie content"
        ],
        glycemic_index: 20
      }
    ],
    'mx': [
      {
        name: "Nopales (Cactus)",
        description: "Traditional Mexican food that helps regulate blood sugar.",
        benefits: [
          "May help lower blood glucose",
          "Rich in fiber and antioxidants",
          "Low calorie content"
        ],
        glycemic_index: 10
      }
    ],
    'ng': [
      {
        name: "African yam bean",
        description: "High-protein legume popular in West Africa with a low glycemic index.",
        benefits: [
          "High in protein and fiber",
          "Contains essential amino acids",
          "Slow-release energy source"
        ],
        glycemic_index: 30
      }
    ]
  };
  
  return culturalRecommendations[country] || [];
}