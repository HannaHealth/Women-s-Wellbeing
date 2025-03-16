/*
  # Add Location and Cultural Fields to Health Profiles

  1. Changes
    - Add new columns to health_profiles table:
      - nationality (text)
      - country_of_residence (text)
      - region (text)
      - climate_type (text)
      - dietary_restrictions (jsonb)
      - cultural_considerations (jsonb)

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to health_profiles
ALTER TABLE public.health_profiles
ADD COLUMN IF NOT EXISTS nationality text,
ADD COLUMN IF NOT EXISTS country_of_residence text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS climate_type text,
ADD COLUMN IF NOT EXISTS dietary_restrictions jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS cultural_considerations jsonb DEFAULT '[]';

-- Add indices for better query performance
CREATE INDEX IF NOT EXISTS idx_health_profiles_nationality ON public.health_profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_health_profiles_country_residence ON public.health_profiles(country_of_residence);
CREATE INDEX IF NOT EXISTS idx_health_profiles_climate ON public.health_profiles(climate_type);

-- Comment on columns
COMMENT ON COLUMN public.health_profiles.nationality IS 'User''s nationality for cultural context';
COMMENT ON COLUMN public.health_profiles.country_of_residence IS 'Current country of residence';
COMMENT ON COLUMN public.health_profiles.region IS 'Specific region or city';
COMMENT ON COLUMN public.health_profiles.climate_type IS 'Local climate type for activity recommendations';
COMMENT ON COLUMN public.health_profiles.dietary_restrictions IS 'Cultural or religious dietary restrictions';
COMMENT ON COLUMN public.health_profiles.cultural_considerations IS 'Other cultural factors to consider';