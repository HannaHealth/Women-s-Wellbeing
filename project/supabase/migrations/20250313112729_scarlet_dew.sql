/*
  # Care Plan Progress Migration

  This migration creates and configures tables for tracking care plan progress.
  Fixed to use proper PostgreSQL policy creation syntax.
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