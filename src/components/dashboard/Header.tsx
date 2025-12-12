import { Shield, Bell, Settings, Activity, LogIn, LogOut, Zap, User, BarChart3, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";
import { ClusterStatus } from "./ClusterStatus";

interface HeaderProps {
  criticalAlerts: number;
  user?: { email?: string } | null;
  onSignOut?: () => void;
  onSimulate?: () => void;
  isSimulating?: boolean;
}

export function Header({ criticalAlerts, user, onSignOut, onSimulate, isSimulating }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Shield },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/response-rules', label: 'Response Rules', icon: ShieldCheck },
  ];

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Mobile Menu */}
            <MobileNav 
              user={user} 
              onSignOut={onSignOut} 
              onSimulate={onSimulate}
              isSimulating={isSimulating}
            />

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative">
                <Shield className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-success animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                  SENTINEL
                </h1>
                <p className="text-[10px] md:text-xs text-muted-foreground font-mono">
                  Threat Intelligence Platform
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "font-mono text-xs gap-2",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
            
            {/* Interactive Cluster Status */}
            <ClusterStatus />
          </div>
          
          <div className="flex items-center gap-3">
            {/* Threat Simulator */}
            {user && onSimulate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSimulate}
                disabled={isSimulating}
                className="hidden sm:flex font-mono text-xs gap-2 border-primary/50 text-primary hover:bg-primary/10"
              >
                <Zap className={`h-4 w-4 ${isSimulating ? 'animate-pulse' : ''}`} />
                {isSimulating ? 'Generating...' : 'Simulate Attack'}
              </Button>
            )}

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {criticalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {criticalAlerts}
                </span>
              )}
            </Button>
            
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>

            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <User className="h-4 w-4" />
                  {user.email?.split('@')[0]}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignOut}
                  className="font-mono text-xs"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/auth')}
                className="font-mono text-xs"
              >
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
