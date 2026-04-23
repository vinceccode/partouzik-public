import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2 } from "lucide-react";

interface Props {
  videoId: string;
  /** Called when the video finishes playing. */
  onEnded?: () => void;
  /** Called with duration (seconds) when known. */
  onDuration?: (seconds: number) => void;
}

export default function YouTubePlayer({ videoId, onEnded, onDuration }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onEndedRef = useRef(onEnded);
  const onDurationRef = useRef(onDuration);
  const [muted, setMuted] = useState(true);

  // Keep latest callbacks without re-creating the player
  useEffect(() => {
    onEndedRef.current = onEnded;
    onDurationRef.current = onDuration;
  }, [onEnded, onDuration]);

  // Reset to muted when track changes (browsers block unmuted autoplay)
  useEffect(() => {
    setMuted(true);
  }, [videoId]);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  const src = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: "1",
      playsinline: "1",
      mute: muted ? "1" : "0",
      enablejsapi: "1",
      origin,
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [videoId, origin, muted]);

  // Subscribe to YouTube player state changes via postMessage
  useEffect(() => {
    function postToPlayer(message: object) {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      win.postMessage(JSON.stringify(message), "*");
    }

    function sendListening() {
      postToPlayer({ event: "listening", id: videoId, channel: "widget" });
      postToPlayer({
        event: "command",
        func: "addEventListener",
        args: ["onStateChange"],
        id: videoId,
        channel: "widget",
      });
      postToPlayer({
        event: "command",
        func: "getDuration",
        id: videoId,
        channel: "widget",
      });
    }

    function handleMessage(event: MessageEvent) {
      if (event.origin !== "https://www.youtube.com") return;
      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.event === "onStateChange" && data?.info === 0) {
          onEndedRef.current?.();
        }
        if (data?.event === "infoDelivery" && data?.info?.duration) {
          onDurationRef.current?.(data.info.duration);
        }
      } catch {
        /* noop */
      }
    }

    window.addEventListener("message", handleMessage);

    const iframe = iframeRef.current;
    iframe?.addEventListener("load", sendListening);
    const t1 = setTimeout(sendListening, 500);
    const t2 = setTimeout(sendListening, 1500);

    return () => {
      window.removeEventListener("message", handleMessage);
      iframe?.removeEventListener("load", sendListening);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [videoId, muted]);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <iframe
        ref={iframeRef}
        src={src}
        width="100%"
        height="200"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title="YouTube player"
        frameBorder={0}
      />
      {muted && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
          <button
            onClick={() => setMuted(false)}
            className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-lg bg-glow hover:bg-primary/90 transition-colors"
          >
            <Volume2 className="h-5 w-5" />
            Activer le son
          </button>
        </div>
      )}
    </div>
  );
}
