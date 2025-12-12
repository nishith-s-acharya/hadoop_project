import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, X, Send, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    sender: 'bot' | 'user';
    text: string;
    timestamp: Date;
}

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'bot',
            text: "Hello, Commander. I am Sentinel AI. How can I assist you with threat monitoring today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const generateResponse = (query: string): string => {
        const q = query.toLowerCase();

        // System Status / Operations
        if (q.includes('status') || q.includes('system') || q.includes('health') || q.includes('operational')) {
            return "All systems are currently operational. Active defense protocols are engaged. The network firewall, IDS, and IPS are running at optimal efficiency.";
        }

        // Critical / Threats
        if (q.includes('critical') || q.includes('alert') || q.includes('danger')) {
            return "High-priority alert monitoring is active. I flag approximately 3-5 critical incidents per hour. Please review the 'Threat Log' immediately for detailed forensics on recent critical events.";
        }

        // Identity / Personality
        if (q.includes('bot') || q.includes('who are you') || q.includes('identity') || q.includes('name')) {
            return "I am Sentinel, an advanced heuristic AI agent designed to monitor, analyze, and neutralize cyber threats in real-time.";
        }

        // Network / Scanning
        if (q.includes('scan') || q.includes('ip') || q.includes('port') || q.includes('network')) {
            return "Network surveillance detected repeated port scanning attempts from external subnets. I automatically correlate these IP addresses. You can block specific IPs in the 'Response Rules' module.";
        }

        // Attacks / Malware
        if (q.includes('malware') || q.includes('virus') || q.includes('infection') || q.includes('ddos')) {
            return "Malware signatures and traffic anomalies are being cross-referenced with the global threat database. Any confirmed vectors are automatically quarantined.";
        }

        // Infrastructure / Big Data (Hadoop)
        if (q.includes('hadoop') || q.includes('hdfs') || q.includes('big data')) {
            return "Hadoop Cluster Status: Nominal. All NameNodes and DataNodes are active. Storage tiers are operating at 45% capacity with zero packet loss.";
        }

        // Cloud / Docker / K8s
        if (q.includes('docker') || q.includes('k8s') || q.includes('kubernetes') || q.includes('container')) {
            return "Container orchestration metrics are stable. All pod clusters are healthy. Auto-scaling policies are ready to deploy additional resources if threat load increases.";
        }

        // Database
        if (q.includes('db') || q.includes('database') || q.includes('sql') || q.includes('postgres')) {
            return "Primary database shards are synced. Transaction logs show normal read/write latency (<20ms). No unauthorized SQL injection attempts detected in the last cycle.";
        }

        // Help / Capabilities
        if (q.includes('help') || q.includes('assist') || q.includes('can you')) {
            return "I can report on system status, analyze threat levels, explain attack types (like DDoS or Malware), check infrastructure (Hadoop, Docker), and monitor network traffic.";
        }

        // Casual
        if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
            return "Greetings, Commander. Sentinel systems are online and awaiting your orders.";
        }

        // Default Fallback
        const fallbacks = [
            "I'm analyzing that query... My heuristic engine suggests checking the Analytics dashboard for granular data.",
            "That specific parameter is outside my primary dataset. However, I am continuously monitoring for anomalies.",
            "I didn't quite catch that command. You can ask me about 'status', 'threats', 'alerts', or 'network' activity."
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulate AI delay
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: generateResponse(userMsg.text),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <>
            <div className={cn(
                "fixed bottom-6 right-6 z-50 transition-all duration-300 transform",
                isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
            )}>
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] bg-primary hover:bg-primary/80 animate-bounce"
                    onClick={() => setIsOpen(true)}
                >
                    <Bot className="h-8 w-8 text-primary-foreground" />
                </Button>
            </div>

            <div className={cn(
                "fixed bottom-6 right-6 z-50 transition-all duration-300 transform origin-bottom-right",
                isOpen ? "scale-100 opacity-100" : "scale-90 opacity-0 pointer-events-none"
            )}>
                <Card className="w-[350px] shadow-[0_0_40px_rgba(0,0,0,0.5)] border-primary/50 bg-black/90 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-white/10">
                        <CardTitle className="text-sm font-mono flex items-center gap-2 text-primary">
                            <Sparkles className="h-4 w-4" /> SENTINEL AI
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[400px] p-4">
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex gap-2 max-w-[80%] text-sm",
                                            msg.sender === 'user' ? "ml-auto" : "mr-auto"
                                        )}
                                    >
                                        {msg.sender === 'bot' && (
                                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/50">
                                                <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "p-3 rounded-lg",
                                            msg.sender === 'user'
                                                ? "bg-primary text-primary-foreground rounded-br-none"
                                                : "bg-white/10 text-white rounded-bl-none border border-white/5"
                                        )}>
                                            {msg.text}
                                        </div>
                                        {msg.sender === 'user' && (
                                            <User className="h-8 w-8 p-1.5 rounded-full bg-white/10 text-white/70" />
                                        )}
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex gap-2 mr-auto max-w-[80%]">
                                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/50">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="bg-white/10 p-3 rounded-lg rounded-bl-none flex gap-1 items-center">
                                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>
                        <div className="p-3 border-t border-white/10 flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask Sentinel..."
                                className="bg-white/5 border-white/10 focus:border-primary/50"
                            />
                            <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
