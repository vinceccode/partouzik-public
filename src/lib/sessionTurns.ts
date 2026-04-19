import { supabase } from "@/integrations/supabase/client";

/**
 * Advance the turn rotation only after the current track finishes:
 *  - reset everyone to "waiting"
 *  - next player becomes "current_turn"
 *  - player after that becomes "upcoming_turn"
 *
 * If no player currently has "current_turn", we start from the beginning
 * (turn_order 0) so the rotation can kick off cleanly.
 */
export async function advanceTurn(sessionId: string) {
  const { data: participants } = await supabase
    .from("session_participants")
    .select("*")
    .eq("session_id", sessionId)
    .order("turn_order", { ascending: true });

  if (!participants || participants.length === 0) return;

  // Find current player - if none found, start from beginning (turn_order 0)
  let currentIdx = participants.findIndex(
    (p: any) => p.turn_status === "current_turn"
  );
  if (currentIdx < 0) currentIdx = 0;

  const nextIdx = (currentIdx + 1) % participants.length;
  const upcomingIdx = (nextIdx + 1) % participants.length;

  // Reset all to waiting first
  await supabase
    .from("session_participants")
    .update({ turn_status: "waiting" as any })
    .eq("session_id", sessionId);

  // Set next as current_turn
  await supabase
    .from("session_participants")
    .update({ turn_status: "current_turn" as any })
    .eq("id", participants[nextIdx].id);

  // Set upcoming
  if (upcomingIdx !== nextIdx) {
    await supabase
      .from("session_participants")
      .update({ turn_status: "upcoming_turn" as any })
      .eq("id", participants[upcomingIdx].id);
  }
}
