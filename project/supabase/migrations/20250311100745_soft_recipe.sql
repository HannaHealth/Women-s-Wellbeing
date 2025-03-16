/*
  # Initial Database Schema for OpenHanna AI

  1. New Tables
    - `users` - Extended user profile data
    - `health_profiles` - Detailed health information for each user
    - `health_metrics` - Daily health measurements
    - `care_plans` - AI-generated care plans
    - `conversations` - Chat history with AI assistant

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their data
*/

-- Create tables with UUIDs and timestamps
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  date_of_birth date,
  country text,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS health_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  age int,
  height numeric, -- in cm
  medical_conditions jsonb DEFAULT '[]',
  medications jsonb DEFAULT '[]',
  family_history jsonb DEFAULT '[]',
  lifestyle_factors jsonb DEFAULT '{"diet_type": "", "activity_level": "", "stress_level": "", "sleep_quality": ""}',
  goals jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  weight numeric, -- in kg
  blood_glucose numeric, -- in mg/dL
  blood_pressure_systolic int,
  blood_pressure_diastolic int,
  mood int, -- 1-5 scale
  steps int,
  sleep_hours numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS care_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL, -- structured care plan content
  start_date date NOT NULL,
  end_date date,
  status text DEFAULT 'active', -- active, completed, archived
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text DEFAULT 'New Conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL, -- 'user' or 'assistant'
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create triggers to automatically update 'updated_at' fields
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_health_profiles_modtime
BEFORE UPDATE ON health_profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_care_plans_modtime
BEFORE UPDATE ON care_plans
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_conversations_modtime
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Enable row level security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Health profiles
CREATE POLICY "Users can view own health profile"
  ON health_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own health profile"
  ON health_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health profile"
  ON health_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Health metrics
CREATE POLICY "Users can view own health metrics"
  ON health_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own health metrics"
  ON health_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health metrics"
  ON health_metrics FOR UPDATE
  USING (auth.uid() = user_id);

-- Care plans
CREATE POLICY "Users can view own care plans"
  ON care_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own care plans"
  ON care_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own care plans"
  ON care_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- Conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Create trigger to add new users to our users table when they sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();