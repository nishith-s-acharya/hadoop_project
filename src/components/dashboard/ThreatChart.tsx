import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { generateTimeSeriesData } from "@/lib/mock-data";
import { useMemo } from "react";

export function ThreatChart() {
  const data = useMemo(() => generateTimeSeriesData(), []);

  return (
    <Card variant="cyber" className="col-span-full lg:col-span-2">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Threat Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="failedLogins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(174, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(174, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="portScans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bruteForce" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(222, 30%, 18%)" 
                vertical={false}
              />
              <XAxis 
                dataKey="time" 
                stroke="hsl(215, 20%, 55%)"
                tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'hsl(222, 30%, 18%)' }}
              />
              <YAxis 
                stroke="hsl(215, 20%, 55%)"
                tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'hsl(222, 30%, 18%)' }}
              />
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
                wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="failedLogins"
                name="Failed Logins"
                stroke="hsl(174, 100%, 50%)"
                strokeWidth={2}
                fill="url(#failedLogins)"
              />
              <Area
                type="monotone"
                dataKey="portScans"
                name="Port Scans"
                stroke="hsl(38, 92%, 50%)"
                strokeWidth={2}
                fill="url(#portScans)"
              />
              <Area
                type="monotone"
                dataKey="bruteForce"
                name="Brute Force"
                stroke="hsl(0, 85%, 55%)"
                strokeWidth={2}
                fill="url(#bruteForce)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
