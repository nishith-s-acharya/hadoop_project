import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ShieldBan, ShieldCheck, ArrowRight, Clock, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  blocked_at: string;
  expires_at: string | null;
  is_permanent: boolean;
}

interface ResponseRule {
  id: string;
  name: string;
  trigger_type: string;
  action_type: string;
  is_active: boolean;
}

export function SecuritySummaryWidget() {
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [rules, setRules] = useState<ResponseRule[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ipsResult, rulesResult] = await Promise.all([
          supabase
            .from('blocked_ips')
            .select('*')
            .order('blocked_at', { ascending: false })
            .limit(5),
          supabase
            .from('response_rules')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        if (ipsResult.data) setBlockedIPs(ipsResult.data);
        if (rulesResult.data) setRules(rulesResult.data);
      } catch (error) {
        console.error('Error fetching security summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const blockedChannel = supabase
      .channel('blocked_ips_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_ips' }, () => {
        fetchData();
      })
      .subscribe();

    const rulesChannel = supabase
      .channel('rules_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'response_rules' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(blockedChannel);
      supabase.removeChannel(rulesChannel);
    };
  }, []);

  const getActionBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case 'block_ip': return 'critical';
      case 'escalate': return 'warning';
      case 'notify': return 'info';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card variant="cyber">
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-primary animate-pulse font-mono text-sm">
            Loading security data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="cyber">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Security Summary
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/response-rules')}
            className="font-mono text-xs gap-1 text-primary"
          >
            View All
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Blocked IPs Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldBan className="h-4 w-4 text-destructive" />
            <span className="font-mono text-xs text-muted-foreground">
              BLOCKED IPs ({blockedIPs.length})
            </span>
          </div>
          {blockedIPs.length === 0 ? (
            <div className="text-xs text-muted-foreground font-mono p-3 bg-secondary/30 rounded-lg text-center">
              No blocked IPs
            </div>
          ) : (
            <ScrollArea className="h-24">
              <div className="space-y-1">
                {blockedIPs.map((ip) => (
                  <div
                    key={ip.id}
                    className="flex items-center justify-between p-2 bg-secondary/30 rounded-md border border-border/30"
                  >
                    <div className="flex items-center gap-2">
                      <Ban className="h-3 w-3 text-destructive" />
                      <span className="font-mono text-xs text-foreground">{ip.ip_address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {ip.is_permanent ? (
                        <Badge variant="critical" className="text-[10px]">PERMANENT</Badge>
                      ) : ip.expires_at && (
                        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(ip.expires_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Active Rules Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span className="font-mono text-xs text-muted-foreground">
              ACTIVE RULES ({rules.length})
            </span>
          </div>
          {rules.length === 0 ? (
            <div className="text-xs text-muted-foreground font-mono p-3 bg-secondary/30 rounded-lg text-center">
              No active rules
            </div>
          ) : (
            <ScrollArea className="h-24">
              <div className="space-y-1">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-2 bg-secondary/30 rounded-md border border-border/30"
                  >
                    <span className="font-mono text-xs text-foreground truncate max-w-[150px]">
                      {rule.name}
                    </span>
                    <Badge variant={getActionBadgeVariant(rule.action_type)} className="text-[10px]">
                      {rule.action_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
