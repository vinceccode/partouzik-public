import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubmitTrack } from "@/hooks/useSessions";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  sessionId: string;
}

const isValidYoutubeUrl = (url: string) =>
  url.includes("youtube.com") || url.includes("youtu.be");

export default function SubmitTrackDialog({ open, onClose, sessionId }: Props) {
  const [trackName, setTrackName] = useState("");
  const [link, setLink] = useState("");
  const submitTrack = useSubmitTrack();

  const canSubmit = trackName.trim().length > 0 && isValidYoutubeUrl(link.trim());

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await submitTrack.mutateAsync({
        sessionId,
        trackName: trackName.trim(),
        platform: "youtube",
        platformUrl: link.trim(),
      });
      toast({ title: "Track soumise ! 🎵" });
      setTrackName("");
      setLink("");
      onClose();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
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
                <Music className="h-5 w-5 text-primary" /> Soumettre une musique
              </h2>
              <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-sm mb-1.5 block">Titre de la musique</Label>
                <Input
                  value={trackName}
                  onChange={(e) => setTrackName(e.target.value)}
                  placeholder="e.g. Blinding Lights"
                  className="h-12 rounded-xl bg-background"
                />
              </div>

              <div>
                <Label className="text-sm mb-1.5 block">Lien YouTube</Label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-12 rounded-xl bg-background"
                />
                {link.trim() && !isValidYoutubeUrl(link.trim()) && (
                  <p className="text-xs text-destructive mt-1.5">
                    Le lien doit contenir youtube.com ou youtu.be
                  </p>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || submitTrack.isPending}
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 bg-glow font-semibold text-base"
              >
                {submitTrack.isPending ? "Envoi..." : "Soumettre 🎵"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
