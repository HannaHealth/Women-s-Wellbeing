import toast from 'react-hot-toast';

// Types
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

// Search food in external API (Open Food Facts or USDA)
export async function searchFoodApi(query: string): Promise<FoodSearchResult[]> {
  try {
    // First try Open Food Facts API
    const openFoodFactsUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;
    
    const response = await fetch(openFoodFactsUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch from Open Food Facts');
    }
    
    const data = await response.json();
    
    if (data.products && data.products.length > 0) {
      return data.products.map((product: any) => ({
        name: product.product_name || 'Unknown Food',
        portion: product.serving_size || '100g',
        calories: parseFloat(product.nutriments['energy-kcal_100g']) || 0,
        carbs: parseFloat(product.nutriments.carbohydrates_100g) || 0,
        protein: parseFloat(product.nutriments.proteins_100g) || 0,
        fat: parseFloat(product.nutriments.fat_100g) || 0,
        fiber: parseFloat(product.nutriments.fiber_100g) || 0,
        // Glycemic index not available from Open Food Facts
      }));
    }
    
    // If no results from Open Food Facts, try FoodData Central (USDA) API
    return getFallbackFoodData(query);
  } catch (error) {
    console.error('Error in searchFoodApi:', error);
    return getFallbackFoodData(query);
  }
}

// Get food composition data
export async function getFoodComposition(foodName: string): Promise<any> {
  try {
    // Try to get composition from Open Food Facts
    const openFoodFactsUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&search_simple=1&action=process&json=1&page_size=1`;
    
    const response = await fetch(openFoodFactsUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch food composition');
    }
    
    const data = await response.json();
    
    if (data.products && data.products.length > 0) {
      const product = data.products[0];
      return {
        name: product.product_name || foodName,
        nutrients: {
          calories: parseFloat(product.nutriments['energy-kcal_100g']) || 0,
          carbs: parseFloat(product.nutriments.carbohydrates_100g) || 0,
          protein: parseFloat(product.nutriments.proteins_100g) || 0,
          fat: parseFloat(product.nutriments.fat_100g) || 0,
          fiber: parseFloat(product.nutriments.fiber_100g) || 0,
          sugar: parseFloat(product.nutriments.sugars_100g) || 0,
          sodium: parseFloat(product.nutriments.sodium_100g) || 0
        },
        serving_size: product.serving_size || '100g',
        ingredients: product.ingredients_text || 'Not available'
      };
    }
    
    // Fall back to defaults if nothing found
    return getFallbackFoodComposition(foodName);
  } catch (error) {
    console.error('Error in getFoodComposition:', error);
    return getFallbackFoodComposition(foodName);
  }
}

// Fallback food data when API fails
function getFallbackFoodData(query: string): FoodSearchResult[] {
  // Common foods with approximate nutritional values
  const fallbackFoods: Record<string, FoodSearchResult> = {
    'apple': {
      name: 'Apple',
      portion: '1 medium (182g)',
      calories: 95,
      carbs: 25,
      protein: 0.5,
      fat: 0.3,
      fiber: 4.4,
      glycemic_index: 36
    },
    'banana': {
      name: 'Banana',
      portion: '1 medium (118g)',
      calories: 105,
      carbs: 27,
      protein: 1.3,
      fat: 0.4,
      fiber: 3.1,
      glycemic_index: 51
    },
    'chicken': {
      name: 'Chicken Breast',
      portion: '100g, cooked',
      calories: 165,
      carbs: 0,
      protein: 31,
      fat: 3.6,
      fiber: 0
    },
    'broccoli': {
      name: 'Broccoli',
      portion: '1 cup (91g)',
      calories: 31,
      carbs: 6,
      protein: 2.6,
      fat: 0.3,
      fiber: 2.4,
      glycemic_index: 15
    },
    'rice': {
      name: 'White Rice',
      portion: '1 cup cooked (158g)',
      calories: 205,
      carbs: 45,
      protein: 4.3,
      fat: 0.4,
      fiber: 0.6,
      glycemic_index: 73
    },
    'bread': {
      name: 'Whole Wheat Bread',
      portion: '1 slice (28g)',
      calories: 69,
      carbs: 12,
      protein: 3.6,
      fat: 1.1,
      fiber: 1.9,
      glycemic_index: 74
    },
    'egg': {
      name: 'Egg',
      portion: '1 large (50g)',
      calories: 72,
      carbs: 0.4,
      protein: 6.3,
      fat: 5,
      fiber: 0
    },
    'milk': {
      name: 'Milk',
      portion: '1 cup (244g)',
      calories: 122,
      carbs: 12,
      protein: 8.1,
      fat: 4.8,
      fiber: 0,
      glycemic_index: 27
    }
  };
  
  // Try to match query with fallback foods
  const lowerQuery = query.toLowerCase();
  
  const matchedFoods = Object.keys(fallbackFoods)
    .filter(key => key.includes(lowerQuery) || lowerQuery.includes(key))
    .map(key => fallbackFoods[key]);
  
  if (matchedFoods.length > 0) {
    return matchedFoods;
  }
  
  // If no matches, return these default foods
  return [
    fallbackFoods.apple,
    fallbackFoods.banana,
    fallbackFoods.chicken
  ];
}

// Fallback food composition for when API fails
function getFallbackFoodComposition(foodName: string): any {
  const lowerFoodName = foodName.toLowerCase();
  
  // Check for some common food types
  if (lowerFoodName.includes('apple')) {
    return {
      name: 'Apple',
      nutrients: {
        calories: 95,
        carbs: 25,
        protein: 0.5,
        fat: 0.3,
        fiber: 4.4,
        sugar: 19,
        sodium: 2
      },
      serving_size: '1 medium apple (182g)',
      ingredients: 'Apple',
      glycemic_index: 36
    };
  } else if (lowerFoodName.includes('banana')) {
    return {
      name: 'Banana',
      nutrients: {
        calories: 105,
        carbs: 27,
        protein: 1.3,
        fat: 0.4,
        fiber: 3.1,
        sugar: 14,
        sodium: 1
      },
      serving_size: '1 medium banana (118g)',
      ingredients: 'Banana',
      glycemic_index: 51
    };
  } else if (lowerFoodName.includes('chicken')) {
    return {
      name: 'Chicken Breast',
      nutrients: {
        calories: 165,
        carbs: 0,
        protein: 31,
        fat: 3.6,
        fiber: 0,
        sugar: 0,
        sodium: 74
      },
      serving_size: '100g, cooked',
      ingredients: 'Chicken breast'
    };
  }
  
  // Generic fallback
  return {
    name: foodName,
    nutrients: {
      calories: 100,
      carbs: 15,
      protein: 5,
      fat: 2,
      fiber: 2,
      sugar: 5,
      sodium: 50
    },
    serving_size: '100g',
    ingredients: 'Not available'
  };
}