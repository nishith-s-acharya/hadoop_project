import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Activity, Server, Database, Cpu, HardDrive, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClusterNode {
  id: string;
  name: string;
  type: "namenode" | "datanode" | "resourcemanager";
  status: "online" | "offline" | "warning";
  cpu: number;
  memory: number;
  storage: number;
}

const mockNodes: ClusterNode[] = [
  { id: "1", name: "NameNode-01", type: "namenode", status: "online", cpu: 42, memory: 68, storage: 45 },
  { id: "2", name: "DataNode-01", type: "datanode", status: "online", cpu: 78, memory: 82, storage: 67 },
  { id: "3", name: "DataNode-02", type: "datanode", status: "online", cpu: 65, memory: 71, storage: 58 },
  { id: "4", name: "DataNode-03", type: "datanode", status: "warning", cpu: 91, memory: 88, storage: 82 },
  { id: "5", name: "ResourceMgr", type: "resourcemanager", status: "online", cpu: 34, memory: 45, storage: 23 },
];

export function ClusterStatus() {
  const [open, setOpen] = useState(false);
  const [nodes, setNodes] = useState<ClusterNode[]>(mockNodes);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const onlineCount = nodes.filter(n => n.status === "online").length;
  const warningCount = nodes.filter(n => n.status === "warning").length;
  const offlineCount = nodes.filter(n => n.status === "offline").length;

  const overallStatus = offlineCount > 0 ? "degraded" : warningCount > 0 ? "warning" : "online";

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        cpu: Math.min(100, Math.max(10, node.cpu + Math.floor(Math.random() * 20) - 10)),
        memory: Math.min(100, Math.max(10, node.memory + Math.floor(Math.random() * 10) - 5)),
      })));
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-success";
      case "warning": return "bg-warning";
      case "offline": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "namenode": return Server;
      case "datanode": return HardDrive;
      case "resourcemanager": return Cpu;
      default: return Database;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Badge 
          variant="info" 
          className="hidden lg:flex items-center gap-1 font-mono cursor-pointer hover:bg-primary/20 transition-colors"
        >
          <Activity className={cn("h-3 w-3", overallStatus === "online" && "text-success")} />
          HADOOP CLUSTER: {overallStatus.toUpperCase()}
          <span className={cn(
            "h-2 w-2 rounded-full animate-pulse",
            getStatusColor(overallStatus)
          )} />
        </Badge>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between font-mono text-primary">
            <span className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Hadoop Cluster Status
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="font-mono text-xs gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-success/10 border border-success/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-success">{onlineCount}</div>
              <div className="text-xs text-muted-foreground font-mono">Online</div>
            </div>
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-warning">{warningCount}</div>
              <div className="text-xs text-muted-foreground font-mono">Warning</div>
            </div>
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-destructive">{offlineCount}</div>
              <div className="text-xs text-muted-foreground font-mono">Offline</div>
            </div>
          </div>

          {/* Nodes List */}
          <div className="space-y-2">
            {nodes.map((node) => {
              const Icon = getNodeIcon(node.type);
              return (
                <div 
                  key={node.id}
                  className="flex items-center gap-4 p-3 bg-secondary/30 border border-border/50 rounded-lg"
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    node.status === "online" && "bg-success/20 text-success",
                    node.status === "warning" && "bg-warning/20 text-warning",
                    node.status === "offline" && "bg-destructive/20 text-destructive",
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{node.name}</span>
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        getStatusColor(node.status)
                      )} />
                    </div>
                    <div className="text-xs text-muted-foreground font-mono uppercase">
                      {node.type}
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs font-mono">
                    <div className="text-center">
                      <div className={cn(
                        node.cpu > 80 ? "text-destructive" : node.cpu > 60 ? "text-warning" : "text-success"
                      )}>
                        {node.cpu}%
                      </div>
                      <div className="text-muted-foreground">CPU</div>
                    </div>
                    <div className="text-center">
                      <div className={cn(
                        node.memory > 80 ? "text-destructive" : node.memory > 60 ? "text-warning" : "text-success"
                      )}>
                        {node.memory}%
                      </div>
                      <div className="text-muted-foreground">MEM</div>
                    </div>
                    <div className="text-center">
                      <div className={cn(
                        node.storage > 80 ? "text-destructive" : node.storage > 60 ? "text-warning" : "text-success"
                      )}>
                        {node.storage}%
                      </div>
                      <div className="text-muted-foreground">DISK</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-muted-foreground font-mono text-center pt-2 border-t border-border/30">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
