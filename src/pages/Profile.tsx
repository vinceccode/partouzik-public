import MobileLayout from "@/components/MobileLayout";
import { motion } from "framer-motion";
import { Settings, LogOut, ChevronRight, Zap } from "lucide-react";

const Profile = () => {
  return (
    <MobileLayout title="Profile">
      <div className="px-4 pt-6">
        {/* Avatar & Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary font-display text-3xl font-bold text-primary-foreground">
            A
          </div>
          <h2 className="text-xl font-display font-bold">Alex User</h2>
          <p className="text-sm text-muted-foreground">@alexuser</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 grid grid-cols-3 gap-3"
        >
          {[
            { label: "Sessions", value: "5" },
            { label: "Friends", value: "12" },
            { label: "Created", value: "3" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center rounded-2xl bg-card border border-border p-3">
              <span className="text-lg font-display font-bold">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-2"
        >
          {[
            { icon: Settings, label: "Settings" },
            { icon: Zap, label: "About Partouzik" },
            { icon: LogOut, label: "Log Out", destructive: true },
          ].map((menuItem) => (
            <button
              key={menuItem.label}
              className={`flex items-center justify-between rounded-2xl bg-card border border-border p-4 transition-colors hover:border-primary/30 ${
                menuItem.destructive ? "text-destructive" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <menuItem.icon className="h-5 w-5" />
                <span className="font-medium text-sm">{menuItem.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default Profile;
