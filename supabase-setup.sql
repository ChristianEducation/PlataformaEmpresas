-- Enable RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles (allow all authenticated users to read all profiles for the dropdown)
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create shifts table
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on shifts
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Create policy for shifts (all authenticated users can read)
CREATE POLICY "Authenticated users can view shifts" ON public.shifts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE NOT NULL,
  order_date DATE NOT NULL,
  menu_item TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, shift_id, order_date)
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders" ON public.orders
  FOR DELETE USING (auth.uid() = user_id);

-- Insert default shifts
INSERT INTO public.shifts (name, start_time, end_time) VALUES
  ('Turno Día', '06:00:00', '14:00:00'),
  ('Turno Noche', '14:00:00', '22:00:00')
ON CONFLICT DO NOTHING;

-- Function to generate password (first letter of first name + last name in uppercase)
CREATE OR REPLACE FUNCTION generate_user_password(full_name TEXT)
RETURNS TEXT AS $$
DECLARE
  name_parts TEXT[];
  first_name TEXT;
  last_name TEXT;
BEGIN
  IF full_name IS NULL OR trim(full_name) = '' THEN
    RETURN '';
  END IF;
  
  name_parts := string_to_array(trim(full_name), ' ');
  
  IF array_length(name_parts, 1) < 2 THEN
    RETURN '';
  END IF;
  
  first_name := name_parts[1];
  last_name := name_parts[array_length(name_parts, 1)];
  
  RETURN upper(substring(first_name, 1, 1) || last_name);
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for orders updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert example users (you'll need to create these users in Supabase Auth first)
-- Example users with their generated passwords:
-- Juan Pérez -> JPEREZ
-- María García -> MGARCIA  
-- Carlos López -> CLOPEZ
-- Ana Martínez -> AMARTINEZ
-- Luis Rodríguez -> LRODRIGUEZ

-- Note: You need to create these users manually in Supabase Auth dashboard first,
-- then their profiles will be automatically created by the trigger.
-- Make sure to set their passwords to match the generated pattern.

-- Example of how to insert users programmatically (if needed):
/*
-- First create the auth user, then the profile will be created automatically
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'juan.perez@example.com',
  crypt('JPEREZ', gen_salt('bf')),
  NOW(),
  '{"full_name": "Juan Pérez"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
*/
