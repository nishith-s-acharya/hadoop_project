import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  variant?: 'default' | 'critical' | 'warning' | 'success';
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  variant = 'default'
}: StatsCardProps) {
  const variantStyles = {
    default: 'border-primary/20 hover:border-primary/40',
    critical: 'border-destructive/30 hover:border-destructive/50',
    warning: 'border-warning/30 hover:border-warning/50',
    success: 'border-success/30 hover:border-success/50',
  };

  const iconStyles = {
    default: 'text-primary bg-primary/10',
    critical: 'text-destructive bg-destructive/10',
    warning: 'text-warning bg-warning/10',
    success: 'text-success bg-success/10',
  };

  return (
    <Card 
      variant="cyber" 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px]",
        variantStyles[variant]
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className={cn(
              "text-3xl font-bold font-mono tracking-tight",
              variant === 'critical' && "text-destructive text-glow",
              variant === 'warning' && "text-warning",
              variant === 'success' && "text-success",
              variant === 'default' && "text-foreground"
            )}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change && (
              <p className={cn(
                "text-xs font-medium",
                changeType === 'increase' && "text-destructive",
                changeType === 'decrease' && "text-success",
                changeType === 'neutral' && "text-muted-foreground"
              )}>
                {change}
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-lg",
            iconStyles[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        {/* Decorative corner accent */}
        <div className={cn(
          "absolute top-0 right-0 w-20 h-20 opacity-5",
          variant === 'critical' && "bg-gradient-to-bl from-destructive",
          variant === 'warning' && "bg-gradient-to-bl from-warning",
          variant === 'success' && "bg-gradient-to-bl from-success",
          variant === 'default' && "bg-gradient-to-bl from-primary"
        )} />
      </CardContent>
    </Card>
  );
}
