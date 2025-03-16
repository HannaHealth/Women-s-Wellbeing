import { createClient } from '@supabase/supabase-js';
import { generateCarePlan } from './openai';
import toast from 'react-hot-toast';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export interface CarePlan {
  id: string;
  user_id: string;
  title: string;
  content: CarePlanContent;
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CarePlanSection {
  title: string;
  content: string[];
}

export interface CarePlanContent {
  sections: CarePlanSection[];
  weeklyGoals: string[];
}

export interface CarePlanProgress {
  id: string;
  care_plan_id: string;
  goal_id: string;
  date: string;
  value: number;
  notes?: string;
}

// Get active care plan for the user
export async function getUserActivePlan(userId: string): Promise<CarePlan | null> {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching care plan:', error);
      throw error;
    }

    if (data && data.length > 0) {
      // Parse the content field if it's stored as a string
      const plan = data[0];
      if (typeof plan.content === 'string') {
        plan.content = JSON.parse(plan.content);
      }
      return plan;
    }

    return null;
  } catch (error) {
    console.error('Error getting active care plan:', error);
    return null;
  }
}

// Create a new care plan for the user
export async function createUserCarePlan(userId: string): Promise<CarePlan | null> {
  try {
    // Generate care plan content using OpenAI
    const planContent = await generateCarePlan(userId);
    
    if (!planContent) {
      throw new Error('Failed to generate care plan content');
    }
    
    // Format dates
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    
    // Add 8 weeks for end date
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 56); // 8 weeks
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Create the care plan in the database
    const { data, error } = await supabase
      .from('care_plans')
      .insert({
        user_id: userId,
        title: planContent.title,
        content: planContent,
        start_date: startDate,
        end_date: endDateStr,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating care plan:', error);
      throw error;
    }

    toast.success('Your personalized care plan has been created!');
    return data;
  } catch (error) {
    console.error('Error creating care plan:', error);
    toast.error('Failed to create care plan. Please try again later.');
    return null;
  }
}

// Update care plan status
export async function updateCarePlanStatus(
  planId: string, 
  status: 'active' | 'completed' | 'archived'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('care_plans')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', planId);

    if (error) {
      console.error('Error updating care plan:', error);
      throw error;
    }

    toast.success(`Care plan ${status === 'completed' ? 'completed' : 'updated'} successfully!`);
    return true;
  } catch (error) {
    console.error('Error updating care plan status:', error);
    return false;
  }
}

// Get progress for a care plan
export async function getCarePlanProgress(carePlanId: string): Promise<CarePlanProgress[]> {
  try {
    const { data, error } = await supabase
      .from('care_plan_progress')
      .select('*')
      .eq('care_plan_id', carePlanId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching progress data:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting care plan progress:', error);
    return [];
  }
}

// Update progress for a goal
export async function updateGoalProgress(
  carePlanId: string,
  goalId: string,
  value: number,
  notes?: string
): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have an entry for this goal and date
    const { data: existingData, error: checkError } = await supabase
      .from('care_plan_progress')
      .select('id')
      .eq('care_plan_id', carePlanId)
      .eq('goal_id', goalId)
      .eq('date', today);
      
    if (checkError) {
      console.error('Error checking progress:', checkError);
      throw checkError;
    }
    
    if (existingData && existingData.length > 0) {
      // Update existing progress
      const { error } = await supabase
        .from('care_plan_progress')
        .update({ value, notes })
        .eq('id', existingData[0].id);
        
      if (error) {
        console.error('Error updating progress:', error);
        throw error;
      }
    } else {
      // Create new progress entry
      const { error } = await supabase
        .from('care_plan_progress')
        .insert({
          care_plan_id: carePlanId,
          goal_id: goalId,
          date: today,
          value,
          notes
        });
        
      if (error) {
        console.error('Error saving progress:', error);
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return false;
  }
}

// Format progress data for display in charts
export function formatProgressData(progress: CarePlanProgress[]): Record<string, number> {
  // This function processes the raw progress data into a format for the UI
  // The result maps goal IDs to their latest progress values
  
  const latestProgress: Record<string, number | string> = {};
  
  progress.forEach((item) => {
    // Track only the most recent value for each goal
    if (!latestProgress[item.goal_id] || new Date(item.date) > new Date(latestProgress[`${item.goal_id}_date`] as string)) {
      latestProgress[item.goal_id] = item.value;
      latestProgress[`${item.goal_id}_date`] = item.date;
    }
  });
  
  // Remove the date tracking properties
  const cleanedProgress: Record<string, number> = {};
  Object.keys(latestProgress).forEach(key => {
    if (!key.endsWith('_date')) {
      cleanedProgress[key] = latestProgress[key] as number;
    }
  });
  
  return cleanedProgress;
}