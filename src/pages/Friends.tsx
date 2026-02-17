import MobileLayout from "@/components/MobileLayout";
import { motion } from "framer-motion";
import { UserPlus, Check, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const mockFriends = [
  { id: 1, name: "Alex Johnson", username: "@alexj", status: "online" },
  { id: 2, name: "Maya Chen", username: "@mayac", status: "offline" },
  { id: 3, name: "Sam Rivera", username: "@samr", status: "online" },
  { id: 4, name: "Jordan Lee", username: "@jordanl", status: "offline" },
  { id: 5, name: "Taylor Kim", username: "@taylork", status: "online" },
];

const mockRequests = [
  { id: 10, name: "Chris Doe", username: "@chrisd" },
  { id: 11, name: "Pat Morgan", username: "@patm" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0 },
};

const Friends = () => {
  const [search, setSearch] = useState("");
  const filtered = mockFriends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MobileLayout title="Friends">
      <div className="px-4 pt-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl bg-card border-border h-12"
          />
        </div>

        {/* Add friend */}
        <Button
          variant="outline"
          className="mb-6 w-full gap-2 h-12 rounded-xl border-dashed border-primary/40 text-primary hover:bg-primary/5"
        >
          <UserPlus className="h-4 w-4" /> Add a Friend
        </Button>

        {/* Requests */}
        {mockRequests.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Friend Requests ({mockRequests.length})
            </h2>
            <div className="flex flex-col gap-2">
              {mockRequests.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-2xl bg-card border border-primary/20 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary">
                      {req.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{req.name}</p>
                      <p className="text-xs text-muted-foreground">{req.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-border hover:bg-destructive/10 hover:text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Friends list */}
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Your Friends ({filtered.length})
        </h2>
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-2">
          {filtered.map((friend) => (
            <motion.div
              key={friend.id}
              variants={item}
              className="flex items-center gap-3 rounded-2xl bg-card border border-border p-4 hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-display font-bold text-foreground">
                  {friend.name[0]}
                </div>
                {friend.status === "online" && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{friend.name}</p>
                <p className="text-xs text-muted-foreground">{friend.username}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default Friends;
