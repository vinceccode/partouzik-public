import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { motion } from "framer-motion";
import { Plus, Users, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMySessions, useDeleteSession } from "@/hooks/useSessions";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const statusLabel: Record<string, string> = {
  waiting: "⏳ Waiting",
  active: "🔴 Live",
  paused: "⏸ Paused",
  ended: "✅ Ended",
};

const Sessions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: sessions = [], isLoading } = useMySessions();
  const deleteSession = useDeleteSession();
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteSession.mutateAsync(toDelete.id);
      toast({ title: "Session supprimée" });
      setToDelete(null);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  return (
    <MobileLayout title="Sessions">
      <div className="px-4 pt-4">
        <Button
          className="mb-6 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 bg-glow font-semibold text-base h-14 rounded-2xl"
          onClick={() => navigate("/sessions/create")}
        >
          <Plus className="h-5 w-5" /> New Session
        </Button>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-3">
            {sessions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No sessions yet. Create your first one!</p>
            )}
            {sessions.map((session: any) => {
              const isOwner = session.created_by === user?.id;
              return (
                <motion.div
                  key={session.id}
                  variants={item}
                  className="flex items-center justify-between rounded-2xl bg-card border border-border p-4 cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => navigate(`/sessions/${session.id}/live`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{session.name}</h3>
                      {isOwner && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{statusLabel[session.status] || session.status}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {session.session_participants?.[0]?.count || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isOwner && (
                      <button
                        type="button"
                        aria-label="Supprimer la session"
                        onClick={(e) => {
                          e.stopPropagation();
                          setToDelete({ id: session.id, name: session.name });
                        }}
                        className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la session ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="font-semibold text-foreground">{toDelete?.name}</span> ?
              Cette action est irréversible et supprimera également tous les participants et morceaux associés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSession.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteSession.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSession.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileLayout>
  );
};

export default Sessions;
