import { useEffect, useMemo, useRef } from "react";

interface Props {
  videoId: string;
  /** Called when the video finishes playing. */
  onEnded?: () => void;
}

export default function YouTubePlayer({ videoId, onEnded }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onEndedRef = useRef(onEnded);

  // Keep latest callback without re-creating the player
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  const src = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: "1",
      playsinline: "1",
      enablejsapi: "1",
      origin,
      widget_referrer: origin,
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [videoId, origin]);

  // Subscribe to YouTube player state changes via postMessage
  useEffect(() => {
    function sendListening() {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      // Tell the embedded player we want to receive events
      win.postMessage(
        JSON.stringify({
          event: "listening",
          id: videoId,
          channel: "widget",
        }),
        "*"
      );
      win.postMessage(
        JSON.stringify({
          event: "command",
          func: "addEventListener",
          args: ["onStateChange"],
          id: videoId,
          channel: "widget",
        }),
        "*"
      );
    }

    function handleMessage(event: MessageEvent) {
      if (event.origin !== "https://www.youtube.com") return;
      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        // YT.PlayerState.ENDED === 0
        if (data?.event === "onStateChange" && data?.info === 0) {
          onEndedRef.current?.();
        }
      } catch {
        /* noop */
      }
    }

    window.addEventListener("message", handleMessage);

    const iframe = iframeRef.current;
    iframe?.addEventListener("load", sendListening);
    // Also send a few times in case the load event fired before we subscribed
    const t1 = setTimeout(sendListening, 500);
    const t2 = setTimeout(sendListening, 1500);

    return () => {
      window.removeEventListener("message", handleMessage);
      iframe?.removeEventListener("load", sendListening);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [videoId]);

  return (
    <div className="overflow-hidden rounded-2xl">
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
    </div>
  );
}
