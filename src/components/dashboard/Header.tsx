import { Shield, Bell, Settings, Activity, LogIn, LogOut, Zap, User, BarChart3, ShieldCheck, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";
import { ClusterStatus } from "./ClusterStatus";
import { toast } from "sonner";
import { useState } from "react";
import { SettingsDialog } from "./SettingsDialog";
import { SimulationDialog } from "./SimulationDialog";

interface HeaderProps {
  criticalAlerts: number;
  user?: { email?: string } | null;
  onSignOut?: () => void;
  onSimulate?: (options?: { count: number; type: string }) => void;
  isSimulating?: boolean;
}

export function Header({ criticalAlerts, user, onSignOut, onSimulate, isSimulating }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Shield },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/network', label: 'Network Map', icon: Network },
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
              onSimulate={() => setShowSimulation(true)}
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
                <p className="text-xs text-muted-foreground">
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
                      "text-sm font-medium gap-2",
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
                onClick={() => setShowSimulation(true)}
                disabled={isSimulating}
                className="hidden sm:flex text-sm gap-2 border-primary/50 text-primary hover:bg-primary/10"
              >
                <Zap className={`h-4 w-4 ${isSimulating ? 'animate-pulse' : ''}`} />
                {isSimulating ? 'Generating...' : 'Simulate Attack'}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => toast.info(`${criticalAlerts} Critical Alerts requiring attention`, {
                description: "Check the Threat Log for details"
              })}
            >
              <Bell className="h-5 w-5" />
              {criticalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {criticalAlerts}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {user.email?.split('@')[0]}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignOut}
                  className="text-sm"
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
                className="text-sm"
              >
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      {onSimulate && (
        <SimulationDialog
          open={showSimulation}
          onOpenChange={setShowSimulation}
          onSimulate={onSimulate}
          isSimulating={!!isSimulating}
        />
      )}
    </header>
  );
}
