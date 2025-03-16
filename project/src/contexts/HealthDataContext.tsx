import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type HealthMetric = {
  id: string;
  user_id: string;
  date: string;
  weight: number | null;
  blood_glucose: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  mood: number | null;
  steps: number | null;
  sleep_hours: number | null;
  notes: string | null;
};

type HealthProfile = {
  id: string;
  user_id: string;
  age: number | null;
  height: number | null;
  medical_conditions: string[];
  medications: string[];
  family_history: string[];
  lifestyle_factors: {
    diet_type: string;
    activity_level: string;
    stress_level: string;
    sleep_quality: string;
  };
  goals: string[];
};

type HealthDataContextType = {
  healthMetrics: HealthMetric[];
  healthProfile: HealthProfile | null;
  loading: boolean;
  addHealthMetric: (metric: Omit<HealthMetric, 'id' | 'user_id'>) => Promise<void>;
  updateHealthProfile: (profile: Partial<Omit<HealthProfile, 'id' | 'user_id'>>) => Promise<void>;
  fetchHealthMetrics: () => Promise<void>;
};

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHealthMetrics();
      fetchHealthProfile();
    } else {
      setHealthMetrics([]);
      setHealthProfile(null);
    }
  }, [user]);

  const fetchHealthMetrics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        toast.error(`Error fetching health metrics: ${error.message}`);
        throw error;
      }

      setHealthMetrics(data || []);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthProfile = async () => {
    if (!user) return;
    
    try {
      // Use maybeSingle() instead of single() to avoid PGRST116 error when no rows are found
      const { data, error } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        toast.error(`Error fetching health profile: ${error.message}`);
        throw error;
      }

      // If data is an array with elements, take the first one
      setHealthProfile(data && data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error('Error fetching health profile:', error);
    }
  };

  const addHealthMetric = async (metric: Omit<HealthMetric, 'id' | 'user_id'>) => {
    if (!user) {
      toast.error('You must be logged in to add health metrics');
      return;
    }
    
    try {
      const { error } = await supabase.from('health_metrics').insert({
        ...metric,
        user_id: user.id,
      });

      if (error) {
        toast.error(`Error adding health metric: ${error.message}`);
        throw error;
      }

      toast.success('Health metric added successfully');
      await fetchHealthMetrics();
    } catch (error) {
      console.error('Error adding health metric:', error);
      throw error;
    }
  };

  const updateHealthProfile = async (profile: Partial<Omit<HealthProfile, 'id' | 'user_id'>>) => {
    if (!user) {
      toast.error('You must be logged in to update your health profile');
      return;
    }
    
    try {
      // Ensure medical_conditions and medications are properly stringified if they're arrays
      const formattedProfile = {
        ...profile,
        medical_conditions: Array.isArray(profile.medical_conditions) 
          ? JSON.stringify(profile.medical_conditions)
          : profile.medical_conditions,
        medications: Array.isArray(profile.medications)
          ? JSON.stringify(profile.medications)
          : profile.medications,
        lifestyle_factors: typeof profile.lifestyle_factors === 'object'
          ? JSON.stringify(profile.lifestyle_factors)
          : profile.lifestyle_factors
      };
      
      if (healthProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('health_profiles')
          .update(formattedProfile)
          .eq('user_id', user.id);

        if (error) {
          toast.error(`Error updating health profile: ${error.message}`);
          throw error;
        }
      } else {
        // Create new profile
        const { error } = await supabase.from('health_profiles').insert({
          ...formattedProfile,
          user_id: user.id,
        });

        if (error) {
          toast.error(`Error creating health profile: ${error.message}`);
          throw error;
        }
      }

      toast.success('Health profile updated successfully');
      await fetchHealthProfile();
    } catch (error) {
      console.error('Error updating health profile:', error);
      throw error;
    }
  };

  const value = {
    healthMetrics,
    healthProfile,
    loading,
    addHealthMetric,
    updateHealthProfile,
    fetchHealthMetrics,
  };

  return <HealthDataContext.Provider value={value}>{children}</HealthDataContext.Provider>;
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};