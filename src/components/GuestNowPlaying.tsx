import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface Props {
  trackName: string;
  submittedBy?: string;
  /** Reset progress when this changes (e.g. new track id). */
  trackKey: string;
  /** Estimated duration in seconds (default 3 minutes). */
  estimatedDuration?: number;
}

export default function GuestNowPlaying({
  trackName,
  submittedBy,
  trackKey,
  estimatedDuration = 180,
}: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [trackKey]);

  const progress = Math.min((elapsed / estimatedDuration) * 100, 100);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <motion.span
          className="h-2.5 w-2.5 rounded-full bg-primary"
          animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          En cours de lecture
        </span>
      </div>

      <div>
        <h3 className="font-display font-bold text-lg leading-tight">{trackName}</h3>
        {submittedBy && (
          <p className="text-sm text-muted-foreground">par {submittedBy}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Progress value={progress} className="h-1.5" />
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          <span>{fmt(elapsed)}</span>
          <span>{fmt(estimatedDuration)}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground italic">
        🔊 Le son est joué depuis l'appareil de l'hôte
      </p>
    </div>
  );
}
