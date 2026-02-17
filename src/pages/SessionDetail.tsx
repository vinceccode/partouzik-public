import MobileLayout from "@/components/MobileLayout";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Calendar, Crown, UserPlus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const mockMembers = [
  { id: 1, name: "Alex Johnson", role: "admin" },
  { id: 2, name: "Maya Chen", role: "member" },
  { id: 3, name: "Sam Rivera", role: "member" },
  { id: 4, name: "Jordan Lee", role: "member" },
];

const SessionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <MobileLayout>
      <div className="px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold">Friday Night Vibes</h1>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Feb 21, 2026 · 9:00 PM</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-2xl bg-card border border-border p-4"
        >
          <p className="text-sm text-muted-foreground">
            Get together for a chill evening. Bring good vibes only ✨
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Users className="h-4 w-4" /> Members ({mockMembers.length})
            </h2>
            <Button variant="ghost" size="sm" className="gap-1 text-primary text-xs">
              <UserPlus className="h-3.5 w-3.5" /> Invite
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {mockMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-xl bg-card border border-border p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted font-display font-bold text-sm">
                  {member.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{member.name}</p>
                </div>
                {member.role === "admin" && (
                  <Crown className="h-4 w-4 text-primary" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default SessionDetail;
