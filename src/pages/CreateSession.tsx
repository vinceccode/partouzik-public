import MobileLayout from "@/components/MobileLayout";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const mockFriends = [
  { id: 1, name: "Alex Johnson" },
  { id: 2, name: "Maya Chen" },
  { id: 3, name: "Sam Rivera" },
  { id: 4, name: "Jordan Lee" },
  { id: 5, name: "Taylor Kim" },
];

const CreateSession = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  return (
    <MobileLayout>
      <div className="px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-2xl font-display font-bold"
        >
          Create a Session
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          <div>
            <Label htmlFor="title" className="text-sm font-medium mb-1.5 block">Session Name</Label>
            <Input id="title" placeholder="e.g. Friday Night Vibes" className="h-12 rounded-xl bg-card" />
          </div>

          <div>
            <Label htmlFor="date" className="text-sm font-medium mb-1.5 block">Date & Time</Label>
            <Input id="date" type="datetime-local" className="h-12 rounded-xl bg-card" />
          </div>

          <div>
            <Label htmlFor="desc" className="text-sm font-medium mb-1.5 block">Description (optional)</Label>
            <Textarea id="desc" placeholder="What's the plan?" className="rounded-xl bg-card min-h-[80px]" />
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">
              Invite Friends ({selected.length} selected)
            </Label>
            <div className="flex flex-col gap-2">
              {mockFriends.map((friend) => {
                const isSelected = selected.includes(friend.id);
                return (
                  <button
                    key={friend.id}
                    onClick={() => toggle(friend.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-display font-bold text-sm">
                        {friend.name[0]}
                      </div>
                      <span className="font-medium text-sm">{friend.name}</span>
                    </div>
                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 bg-glow font-semibold text-base mt-2"
            onClick={() => navigate("/sessions")}
          >
            Create Session 🎉
          </Button>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default CreateSession;
