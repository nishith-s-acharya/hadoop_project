import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThreatLog } from "@/hooks/useThreatLogs";
import { ThreatFiltersComponent, ThreatFilters } from "./ThreatFilters";
import { ThreatManagement } from "./ThreatManagement";
import { AlertNotificationButton } from "./AlertNotificationButton";
import { cn } from "@/lib/utils";
import { 
  ShieldAlert, 
  Scan, 
  KeyRound, 
  Bug, 
  Zap,
  Globe
} from "lucide-react";

interface ThreatLogProps {
  logs: ThreatLog[];
  isAuthenticated?: boolean;
  onRefetch?: () => void;
}

const typeIcons: Record<string, typeof KeyRound> = {
  failed_login: KeyRound,
  port_scan: Scan,
  brute_force: ShieldAlert,
  malware: Bug,
  ddos: Zap,
};

const typeLabels: Record<string, string> = {
  failed_login: 'Failed Login',
  port_scan: 'Port Scan',
  brute_force: 'Brute Force',
  malware: 'Malware',
  ddos: 'DDoS',
};

const severityVariants = {
  low: 'info',
  medium: 'warning',
  high: 'warning',
  critical: 'critical',
} as const;

export function ThreatLogViewer({ logs, isAuthenticated, onRefetch }: ThreatLogProps) {
  const [filters, setFilters] = useState<ThreatFilters>({
    search: '',
    severity: [],
    threatType: [],
    dateFrom: undefined,
    dateTo: undefined,
  });

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          log.source_ip.toLowerCase().includes(searchLower) ||
          (log.destination_ip?.toLowerCase().includes(searchLower)) ||
          log.description.toLowerCase().includes(searchLower) ||
          (log.location?.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Severity filter
      if (filters.severity.length > 0 && !filters.severity.includes(log.severity)) {
        return false;
      }

      // Threat type filter
      if (filters.threatType.length > 0 && !filters.threatType.includes(log.threat_type)) {
        return false;
      }

      // Date range filter
      const logDate = new Date(log.timestamp);
      if (filters.dateFrom && logDate < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (logDate > endOfDay) {
          return false;
        }
      }

      return true;
    });
  }, [logs, filters]);

  return (
    <Card variant="cyber" className="col-span-full">
      <CardHeader className="pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            Real-Time Threat Feed
          </CardTitle>
          <Badge variant="info" className="font-mono">
            {filteredLogs.length} / {logs.length} events
          </Badge>
        </div>
        <ThreatFiltersComponent filters={filters} onFiltersChange={setFilters} />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShieldAlert className="h-12 w-12 mb-4 opacity-50" />
              <p className="font-mono text-sm">
                {logs.length === 0 ? 'No threats detected' : 'No matching threats'}
              </p>
              <p className="text-xs mt-1">
                {logs.length === 0 ? 'System monitoring active' : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log, index) => {
                const Icon = typeIcons[log.threat_type] || ShieldAlert;
                const timestamp = new Date(log.timestamp);
                return (
                  <div
                    key={log.id}
                    className={cn(
                      "group relative flex items-start gap-4 p-4 rounded-lg border transition-all duration-300",
                      "bg-secondary/30 border-border/50 hover:border-primary/30 hover:bg-secondary/50",
                      "animate-fade-in",
                      log.status === 'resolved' && "opacity-60"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={cn(
                      "flex-shrink-0 p-2 rounded-lg",
                      log.severity === 'critical' && "bg-destructive/20 text-destructive",
                      log.severity === 'high' && "bg-warning/20 text-warning",
                      log.severity === 'medium' && "bg-warning/10 text-warning/80",
                      log.severity === 'low' && "bg-primary/20 text-primary",
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={severityVariants[log.severity]} className="uppercase text-[10px]">
                          {log.severity}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {typeLabels[log.threat_type] || log.threat_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          {timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-foreground font-medium">
                        {log.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1">
                          <span className="text-primary">SRC:</span> {log.source_ip}
                        </span>
                        {log.destination_ip && (
                          <span className="flex items-center gap-1">
                            <span className="text-primary">DST:</span> {log.destination_ip}
                          </span>
                        )}
                        {log.port && (
                          <span className="flex items-center gap-1">
                            <span className="text-primary">PORT:</span> {log.port}
                          </span>
                        )}
                        {log.location && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" /> {log.location}
                          </span>
                        )}
                      </div>

                      {/* Management controls for authenticated users */}
                      {isAuthenticated && onRefetch && (
                        <div className="pt-2 border-t border-border/30 mt-2 flex items-center gap-2">
                          <ThreatManagement threat={log} onUpdate={onRefetch} />
                          {log.severity === 'critical' && log.status !== 'resolved' && (
                            <AlertNotificationButton threatId={log.id} severity={log.severity} />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Severity indicator line */}
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
                      log.severity === 'critical' && "bg-destructive",
                      log.severity === 'high' && "bg-warning",
                      log.severity === 'medium' && "bg-warning/60",
                      log.severity === 'low' && "bg-primary/60",
                    )} />
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
