import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, Shield, BarChart3, ShieldCheck, Zap, LogIn, LogOut, User } from "lucide-react";

interface MobileNavProps {
  user?: { email?: string } | null;
  onSignOut?: () => void;
  onSimulate?: () => void;
  isSimulating?: boolean;
}

export function MobileNav({ user, onSignOut, onSimulate, isSimulating }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Shield },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/response-rules', label: 'Response Rules', icon: ShieldCheck },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-card border-border w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-primary font-mono">
            <Shield className="h-6 w-6" />
            SENTINEL
          </SheetTitle>
        </SheetHeader>
        
        <nav className="flex flex-col gap-2 mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  "justify-start font-mono text-sm gap-3",
                  isActive && "bg-primary/10 text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="border-t border-border/50 mt-6 pt-6 space-y-3">
          {user && onSimulate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onSimulate();
                setOpen(false);
              }}
              disabled={isSimulating}
              className="w-full font-mono text-xs gap-2 border-primary/50 text-primary hover:bg-primary/10"
            >
              <Zap className={`h-4 w-4 ${isSimulating ? 'animate-pulse' : ''}`} />
              {isSimulating ? 'Generating...' : 'Simulate Attack'}
            </Button>
          )}

          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono px-3">
                <User className="h-4 w-4" />
                {user.email?.split('@')[0]}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSignOut?.();
                  setOpen(false);
                }}
                className="w-full font-mono text-xs justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleNavigate('/auth')}
              className="w-full font-mono text-xs"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
