
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ThreatStats } from "@/hooks/useThreatLogs";
import { Shield } from "lucide-react";

interface AttackTypeChartProps {
  stats: ThreatStats;
}

// Professional corporate palette (Blues, Teals, Indigos)
const COLORS = ['#2563eb', '#0d9488', '#4f46e5', '#ca8a04', '#059669', '#dc2626'];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#334155" className="text-xl font-bold">
        {payload.count}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke={fill}
        strokeWidth={2}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 6}
        outerRadius={outerRadius + 10}
        fill={fill}
        opacity={0.15}
      />
    </g>
  );
};

export const AttackTypeChart = ({ stats }: AttackTypeChartProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const data = [
    { name: 'Failed Logins', value: stats.failedLogins },
    { name: 'Port Scans', value: stats.portScans },
    { name: 'Brute Force', value: stats.bruteForceAttempts },
    { name: 'Malware', value: stats.malwareDetected },
    { name: 'DDoS', value: stats.ddosAttacks || 0 }, // Ensure ddos exists or default to 0
  ].filter(item => item.value > 0);

  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: Math.round((item.value / total) * 100)
  }));

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <Card className="h-full border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          Attack Types
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 items-center">
          <div className="h-[250px] w-full relative mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={dataWithPercentage}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  paddingAngle={2}
                >
                  {dataWithPercentage.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar px-2">
            <AnimatePresence>
              {dataWithPercentage.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-200 cursor-pointer ${activeIndex === index
                    ? "bg-secondary/50 border-primary/20 shadow-sm"
                    : "bg-transparent border-transparent hover:bg-secondary/30"
                    }`}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className={`text-xs font-medium ${activeIndex === index ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-foreground font-semibold text-xs">
                      {item.percentage}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      ({item.value})
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
