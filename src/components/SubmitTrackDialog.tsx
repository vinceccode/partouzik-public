import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubmitTrack } from "@/hooks/useSessions";
import { toast } from "@/hooks/use-toast";

const platforms = [
  { value: "spotify", label: "Spotify", icon: "🟢" },
  { value: "apple_music", label: "Apple Music", icon: "🍎" },
  { value: "youtube", label: "YouTube", icon: "🔴" },
  { value: "other", label: "Other", icon: "🎵" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  sessionId: string;
}

export default function SubmitTrackDialog({ open, onClose, sessionId }: Props) {
  const [trackName, setTrackName] = useState("");
  const [platform, setPlatform] = useState("spotify");
  const [link, setLink] = useState("");
  const submitTrack = useSubmitTrack();

  const handleSubmit = async () => {
    if (!trackName.trim()) return;
    try {
      await submitTrack.mutateAsync({
        sessionId,
        trackName: trackName.trim(),
        platform,
        platformUrl: link.trim() || undefined,
      });
      toast({ title: "Track submitted! 🎵" });
      setTrackName("");
      setLink("");
      onClose();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-3xl bg-card border-t border-border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" /> Submit a Track
              </h2>
              <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-sm mb-1.5 block">Track Name</Label>
                <Input
                  value={trackName}
                  onChange={(e) => setTrackName(e.target.value)}
                  placeholder="e.g. Blinding Lights"
                  className="h-12 rounded-xl bg-background"
                />
              </div>

              <div>
                <Label className="text-sm mb-2 block">Platform</Label>
                <div className="grid grid-cols-4 gap-2">
                  {platforms.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPlatform(p.value)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors text-xs ${
                        platform === p.value
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/30"
                      }`}
                    >
                      <span className="text-lg">{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm mb-1.5 block">Link (optional)</Label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="h-12 rounded-xl bg-background"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!trackName.trim() || submitTrack.isPending}
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 bg-glow font-semibold text-base"
              >
                {submitTrack.isPending ? "Submitting..." : "Submit Track 🎵"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
