import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ThreatStats } from "@/lib/mock-data";

interface AttackTypeChartProps {
  stats: ThreatStats;
}

export function AttackTypeChart({ stats }: AttackTypeChartProps) {
  const data = [
    { name: 'Failed Logins', value: stats.failedLogins, color: 'hsl(174, 100%, 50%)' },
    { name: 'Port Scans', value: stats.portScans, color: 'hsl(38, 92%, 50%)' },
    { name: 'Brute Force', value: stats.bruteForceAttempts, color: 'hsl(0, 85%, 55%)' },
    { name: 'Malware', value: stats.malwareDetected, color: 'hsl(262, 83%, 58%)' },
    { name: 'DDoS', value: stats.ddosAttacks, color: 'hsl(140, 100%, 50%)' },
  ];

  return (
    <Card variant="cyber" className="col-span-full lg:col-span-1">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground">Attack Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="hsl(222, 47%, 6%)"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222, 47%, 8%)',
                  border: '1px solid hsl(174, 100%, 50%, 0.3)',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(180, 100%, 95%)' }}
              />
              <Legend
                wrapperStyle={{ 
                  fontFamily: 'JetBrains Mono', 
                  fontSize: '11px',
                  paddingTop: '20px'
                }}
                formatter={(value) => (
                  <span className="text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
