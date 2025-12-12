import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/dashboard/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Globe, Activity, Shield, Clock, FileDown, Printer } from "lucide-react";
import { toast } from "sonner";
import { AttackDistributionChart } from "@/components/analytics/AttackDistributionChart";

interface ThreatTrend {
  date: string;
  count: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface AttackPattern {
  threat_type: string;
  count: number;
  percentage: number;
}

interface GeoData {
  country: string;
  country_code: string;
  count: number;
}

const COLORS = ['#ff0040', '#ff6b00', '#ffd93d', '#00ff88', '#00d4ff', '#8b5cf6'];

const Analytics = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [trends, setTrends] = useState<ThreatTrend[]>([]);
  const [patterns, setPatterns] = useState<AttackPattern[]>([]);
  const [geoData, setGeoData] = useState<GeoData[]>([]);
  const [hourlyData, setHourlyData] = useState<{ hour: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalThreats: 0,
    avgDaily: 0,
    trend: 0,
    topThreat: "",
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const daysMap: Record<string, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 };
      const days = daysMap[timeRange] || 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: threats, error } = await supabase
        .from("threat_logs")
        .select("*")
        .gte("timestamp", startDate.toISOString())
        .order("timestamp", { ascending: true });

      if (error) throw error;

      // Process trends by date
      const trendMap = new Map<string, ThreatTrend>();
      threats?.forEach((threat) => {
        const date = new Date(threat.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const existing = trendMap.get(date) || { date, count: 0, critical: 0, high: 0, medium: 0, low: 0 };
        existing.count++;
        if (threat.severity === "critical") existing.critical++;
        else if (threat.severity === "high") existing.high++;
        else if (threat.severity === "medium") existing.medium++;
        else existing.low++;
        trendMap.set(date, existing);
      });
      setTrends(Array.from(trendMap.values()));

      // Process attack patterns
      const patternMap = new Map<string, number>();
      threats?.forEach((threat) => {
        patternMap.set(threat.threat_type, (patternMap.get(threat.threat_type) || 0) + 1);
      });
      const total = threats?.length || 1;
      const patternData = Array.from(patternMap.entries())
        .map(([threat_type, count]) => ({
          threat_type,
          count,
          percentage: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count);
      setPatterns(patternData);

      // Process geo data
      const geoMap = new Map<string, { country: string; count: number }>();
      threats?.forEach((threat) => {
        if (threat.location && threat.country_code) {
          const existing = geoMap.get(threat.country_code) || { country: threat.location, count: 0 };
          existing.count++;
          geoMap.set(threat.country_code, existing);
        }
      });
      const geoDataArray = Array.from(geoMap.entries())
        .map(([country_code, data]) => ({ country_code, country: data.country, count: data.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setGeoData(geoDataArray);

      // Process hourly distribution
      const hourMap = new Map<number, number>();
      threats?.forEach((threat) => {
        const hour = new Date(threat.timestamp).getHours();
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
      });
      const hourlyDataArray = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, "0")}:00`,
        count: hourMap.get(i) || 0,
      }));
      setHourlyData(hourlyDataArray);

      // Calculate stats
      const avgDaily = total / days;
      const midpoint = Math.floor(threats?.length / 2) || 0;
      const firstHalf = threats?.slice(0, midpoint).length || 0;
      const secondHalf = threats?.slice(midpoint).length || 1;
      const trendPercent = Math.round(((secondHalf - firstHalf) / firstHalf) * 100) || 0;

      setStats({
        totalThreats: total,
        avgDaily: Math.round(avgDaily * 10) / 10,
        trend: trendPercent,
        topThreat: patternData[0]?.threat_type || "N/A",
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) toast.error("Failed to sign out");
    else {
      toast.success("Signed out");
      navigate("/");
    }
  };

  const handleExportCSV = () => {
    try {
      if (trends.length === 0) {
        toast.error("No data available to export");
        return;
      }

      // Define CSV headers
      const headers = ["Date", "Total Count", "Critical", "High", "Medium", "Low"];

      // Map data to CSV rows
      const rows = trends.map(t => [
        t.date,
        t.count,
        t.critical,
        t.high,
        t.medium,
        t.low
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      // Create blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `threat-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
        <div className="text-primary animate-pulse font-mono text-xl">LOADING ANALYTICS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid relative">
      <div className="fixed inset-0 pointer-events-none scanlines opacity-30 print:hidden" />
      <div className="print:hidden">
        <Header criticalAlerts={0} user={user} onSignOut={handleSignOut} onSimulate={() => { }} isSimulating={false} />
      </div>

      <main className="container mx-auto px-6 py-8 space-y-6 print:p-0 print:max-w-none">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <h1 className="text-2xl font-mono font-bold text-primary">THREAT ANALYTICS</h1>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36 bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleExportCSV} title="Export CSV">
              <FileDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrint} title="Print View">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block mb-8">
          <h1 className="text-2xl font-bold text-black">Security Threat Report</h1>
          <p className="text-sm text-gray-500">Generated on {new Date().toLocaleString()}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/80 border-border backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">TOTAL THREATS</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalThreats}</p>
                </div>
                <Activity className="h-10 w-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">AVG/DAY</p>
                  <p className="text-3xl font-bold text-foreground">{stats.avgDaily}</p>
                </div>
                <Clock className="h-10 w-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">TREND</p>
                  <p className={`text-3xl font-bold ${stats.trend > 0 ? "text-destructive" : "text-green-500"}`}>
                    {stats.trend > 0 ? "+" : ""}{stats.trend}%
                  </p>
                </div>
                {stats.trend > 0 ? (
                  <TrendingUp className="h-10 w-10 text-destructive opacity-50" />
                ) : (
                  <TrendingDown className="h-10 w-10 text-green-500 opacity-50" />
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">TOP THREAT</p>
                  <p className="text-xl font-bold text-foreground truncate">{stats.topThreat}</p>
                </div>
                <Shield className="h-10 w-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Threat Trends */}
        <Card className="bg-card/80 border-border backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-primary">THREAT ACTIVITY OVER TIME</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#888", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: 4 }}
                    labelStyle={{ color: "#00ff88" }}
                  />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke="#ff0040" fill="#ff0040" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="high" stackId="1" stroke="#ff6b00" fill="#ff6b00" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke="#ffd93d" fill="#ffd93d" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="low" stackId="1" stroke="#00ff88" fill="#00ff88" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attack Patterns */}
          <div className="h-full">
            <AttackDistributionChart data={patterns} />
          </div>

          {/* Geographic Distribution */}
          <Card className="bg-card/80 border-border backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm font-mono text-primary flex items-center gap-2">
                <Globe className="h-4 w-4" /> TOP ATTACK ORIGINS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={geoData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" tick={{ fill: "#888", fontSize: 11 }} />
                    <YAxis dataKey="country" type="category" tick={{ fill: "#888", fontSize: 10 }} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                    />
                    <Bar dataKey="count" fill="#00ff88" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Distribution */}
        <Card className="bg-card/80 border-border backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-primary">ATTACK FREQUENCY BY HOUR (UTC)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" tick={{ fill: "#888", fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fill: "#888", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#00d4ff" strokeWidth={2} dot={{ fill: "#00d4ff", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
