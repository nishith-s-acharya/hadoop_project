import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ThreatChart } from "@/components/dashboard/ThreatChart";
import { ThreatLogViewer } from "@/components/dashboard/ThreatLog";
import { GeoAttackMap } from "@/components/dashboard/GeoAttackMap";
import { AttackTypeChart } from "@/components/dashboard/AttackTypeChart";
import { SecuritySummaryWidget } from "@/components/dashboard/SecuritySummaryWidget";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { useThreatLogs } from "@/hooks/useThreatLogs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ShieldAlert,
  Scan,
  KeyRound,
  Bug,
  AlertTriangle,
  Activity
} from "lucide-react";

const Index = () => {
  const { logs, stats, loading, refetch } = useThreatLogs();
  const { user, signOut, loading: authLoading } = useAuth();
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async (options = { count: 3, type: 'all' }) => {
    setIsSimulating(true);
    try {
      const { data, error } = await supabase.functions.invoke('simulate-threats', {
        body: options,
      });

      if (error) throw error;
      toast.success(`Generated ${data.count} simulated threats (${options.type === 'all' ? 'Mixed' : options.type})`);
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Failed to simulate threats');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
        <div className="text-primary animate-pulse font-mono text-xl">
          INITIALIZING SENTINEL...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid relative">
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none scanlines opacity-30" />

      <Header
        criticalAlerts={stats.criticalAlerts}
        user={user}
        onSignOut={handleSignOut}
        onSimulate={handleSimulate}
        isSimulating={isSimulating}
      />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatsCard
            title="Total Threats"
            value={stats.totalThreats}
            change="+12% from yesterday"
            changeType="increase"
            icon={Activity}
            variant="default"
          />
          <StatsCard
            title="Critical Alerts"
            value={stats.criticalAlerts}
            change="Requires attention"
            changeType="increase"
            icon={AlertTriangle}
            variant="critical"
          />
          <StatsCard
            title="Failed Logins"
            value={stats.failedLogins}
            change="+8% from avg"
            changeType="increase"
            icon={KeyRound}
            variant="warning"
          />
          <StatsCard
            title="Port Scans"
            value={stats.portScans}
            change="-3% from avg"
            changeType="increase"
            icon={Scan}
            variant="default"
          />
          <StatsCard
            title="Brute Force"
            value={stats.bruteForceAttempts}
            change="Pattern detected"
            changeType="neutral"
            icon={ShieldAlert}
            variant="warning"
          />
          <StatsCard
            title="Malware"
            value={stats.malwareDetected}
            change="Blocked"
            changeType="neutral"
            icon={Bug}
            variant="success"
          />
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ThreatChart />
          <AttackTypeChart stats={stats} />
        </section>

        {/* Bottom Row */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <ThreatLogViewer
              logs={logs}
              isAuthenticated={!!user}
              onRefetch={refetch}
            />
          </div>
          <GeoAttackMap />
          <SecuritySummaryWidget />
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-border/30">
          <p className="text-xs text-muted-foreground font-mono">
            SENTINEL v2.0.1 • Lovable Cloud Connected • Last sync: {new Date().toLocaleTimeString()}
          </p>
        </footer>
      </main>

      {/* Floating AI Assistant */}
      <AIAssistant />
    </div>
  );
};

export default Index;
