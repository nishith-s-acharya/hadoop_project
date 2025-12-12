
import { useState } from "react";
import { Activity } from "lucide-react";
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

// Professional corporate palette (Blues, Teals, Indigos)
const COLORS = ['#2563eb', '#0d9488', '#4f46e5', '#ca8a04', '#059669', '#dc2626'];

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
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#334155" className="text-lg font-bold">
                {payload.threat_type}
            </text>
            <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#64748b" className="text-sm">
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
        <Card className="h-full border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Live Attack Distribution
                </CardTitle>
            </CardHeader>
            <CardContent>
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
                                            stroke="transparent"
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
                                        ? "bg-secondary/50 border-primary/20 shadow-sm"
                                        : "bg-transparent border-transparent hover:bg-secondary/30"
                                        }`}
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className={`font-medium ${activeIndex === index ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {item.threat_type}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-foreground font-semibold">
                                            {item.percentage}%
                                        </div>
                                        <div className="text-xs text-muted-foreground">
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
