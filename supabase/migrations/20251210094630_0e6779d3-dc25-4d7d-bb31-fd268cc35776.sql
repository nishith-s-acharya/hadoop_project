-- Create threat_logs table for storing security events
CREATE TABLE public.threat_logs (
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.threat_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access for the dashboard
CREATE POLICY "Allow public read access" 
ON public.threat_logs 
FOR SELECT 
USING (true);

-- Allow authenticated users to insert logs
CREATE POLICY "Allow authenticated insert" 
ON public.threat_logs 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update logs
CREATE POLICY "Allow authenticated update" 
ON public.threat_logs 
FOR UPDATE 
TO authenticated
USING (true);

-- Create index for faster queries
CREATE INDEX idx_threat_logs_timestamp ON public.threat_logs(timestamp DESC);
CREATE INDEX idx_threat_logs_severity ON public.threat_logs(severity);
CREATE INDEX idx_threat_logs_threat_type ON public.threat_logs(threat_type);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.threat_logs;