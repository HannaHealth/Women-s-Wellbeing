/*
  # Update Health Profiles Schema

  1. Changes
    - Add new columns for cultural and environmental context
    - Add indices for better query performance
    - Add comments for better documentation
*/

-- Add new columns to health_profiles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'health_profiles' AND column_name = 'nationality'
  ) THEN
    ALTER TABLE public.health_profiles
    ADD COLUMN nationality text,
    ADD COLUMN country_of_residence text,
    ADD COLUMN region text,
    ADD COLUMN climate_type text,
    ADD COLUMN dietary_restrictions jsonb DEFAULT '[]',
    ADD COLUMN cultural_considerations jsonb DEFAULT '[]';
  END IF;
END $$;

-- Create indices for better query performance if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'health_profiles' AND indexname = 'idx_health_profiles_nationality'
  ) THEN
    CREATE INDEX idx_health_profiles_nationality ON public.health_profiles(nationality);
    CREATE INDEX idx_health_profiles_country_residence ON public.health_profiles(country_of_residence);
    CREATE INDEX idx_health_profiles_climate ON public.health_profiles(climate_type);
  END IF;
END $$;

-- Add column comments
COMMENT ON COLUMN public.health_profiles.nationality IS 'User''s nationality for cultural context';
COMMENT ON COLUMN public.health_profiles.country_of_residence IS 'Current country of residence';
COMMENT ON COLUMN public.health_profiles.region IS 'Specific region or city';
COMMENT ON COLUMN public.health_profiles.climate_type IS 'Local climate type for activity recommendations';
COMMENT ON COLUMN public.health_profiles.dietary_restrictions IS 'Cultural or religious dietary restrictions';
COMMENT ON COLUMN public.health_profiles.cultural_considerations IS 'Other cultural factors to consider';