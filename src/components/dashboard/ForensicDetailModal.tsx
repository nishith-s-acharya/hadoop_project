import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThreatLog } from "@/hooks/useThreatLogs";
import { ShieldAlert, Activity, GitCommit, FileCode, Binary, MapPin, Search } from "lucide-react";

interface ForensicDetailModalProps {
    threat: ThreatLog | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ForensicDetailModal({ threat, open, onOpenChange }: ForensicDetailModalProps) {
    if (!threat) return null;

    // Simulated Trace Route Data
    const traceRoute = [
        { hop: 1, ip: "192.168.1.1", lat: 0, ms: "<1ms", loc: "Local Gateway" },
        { hop: 2, ip: "10.0.0.254", lat: 2, ms: "4ms", loc: "ISP Node" },
        { hop: 3, ip: "172.16.45.12", lat: 5, ms: "12ms", loc: "Regional Hub" },
        { hop: 4, ip: threat.source_ip, lat: 25, ms: "45ms", loc: threat.location || "Unknown" },
    ];

    // Simulated Hex Dump Generator
    const generateHexDump = (id: string) => {
        // Deterministic pseudo-random based on string hash for consistent view
        const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hexChars = "0123456789ABCDEF";
        let output = [];
        for (let i = 0; i < 16; i++) {
            let line = `00${(i * 10).toString(16).toUpperCase().padStart(2, '0')}  `;
            let hex = "";
            let ascii = "";
            for (let j = 0; j < 16; j++) {
                const val = Math.floor(Math.abs(Math.sin(seed + i * 16 + j) * 255));
                hex += val.toString(16).toUpperCase().padStart(2, '0') + " ";
                ascii += (val > 32 && val < 127) ? String.fromCharCode(val) : ".";
            }
            output.push(line + hex + " |" + ascii + "|");
        }
        return output.join("\n");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] bg-black/95 border-primary/20 backdrop-blur-xl text-foreground font-mono">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl text-primary">
                        <Search className="h-5 w-5" /> FORENSIC ANALYSIS REPORT
                        {threat.severity === 'critical' && (
                            <Badge variant="destructive" className="ml-auto animate-pulse">CRITICAL THREAT</Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-secondary/30">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="payload">Payload</TabsTrigger>
                        <TabsTrigger value="trace">Trace Route</TabsTrigger>
                        <TabsTrigger value="verdict">AI Verdict</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 p-3 border border-border/50 rounded bg-secondary/10">
                                <div className="text-xs text-muted-foreground uppercase">Threat Type</div>
                                <div className="font-bold flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-warning" />
                                    {threat.threat_type.toUpperCase()}
                                </div>
                            </div>
                            <div className="space-y-1 p-3 border border-border/50 rounded bg-secondary/10">
                                <div className="text-xs text-muted-foreground uppercase">Timestamp</div>
                                <div>{new Date(threat.timestamp).toLocaleString()}</div>
                            </div>
                            <div className="space-y-1 p-3 border border-border/50 rounded bg-secondary/10">
                                <div className="text-xs text-muted-foreground uppercase">Source IP</div>
                                <div className="font-mono text-primary">{threat.source_ip}</div>
                            </div>
                            <div className="space-y-1 p-3 border border-border/50 rounded bg-secondary/10">
                                <div className="text-xs text-muted-foreground uppercase">Destination</div>
                                <div className="font-mono">{threat.destination_ip || "N/A"}:{threat.port || "-"}</div>
                            </div>
                        </div>

                        <div className="p-3 border border-border/50 rounded bg-secondary/10">
                            <div className="text-xs text-muted-foreground uppercase mb-1">Description</div>
                            <p className="text-sm">{threat.description}</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="payload" className="mt-4">
                        <div className="rounded-md border border-border/50 bg-black p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <Binary className="h-4 w-4" /> Packet Capture (PCAP) - First 256 Bytes
                            </div>
                            <ScrollArea className="h-[300px]">
                                <pre className="text-xs font-mono text-green-500/80 leading-relaxed">
                                    {generateHexDump(threat.id)}
                                </pre>
                            </ScrollArea>
                        </div>
                    </TabsContent>

                    <TabsContent value="trace" className="mt-4">
                        <div className="space-y-2">
                            {traceRoute.map((node, i) => (
                                <div key={i} className="flex items-center gap-4 p-2 rounded border border-border/30 bg-secondary/5 relative">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/30">
                                        {node.hop}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm font-mono text-primary-foreground">{node.ip}</div>
                                            <div className="text-xs text-muted-foreground">{node.ms}</div>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {node.loc}
                                        </div>
                                    </div>
                                    {i < traceRoute.length - 1 && (
                                        <div className="absolute left-[1.2rem] top-10 w-[1px] h-4 bg-primary/30" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="verdict" className="mt-4">
                        <div className="border border-destructive/30 rounded-lg p-6 bg-destructive/5 text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="w-24 h-24 rounded-full border-4 border-destructive flex items-center justify-center text-3xl font-bold bg-black">
                                    98%
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-destructive">MALICIOUS CONFIDENCE</h3>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                                    Heuristic analysis confirms this traffic pattern matches known APT signatures (APT-28).
                                    Payload analysis reveals attempts to exploit CVE-2023-XX buffer overflow vulnerabilities.
                                </p>
                            </div>
                            <div className="pt-4 flex justify-center gap-2 text-xs font-mono text-primary/70">
                                <span className="px-2 py-1 bg-primary/10 rounded">AI_MODEL_V2</span>
                                <span className="px-2 py-1 bg-primary/10 rounded">SIG_MATCH_CONFIRMED</span>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
