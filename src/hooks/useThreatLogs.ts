import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ThreatLog {
  id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string | null;
  threat_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location: string | null;
  country_code: string | null;
  port: number | null;
  protocol: string | null;
  status: string;
  raw_log: string | null;
  created_at: string;
}

export interface ThreatStats {
  failedLogins: number;
  portScans: number;
  bruteForceAttempts: number;
  malwareDetected: number;
  ddosAttacks: number;
  totalThreats: number;
  criticalAlerts: number;
}

export function useThreatLogs() {
  const [logs, setLogs] = useState<ThreatLog[]>([]);
  const [stats, setStats] = useState<ThreatStats>({
    failedLogins: 0,
    portScans: 0,
    bruteForceAttempts: 0,
    malwareDetected: 0,
    ddosAttacks: 0,
    totalThreats: 0,
    criticalAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  const calculateStats = (threatLogs: ThreatLog[]): ThreatStats => {
    const failedLogins = threatLogs.filter(l => l.threat_type === 'failed_login').length;
    const portScans = threatLogs.filter(l => l.threat_type === 'port_scan').length;
    const bruteForceAttempts = threatLogs.filter(l => l.threat_type === 'brute_force').length;
    const malwareDetected = threatLogs.filter(l => l.threat_type === 'malware').length;
    const ddosAttacks = threatLogs.filter(l => l.threat_type === 'ddos').length;
    const criticalAlerts = threatLogs.filter(l => l.severity === 'critical').length;

    return {
      failedLogins,
      portScans,
      bruteForceAttempts,
      malwareDetected,
      ddosAttacks,
      totalThreats: threatLogs.length,
      criticalAlerts,
    };
  };

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('threat_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching threat logs:', error);
      return;
    }

    const typedLogs = (data || []) as ThreatLog[];
    setLogs(typedLogs);
    setStats(calculateStats(typedLogs));
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('threat_logs_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'threat_logs',
        },
        (payload) => {
          const newLog = payload.new as ThreatLog;
          setLogs(prev => {
            const updated = [newLog, ...prev.slice(0, 99)];
            setStats(calculateStats(updated));
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { logs, stats, loading, refetch: fetchLogs };
}
