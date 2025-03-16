/*
  # Add Food Tracking Tables

  1. New Tables
    - `food_entries` - For tracking individual food items consumed by users
      - `id` (uuid, primary key): Unique identifier
      - `user_id` (uuid, references users): Owner of the food entry
      - `date` (date): Date of consumption
      - `meal_type` (text): Breakfast, lunch, dinner, or snack
      - `name` (text): Name of the food item
      - `portion` (text): Serving size or portion information
      - `calories` (integer): Calorie content
      - `carbs` (integer): Carbohydrate content in grams
      - `protein` (integer): Protein content in grams
      - `fat` (integer): Fat content in grams
      - `fiber` (integer): Fiber content in grams
      - `glycemic_index` (integer): Optional glycemic index value
      - `created_at` (timestamp): When the entry was created
      
    - `food_database` - Reference table of common foods and their nutritional info
      - `id` (uuid, primary key): Unique identifier
      - `name` (text): Name of the food
      - `portion` (text): Standard portion size
      - `calories` (integer): Calories per portion
      - `carbs` (integer): Carbs per portion in grams
      - `protein` (integer): Protein per portion in grams
      - `fat` (integer): Fat per portion in grams
      - `fiber` (integer): Fiber per portion in grams
      - `glycemic_index` (integer): Optional glycemic index value
      - `created_at` (timestamp): When the entry was added to the database
      
    - `glycemic_index` - Reference table for glycemic index of foods
      - `id` (uuid, primary key): Unique identifier
      - `food_name` (text): Name of the food
      - `glycemic_index` (integer): Glycemic index value (0-100)
      - `glycemic_load` (integer): Optional glycemic load value
      - `notes` (text): Optional additional information
      
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their food entries
    - Allow all users to read from reference tables
*/

-- Food Entries Table
CREATE TABLE IF NOT EXISTS public.food_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  name text NOT NULL,
  portion text,
  calories integer NOT NULL DEFAULT 0,
  carbs integer NOT NULL DEFAULT 0,
  protein integer NOT NULL DEFAULT 0,
  fat integer NOT NULL DEFAULT 0,
  fiber integer NOT NULL DEFAULT 0,
  glycemic_index integer,
  created_at timestamptz DEFAULT now()
);

-- Food Database Table
CREATE TABLE IF NOT EXISTS public.food_database (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  portion text NOT NULL,
  calories integer NOT NULL DEFAULT 0,
  carbs integer NOT NULL DEFAULT 0,
  protein integer NOT NULL DEFAULT 0,
  fat integer NOT NULL DEFAULT 0,
  fiber integer NOT NULL DEFAULT 0,
  glycemic_index integer,
  created_at timestamptz DEFAULT now()
);

-- Glycemic Index Reference Table
CREATE TABLE IF NOT EXISTS public.glycemic_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name text NOT NULL,
  glycemic_index integer NOT NULL,
  glycemic_load integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS food_entries_user_id_idx ON public.food_entries(user_id);
CREATE INDEX IF NOT EXISTS food_entries_date_idx ON public.food_entries(date);
CREATE INDEX IF NOT EXISTS food_entries_meal_type_idx ON public.food_entries(meal_type);
CREATE INDEX IF NOT EXISTS food_database_name_idx ON public.food_database(name);
CREATE INDEX IF NOT EXISTS glycemic_index_food_name_idx ON public.glycemic_index(food_name);

-- Enable Row Level Security
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glycemic_index ENABLE ROW LEVEL SECURITY;

-- RLS Policies for food_entries
CREATE POLICY "Users can create own food entries"
  ON public.food_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own food entries"
  ON public.food_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own food entries"
  ON public.food_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food entries"
  ON public.food_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for food_database (read-only for all authenticated users)
CREATE POLICY "All users can view food database"
  ON public.food_database
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for glycemic_index (read-only for all authenticated users)
CREATE POLICY "All users can view glycemic index"
  ON public.glycemic_index
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert some sample data into food_database
INSERT INTO public.food_database (name, portion, calories, carbs, protein, fat, fiber, glycemic_index)
VALUES
  ('Apple', '1 medium (182g)', 95, 25, 0, 0, 4, 36),
  ('Banana', '1 medium (118g)', 105, 27, 1, 0, 3, 51),
  ('Chicken Breast', '100g (cooked)', 165, 0, 31, 4, 0, NULL),
  ('White Rice', '1 cup cooked (158g)', 205, 45, 4, 0, 1, 73),
  ('Brown Rice', '1 cup cooked (158g)', 216, 45, 5, 2, 4, 50),
  ('Quinoa', '1 cup cooked (185g)', 222, 39, 8, 4, 5, 53),
  ('Broccoli', '1 cup chopped (91g)', 31, 6, 3, 0, 2, 15),
  ('Spinach', '1 cup (30g)', 7, 1, 1, 0, 1, 15),
  ('Salmon', '100g (cooked)', 206, 0, 22, 13, 0, NULL),
  ('Greek Yogurt', '1 cup (245g)', 130, 9, 22, 0, 0, 11)
ON CONFLICT DO NOTHING;

-- Insert some sample data into glycemic_index
INSERT INTO public.glycemic_index (food_name, glycemic_index, glycemic_load, notes)
VALUES
  ('White Bread', 75, 10, 'High GI food'),
  ('Whole Grain Bread', 53, 7, 'Medium GI food'),
  ('Oatmeal', 55, 13, 'Medium GI food'),
  ('Apple', 36, 5, 'Low GI food'),
  ('Banana', 51, 13, 'Low GI food'),
  ('Pasta', 41, 16, 'Low GI food'),
  ('White Rice', 73, 43, 'High GI food'),
  ('Brown Rice', 50, 16, 'Medium GI food'),
  ('Quinoa', 53, 13, 'Medium GI food'),
  ('Sweet Potato', 70, 22, 'High GI food'),
  ('Potato', 82, 21, 'High GI food'),
  ('Lentils', 32, 5, 'Low GI food'),
  ('Chickpeas', 28, 8, 'Low GI food'),
  ('Greek Yogurt', 11, 2, 'Low GI food'),
  ('Milk', 31, 4, 'Low GI food'),
  ('Chocolate', 40, 8, 'Low GI food'),
  ('Honey', 58, 10, 'Medium GI food'),
  ('Table Sugar', 65, 7, 'Medium GI food'),
  ('Watermelon', 72, 4, 'High GI food but low glycemic load'),
  ('Pineapple', 59, 7, 'Medium GI food')
ON CONFLICT DO NOTHING;