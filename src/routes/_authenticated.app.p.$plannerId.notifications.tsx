import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { plannerId } = Route.useParams();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return { ...data, email: user.email };
    },
  });

  const { data: pendingInvites = [] } = useQuery({
    queryKey: ["pending_invites_notifications", profile?.email],
    queryFn: async () => {
      if (!profile?.email) return [];
      return (await supabase.from("planner_invites").select("*, planners(name)").eq("invitee_email", profile.email).eq("status", "pending")).data ?? [];
    },
    enabled: !!profile?.email,
  });

  const handleInviteAction = async (inviteId: string, action: 'accepted' | 'declined') => {
    const { error } = await supabase.from("planner_invites").update({ status: action }).eq("id", inviteId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Invitation ${action}`);
    qc.invalidateQueries({ queryKey: ["pending_invites_notifications"] });
    qc.invalidateQueries({ queryKey: ["planners"] });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="relative z-10 space-y-6 max-w-4xl mx-auto pb-20 pt-8">
        
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/app/p/$plannerId/dashboard" params={{ plannerId }}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-display tracking-tight flex items-center gap-2">
              <Bell className="h-7 w-7 text-emerald-500" />
              Notifications
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage your invitations and alerts.</p>
          </div>
        </div>

        {pendingInvites.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-10 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-medium text-lg">You're all caught up!</h3>
            <p className="text-muted-foreground text-sm mt-1">No new notifications at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingInvites.map((inv: any) => (
              <div key={inv.id} className="bg-card border border-hairline rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-emerald-500/30 hover:bg-card/60">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
                    <Bell className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Planner Invitation</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      You've been invited to collaborate on <strong className="text-white">{inv.planners?.name}</strong>.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 opacity-70">
                      Sent to: {inv.invitee_email}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:shrink-0 mt-2 sm:mt-0">
                  <Button size="sm" className="glow-emerald" onClick={() => handleInviteAction(inv.id, 'accepted')}>Accept</Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleInviteAction(inv.id, 'declined')}>Decline</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
