/*
  # Add Care Plan Progress Tracking

  1. New Tables
    - `care_plan_progress`: Tracks goal progress for care plans
      - `id` (uuid, primary key): Unique identifier
      - `care_plan_id` (uuid, references care_plans): Associated care plan
      - `goal_id` (text): Identifier for the specific goal
      - `date` (date): Date of the progress entry 
      - `value` (integer): Progress value (0-100)
      - `notes` (text): Optional notes about progress
      - `created_at` (timestamptz): Timestamp

  2. Security
    - Enable RLS on the table
    - Add policies for authenticated users to manage their own care plan progress
*/

-- Care Plan Progress Table (if not already created)
CREATE TABLE IF NOT EXISTS public.care_plan_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id uuid NOT NULL REFERENCES public.care_plans(id) ON DELETE CASCADE,
  goal_id text NOT NULL,
  date date NOT NULL,
  value integer NOT NULL CHECK (value >= 0 AND value <= 100),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.care_plan_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can create progress for own care plans" ON public.care_plan_progress;
DROP POLICY IF EXISTS "Users can view progress for own care plans" ON public.care_plan_progress;
DROP POLICY IF EXISTS "Users can update progress for own care plans" ON public.care_plan_progress;
DROP POLICY IF EXISTS "Users can delete progress for own care plans" ON public.care_plan_progress;

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