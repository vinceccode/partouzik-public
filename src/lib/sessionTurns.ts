import { supabase } from "@/integrations/supabase/client";

/**
 * Advance the turn rotation:
 *  - current player → "played"
 *  - next player    → "current_turn"
 *  - player after   → "upcoming_turn"
 *  - everyone else (not yet played) → "waiting"
 *
 * Safe to call multiple times — state is read fresh from the DB.
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

  // Compute the desired status for every participant in one pass so we
  // don't leave stale "upcoming_turn" / "current_turn" rows behind.
  const updates = participants.map((p: any, idx: number) => {
    let turn_status: string;
    if (idx === currentIdx) {
      turn_status = "played";
    } else if (idx === nextIdx) {
      turn_status = "current_turn";
    } else if (idx === upcomingIdx && upcomingIdx !== nextIdx) {
      turn_status = "upcoming_turn";
    } else if (p.turn_status === "played" || p.turn_status === "skipped") {
      // preserve history
      turn_status = p.turn_status;
    } else {
      turn_status = "waiting";
    }
    return { id: p.id, turn_status };
  });

  await Promise.all(
    updates.map((u) =>
      supabase
        .from("session_participants")
        .update({ turn_status: u.turn_status as any })
        .eq("id", u.id)
    )
  );
}
