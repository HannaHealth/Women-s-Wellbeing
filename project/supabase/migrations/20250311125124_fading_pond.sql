/*
  # Create Care Plans and Progress Tracking

  1. New Tables
    - `care_plans`: Stores personalized health care plans
      - `id` (uuid, primary key): Unique identifier
      - `user_id` (uuid, references users): Owner of the care plan
      - `title` (text): Title of the care plan
      - `content` (jsonb): Plan content including sections and goals
      - `start_date` (date): When the plan begins
      - `end_date` (date): When the plan ends (optional)
      - `status` (text): Current status (active, completed, archived)
      - `created_at`, `updated_at` (timestamptz): Timestamps
    - `care_plan_progress`: Tracks progress for each care plan goal
      - `id` (uuid, primary key): Unique identifier
      - `care_plan_id` (uuid, references care_plans): Associated care plan
      - `goal_id` (text): Identifier for the specific goal within the care plan
      - `date` (date): Date of the progress entry
      - `value` (integer): Progress value (0-100)
      - `notes` (text): Optional notes about progress
      - `created_at` (timestamptz): Timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own care plans and progress
*/

-- Care Plans Table
CREATE TABLE IF NOT EXISTS public.care_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  start_date date NOT NULL,
  end_date date,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Care Plan Progress Table
CREATE TABLE IF NOT EXISTS public.care_plan_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id uuid NOT NULL REFERENCES public.care_plans(id) ON DELETE CASCADE,
  goal_id text NOT NULL,
  date date NOT NULL,
  value integer NOT NULL CHECK (value >= 0 AND value <= 100),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Add update trigger for care_plans if it doesn't exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_care_plans_modtime'
  ) THEN
    CREATE TRIGGER update_care_plans_modtime
    BEFORE UPDATE ON public.care_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  END IF;
END
$$;

-- Enable Row Level Security
ALTER TABLE public.care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_plan_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can create own care plans" ON public.care_plans;
DROP POLICY IF EXISTS "Users can view own care plans" ON public.care_plans;
DROP POLICY IF EXISTS "Users can update own care plans" ON public.care_plans;
DROP POLICY IF EXISTS "Users can delete own care plans" ON public.care_plans;
DROP POLICY IF EXISTS "Users can create progress for own care plans" ON public.care_plan_progress;
DROP POLICY IF EXISTS "Users can view progress for own care plans" ON public.care_plan_progress;
DROP POLICY IF EXISTS "Users can update progress for own care plans" ON public.care_plan_progress;
DROP POLICY IF EXISTS "Users can delete progress for own care plans" ON public.care_plan_progress;

-- RLS Policies for care_plans
CREATE POLICY "Users can create own care plans"
  ON public.care_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own care plans"
  ON public.care_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own care plans"
  ON public.care_plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own care plans"
  ON public.care_plans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for care_plan_progress
CREATE POLICY "Users can create progress for own care plans"
  ON public.care_plan_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.care_plans
      WHERE care_plans.id = care_plan_progress.care_plan_id
      AND care_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view progress for own care plans"
  ON public.care_plan_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.care_plans
      WHERE care_plans.id = care_plan_progress.care_plan_id
      AND care_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update progress for own care plans"
  ON public.care_plan_progress
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.care_plans
      WHERE care_plans.id = care_plan_progress.care_plan_id
      AND care_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete progress for own care plans"
  ON public.care_plan_progress
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.care_plans
      WHERE care_plans.id = care_plan_progress.care_plan_id
      AND care_plans.user_id = auth.uid()
    )
  );