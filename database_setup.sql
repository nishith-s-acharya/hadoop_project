-- 1. Base Tables
CREATE TABLE IF NOT EXISTS public.threat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source_ip TEXT NOT NULL,
  destination_ip TEXT,
  threat_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  description TEXT NOT NULL,
  location TEXT,
  country_code TEXT,
  port INTEGER,
  protocol TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'investigating', 'resolved')),
  raw_log TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Columns from Update 1
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Enable RLS and Policies for threat_logs
ALTER TABLE public.threat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.threat_logs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.threat_logs FOR INSERT TO authenticated WITH CHECK (true);
-- Updates allowed for specific roles (handled below)

-- Indices
CREATE INDEX IF NOT EXISTS idx_threat_logs_timestamp ON public.threat_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_threat_logs_severity ON public.threat_logs(severity);
CREATE INDEX IF NOT EXISTS idx_threat_logs_threat_type ON public.threat_logs(threat_type);
CREATE INDEX IF NOT EXISTS idx_threat_logs_resolved ON public.threat_logs(resolved_at);

-- Realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.threat_logs;


-- 2. Profiles App Roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'analyst', 'viewer');
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Helper Function for Roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS ( SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role )
$$;

-- Handle New User Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
  
  -- Default role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'analyst');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. Response Rules & Extras
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE IF NOT EXISTS public.response_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL,
    trigger_value TEXT NOT NULL,
    action_type TEXT NOT NULL,
    action_config JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blocked_ips (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    blocked_by UUID REFERENCES auth.users(id),
    rule_id UUID REFERENCES public.response_rules(id) ON DELETE SET NULL,
    blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_permanent BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.alert_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    threat_log_id UUID REFERENCES public.threat_logs(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Advanced RLS
ALTER TABLE public.response_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View rules" ON public.response_rules FOR SELECT USING (true);
CREATE POLICY "Manage rules" ON public.response_rules FOR ALL USING (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "View blocked" ON public.blocked_ips FOR SELECT USING (true);
CREATE POLICY "Manage blocked" ON public.blocked_ips FOR ALL USING (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "View alerts" ON public.alert_notifications FOR SELECT USING (true);
CREATE POLICY "System insert alerts" ON public.alert_notifications FOR INSERT WITH CHECK (true);

-- Updated Threat Log Policy for Analysts
CREATE POLICY "Analysts can update threats" ON public.threat_logs
FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin')
);

-- Triggers
DROP TRIGGER IF EXISTS update_response_rules_updated_at ON public.response_rules;
CREATE TRIGGER update_response_rules_updated_at BEFORE UPDATE ON public.response_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
