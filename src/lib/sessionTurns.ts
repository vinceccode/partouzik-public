import { supabase } from "@/integrations/supabase/client";

/**
 * Advance the turn rotation only after the current track finishes:
 *  - reset everyone to "waiting"
 *  - next player becomes "current_turn"
 *  - player after that becomes "upcoming_turn"
 */
export async function advanceTurn(sessionId: string) {
  const { data: participants } = await supabase
    .from("session_participants")
    .select("*")
    .eq("session_id", sessionId)
    .order("turn_order", { ascending: true });

  if (!participants || participants.length === 0) return;

  const currentIdx = participants.findIndex(
    (p: any) => p.turn_status === "current_turn"
  );
  if (currentIdx < 0) return;

  const nextIdx = (currentIdx + 1) % participants.length;
  const upcomingIdx = (nextIdx + 1) % participants.length;

  await supabase
    .from("session_participants")
    .update({ turn_status: "waiting" as any })
    .eq("session_id", sessionId);

  await supabase
    .from("session_participants")
    .update({ turn_status: "current_turn" as any })
    .eq("id", participants[nextIdx].id);

  if (upcomingIdx !== nextIdx) {
    await supabase
      .from("session_participants")
      .update({ turn_status: "upcoming_turn" as any })
      .eq("id", participants[upcomingIdx].id);
  }
}
