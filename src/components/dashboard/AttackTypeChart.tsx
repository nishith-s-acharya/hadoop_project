
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ThreatStats } from "@/hooks/useThreatLogs";

interface AttackTypeChartProps {
  stats: ThreatStats;
}

const COLORS = ['hsl(174, 100%, 50%)', 'hsl(38, 92%, 50%)', 'hsl(0, 85%, 55%)', 'hsl(262, 83%, 58%)', 'hsl(140, 100%, 50%)'];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
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
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 12}
        fill={fill}
        opacity={0.15}
      />
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#ffffff" className="text-xl font-bold font-mono">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#cccccc" className="text-sm font-mono">
        {`${(percent * 100).toFixed(0)}% (${value})`}
      </text>
    </g>
  );
};

export function AttackTypeChart({ stats }: AttackTypeChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const data = [
    { name: 'Failed Logins', value: stats.failedLogins, threat_type: 'Failed Logins' },
    { name: 'Port Scans', value: stats.portScans, threat_type: 'Port Scans' },
    { name: 'Brute Force', value: stats.bruteForceAttempts, threat_type: 'Brute Force' },
    { name: 'Malware', value: stats.malwareDetected, threat_type: 'Malware' },
    { name: 'DDoS', value: stats.ddosAttacks, threat_type: 'DDoS' },
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: Math.round((item.value / total) * 100)
  }));

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <Card className="col-span-full lg:col-span-1 bg-black/40 border-white/10 backdrop-blur-md overflow-hidden h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
      <CardHeader>
        <CardTitle className="text-sm font-mono text-cyan-400 tracking-wider uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400/50 animate-pulse" />
          Live Attack Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex flex-col gap-6 items-center">
          <div className="h-[250px] w-full relative">
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
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="rgba(0,0,0,0.5)"
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
                    ? "bg-white/10 border-white/20 shadow-lg scale-[1.02]"
                    : "bg-transparent border-transparent hover:bg-white/5"
                    }`}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                      style={{ color: COLORS[index % COLORS.length], backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className={`text-xs font-medium ${activeIndex === index ? 'text-white' : 'text-gray-400'}`}>
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-white font-mono font-bold text-xs">
                      {item.percentage}%
                    </span>
                    <span className="text-[10px] text-gray-500">
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
}
