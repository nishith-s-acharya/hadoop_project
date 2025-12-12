-- Allow anonymous inserts for threat_logs to enable simulation script
BEGIN;

DROP POLICY IF EXISTS "Allow authenticated insert" ON public.threat_logs;

-- Create a new policy that allows anyone (including anon) to insert
-- In production, you would want to use a Service Role Key instead of opening this up.
CREATE POLICY "Allow simulation insert" ON public.threat_logs FOR INSERT WITH CHECK (true);

COMMIT;
