import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useMySessions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sessions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get sessions where user is participant or creator
      const { data: participantSessions } = await supabase
        .from("session_participants")
        .select("session_id")
        .eq("user_id", user!.id);

      const sessionIds = (participantSessions || []).map((p: any) => p.session_id);

      const { data, error } = await supabase
        .from("sessions")
        .select("*, session_participants(count)")
        .or(`id.in.(${sessionIds.join(",")}),created_by.eq.${user!.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ["session", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useSessionParticipants(sessionId: string) {
  return useQuery({
    queryKey: ["session-participants", sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_participants")
        .select("*, profile:profiles(*)")
        .eq("session_id", sessionId)
        .order("turn_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSessionTracks(sessionId: string) {
  return useQuery({
    queryKey: ["session-tracks", sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("*, submitter:profiles!tracks_submitted_by_fkey(*)")
        .eq("session_id", sessionId)
        .order("play_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ name, description, invitedFriendIds }: { name: string; description?: string; invitedFriendIds: string[] }) => {
      // Create session
      const { data: session, error } = await supabase
        .from("sessions")
        .insert({ name, description, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;

      // Add creator as first participant
      await supabase.from("session_participants").insert({
        session_id: session.id,
        user_id: user!.id,
        turn_order: 0,
      });

      // Add invited friends
      if (invitedFriendIds.length > 0) {
        await supabase.from("session_participants").insert(
          invitedFriendIds.map((friendId, i) => ({
            session_id: session.id,
            user_id: friendId,
            turn_order: i + 1,
          }))
        );
      }

      return session;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      // Set first participant to current_turn, second to upcoming_turn
      const { data: participants } = await supabase
        .from("session_participants")
        .select("*")
        .eq("session_id", sessionId)
        .order("turn_order");

      if (participants && participants.length > 0) {
        await supabase
          .from("session_participants")
          .update({ turn_status: "current_turn" as any })
          .eq("id", participants[0].id);

        if (participants.length > 1) {
          await supabase
            .from("session_participants")
            .update({ turn_status: "upcoming_turn" as any })
            .eq("id", participants[1].id);
        }
      }

      await supabase
        .from("sessions")
        .update({ status: "active" as any, started_at: new Date().toISOString() })
        .eq("id", sessionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["session"] });
      qc.invalidateQueries({ queryKey: ["session-participants"] });
    },
  });
}

export function useSubmitTrack() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ sessionId, trackName, platform, platformUrl }: {
      sessionId: string; trackName: string; platform: string; platformUrl?: string;
    }) => {
      // Get current play order
      const { data: tracks } = await supabase
        .from("tracks")
        .select("play_order")
        .eq("session_id", sessionId)
        .order("play_order", { ascending: false })
        .limit(1);

      const nextOrder = tracks && tracks.length > 0 ? tracks[0].play_order + 1 : 1;

      const { error } = await supabase.from("tracks").insert({
        session_id: sessionId,
        submitted_by: user!.id,
        track_name: trackName,
        platform: platform as any,
        platform_url: platformUrl,
        play_order: nextOrder,
      });
      if (error) throw error;

      // Advance the turn immediately so the submitted track becomes "Now Playing".
      const { advanceTurn } = await import("@/lib/sessionTurns");
      await advanceTurn(sessionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["session-tracks"] });
      qc.invalidateQueries({ queryKey: ["session-participants"] });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      // Delete dependent rows first (no DB cascade configured).
      const { error: tracksErr } = await supabase
        .from("tracks")
        .delete()
        .eq("session_id", sessionId);
      if (tracksErr) throw tracksErr;

      const { error: partsErr } = await supabase
        .from("session_participants")
        .delete()
        .eq("session_id", sessionId);
      if (partsErr) throw partsErr;

      const { error: sessErr } = await supabase
        .from("sessions")
        .delete()
        .eq("id", sessionId);
      if (sessErr) throw sessErr;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useJoinByToken() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (token: string) => {
      const { data: session, error: findError } = await supabase
        .from("sessions")
        .select("*")
        .eq("invite_token", token)
        .single();
      if (findError || !session) throw new Error("Session not found");

      // Check if already joined
      const { data: existing } = await supabase
        .from("session_participants")
        .select("id")
        .eq("session_id", session.id)
        .eq("user_id", user!.id);

      if (existing && existing.length > 0) return session;

      // Get max turn order
      const { data: parts } = await supabase
        .from("session_participants")
        .select("turn_order")
        .eq("session_id", session.id)
        .order("turn_order", { ascending: false })
        .limit(1);

      const nextOrder = parts && parts.length > 0 ? parts[0].turn_order + 1 : 0;

      await supabase.from("session_participants").insert({
        session_id: session.id,
        user_id: user!.id,
        turn_order: nextOrder,
      });

      return session;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}
