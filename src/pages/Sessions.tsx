import MobileLayout from "@/components/MobileLayout";
import { motion } from "framer-motion";
import { Plus, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const mockSessions = [
  { id: 1, title: "Friday Night Vibes", date: "Feb 21, 2026", members: 6, isAdmin: true },
  { id: 2, title: "Chill Sunday", date: "Feb 23, 2026", members: 4, isAdmin: false },
  { id: 3, title: "After Work", date: "Feb 14, 2026", members: 8, isAdmin: true },
  { id: 4, title: "Birthday Bash", date: "Feb 28, 2026", members: 12, isAdmin: false },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const Sessions = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout title="Sessions">
      <div className="px-4 pt-4">
        <Button
          className="mb-6 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 bg-glow font-semibold text-base h-14 rounded-2xl"
          onClick={() => navigate("/sessions/create")}
        >
          <Plus className="h-5 w-5" /> New Session
        </Button>

        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-3">
          {mockSessions.map((session) => (
            <motion.div
              key={session.id}
              variants={item}
              className="flex items-center justify-between rounded-2xl bg-card border border-border p-4 cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => navigate(`/sessions/${session.id}`)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{session.title}</h3>
                  {session.isAdmin && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{session.date}</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {session.members}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default Sessions;
