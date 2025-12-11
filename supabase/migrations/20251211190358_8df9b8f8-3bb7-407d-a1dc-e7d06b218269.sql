-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for automated response rules
CREATE TABLE public.response_rules (
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

-- Create table for blocked IPs
CREATE TABLE public.blocked_ips (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    blocked_by UUID REFERENCES auth.users(id),
    rule_id UUID REFERENCES public.response_rules(id) ON DELETE SET NULL,
    blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_permanent BOOLEAN NOT NULL DEFAULT false
);

-- Create table for alert notifications log
CREATE TABLE public.alert_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    threat_log_id UUID REFERENCES public.threat_logs(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.response_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for response_rules
CREATE POLICY "Authenticated users can view rules" ON public.response_rules FOR SELECT USING (true);
CREATE POLICY "Analysts can create rules" ON public.response_rules FOR INSERT WITH CHECK (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Analysts can update rules" ON public.response_rules FOR UPDATE USING (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete rules" ON public.response_rules FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS policies for blocked_ips
CREATE POLICY "Authenticated users can view blocked IPs" ON public.blocked_ips FOR SELECT USING (true);
CREATE POLICY "Analysts can block IPs" ON public.blocked_ips FOR INSERT WITH CHECK (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Analysts can update blocked IPs" ON public.blocked_ips FOR UPDATE USING (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can unblock IPs" ON public.blocked_ips FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS policies for alert_notifications
CREATE POLICY "Authenticated users can view notifications" ON public.alert_notifications FOR SELECT USING (true);
CREATE POLICY "System can insert notifications" ON public.alert_notifications FOR INSERT WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_response_rules_updated_at
    BEFORE UPDATE ON public.response_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();