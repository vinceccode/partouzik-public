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

async function fetchYoutubeTitle(url: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.title ?? null;
  } catch {
    return null;
  }
}

export default function SubmitTrackDialog({ open, onClose, sessionId }: Props) {
  const [link, setLink] = useState("");
  const submitTrack = useSubmitTrack();

  const linkTrimmed = link.trim();
  const linkValid = isValidYoutubeUrl(linkTrimmed);
  const canSubmit = linkTrimmed.length > 0 && linkValid;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      // Try to fetch the real title; fall back to the URL itself
      const fetchedTitle = await fetchYoutubeTitle(linkTrimmed);
      const trackName = fetchedTitle?.trim() || linkTrimmed;

      await submitTrack.mutateAsync({
        sessionId,
        trackName,
        platform: "youtube",
        platformUrl: linkTrimmed,
      });
      toast({ title: "Track soumise ! 🎵" });
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm overflow-y-auto p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 my-auto max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" /> Soumettre une musique
              </h2>
              <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-sm mb-1.5 block">Lien YouTube</Label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-12 rounded-xl bg-background"
                />
                {linkTrimmed && !linkValid && (
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
