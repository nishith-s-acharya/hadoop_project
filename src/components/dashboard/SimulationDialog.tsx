
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Zap, Activity } from "lucide-react";

interface SimulationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSimulate: (options: { count: number; type: string }) => void;
    isSimulating: boolean;
}

export function SimulationDialog({
    open,
    onOpenChange,
    onSimulate,
    isSimulating,
}: SimulationDialogProps) {
    const [count, setCount] = useState([5]);
    const [type, setType] = useState("all");

    const handleSimulate = () => {
        onSimulate({ count: count[0], type });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-card border-border backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-mono">
                        <Zap className="h-5 w-5 text-primary" />
                        Simulate Attack Scenario
                    </DialogTitle>
                    <DialogDescription>
                        Configure the parameters for the simulated cyber attack.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <Label htmlFor="type" className="text-right">
                            Attack Type
                        </Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger id="type" className="bg-background/50 border-input">
                                <SelectValue placeholder="Select attack type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Random Mix</SelectItem>
                                <SelectItem value="ddos">DDoS Attack</SelectItem>
                                <SelectItem value="brute_force">Brute Force</SelectItem>
                                <SelectItem value="failed_login">Failed Logins</SelectItem>
                                <SelectItem value="malware">Malware Injection</SelectItem>
                                <SelectItem value="port_scan">Port Scanning</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="intensity" className="text-right">
                                Intensity (Events)
                            </Label>
                            <span className="text-sm font-mono text-muted-foreground bg-primary/10 px-2 py-0.5 rounded text-primary">
                                {count[0]}
                            </span>
                        </div>
                        <Slider
                            id="intensity"
                            min={1}
                            max={20}
                            step={1}
                            value={count}
                            onValueChange={setCount}
                            className="py-4"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-1">
                            <span>Low</span>
                            <span>Medium</span>
                            <span>High</span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSimulate}
                        disabled={isSimulating}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    >
                        {isSimulating ? (
                            <Activity className="h-4 w-4 animate-spin" />
                        ) : (
                            <Zap className="h-4 w-4" />
                        )}
                        Launch Simulation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
