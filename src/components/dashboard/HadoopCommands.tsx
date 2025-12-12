
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Terminal, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const HadoopCommands = () => {
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        toast.success("Command copied to clipboard");
        setTimeout(() => setCopied(null), 2000);
    };

    const commands = [
        {
            label: "View Analysis Output",
            description: "See the raw JSON output from the Reucer",
            cmd: "export JAVA_HOME=$(/usr/libexec/java_home -v 17) && hdfs dfs -cat hdfs_data/output/part-00000"
        },
        {
            label: "List HDFS Directory",
            description: "Verify generated log files exist",
            cmd: "hdfs dfs -ls hdfs_data/logs/"
        },
        {
            label: "Run Manual Analysis",
            description: "Execute the Hadoop Streaming job manually",
            cmd: "npm run hadoop"
        },
        {
            label: "Run Full Hive Stack",
            description: "Initialize schema and run analysis (Embedded)",
            cmd: "cat hadoop/hive_schema.hql hadoop/hive_analysis.hql | beeline -u \"jdbc:hive2:///\""
        }
    ];

    return (
        <Card className="h-full border-border bg-card shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    Hadoop Operations
                </CardTitle>
                <CardDescription>
                    Commands to interact with your local HDFS data
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-md bg-muted p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        HDFS Analysis File
                    </div>
                    <code className="text-xs text-foreground font-mono block bg-background/50 p-2 rounded border border-border">
                        hdfs_data/output/part-00000
                    </code>
                </div>

                <div className="space-y-3">
                    {commands.map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <div className="text-xs font-medium text-foreground">{item.label}</div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
                                <pre className="text-[10px] md:text-xs bg-black/90 text-gray-300 p-3 rounded-md font-mono overflow-x-auto border border-border/50">
                                    {item.cmd}
                                </pre>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-1 top-1 h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-white/10"
                                    onClick={() => copyToClipboard(item.cmd, item.label)}
                                >
                                    {copied === item.label ? (
                                        <Check className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <Copy className="h-3 w-3" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground ml-1">{item.description}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
