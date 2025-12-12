
import { useState, useRef } from 'react';
import { Header } from "@/components/dashboard/Header";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
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
    Activity,
    Wifi,
    Plus,
    Trash2,
    RefreshCw,
    ShieldAlert
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
            case 'server': return <Server className="h-5 w-5" />;
            case 'database': return <Database className="h-5 w-5" />;
            case 'workstation': return <Laptop className="h-5 w-5" />;
            case 'external': return <Globe className="h-5 w-5" />;
            default: return <Activity className="h-5 w-5" />;
        }
    };

    const getNodeColor = (status: string) => {
        switch (status) {
            case 'secure': return '#10b981'; // Green (Success)
            case 'warning': return '#f59e0b'; // Amber (Warning)
            case 'compromised': return '#ef4444'; // Red (Destructive)
            default: return '#64748b'; // Slate (Neutral)
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-background relative">
            <Header criticalAlerts={0} user={user} onSignOut={handleSignOut} onSimulate={() => { }} isSimulating={false} />

            <main className="container mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Wifi className="h-6 w-6 text-primary" /> Network Topology Map
                        </h1>
                        <Badge variant="outline" className="hidden sm:inline-flex bg-green-500/10 text-green-600 border-green-200">
                            Live Monitoring
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Node
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleAddNode('server')} className="cursor-pointer">
                                    <Server className="mr-2 h-4 w-4" /> Server
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAddNode('database')} className="cursor-pointer">
                                    <Database className="mr-2 h-4 w-4" /> Database
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAddNode('workstation')} className="cursor-pointer">
                                    <Laptop className="mr-2 h-4 w-4" /> Workstation
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAddNode('external')} className="cursor-pointer">
                                    <Globe className="mr-2 h-4 w-4" /> External Node
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={handleDeleteNode}
                            disabled={!selectedNodeId}
                            className={`transition-opacity ${!selectedNodeId ? 'opacity-50' : ''}`}
                            title="Delete Selected Node"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleReset}
                            title="Reset Map Layout"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Card className="bg-card border-border shadow-sm min-h-[600px] relative overflow-hidden select-none">
                    <CardContent
                        ref={containerRef}
                        className="p-0 h-[600px] relative cursor-default"
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
                                    <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
                                </marker>
                            </defs>
                            {links.map((link, i) => {
                                const source = nodes.find(n => n.id === link.source);
                                const target = nodes.find(n => n.id === link.target);

                                if (!source || !target) return null;

                                const isAttack = link.activity === 'high';

                                return (
                                    <g key={i}>
                                        <line
                                            x1={source.x}
                                            y1={source.y}
                                            x2={target.x}
                                            y2={target.y}
                                            stroke={isAttack ? '#ef4444' : '#cbd5e1'}
                                            strokeWidth={isAttack ? 2 : 1.5}
                                        />
                                        {isAttack && (
                                            <circle r="3" fill="#ef4444">
                                                <animateMotion
                                                    dur="1s"
                                                    repeatCount="indefinite"
                                                    path={`M${source.x},${source.y} L${target.x},${target.y}`}
                                                />
                                            </circle>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>

                        {/* DOM Layer for Nodes */}
                        {nodes.map((node) => {
                            const isSelected = selectedNodeId === node.id;
                            const isDragging = draggingId === node.id;

                            return (
                                <div
                                    key={node.id}
                                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer ${isDragging ? 'z-50 scale-105' : 'z-10'}`}
                                    style={{ left: node.x, top: node.y }}
                                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center bg-background border shadow-sm transition-all duration-200`}
                                        style={{
                                            borderColor: isSelected ? '#3b82f6' : getNodeColor(node.status),
                                            color: isSelected ? '#3b82f6' : getNodeColor(node.status),
                                            borderWidth: isSelected ? '2px' : '1px'
                                        }}
                                    >
                                        {getNodeIcon(node.type)}
                                    </div>
                                    <div className={`mt-2 bg-card px-2 py-1 rounded shadow-sm border text-[11px] font-medium text-foreground whitespace-nowrap ${isSelected ? 'border-blue-500 text-blue-600' : 'border-border'}`}>
                                        {node.label}
                                    </div>
                                    {node.status === 'compromised' && (
                                        <div className="absolute -top-1 -right-1 bg-white rounded-full">
                                            <ShieldAlert className="h-4 w-4 text-destructive" />
                                        </div>
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
