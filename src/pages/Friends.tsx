import MobileLayout from "@/components/MobileLayout";
import { motion } from "framer-motion";
import { UserPlus, Check, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useFriends, useFriendRequests, useAcceptFriend, useDeclineFriend, useSendFriendRequest } from "@/hooks/useFriends";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } };

const Friends = () => {
  const [search, setSearch] = useState("");
  const [addUsername, setAddUsername] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: friends = [] } = useFriends();
  const { data: requests = [] } = useFriendRequests();
  const acceptFriend = useAcceptFriend();
  const declineFriend = useDeclineFriend();
  const sendRequest = useSendFriendRequest();

  const filtered = friends.filter((f: any) =>
    f.profile?.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!addUsername.trim()) return;
    try {
      await sendRequest.mutateAsync(addUsername.trim());
      toast({ title: "Friend request sent!" });
      setAddUsername("");
      setDialogOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <MobileLayout title="Friends">
      <div className="px-4 pt-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl bg-card border-border h-12"
          />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="mb-6 w-full gap-2 h-12 rounded-xl border-dashed border-primary/40 text-primary hover:bg-primary/5">
              <UserPlus className="h-4 w-4" /> Add a Friend
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Add Friend by Username</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Enter username"
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value)}
                className="h-12 rounded-xl"
              />
              <Button onClick={handleAdd} disabled={sendRequest.isPending} className="bg-primary text-primary-foreground rounded-xl h-12">
                {sendRequest.isPending ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {requests.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Friend Requests ({requests.length})
            </h2>
            <div className="flex flex-col gap-2">
              {requests.map((req: any) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-2xl bg-card border border-primary/20 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary">
                      {req.requester?.display_name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{req.requester?.display_name}</p>
                      <p className="text-xs text-muted-foreground">@{req.requester?.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => acceptFriend.mutate(req.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon" variant="outline"
                      className="h-8 w-8 rounded-full border-border hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => declineFriend.mutate(req.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Your Friends ({filtered.length})
        </h2>
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No friends yet. Add some!</p>
          )}
          {filtered.map((friend: any) => (
            <motion.div
              key={friend.id}
              variants={item}
              className="flex items-center gap-3 rounded-2xl bg-card border border-border p-4 hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-display font-bold text-foreground">
                {friend.profile?.display_name?.[0] || "?"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{friend.profile?.display_name}</p>
                <p className="text-xs text-muted-foreground">@{friend.profile?.username}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default Friends;
