import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Send, Loader2 } from "lucide-react";

interface AlertNotificationButtonProps {
  threatId: string;
  threatType: string;
  severity: string;
}

export const AlertNotificationButton = ({ threatId, threatType, severity }: AlertNotificationButtonProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendAlert = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-critical-alert", {
        body: { threatId, recipientEmail: email },
      });

      if (error) throw error;
      toast.success("Alert notification sent successfully");
      setOpen(false);
      setEmail("");
    } catch (error: any) {
      console.error("Failed to send alert:", error);
      toast.error(error.message || "Failed to send alert notification");
    } finally {
      setSending(false);
    }
  };

  if (severity !== "critical") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10">
          <Mail className="h-3 w-3" />
          Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-destructive flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Critical Alert
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
            <p className="text-sm text-muted-foreground">
              Sending alert for <strong className="text-foreground">{threatType}</strong> threat with{" "}
              <span className="text-destructive font-bold">CRITICAL</span> severity.
            </p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Recipient Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="security-team@company.com"
              className="bg-background border-border mt-1"
            />
          </div>
          <Button onClick={handleSendAlert} disabled={sending} className="w-full gap-2">
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Alert
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
