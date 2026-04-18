import { supabase } from "@/integrations/supabase/client";

/**
 * Advance the turn rotation: mark current as played, next as current_turn,
 * and the one after as upcoming_turn. Safe to call multiple times — it
 * looks up state freshly from the DB.
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

  await supabase
    .from("session_participants")
    .update({ turn_status: "played" as any })
    .eq("id", participants[currentIdx].id);

  const nextIdx = (currentIdx + 1) % participants.length;
  await supabase
    .from("session_participants")
    .update({ turn_status: "current_turn" as any })
    .eq("id", participants[nextIdx].id);

  const upcomingIdx = (nextIdx + 1) % participants.length;
  if (upcomingIdx !== nextIdx) {
    await supabase
      .from("session_participants")
      .update({ turn_status: "upcoming_turn" as any })
      .eq("id", participants[upcomingIdx].id);
  }
}
