import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, SkipForward, Users, Music, Crown, Clock, Share2, QrCode, Copy, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSession, useSessionParticipants, useSessionTracks, useStartSession, useSubmitTrack } from "@/hooks/useSessions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import SubmitTrackDialog from "@/components/SubmitTrackDialog";
import YouTubePlayer from "@/components/YouTubePlayer";
import { advanceTurn } from "@/lib/sessionTurns";
import { useQueryClient } from "@tanstack/react-query";

const platformIcons: Record<string, string> = {
  spotify: "🟢",
  apple_music: "🍎",
  youtube: "🔴",
  other: "🎵",
};

function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

const turnStatusLabel: Record<string, string> = {
  waiting: "Waiting",
  upcoming_turn: "Up Next",
  current_turn: "Your Turn!",
  skipped: "Skipped",
  played: "Played",
};

const turnStatusColor: Record<string, string> = {
  waiting: "text-muted-foreground",
  upcoming_turn: "text-accent",
  current_turn: "text-primary",
  skipped: "text-destructive",
  played: "text-muted-foreground",
};

const SessionLive = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: session, refetch: refetchSession } = useSession(id!);
  const { data: participants = [], refetch: refetchParticipants } = useSessionParticipants(id!);
  const { data: tracks = [], refetch: refetchTracks } = useSessionTracks(id!);
  const startSession = useStartSession();
  const [showSubmit, setShowSubmit] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const qc = useQueryClient();
  const advancedForTrackRef = useRef<string | null>(null);

  const isAdmin = session?.created_by === user?.id;
  const myParticipant = participants.find((p: any) => p.user_id === user?.id);
  const isMyTurn = myParticipant?.turn_status === "current_turn";
  const isUpcoming = myParticipant?.turn_status === "upcoming_turn";
  const currentPlayer = participants.find((p: any) => p.turn_status === "current_turn");

  // The track currently playing = latest track submitted by the current_turn player
  const currentPlayerTracks = currentPlayer
    ? tracks.filter((t: any) => t.submitted_by === currentPlayer.user_id)
    : [];
  const currentTrack = currentPlayerTracks.length > 0
    ? currentPlayerTracks[currentPlayerTracks.length - 1]
    : null;
  const currentTrackOrder = currentTrack?.play_order ?? 0;

  // A participant has submitted for this round if:
  //  - they are current_turn AND have a track (currentTrack exists)
  //  - they are upcoming_turn (or other) AND their latest track has play_order > currentTrackOrder
  const hasSubmittedThisRound = (p: any) => {
    const userTracks = tracks.filter((t: any) => t.submitted_by === p.user_id);
    if (userTracks.length === 0) return false;
    const latest = userTracks[userTracks.length - 1];
    if (p.turn_status === "current_turn") return !!currentTrack;
    return latest.play_order > currentTrackOrder;
  };

  const mySubmitted = myParticipant ? hasSubmittedThisRound(myParticipant) : false;
  const canSubmit = (isMyTurn || isUpcoming) && !mySubmitted;

  // Realtime subscription
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`session-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "session_participants", filter: `session_id=eq.${id}` }, () => {
        refetchParticipants();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tracks", filter: `session_id=eq.${id}` }, () => {
        refetchTracks();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions", filter: `id=eq.${id}` }, () => {
        refetchSession();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const handleStart = async () => {
    await startSession.mutateAsync(id!);
  };

  const inviteUrl = session ? `${window.location.origin}/join/${session.invite_token}` : "";

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast({ title: "Copied!", description: "Invite link copied to clipboard" });
  };

  if (!session) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-4 pt-4 pb-4">
        <button
          onClick={() => navigate("/sessions")}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-display font-bold">{session.name}</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowShare(!showShare)}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
              session.status === "active" ? "bg-primary/10 text-primary" :
              session.status === "waiting" ? "bg-muted text-muted-foreground" :
              "bg-destructive/10 text-destructive"
            }`}>
              {session.status}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {participants.length}
            </span>
          </div>
        </motion.div>

        {/* Share panel */}
        <AnimatePresence>
          {showShare && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="rounded-2xl bg-card border border-border p-4">
                <p className="text-xs text-muted-foreground mb-2">Share this link to invite friends:</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={inviteUrl}
                    className="flex-1 bg-muted rounded-xl px-3 py-2 text-xs font-mono truncate"
                  />
                  <Button size="sm" variant="outline" onClick={copyInvite} className="gap-1">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waiting Room */}
        {session.status === "waiting" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl bg-card border border-border p-6 text-center"
          >
            <Clock className="h-10 w-10 mx-auto mb-3 text-primary animate-pulse" />
            <h2 className="font-display font-bold text-lg mb-1">Waiting Room</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {isAdmin ? `${participants.length} people joined. Start when ready!` : "Waiting for the admin to start the session..."}
            </p>
            {isAdmin && (
              <Button
                onClick={handleStart}
                disabled={startSession.isPending || participants.length < 2}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 bg-glow rounded-2xl h-12 font-semibold"
              >
                <Play className="h-4 w-4" /> Start Session
              </Button>
            )}
          </motion.div>
        )}

        {/* Now Playing (active session) */}
        {session.status === "active" && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 rounded-2xl bg-card border border-primary/20 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Music className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Now Playing</span>
              </div>
              {currentTrack ? (
                <div>
                  <h3 className="font-display font-bold text-lg">{currentTrack.track_name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {platformIcons[currentTrack.platform]} {currentTrack.platform.replace("_", " ")} — by {currentTrack.submitter?.display_name}
                  </p>
                  {currentTrack.platform_url && (() => {
                    const videoId = getYoutubeId(currentTrack.platform_url);
                    if (!videoId) return null;
                    return (
                      <YouTubePlayer
                        videoId={videoId}
                        onEnded={async () => {
                          // Only the admin advances the turn to avoid race conditions
                          if (!isAdmin) return;
                          if (advancedForTrackRef.current === currentTrack.id) return;
                          advancedForTrackRef.current = currentTrack.id;
                          try {
                            await advanceTurn(id!);
                            qc.invalidateQueries({ queryKey: ["session-participants"] });
                          } catch (e: any) {
                            advancedForTrackRef.current = null;
                            toast({ title: "Erreur", description: e.message, variant: "destructive" });
                          }
                        }}
                      />
                    );
                  })()}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Waiting for first track...</p>
              )}
            </motion.div>

            {/* Your turn notification */}
            {isMyTurn && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-2xl bg-primary/10 border border-primary p-5 text-center"
              >
                <h3 className="font-display font-bold text-lg text-primary mb-2">🎵 It's Your Turn!</h3>
                <p className="text-sm text-muted-foreground mb-3">Submit a track for everyone to listen to</p>
                <Button
                  onClick={() => setShowSubmit(true)}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 bg-glow rounded-2xl h-12 font-semibold"
                >
                  <Music className="h-4 w-4" /> Submit Track
                </Button>
              </motion.div>
            )}

            {isUpcoming && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-2xl bg-accent/10 border border-accent/30 p-4 text-center"
              >
                <p className="font-semibold text-accent text-sm">⏳ You're up next! Get a track ready...</p>
              </motion.div>
            )}

            {/* Admin controls */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 flex gap-2"
              >
                <Button
                  variant="outline"
                  className="flex-1 gap-1 rounded-xl"
                  onClick={async () => {
                    if (!currentPlayer) return;
                    try {
                      // Mark current as skipped first, then advance.
                      await supabase
                        .from("session_participants")
                        .update({ turn_status: "current_turn" as any })
                        .eq("id", currentPlayer.id); // ensure status is current_turn for advanceTurn
                      await advanceTurn(id!);
                      // Re-mark the just-played one as "skipped" instead of "played"
                      await supabase
                        .from("session_participants")
                        .update({ turn_status: "skipped" as any })
                        .eq("id", currentPlayer.id);
                      qc.invalidateQueries({ queryKey: ["session-participants"] });
                    } catch (e: any) {
                      toast({ title: "Erreur", description: e.message, variant: "destructive" });
                    }
                  }}
                >
                  <SkipForward className="h-4 w-4" /> Skip Turn
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Participants */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
            <Users className="h-4 w-4" /> Queue ({participants.length})
          </h2>
          <div className="flex flex-col gap-2">
            {participants.map((p: any, idx: number) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                  p.turn_status === "current_turn"
                    ? "border-primary bg-primary/5"
                    : p.turn_status === "upcoming_turn"
                    ? "border-accent/30 bg-accent/5"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-display font-bold text-sm">
                  {p.profile?.display_name?.[0] || "?"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{p.profile?.display_name || "Unknown"}</p>
                  <p className={`text-xs ${turnStatusColor[p.turn_status]}`}>
                    {turnStatusLabel[p.turn_status]}
                  </p>
                </div>
                {session.created_by === p.user_id && <Crown className="h-4 w-4 text-primary" />}
                <span className="text-xs text-muted-foreground">#{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Track History */}
        {tracks.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
              <Music className="h-4 w-4" /> Played ({tracks.length})
            </h2>
            <div className="flex flex-col gap-2">
              {[...tracks].reverse().map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 rounded-xl bg-card border border-border p-3">
                  <span className="text-lg">{platformIcons[t.platform]}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{t.track_name}</p>
                    <p className="text-xs text-muted-foreground">by {t.submitter?.display_name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">#{t.play_order}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Track Dialog */}
      <SubmitTrackDialog
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        sessionId={id!}
      />
    </MobileLayout>
  );
};

export default SessionLive;
