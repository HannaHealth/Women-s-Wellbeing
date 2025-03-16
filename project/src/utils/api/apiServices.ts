import api from './axiosConfig';
import { 
  weatherCache, 
  foodDataCache, 
  healthEducationCache, 
  globalHealthCache 
} from './cacheManager';
import { z } from 'zod';

// Validation schemas
const WeatherResponse = z.object({
  temperature: z.number(),
  condition: z.string(),
  description: z.string()
});

// Weather API
export async function getWeatherBasedActivitySuggestions(latitude?: number, longitude?: number) {
  const cacheKey = `weather_${latitude}_${longitude}`;
  const cachedData = weatherCache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Default to New York coordinates if none provided
    if (!latitude || !longitude) {
      latitude = 40.7128;
      longitude = -74.0060;
    }
    
    // Simulated weather data since we don't have a real API key
    const weatherData = {
      temperature: 22, // Celsius
      condition: 'clear',
      description: 'Clear sky'
    };
    
    // Validate response
    WeatherResponse.parse(weatherData);
    
    // Generate activity suggestions based on weather
    const suggestions = [
      {
        name: 'Morning Walk',
        intensity: 'Light',
        duration: 30,
        calories: 150,
        suitable: true,
        indoor: false
      },
      {
        name: 'Yoga Session',
        intensity: 'Moderate',
        duration: 45,
        calories: 200,
        suitable: true,
        indoor: true
      },
      {
        name: 'Swimming',
        intensity: 'High',
        duration: 60,
        calories: 400,
        suitable: weatherData.temperature > 20,
        indoor: false
      }
    ];
    
    const result = {
      weather: weatherData,
      activities: suggestions
    };
    
    // Cache the result
    weatherCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Weather API Error:', error);
    // Return fallback data
    return {
      weather: {
        temperature: 20,
        condition: 'clear',
        description: 'Clear sky'
      },
      activities: [
        {
          name: 'Indoor Walking',
          intensity: 'Light',
          duration: 30,
          calories: 150,
          suitable: true,
          indoor: true
        },
        {
          name: 'Home Workout',
          intensity: 'Moderate',
          duration: 45,
          calories: 200,
          suitable: true,
          indoor: true
        }
      ]
    };
  }
}

// Location API
export async function getLocation(latitude: number, longitude: number) {
  try {
    // Simulated response since we don't have a real geocoding API key
    return {
      city: "New York",
      country: "US"
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

// Global Health Data API
export async function getGlobalHealthData(indicator: string, country: string = 'us') {
  const cacheKey = `health_${indicator}_${country}`;
  const cachedData = globalHealthCache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Simulated data since we don't have a real WHO API key
    const data = {
      diabetes_prevalence: {
        us: {
          value: 10.5,
          comparison: {
            globalAverage: 8.5,
            percentDifference: 23.5
          }
        },
        global: {
          value: 8.5
        }
      },
      obesity_prevalence: {
        us: {
          value: 36.2,
          comparison: {
            globalAverage: 13.1,
            percentDifference: 176.3
          }
        },
        global: {
          value: 13.1
        }
      }
    };
    
    // Get data for the requested indicator and country
    const result = data[indicator as keyof typeof data][country] || data[indicator as keyof typeof data].global;
    
    // Cache the result
    globalHealthCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Global Health Data API Error:', error);
    // Return fallback data
    return {
      value: 0,
      comparison: {
        globalAverage: 0,
        percentDifference: 0
      }
    };
  }
}

// Health Education Content API
export async function getHealthEducationContent(topic: string) {
  const cacheKey = `education_${topic}`;
  const cachedData = healthEducationCache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Simulated health education content
    const content = {
      diabetes: {
        title: 'Understanding Diabetes',
        summary: 'Learn about diabetes management, prevention, and lifestyle modifications.',
        symptoms: [
          'Increased thirst and urination',
          'Fatigue',
          'Blurred vision',
          'Slow healing of cuts and bruises'
        ],
        management: [
          'Regular blood glucose monitoring',
          'Balanced diet with controlled carbohydrates',
          'Regular physical activity',
          'Medication adherence if prescribed'
        ],
        source: 'MedlinePlus',
        url: 'https://medlineplus.gov/diabetes.html'
      },
      nutrition: {
        title: 'Healthy Eating Guidelines',
        summary: 'Discover the principles of balanced nutrition and healthy eating habits.',
        guidelines: [
          'Eat plenty of fruits and vegetables',
          'Choose whole grains over refined grains',
          'Include lean proteins in your diet',
          'Limit added sugars and processed foods'
        ],
        benefits: [
          'Better blood sugar control',
          'Weight management',
          'Improved energy levels',
          'Reduced risk of chronic diseases'
        ],
        source: 'MedlinePlus',
        url: 'https://medlineplus.gov/nutrition.html'
      }
    };
    
    const result = content[topic as keyof typeof content] || {
      title: 'Health Information',
      summary: 'General health information and guidelines.',
      recommendations: [
        'Maintain a balanced diet',
        'Stay physically active',
        'Get adequate sleep',
        'Manage stress levels'
      ],
      source: 'MedlinePlus',
      url: 'https://medlineplus.gov'
    };
    
    // Cache the result
    healthEducationCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Health Education API Error:', error);
    return null;
  }
}