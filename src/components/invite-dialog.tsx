import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, Send } from "lucide-react";

export function InviteDialog({ plannerId, trigger, open, onOpenChange }: { plannerId: string, trigger?: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  async function handleInvite() {
    if (!email) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if already invited
    const { data: existing } = await supabase.from("planner_invites")
      .select("*")
      .eq("planner_id", plannerId)
      .eq("invitee_email", email)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      toast.error("An invite to this email is already pending.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("planner_invites").insert({
      planner_id: plannerId,
      inviter_id: user.id,
      invitee_email: email,
      role,
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Invite sent successfully!");
      setIsOpen(false);
      setEmail("");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Invite Collaborator 
            <span className="text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">Beta</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Email address</label>
            <Input 
              type="email" 
              placeholder="colleague@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer (Read only)</SelectItem>
                <SelectItem value="editor">Editor (Can make changes)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleInvite} disabled={loading || !email} className="w-full glow-emerald mt-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2"/>}
            Send Invite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
