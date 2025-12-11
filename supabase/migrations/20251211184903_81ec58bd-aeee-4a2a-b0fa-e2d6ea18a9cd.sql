-- Add columns to threat_logs for management
ALTER TABLE public.threat_logs 
ADD COLUMN resolved_at timestamp with time zone,
ADD COLUMN resolved_by uuid REFERENCES auth.users(id),
ADD COLUMN notes text;

-- Create index for resolved status
CREATE INDEX idx_threat_logs_resolved ON public.threat_logs(resolved_at);

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'analyst', 'viewer');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
  
  -- Give new users analyst role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'analyst');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS on threat_logs for authenticated updates
DROP POLICY IF EXISTS "Allow authenticated update " ON public.threat_logs;

CREATE POLICY "Analysts can update threats" ON public.threat_logs
FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin')
);