import MobileLayout from "@/components/MobileLayout";
import { motion } from "framer-motion";
import { Plus, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMySessions } from "@/hooks/useSessions";
import { useAuth } from "@/hooks/useAuth";

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
            {sessions.map((session: any) => (
              <motion.div
                key={session.id}
                variants={item}
                className="flex items-center justify-between rounded-2xl bg-card border border-border p-4 cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => navigate(`/sessions/${session.id}/live`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{session.name}</h3>
                    {session.created_by === user?.id && (
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
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Sessions;
