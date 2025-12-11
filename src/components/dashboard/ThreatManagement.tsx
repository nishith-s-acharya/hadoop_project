import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ThreatLog } from '@/hooks/useThreatLogs';
import { CheckCircle, MessageSquare, Loader2 } from 'lucide-react';

interface ThreatManagementProps {
  threat: ThreatLog;
  onUpdate: () => void;
}

export function ThreatManagement({ threat, onUpdate }: ThreatManagementProps) {
  const [notes, setNotes] = useState(threat.notes || '');
  const [isResolving, setIsResolving] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleResolve = async () => {
    setIsResolving(true);
    const { error } = await supabase
      .from('threat_logs')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', threat.id);

    if (error) {
      toast.error('Failed to resolve threat');
      console.error(error);
    } else {
      toast.success('Threat marked as resolved');
      onUpdate();
    }
    setIsResolving(false);
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    const { error } = await supabase
      .from('threat_logs')
      .update({ notes })
      .eq('id', threat.id);

    if (error) {
      toast.error('Failed to save notes');
      console.error(error);
    } else {
      toast.success('Notes saved');
      setDialogOpen(false);
      onUpdate();
    }
    setIsSavingNotes(false);
  };

  const isResolved = threat.status === 'resolved';

  return (
    <div className="flex items-center gap-2">
      {isResolved ? (
        <Badge variant="outline" className="text-success border-success/50 text-[10px]">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resolved
        </Badge>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleResolve}
          disabled={isResolving}
          className="h-7 text-xs font-mono text-success hover:text-success hover:bg-success/10"
        >
          {isResolving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolve
            </>
          )}
        </Button>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs font-mono"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            {threat.notes ? 'View Notes' : 'Add Notes'}
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-mono">
              Analyst Notes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground font-mono">
              Threat ID: {threat.id.slice(0, 8)}...
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add investigation notes, findings, or remediation steps..."
              className="min-h-[120px] font-mono text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveNotes} disabled={isSavingNotes}>
                {isSavingNotes ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Save Notes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
