import { useState, useEffect, useRef } from 'react';
import { Header } from "@/components/dashboard/Header";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Server,
    Database,
    Globe,
    Laptop,
    ShieldAlert,
    Activity,
    Wifi,
    Plus,
    Trash2,
    RefreshCw,
    X,
    MousePointer2
} from "lucide-react";

// Types for our network graph
interface Node {
    id: string;
    type: 'server' | 'database' | 'workstation' | 'external';
    label: string;
    x: number;
    y: number;
    status: 'secure' | 'compromised' | 'warning';
}

interface Link {
    source: string;
    target: string;
    activity: 'low' | 'medium' | 'high';
}

const Network = () => {
    const { user, signOut, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial Mock Data
    const initialNodes: Node[] = [
        { id: 'fw-1', type: 'server', label: 'Firewall', x: 400, y: 100, status: 'secure' },
        { id: 'db-1', type: 'database', label: 'Main DB', x: 600, y: 300, status: 'secure' },
        { id: 'web-1', type: 'server', label: 'Web Server 01', x: 200, y: 300, status: 'warning' },
        { id: 'web-2', type: 'server', label: 'Web Server 02', x: 400, y: 300, status: 'secure' },
        { id: 'ws-1', type: 'workstation', label: 'Admin PC', x: 300, y: 500, status: 'secure' },
        { id: 'ext-1', type: 'external', label: 'Unknown IP', x: 100, y: 50, status: 'compromised' },
        { id: 'ext-2', type: 'external', label: 'Malicious Bot', x: 700, y: 50, status: 'compromised' },
    ];

    const initialLinks: Link[] = [
        { source: 'ext-1', target: 'fw-1', activity: 'high' },
        { source: 'ext-2', target: 'fw-1', activity: 'high' },
        { source: 'fw-1', target: 'web-1', activity: 'medium' },
        { source: 'fw-1', target: 'web-2', activity: 'low' },
        { source: 'web-1', target: 'db-1', activity: 'medium' },
        { source: 'web-2', target: 'db-1', activity: 'low' },
        { source: 'ws-1', target: 'db-1', activity: 'low' },
        { source: 'ws-1', target: 'fw-1', activity: 'low' },
    ];

    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [links, setLinks] = useState<Link[]>(initialLinks);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const handleSignOut = async () => {
        const { error } = await signOut();
        if (error) toast.error("Failed to sign out");
        else {
            toast.success("Signed out");
            navigate("/");
        }
    };

    const handleAddNode = (type: Node['type']) => {
        const id = `${type}-${Date.now()}`;
        const newNode: Node = {
            id,
            type,
            label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            x: 400, // Center-ish
            y: 300,
            status: 'secure'
        };
        setNodes(prev => [...prev, newNode]);
        setSelectedNodeId(id);
        toast.success(`Added new ${type} node`);
    };

    const handleDeleteNode = () => {
        if (!selectedNodeId) return;

        setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
        setLinks(prev => prev.filter(l => l.source !== selectedNodeId && l.target !== selectedNodeId));
        setSelectedNodeId(null);
        toast.success("Node deleted");
    };

    const handleReset = () => {
        setNodes(initialNodes);
        setLinks(initialLinks);
        setSelectedNodeId(null);
        toast.info("Map layout reset");
    };

    const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        setDraggingId(nodeId);
        setSelectedNodeId(nodeId);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingId || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Clamp to container bounds
        const clampedX = Math.max(20, Math.min(x, rect.width - 20));
        const clampedY = Math.max(20, Math.min(y, rect.height - 20));

        setNodes(prev => prev.map(node =>
            node.id === draggingId ? { ...node, x: clampedX, y: clampedY } : node
        ));
    };

    const handleMouseUp = () => {
        setDraggingId(null);
    };

    const handleBackgroundClick = () => {
        setSelectedNodeId(null);
    };

    const getNodeIcon = (type: string) => {
        switch (type) {
            case 'server': return <Server className="h-6 w-6" />;
            case 'database': return <Database className="h-6 w-6" />;
            case 'workstation': return <Laptop className="h-6 w-6" />;
            case 'external': return <Globe className="h-6 w-6" />;
            default: return <Activity className="h-6 w-6" />;
        }
    };

    const getNodeColor = (status: string) => {
        switch (status) {
            case 'secure': return '#10b981'; // green-500
            case 'warning': return '#f59e0b'; // amber-500
            case 'compromised': return '#ef4444'; // red-500
            default: return '#3b82f6'; // blue-500
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-background cyber-grid relative">
            <div className="fixed inset-0 pointer-events-none scanlines opacity-30" />
            <Header criticalAlerts={0} user={user} onSignOut={handleSignOut} onSimulate={() => { }} isSimulating={false} />

            <main className="container mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-mono font-bold text-primary flex items-center gap-2">
                            <Wifi className="h-6 w-6" /> NETWORK TOPOLOGY MAP
                        </h1>
                        <Badge variant="outline" className="font-mono text-primary animate-pulse hidden sm:inline-flex">
                            LIVE MONITORING
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 font-mono bg-card/50 border-primary/20 hover:border-primary/50">
                                    <Plus className="h-4 w-4" /> ADD NODE
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-primary/20">
                                <DropdownMenuItem onClick={() => handleAddNode('server')} className="font-mono cursor-pointer">
                                    <Server className="mr-2 h-4 w-4" /> Server
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAddNode('database')} className="font-mono cursor-pointer">
                                    <Database className="mr-2 h-4 w-4" /> Database
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAddNode('workstation')} className="font-mono cursor-pointer">
                                    <Laptop className="mr-2 h-4 w-4" /> Workstation
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAddNode('external')} className="font-mono cursor-pointer">
                                    <Globe className="mr-2 h-4 w-4" /> External Node
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={handleDeleteNode}
                            disabled={!selectedNodeId}
                            className={`font-mono transition-opacity ${!selectedNodeId ? 'opacity-50' : ''}`}
                            title="Delete Selected Node"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleReset}
                            title="Reset Map Layout"
                            className="font-mono bg-card/50 border-primary/20 hover:border-primary/50"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Card className="bg-card/80 border-border backdrop-blur min-h-[600px] relative overflow-hidden select-none">
                    <CardContent
                        ref={containerRef}
                        className="p-0 h-[600px] relative cursor-crosshair"
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onClick={handleBackgroundClick}
                    >
                        {/* SVG Layer for Connections */}
                        <svg
                            ref={svgRef}
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ zIndex: 0 }}
                        >
                            <defs>
                                <marker
                                    id="arrow"
                                    markerWidth="10"
                                    markerHeight="10"
                                    refX="15"
                                    refY="3"
                                    orient="auto"
                                    markerUnits="strokeWidth"
                                >
                                    <path d="M0,0 L0,6 L9,3 z" fill="#4b5563" />
                                </marker>
                            </defs>
                            {links.map((link, i) => {
                                const source = nodes.find(n => n.id === link.source);
                                const target = nodes.find(n => n.id === link.target);

                                // Skip rendering links if connected nodes are missing
                                if (!source || !target) return null;

                                const isAttack = link.activity === 'high';

                                return (
                                    <g key={i}>
                                        {/* Base Line */}
                                        <line
                                            x1={source.x}
                                            y1={source.y}
                                            x2={target.x}
                                            y2={target.y}
                                            stroke={isAttack ? '#ef4444' : '#4b5563'}
                                            strokeWidth={isAttack ? 3 : 1}
                                            strokeOpacity={0.4}
                                        />
                                        {/* Animated Packet */}
                                        <circle r="4" fill={isAttack ? '#ef4444' : '#3b82f6'}>
                                            <animateMotion
                                                dur={`${link.activity === 'high' ? '1s' : link.activity === 'medium' ? '2s' : '4s'}`}
                                                repeatCount="indefinite"
                                                path={`M${source.x},${source.y} L${target.x},${target.y}`}
                                            />
                                        </circle>
                                    </g>
                                );
                            })}
                        </svg>

                        {/* DOM Layer for Nodes (Interactive) */}
                        {nodes.map((node) => {
                            const isSelected = selectedNodeId === node.id;
                            const isDragging = draggingId === node.id;

                            return (
                                <div
                                    key={node.id}
                                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-grab active:cursor-grabbing ${isDragging ? 'z-50 scale-110' : 'z-10'}`}
                                    style={{ left: node.x, top: node.y }}
                                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                                >
                                    {/* Selection Indicator Ring */}
                                    {isSelected && (
                                        <div className="absolute inset-0 -m-2 rounded-full border-2 border-primary animate-pulse w-16 h-16 pointer-events-none" />
                                    )}

                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 bg-background transition-all duration-300 group-hover:scale-110 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                                        style={{
                                            borderColor: isSelected ? '#3b82f6' : getNodeColor(node.status),
                                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : undefined,
                                            boxShadow: node.status === 'compromised'
                                                ? '0 0 20px rgba(239, 68, 68, 0.6)'
                                                : isDragging || isSelected
                                                    ? '0 0 20px rgba(59, 130, 246, 0.5)'
                                                    : undefined
                                        }}
                                    >
                                        <div style={{ color: getNodeColor(node.status) }}>
                                            {getNodeIcon(node.type)}
                                        </div>
                                    </div>
                                    <div className={`mt-2 bg-black/80 px-2 py-1 rounded text-xs font-mono text-white whitespace-nowrap border ${isSelected ? 'border-primary' : 'border-border'} pointer-events-none select-none`}>
                                        {node.label}
                                    </div>
                                    {node.status === 'compromised' && (
                                        <ShieldAlert className="absolute -top-3 -right-3 h-5 w-5 text-destructive animate-bounce" />
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};
export default Network;
