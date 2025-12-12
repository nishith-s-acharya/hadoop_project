import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/dashboard/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Shield, Ban, Bell, Zap, Trash2, Edit } from "lucide-react";

interface ResponseRule {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_value: string;
  action_type: string;
  action_config: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
}

interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  blocked_at: string;
  expires_at: string | null;
  is_permanent: boolean;
}

const ResponseRules = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rules, setRules] = useState<ResponseRule[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger_type: "severity",
    trigger_value: "critical",
    action_type: "notify",
    action_config: {},
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesRes, blockedRes] = await Promise.all([
        supabase.from("response_rules").select("*").order("created_at", { ascending: false }),
        supabase.from("blocked_ips").select("*").order("blocked_at", { ascending: false }),
      ]);

      if (rulesRes.error) throw rulesRes.error;
      if (blockedRes.error) throw blockedRes.error;

      setRules((rulesRes.data as ResponseRule[]) || []);
      setBlockedIPs(blockedRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load response rules");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    if (!formData.name || !formData.trigger_value) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const { error } = await supabase.from("response_rules").insert({
        name: formData.name,
        description: formData.description || null,
        trigger_type: formData.trigger_type,
        trigger_value: formData.trigger_value,
        action_type: formData.action_type,
        action_config: formData.action_config,
        created_by: user?.id,
      });

      if (error) throw error;
      toast.success("Rule created successfully");
      setDialogOpen(false);
      setFormData({ name: "", description: "", trigger_type: "severity", trigger_value: "critical", action_type: "notify", action_config: {} });
      fetchData();
    } catch (error: any) {
      console.error("Failed to create rule:", error);
      toast.error(error.message || "Failed to create rule");
    }
  };

  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from("response_rules").update({ is_active: !isActive }).eq("id", id);
      if (error) throw error;
      setRules((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: !isActive } : r)));
      toast.success(`Rule ${!isActive ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Failed to toggle rule:", error);
      toast.error("Failed to update rule");
    }
  };

  const handleUnblockIP = async (id: string) => {
    try {
      const { error } = await supabase.from("blocked_ips").delete().eq("id", id);
      if (error) throw error;
      setBlockedIPs((prev) => prev.filter((ip) => ip.id !== id));
      toast.success("IP unblocked");
    } catch (error) {
      console.error("Failed to unblock IP:", error);
      toast.error("Failed to unblock IP");
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) toast.error("Failed to sign out");
    else {
      toast.success("Signed out");
      navigate("/");
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "block_ip": return <Ban className="h-4 w-4 text-destructive" />;
      case "escalate": return <Zap className="h-4 w-4 text-yellow-500" />;
      case "notify": return <Bell className="h-4 w-4 text-blue-500" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (type: string, value: string) => {
    switch (type) {
      case "severity": return `Severity = ${value}`;
      case "threat_type": return `Type = ${value}`;
      case "ip_pattern": return `IP matches ${value}`;
      case "frequency": return `${value}+ per hour`;
      default: return value;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
        <div className="text-primary animate-pulse font-mono text-xl">LOADING RESPONSE RULES...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
        <Card className="bg-card/80 border-border p-8 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Authentication required to manage response rules</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none scanlines opacity-30" />
      <Header criticalAlerts={0} user={user} onSignOut={handleSignOut} onSimulate={() => { }} isSimulating={false} />

      <main className="container mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-mono font-bold text-primary">AUTOMATED RESPONSE RULES</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-mono text-primary">Create Response Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Rule Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Block critical threats"
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    className="bg-background border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Trigger Type</Label>
                    <Select value={formData.trigger_type} onValueChange={(v) => setFormData((prev) => ({ ...prev, trigger_type: v }))}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="severity">Severity Level</SelectItem>
                        <SelectItem value="threat_type">Threat Type</SelectItem>
                        <SelectItem value="ip_pattern">IP Pattern</SelectItem>
                        <SelectItem value="frequency">Attack Frequency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Trigger Value</Label>
                    {formData.trigger_type === "severity" ? (
                      <Select value={formData.trigger_value} onValueChange={(v) => setFormData((prev) => ({ ...prev, trigger_value: v }))}>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : formData.trigger_type === "threat_type" ? (
                      <Select value={formData.trigger_value} onValueChange={(v) => setFormData((prev) => ({ ...prev, trigger_value: v }))}>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Brute Force">Brute Force</SelectItem>
                          <SelectItem value="Port Scan">Port Scan</SelectItem>
                          <SelectItem value="Malware">Malware</SelectItem>
                          <SelectItem value="DDoS">DDoS</SelectItem>
                          <SelectItem value="SQL Injection">SQL Injection</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={formData.trigger_value}
                        onChange={(e) => setFormData((prev) => ({ ...prev, trigger_value: e.target.value }))}
                        placeholder={formData.trigger_type === "ip_pattern" ? "192.168.*" : "10"}
                        className="bg-background border-border"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <Label>Action</Label>
                  <Select value={formData.action_type} onValueChange={(v) => setFormData((prev) => ({ ...prev, action_type: v }))}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notify">Send Notification</SelectItem>
                      <SelectItem value="block_ip">Block Source IP</SelectItem>
                      <SelectItem value="escalate">Escalate to Admin</SelectItem>
                      <SelectItem value="quarantine">Quarantine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateRule} className="w-full">Create Rule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Rules */}
        <Card className="bg-card/80 border-border backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-primary">ACTIVE RULES ({rules.filter((r) => r.is_active).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Rule</TableHead>
                  <TableHead className="text-muted-foreground">Trigger</TableHead>
                  <TableHead className="text-muted-foreground">Action</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground text-right">Controls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No rules configured. Create your first automated response rule.
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow key={rule.id} className="border-border">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{rule.name}</p>
                          {rule.description && <p className="text-xs text-muted-foreground">{rule.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {getTriggerLabel(rule.trigger_type, rule.trigger_value)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(rule.action_type)}
                          <span className="capitalize text-sm">{rule.action_type.replace("_", " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch checked={rule.is_active} onCheckedChange={() => handleToggleRule(rule.id, rule.is_active)} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Blocked IPs */}
        <Card className="bg-card/80 border-border backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-destructive flex items-center gap-2">
              <Ban className="h-4 w-4" /> BLOCKED IPs ({blockedIPs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">IP Address</TableHead>
                  <TableHead className="text-muted-foreground">Reason</TableHead>
                  <TableHead className="text-muted-foreground">Blocked At</TableHead>
                  <TableHead className="text-muted-foreground">Expires</TableHead>
                  <TableHead className="text-muted-foreground text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockedIPs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No blocked IPs. IPs will appear here when blocked by response rules.
                    </TableCell>
                  </TableRow>
                ) : (
                  blockedIPs.map((ip) => (
                    <TableRow key={ip.id} className="border-border">
                      <TableCell className="font-mono text-destructive">{ip.ip_address}</TableCell>
                      <TableCell className="text-sm">{ip.reason}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(ip.blocked_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {ip.is_permanent ? (
                          <Badge variant="destructive">Permanent</Badge>
                        ) : ip.expires_at ? (
                          <span className="text-sm">{new Date(ip.expires_at).toLocaleString()}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleUnblockIP(ip.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ResponseRules;
