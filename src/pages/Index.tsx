import { useMemo, useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ThreatChart } from "@/components/dashboard/ThreatChart";
import { ThreatLogViewer } from "@/components/dashboard/ThreatLog";
import { GeoAttackMap } from "@/components/dashboard/GeoAttackMap";
import { AttackTypeChart } from "@/components/dashboard/AttackTypeChart";
import { 
  generateThreatLogs, 
  generateThreatStats,
  ThreatLog,
  ThreatStats 
} from "@/lib/mock-data";
import { 
  ShieldAlert, 
  Scan, 
  KeyRound, 
  Bug, 
  AlertTriangle,
  Activity
} from "lucide-react";

const Index = () => {
  const [logs, setLogs] = useState<ThreatLog[]>([]);
  const [stats, setStats] = useState<ThreatStats | null>(null);

  useEffect(() => {
    // Initial load
    setLogs(generateThreatLogs(25));
    setStats(generateThreatStats());

    // Simulate real-time updates
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = generateThreatLogs(1)[0];
        return [newLog, ...prev.slice(0, 24)];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-background cyber-grid relative">
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none scanlines opacity-30" />
      
      <Header criticalAlerts={stats.criticalAlerts} />
      
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
            changeType="decrease"
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
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ThreatLogViewer logs={logs} />
          </div>
          <GeoAttackMap />
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-border/30">
          <p className="text-xs text-muted-foreground font-mono">
            SENTINEL v2.0.1 • Hadoop Cluster: 3 nodes • Last sync: {new Date().toLocaleTimeString()}
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
