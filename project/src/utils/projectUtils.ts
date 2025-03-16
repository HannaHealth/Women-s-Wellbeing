/**
 * Utility functions for project-wide use in the HannaHealth application
 */

/**
 * Convert kebab-case or snake_case string to Title Case
 * @param str String to format
 * @returns Formatted string in Title Case
 */
export const toTitleCase = (str: string): string => {
  if (!str) return '';
  
  return str
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get appropriate color class for blood glucose value
 * @param value Blood glucose value in mg/dL
 * @returns Tailwind CSS color class
 */
export const getGlucoseColorClass = (value: number): string => {
  if (value < 70) return 'text-red-500'; // Low
  if (value > 180) return 'text-red-500'; // High
  if (value > 140) return 'text-yellow-500'; // Elevated
  return 'text-green-500'; // Normal
};

/**
 * Get emoji for mood value (1-5 scale)
 * @param value Mood value (1-5)
 * @returns Emoji representing mood
 */
export const getMoodEmoji = (value: number | null): string => {
  if (value === null) return '😐';
  if (value <= 1) return '😢';
  if (value === 2) return '🙁';
  if (value === 3) return '😐';
  if (value === 4) return '🙂';
  return '😄';
};

/**
 * Get blood pressure category and color
 * @param systolic Systolic blood pressure
 * @param diastolic Diastolic blood pressure
 * @returns Category and color class
 */
export const getBPCategory = (
  systolic: number, 
  diastolic: number
): { label: string; color: string } => {
  if (systolic >= 180 || diastolic >= 120) return { label: 'Crisis', color: 'text-red-600' };
  if (systolic >= 140 || diastolic >= 90) return { label: 'High', color: 'text-red-500' };
  if (systolic >= 130 || diastolic >= 80) return { label: 'Elevated', color: 'text-yellow-500' };
  return { label: 'Normal', color: 'text-green-500' };
};

/**
 * Format a number with thousand separators
 * @param num Number to format
 * @returns Formatted string
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

/**
 * Calculate BMI from weight and height
 * @param weight Weight in kg
 * @param height Height in cm
 * @returns BMI value
 */
export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

/**
 * Get BMI category and color class
 * @param bmi BMI value
 * @returns Category and color class
 */
export const getBMICategory = (bmi: number): { category: string; color: string } => {
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-500' };
  if (bmi < 25) return { category: 'Normal', color: 'text-green-500' };
  if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-500' };
  return { category: 'Obese', color: 'text-red-500' };
};

/**
 * Generate a unique ID
 * @param prefix Optional prefix for the ID
 * @returns Unique ID string
 */
export const generateUniqueId = (prefix = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Check if all required fields in an object are filled
 * @param obj Object to check
 * @param requiredFields Array of required field names
 * @returns Boolean indicating if all required fields are filled
 */
export const requiredFieldsFilled = (obj: any, requiredFields: string[]): boolean => {
  return requiredFields.every(field => {
    const value = obj[field];
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    return true;
  });
};

/**
 * Ensure consistent platform name throughout the application
 */
export const PLATFORM_NAME = 'HannaHealth';
export const AI_ASSISTANT_NAME = 'Hanna™';