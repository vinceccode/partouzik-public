import MobileLayout from "@/components/MobileLayout";
import { motion } from "framer-motion";
import { Plus, Calendar, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useMySessions } from "@/hooks/useSessions";
import { useFriends } from "@/hooks/useFriends";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: sessions = [] } = useMySessions();
  const { data: friends = [] } = useFriends();

  const upcomingSessions = sessions.filter((s: any) => s.status === "waiting" || s.status === "active");

  return (
    <MobileLayout>
      <div className="px-4 pt-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-muted-foreground text-sm">Welcome back 👋</p>
          <h1 className="text-3xl font-display font-bold">{profile?.display_name || "Your Sessions"}</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
          <Button
            className="mb-6 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 bg-glow font-semibold text-base h-14 rounded-2xl"
            onClick={() => navigate("/sessions/create")}
          >
            <Plus className="h-5 w-5" /> Create a Session
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6 grid grid-cols-3 gap-3">
          {[
            { icon: Calendar, label: "Sessions", value: String(sessions.length) },
            { icon: Users, label: "Friends", value: String(friends.length) },
            { icon: Clock, label: "Active", value: String(upcomingSessions.length) },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center rounded-2xl bg-card p-4 border border-border">
              <stat.icon className="mb-1 h-5 w-5 text-primary" />
              <span className="text-xl font-display font-bold">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show">
          <h2 className="mb-3 text-lg font-display font-semibold">Active & Upcoming</h2>
          <div className="flex flex-col gap-3">
            {upcomingSessions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No active sessions yet. Create one!</p>
            )}
            {upcomingSessions.map((session: any) => (
              <motion.div
                key={session.id}
                variants={item}
                className="flex items-center justify-between rounded-2xl bg-card border border-border p-4 cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => navigate(`/sessions/${session.id}/live`)}
              >
                <div>
                  <h3 className="font-semibold">{session.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {session.status === "active" ? "🔴 Live" : "⏳ Waiting"}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-medium text-primary">{session.session_participants?.[0]?.count || 0}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default Dashboard;
