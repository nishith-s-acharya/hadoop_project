import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThreatLog as ThreatLogType } from "@/lib/mock-data";
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
  logs: ThreatLogType[];
}

const typeIcons = {
  failed_login: KeyRound,
  port_scan: Scan,
  brute_force: ShieldAlert,
  malware: Bug,
  ddos: Zap,
};

const typeLabels = {
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

export function ThreatLogViewer({ logs }: ThreatLogProps) {
  return (
    <Card variant="cyber" className="col-span-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            Real-Time Threat Feed
          </CardTitle>
          <Badge variant="info" className="font-mono">
            {logs.length} events
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {logs.map((log, index) => {
              const Icon = typeIcons[log.type];
              return (
                <div
                  key={log.id}
                  className={cn(
                    "group relative flex items-start gap-4 p-4 rounded-lg border transition-all duration-300",
                    "bg-secondary/30 border-border/50 hover:border-primary/30 hover:bg-secondary/50",
                    "animate-fade-in"
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
                        {typeLabels[log.type]}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground font-medium">
                      {log.details}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1">
                        <span className="text-primary">SRC:</span> {log.sourceIP}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-primary">DST:</span> {log.targetIP}
                      </span>
                      {log.port && (
                        <span className="flex items-center gap-1">
                          <span className="text-primary">PORT:</span> {log.port}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {log.country}
                      </span>
                    </div>
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
