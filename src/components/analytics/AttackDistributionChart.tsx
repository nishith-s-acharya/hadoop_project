
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface AttackPattern {
    threat_type: string;
    count: number;
    percentage: number;
}

interface AttackDistributionChartProps {
    data: AttackPattern[];
}

const COLORS = ['#FF0055', '#FF7700', '#FFDD00', '#00FF99', '#00CCFF', '#9D00FF'];

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
                {payload.threat_type}
            </text>
            <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#cccccc" className="text-sm font-mono">
                {`${(percent * 100).toFixed(0)}% (${value})`}
            </text>
        </g>
    );
};

export const AttackDistributionChart = ({ data }: AttackDistributionChartProps) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
            <CardHeader>
                <CardTitle className="text-sm font-mono text-cyan-400 tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400/50 animate-pulse" />
                    Live Attack Distribution
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
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

                    <div className="space-y-3 pr-4 h-[300px] overflow-y-auto custom-scrollbar">
                        <AnimatePresence>
                            {data.map((item, index) => (
                                <motion.div
                                    key={item.threat_type}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${activeIndex === index
                                        ? "bg-white/10 border-white/20 shadow-lg scale-[1.02]"
                                        : "bg-transparent border-transparent hover:bg-white/5"
                                        }`}
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                                            style={{ color: COLORS[index % COLORS.length], backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className={`font-medium ${activeIndex === index ? 'text-white' : 'text-gray-400'}`}>
                                            {item.threat_type}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-mono font-bold">
                                            {item.percentage}%
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {item.count.toLocaleString()} Events
                                        </div>
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
