import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { handleError } from '../errorHandler';

// Create rate-limited axios instance
const api = rateLimit(axios.create(), { 
  maxRequests: 10,
  perMilliseconds: 1000 
});

// Types
interface NutritionInfo {
  name: string;
  portion: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  glycemicIndex?: number;
  micronutrients?: {
    [key: string]: number;
  };
}

interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  nutritionInfo: NutritionInfo;
}

// API endpoints
const EDAMAM_APP_ID = import.meta.env.VITE_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY;
const NUTRITIONIX_APP_ID = import.meta.env.VITE_NUTRITIONIX_APP_ID;
const NUTRITIONIX_APP_KEY = import.meta.env.VITE_NUTRITIONIX_APP_KEY;
const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY;

/**
 * Search for food items using multiple nutrition APIs
 */
export const searchFood = async (query: string): Promise<FoodSearchResult[]> => {
  try {
    const results: FoodSearchResult[] = [];
    
    // Try Edamam API first
    try {
      const edamamResponse = await api.get(
        `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(query)}`
      );
      
      if (edamamResponse.data.hints) {
        edamamResponse.data.hints.forEach((hint: any) => {
          const food = hint.food;
          results.push({
            id: food.foodId,
            name: food.label,
            brand: food.brand,
            nutritionInfo: {
              name: food.label,
              portion: '100g',
              calories: food.nutrients.ENERC_KCAL || 0,
              carbs: food.nutrients.CHOCDF || 0,
              protein: food.nutrients.PROCNT || 0,
              fat: food.nutrients.FAT || 0,
              fiber: food.nutrients.FIBTG || 0,
              micronutrients: {
                calcium: food.nutrients.CA || 0,
                iron: food.nutrients.FE || 0,
                potassium: food.nutrients.K || 0
              }
            }
          });
        });
      }
    } catch (error) {
      console.error('Edamam API error:', error);
    }
    
    // Try Nutritionix API if needed
    if (results.length < 5) {
      try {
        const nutritionixResponse = await api.get(
          `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(query)}`,
          {
            headers: {
              'x-app-id': NUTRITIONIX_APP_ID,
              'x-app-key': NUTRITIONIX_APP_KEY
            }
          }
        );
        
        if (nutritionixResponse.data.common) {
          nutritionixResponse.data.common.forEach((item: any) => {
            results.push({
              id: item.food_name,
              name: item.food_name,
              nutritionInfo: {
                name: item.food_name,
                portion: item.serving_unit,
                calories: item.nf_calories || 0,
                carbs: item.nf_total_carbohydrate || 0,
                protein: item.nf_protein || 0,
                fat: item.nf_total_fat || 0,
                fiber: item.nf_dietary_fiber || 0
              }
            });
          });
        }
      } catch (error) {
        console.error('Nutritionix API error:', error);
      }
    }
    
    // Try USDA API if still need more results
    if (results.length < 5) {
      try {
        const usdaResponse = await api.get(
          `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}`
        );
        
        if (usdaResponse.data.foods) {
          usdaResponse.data.foods.forEach((food: any) => {
            const nutrients = food.foodNutrients;
            results.push({
              id: food.fdcId,
              name: food.description,
              nutritionInfo: {
                name: food.description,
                portion: '100g',
                calories: nutrients.find((n: any) => n.nutrientId === 1008)?.value || 0,
                carbs: nutrients.find((n: any) => n.nutrientId === 1005)?.value || 0,
                protein: nutrients.find((n: any) => n.nutrientId === 1003)?.value || 0,
                fat: nutrients.find((n: any) => n.nutrientId === 1004)?.value || 0,
                fiber: nutrients.find((n: any) => n.nutrientId === 1079)?.value || 0
              }
            });
          });
        }
      } catch (error) {
        console.error('USDA API error:', error);
      }
    }
    
    // Remove duplicates and limit results
    const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());
    return uniqueResults.slice(0, 10);
    
  } catch (error) {
    throw handleError(error, 'searching food database');
  }
};

/**
 * Get detailed nutrition information for a specific food item
 */
export const getFoodDetails = async (foodId: string, source: string): Promise<NutritionInfo> => {
  try {
    let nutritionInfo: NutritionInfo;
    
    switch (source) {
      case 'edamam':
        const edamamResponse = await api.get(
          `https://api.edamam.com/api/food-database/v2/nutrients?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`,
          {
            data: {
              ingredients: [{
                foodId: foodId,
                quantity: 100,
                measureURI: 'http://www.edamam.com/ontologies/edamam.owl#Measure_gram'
              }]
            }
          }
        );
        
        nutritionInfo = {
          name: edamamResponse.data.ingredients[0].parsed[0].food,
          portion: '100g',
          calories: edamamResponse.data.calories,
          carbs: edamamResponse.data.totalNutrients.CHOCDF?.quantity || 0,
          protein: edamamResponse.data.totalNutrients.PROCNT?.quantity || 0,
          fat: edamamResponse.data.totalNutrients.FAT?.quantity || 0,
          fiber: edamamResponse.data.totalNutrients.FIBTG?.quantity || 0,
          micronutrients: {
            calcium: edamamResponse.data.totalNutrients.CA?.quantity || 0,
            iron: edamamResponse.data.totalNutrients.FE?.quantity || 0,
            potassium: edamamResponse.data.totalNutrients.K?.quantity || 0,
            sodium: edamamResponse.data.totalNutrients.NA?.quantity || 0,
            vitaminC: edamamResponse.data.totalNutrients.VITC?.quantity || 0,
            vitaminD: edamamResponse.data.totalNutrients.VITD?.quantity || 0
          }
        };
        break;
        
      case 'usda':
        const usdaResponse = await api.get(
          `https://api.nal.usda.gov/fdc/v1/food/${foodId}?api_key=${USDA_API_KEY}`
        );
        
        const nutrients = usdaResponse.data.foodNutrients;
        nutritionInfo = {
          name: usdaResponse.data.description,
          portion: '100g',
          calories: nutrients.find((n: any) => n.nutrient.id === 1008)?.amount || 0,
          carbs: nutrients.find((n: any) => n.nutrient.id === 1005)?.amount || 0,
          protein: nutrients.find((n: any) => n.nutrient.id === 1003)?.amount || 0,
          fat: nutrients.find((n: any) => n.nutrient.id === 1004)?.amount || 0,
          fiber: nutrients.find((n: any) => n.nutrient.id === 1079)?.amount || 0,
          micronutrients: {
            calcium: nutrients.find((n: any) => n.nutrient.id === 1087)?.amount || 0,
            iron: nutrients.find((n: any) => n.nutrient.id === 1089)?.amount || 0,
            potassium: nutrients.find((n: any) => n.nutrient.id === 1092)?.amount || 0,
            sodium: nutrients.find((n: any) => n.nutrient.id === 1093)?.amount || 0,
            vitaminC: nutrients.find((n: any) => n.nutrient.id === 1162)?.amount || 0,
            vitaminD: nutrients.find((n: any) => n.nutrient.id === 1114)?.amount || 0
          }
        };
        break;
        
      default:
        throw new Error('Unsupported nutrition data source');
    }
    
    return nutritionInfo;
    
  } catch (error) {
    throw handleError(error, 'getting food details');
  }
};

/**
 * Get glycemic index for a food item
 */
export const getGlycemicIndex = async (foodName: string): Promise<number | null> => {
  try {
    // First check our database
    const { data: dbData } = await api.get(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/glycemic_index?food_name=ilike.${encodeURIComponent(foodName)}`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      }
    );
    
    if (dbData && dbData.length > 0) {
      return dbData[0].glycemic_index;
    }
    
    // If not in database, try external API
    const response = await api.get(
      `https://api.glycemic-index.com/v1/search?q=${encodeURIComponent(foodName)}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GLYCEMIC_INDEX_API_KEY}`
        }
      }
    );
    
    if (response.data && response.data.length > 0) {
      return response.data[0].glycemic_index;
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting glycemic index:', error);
    return null;
  }
};

/**
 * Get recipe suggestions based on nutritional requirements
 */
export const getRecipeSuggestions = async (
  requirements: {
    maxCalories?: number;
    maxCarbs?: number;
    minProtein?: number;
    restrictions?: string[];
  }
): Promise<any[]> => {
  try {
    const params = new URLSearchParams({
      type: 'public',
      app_id: EDAMAM_APP_ID,
      app_key: EDAMAM_APP_KEY,
      random: 'true'
    });
    
    if (requirements.maxCalories) {
      params.append('calories', `0-${requirements.maxCalories}`);
    }
    
    if (requirements.maxCarbs) {
      params.append('nutrients[CHOCDF]', `0-${requirements.maxCarbs}`);
    }
    
    if (requirements.minProtein) {
      params.append('nutrients[PROCNT]', `${requirements.minProtein}+`);
    }
    
    if (requirements.restrictions) {
      requirements.restrictions.forEach(restriction => {
        params.append('health', restriction);
      });
    }
    
    const response = await api.get(
      `https://api.edamam.com/api/recipes/v2?${params.toString()}`
    );
    
    return response.data.hits.map((hit: any) => ({
      id: hit.recipe.uri.split('#')[1],
      name: hit.recipe.label,
      image: hit.recipe.image,
      url: hit.recipe.url,
      servings: hit.recipe.yield,
      calories: Math.round(hit.recipe.calories / hit.recipe.yield),
      nutrients: {
        carbs: Math.round(hit.recipe.totalNutrients.CHOCDF.quantity / hit.recipe.yield),
        protein: Math.round(hit.recipe.totalNutrients.PROCNT.quantity / hit.recipe.yield),
        fat: Math.round(hit.recipe.totalNutrients.FAT.quantity / hit.recipe.yield),
        fiber: Math.round(hit.recipe.totalNutrients.FIBTG.quantity / hit.recipe.yield)
      },
      dietLabels: hit.recipe.dietLabels,
      healthLabels: hit.recipe.healthLabels
    }));
    
  } catch (error) {
    throw handleError(error, 'getting recipe suggestions');
  }
};

export default {
  searchFood,
  getFoodDetails,
  getGlycemicIndex,
  getRecipeSuggestions
};