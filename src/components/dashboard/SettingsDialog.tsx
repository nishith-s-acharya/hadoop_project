import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Eye, Zap, HardDrive, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const [refreshRate, setRefreshRate] = useState([5]);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [compactMode, setCompactMode] = useState(false);

    const handleSave = () => {
        toast.success("Settings saved successfully", {
            description: "Preferences have been updated locally."
        });
        onOpenChange(false);
    };

    const clearCache = () => {
        toast.info("System cache cleared");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-card/95 border-border backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-mono">
                        SYSTEM PREFERENCES
                    </DialogTitle>
                    <DialogDescription>
                        Configure your Sentinel dashboard environment.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="display">Display</TabsTrigger>
                        <TabsTrigger value="system">System</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4 py-4">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="audio" className="flex items-center gap-2">
                                    <Bell className="h-4 w-4" /> Audio Alerts
                                </Label>
                                <span className="text-xs text-muted-foreground">Play sound on critical threats</span>
                            </div>
                            <Switch
                                id="audio"
                                checked={audioEnabled}
                                onCheckedChange={(checked) => {
                                    setAudioEnabled(checked);
                                    toast.info(checked ? "Audio alerts enabled" : "Audio alerts disabled");
                                }}
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between">
                                <Label htmlFor="refresh" className="flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4" /> Data Refresh Rate
                                </Label>
                                <span className="text-xs font-mono text-primary">{refreshRate}s</span>
                            </div>
                            <Slider
                                id="refresh"
                                min={1}
                                max={60}
                                step={1}
                                value={refreshRate}
                                onValueChange={setRefreshRate}
                                className="py-2"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="display" className="space-y-4 py-4">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="contrast" className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" /> High Contrast
                                </Label>
                                <span className="text-xs text-muted-foreground">Increase visibility for alerts</span>
                            </div>
                            <Switch
                                id="contrast"
                                checked={highContrast}
                                onCheckedChange={setHighContrast}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="compact" className="flex items-center gap-2">
                                    <Zap className="h-4 w-4" /> Compact Mode
                                </Label>
                                <span className="text-xs text-muted-foreground">Dense layout for more data</span>
                            </div>
                            <Switch
                                id="compact"
                                checked={compactMode}
                                onCheckedChange={setCompactMode}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="system" className="space-y-4 py-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-black/20">
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <HardDrive className="h-4 w-4" /> Local Cache
                                </span>
                                <span className="text-xs text-muted-foreground">3.2 MB used</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={clearCache}>
                                Clear
                            </Button>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                            Sentinel Core v2.4.0 <br />
                            Build: 2025.12.12.RC1
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button onClick={handleSave} className="w-full sm:w-auto">Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
