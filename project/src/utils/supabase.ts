import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase URL or API key not found. Please make sure to set up your environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Utility functions for database operations
export const getHealthMetrics = async (userId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('health_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching health metrics:', error);
    throw error;
  }

  return data || [];
};

export const getHealthProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('health_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is the error code for "No rows returned"
    console.error('Error fetching health profile:', error);
    throw error;
  }

  return data || null;
};

export const updateHealthProfile = async (userId: string, profile: any) => {
  const { data, error } = await supabase
    .from('health_profiles')
    .upsert({ user_id: userId, ...profile })
    .select()
    .single();

  if (error) {
    console.error('Error updating health profile:', error);
    throw error;
  }

  return data;
};

export const addHealthMetric = async (userId: string, metric: any) => {
  const { data, error } = await supabase
    .from('health_metrics')
    .insert({ user_id: userId, ...metric })
    .select()
    .single();

  if (error) {
    console.error('Error adding health metric:', error);
    throw error;
  }

  return data;
};

export const getConversations = async (userId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }

  return data || [];
};

export const getMessagesForConversation = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return data || [];
};

export const createConversation = async (userId: string, title: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title })
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }

  return data;
};

export const addMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content })
    .select()
    .single();

  if (error) {
    console.error('Error adding message:', error);
    throw error;
  }

  return data;
};

export const updateConversationTitle = async (conversationId: string, title: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating conversation title:', error);
    throw error;
  }

  return data;
};