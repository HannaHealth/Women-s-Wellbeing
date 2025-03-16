import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

// Calculate BMI from weight and height
export const calculateBMI = (weight: number, height: number): number => {
  // Weight in kg, height in cm
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// Get BMI category
export const getBMICategory = (bmi: number): { category: string; color: string } => {
  if (bmi < 18.5) {
    return { category: 'Underweight', color: 'text-blue-500' };
  } else if (bmi < 25) {
    return { category: 'Normal', color: 'text-green-500' };
  } else if (bmi < 30) {
    return { category: 'Overweight', color: 'text-yellow-500' };
  } else {
    return { category: 'Obese', color: 'text-red-500' };
  }
};

// Format a date for display
export const formatDate = (date: Date | string, formatString: string = 'MMM d, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Get appropriate color for blood glucose value
export const getGlucoseColor = (value: number): string => {
  if (value < 70) return 'text-red-500'; // Low
  if (value > 180) return 'text-red-500'; // High
  if (value > 140) return 'text-yellow-500'; // Elevated
  return 'text-green-500'; // Normal
};

// Get blood pressure category
export const getBPCategory = (systolic: number, diastolic: number): { label: string; color: string } => {
  if (systolic >= 180 || diastolic >= 120) return { label: 'Crisis', color: 'text-red-600' };
  if (systolic >= 140 || diastolic >= 90) return { label: 'High', color: 'text-red-500' };
  if (systolic >= 130 || diastolic >= 80) return { label: 'Elevated', color: 'text-yellow-500' };
  return { label: 'Normal', color: 'text-green-500' };
};

// Get emoji for mood value
export const getMoodEmoji = (value: number | null): string => {
  if (value === null) return '😐';
  if (value <= 1) return '😢';
  if (value === 2) return '🙁';
  if (value === 3) return '😐';
  if (value === 4) return '🙂';
  return '😄';
};

// Calculate average for an array of numbers
export const calculateAverage = (values: number[]): number => {
  if (!values.length) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

// Fill in missing dates in a time series
export const fillMissingDates = <T extends { date: string }>(
  data: T[],
  dateField: keyof T = 'date' as keyof T,
  startDaysAgo: number = 7,
  defaultValue: Partial<T> = {}
): T[] => {
  if (!data.length) return [];

  const today = new Date();
  const startDate = subDays(today, startDaysAgo);
  const dateMap = new Map<string, T>();

  // Add existing data to map
  data.forEach(item => {
    const dateStr = item[dateField] as string;
    dateMap.set(dateStr, item);
  });

  // Create array of all dates in range
  const allDates = eachDayOfInterval({ start: startDate, end: today });
  
  // For each date, use existing data or create placeholder
  return allDates.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (dateMap.has(dateStr)) {
      return dateMap.get(dateStr)!;
    } else {
      return {
        ...defaultValue,
        [dateField]: dateStr
      } as T;
    }
  });
};

// Calculate daily calorie needs based on user data
export const calculateCalorieNeeds = (
  weight: number, // kg
  height: number, // cm
  age: number,
  gender: string = 'female',
  activityLevel: string = 'moderate'
): number => {
  // Harris-Benedict Equation
  let bmr = 0;
  
  if (gender === 'female') {
    // For women
    bmr = 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
  } else {
    // For men
    bmr = 66.47 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
  }
  
  // Apply activity multiplier
  const activityMultipliers: Record<string, number> = {
    'sedentary': 1.2, // Little or no exercise
    'light': 1.375, // Light exercise 1-3 days/week
    'moderate': 1.55, // Moderate exercise 3-5 days/week
    'active': 1.725, // Hard exercise 6-7 days/week
    'very-active': 1.9 // Very hard exercise and physical job
  };
  
  const multiplier = activityMultipliers[activityLevel] || activityMultipliers.moderate;
  
  return Math.round(bmr * multiplier);
};