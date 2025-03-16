import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { handleError } from '../errorHandler';

// Create rate-limited axios instance
const api = rateLimit(axios.create(), { 
  maxRequests: 10,
  perMilliseconds: 1000 
});

// WHO API endpoints
const WHO_BASE_URL = 'https://www.who.int/data/gho/info/gho-odata-api';

/**
 * Get global health statistics from WHO
 */
export const getGlobalHealthStats = async (indicator: string, country?: string) => {
  try {
    const params = new URLSearchParams({
      $filter: `IndicatorCode eq '${indicator}'`,
      $select: 'Value,TimeDimensionValue,SpatialDimensionValue',
      $orderby: 'TimeDimensionValue desc'
    });
    
    if (country) {
      params.append('$filter', `and SpatialDimensionValue eq '${country}'`);
    }
    
    const response = await api.get(`${WHO_BASE_URL}?${params.toString()}`);
    
    return response.data.value.map((item: any) => ({
      value: item.Value,
      year: item.TimeDimensionValue,
      country: item.SpatialDimensionValue
    }));
  } catch (error) {
    throw handleError(error, 'getting global health statistics');
  }
};

/**
 * Get health education materials from MedlinePlus
 */
export const getHealthEducation = async (topic: string, language = 'en') => {
  try {
    const response = await api.get(
      `https://medlineplus.gov/connect/service?mainSearchCriteria.v.c=${encodeURIComponent(topic)}&knowledgeResponseType=application/json&lang=${language}`
    );
    
    return response.data.feed.entry.map((entry: any) => ({
      title: entry.title,
      summary: entry.summary,
      url: entry.link[0].href,
      source: entry.source?.name || 'MedlinePlus',
      topics: entry.category?.map((cat: any) => cat.term) || []
    }));
  } catch (error) {
    throw handleError(error, 'getting health education materials');
  }
};

/**
 * Get weather-based activity suggestions
 */
export const getActivitySuggestions = async (latitude: number, longitude: number) => {
  try {
    // Get current weather
    const weatherResponse = await api.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric`
    );
    
    const weather = weatherResponse.data;
    const temp = weather.main.temp;
    const condition = weather.weather[0].main.toLowerCase();
    
    // Generate activity suggestions based on weather
    const suggestions = [];
    
    // Indoor activities for bad weather
    if (condition.includes('rain') || condition.includes('snow') || condition.includes('storm')) {
      suggestions.push(
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
        },
        {
          name: 'Yoga',
          intensity: 'Light to Moderate',
          duration: 30,
          calories: 120,
          suitable: true,
          indoor: true
        }
      );
    }
    
    // Outdoor activities for good weather
    else {
      suggestions.push(
        {
          name: 'Walking',
          intensity: 'Light',
          duration: 30,
          calories: 150,
          suitable: temp > 10 && temp < 30,
          indoor: false
        },
        {
          name: 'Cycling',
          intensity: 'Moderate',
          duration: 45,
          calories: 300,
          suitable: temp > 10 && temp < 30,
          indoor: false
        },
        {
          name: 'Swimming',
          intensity: 'High',
          duration: 60,
          calories: 400,
          suitable: temp > 20,
          indoor: false
        }
      );
    }
    
    return {
      weather: {
        temperature: temp,
        condition: condition,
        description: weather.weather[0].description
      },
      activities: suggestions
    };
    
  } catch (error) {
    throw handleError(error, 'getting activity suggestions');
  }
};

/**
 * Get mental health resources
 */
export const getMentalHealthResources = async (topic: string, language = 'en') => {
  try {
    const response = await api.get(
      `https://www.nimh.nih.gov/api/v1/health/${encodeURIComponent(topic)}?language=${language}`
    );
    
    return response.data.resources.map((resource: any) => ({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      url: resource.url,
      topics: resource.topics,
      language: resource.language
    }));
  } catch (error) {
    throw handleError(error, 'getting mental health resources');
  }
};

export default {
  getGlobalHealthStats,
  getHealthEducation,
  getActivitySuggestions,
  getMentalHealthResources
};