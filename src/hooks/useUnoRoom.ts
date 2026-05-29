import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UnoRoom, UnoPlayer } from "@/utils/unoTypes";

export function useUnoRoom(code: string | undefined) {
  const [room, setRoom] = useState<UnoRoom | null>(null);
  const [players, setPlayers] = useState<UnoPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!code) return;
    const { data: r } = await supabase
      .from("uno_rooms").select("*").eq("code", code).maybeSingle();
    if (!r) { setLoading(false); return; }
    setRoom(r as any);
    const { data: ps } = await supabase
      .from("uno_players").select("*").eq("room_id", r.id).order("seat");
    setPlayers((ps as any) || []);
    setLoading(false);
  }, [code]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!room?.id) return;
    const ch = supabase
      .channel(`uno-${room.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "uno_rooms", filter: `id=eq.${room.id}` },
        () => refresh())
      .on("postgres_changes",
        { event: "*", schema: "public", table: "uno_players", filter: `room_id=eq.${room.id}` },
        () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [room?.id, refresh]);

  return { room, players, loading, refresh };
}

export async function unoAction(action: string, payload: Record<string, any> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await supabase.functions.invoke("uno-action", {
    body: { action, ...payload },
    headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
  });
  if (res.error) throw res.error;
  if ((res.data as any)?.error) throw new Error((res.data as any).error);
  return res.data;
}
