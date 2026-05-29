// deno-lint-ignore-file no-explicit-any
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  buildDeck, shuffle, isPlayable, hasPlayable, nextSeat,
  ELIMINATION_THRESHOLD, Card,
} from "../_shared/uno.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashPass(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function getUser(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "");
  const { data } = await supabase.auth.getUser(token);
  return data.user;
}

async function loadState(roomId: string) {
  const [{ data: room }, { data: players }] = await Promise.all([
    supabase.from("uno_rooms").select("*").eq("id", roomId).single(),
    supabase.from("uno_players").select("*").eq("room_id", roomId).order("seat"),
  ]);
  return { room, players: players ?? [] };
}

async function logMove(roomId: string, seat: number, action: string, payload: any) {
  await supabase.from("uno_moves").insert({ room_id: roomId, seat, action, payload });
}

// reshuffle discard back into deck when empty
function reshuffleIfNeeded(deck: Card[], top: Card): Card[] {
  if (deck.length > 0) return deck;
  return shuffle(buildDeck()).filter(c => c.id !== top.id);
}

async function handleCreate(userId: string, body: any) {
  const { username, maxPlayers, passcode } = body;
  const code = genCode();
  const { data: room, error } = await supabase.from("uno_rooms").insert({
    code,
    host_id: userId,
    max_players: Math.max(2, Math.min(6, maxPlayers || 4)),
    has_passcode: !!passcode,
    passcode_hash: passcode ? await hashPass(passcode) : null,
  }).select().single();
  if (error) throw error;
  await supabase.from("uno_players").insert({
    room_id: room.id, user_id: userId, username, seat: 0,
  });
  return { room };
}

async function handleJoin(userId: string, body: any) {
  const { code, username, passcode } = body;
  const { data: room } = await supabase.from("uno_rooms").select("*").eq("code", code).single();
  if (!room) throw new Error("Room not found");
  if (room.status !== "waiting") throw new Error("Game already started");
  if (room.has_passcode && room.passcode_hash !== await hashPass(passcode || "")) {
    throw new Error("Wrong passcode");
  }
  const { data: existing } = await supabase.from("uno_players")
    .select("*").eq("room_id", room.id).eq("user_id", userId).maybeSingle();
  if (existing) return { room };
  const { data: players } = await supabase.from("uno_players").select("seat").eq("room_id", room.id);
  if ((players?.length || 0) >= room.max_players) throw new Error("Room full");
  const usedSeats = new Set((players || []).map(p => p.seat));
  let seat = 0;
  while (usedSeats.has(seat)) seat++;
  await supabase.from("uno_players").insert({
    room_id: room.id, user_id: userId, username, seat,
  });
  return { room };
}

async function handleStart(userId: string, body: any) {
  const { roomId } = body;
  const { room, players } = await loadState(roomId);
  if (!room || room.host_id !== userId) throw new Error("Not host");
  if (room.status !== "waiting") throw new Error("Already started");
  if (players.length < 2) throw new Error("Need at least 2 players");

  let deck = shuffle(buildDeck());
  // deal 7
  const hands: Record<string, Card[]> = {};
  for (const p of players) hands[p.id] = [];
  for (let k = 0; k < 7; k++) {
    for (const p of players) {
      hands[p.id].push(deck.shift()!);
    }
  }
  // first discard — avoid wild_draw4 as first
  let top: Card;
  do {
    top = deck.shift()!;
    if (top.value === "wild_draw4") { deck.push(top); deck = shuffle(deck); top = deck.shift()!; }
  } while (top.value === "wild_draw4");
  // if first is wild, pick a color randomly
  if (top.color === "wild") {
    const colors = ["red", "yellow", "green", "blue"] as const;
    top = { ...top, color: colors[Math.floor(Math.random() * 4)] };
  }

  await supabase.from("uno_rooms").update({
    status: "playing", deck, discard_top: top, current_seat: 0, direction: 1,
    draw_stack: 0, started_at: new Date().toISOString(),
  }).eq("id", roomId);
  for (const p of players) {
    await supabase.from("uno_players").update({ hand: hands[p.id] }).eq("id", p.id);
  }
  await logMove(roomId, -1, "start", null);
  return { ok: true };
}

async function endGameIfNeeded(roomId: string) {
  const { room, players } = await loadState(roomId);
  if (!room) return;
  const alive = players.filter(p => !p.eliminated);
  const winners = alive.filter(p => (p.hand as any[]).length === 0);
  if (winners.length > 0 || alive.length <= 1) {
    const winner = winners[0] || alive[0];
    await supabase.from("uno_rooms").update({
      status: "finished",
      winner_seat: winner?.seat ?? null,
      finished_at: new Date().toISOString(),
    }).eq("id", roomId);
    await logMove(roomId, winner?.seat ?? -1, "win", { username: winner?.username });
  }
}

async function handlePlay(userId: string, body: any) {
  const { roomId, cardId, chosenColor } = body;
  const { room, players } = await loadState(roomId);
  if (!room || room.status !== "playing") throw new Error("Game not active");
  const me = players.find(p => p.user_id === userId);
  if (!me) throw new Error("Not in room");
  if (me.seat !== room.current_seat) throw new Error("Not your turn");
  if (me.eliminated) throw new Error("Eliminated");

  const hand = me.hand as Card[];
  const idx = hand.findIndex(c => c.id === cardId);
  if (idx < 0) throw new Error("Card not in hand");
  const card = hand[idx];
  const top = room.discard_top as Card;
  if (!isPlayable(card, top, room.draw_stack)) throw new Error("Illegal card");
  if ((card.color === "wild") && !["red", "yellow", "green", "blue"].includes(chosenColor)) {
    throw new Error("Choose color");
  }

  const newHand = [...hand.slice(0, idx), ...hand.slice(idx + 1)];
  const playedTop: Card = card.color === "wild" ? { ...card, color: chosenColor } : card;

  let direction = room.direction;
  let drawStack = room.draw_stack;
  let nextIdx = room.current_seat;

  const alive = players.map(p => ({ ...p, eliminated: p.eliminated }));
  // mark me with new hand for next-seat calc
  alive[alive.findIndex(p => p.id === me.id)].hand = newHand;

  if (card.value === "draw2") drawStack += 2;
  else if (card.value === "wild_draw4") drawStack += 4;
  else if (card.value === "reverse") {
    direction = -direction;
    if (alive.filter(p => !p.eliminated).length === 2) {
      // acts as skip
      nextIdx = nextSeat(nextIdx, direction, alive);
    }
  } else if (card.value === "skip") {
    nextIdx = nextSeat(nextIdx, direction, alive);
  }

  // Save player hand
  await supabase.from("uno_players").update({
    hand: newHand,
    said_uno: newHand.length === 1 ? me.said_uno : false,
  }).eq("id", me.id);

  // Win check
  if (newHand.length === 0) {
    await supabase.from("uno_rooms").update({
      discard_top: playedTop, draw_stack: drawStack, direction,
    }).eq("id", roomId);
    await logMove(roomId, me.seat, "play", { card: playedTop });
    await endGameIfNeeded(roomId);
    return { ok: true };
  }

  // advance
  nextIdx = nextSeat(nextIdx, direction, alive);
  await supabase.from("uno_rooms").update({
    discard_top: playedTop, draw_stack: drawStack, direction, current_seat: nextIdx,
  }).eq("id", roomId);
  await logMove(roomId, me.seat, "play", { card: playedTop });
  return { ok: true };
}

async function handleDraw(userId: string, body: any) {
  const { roomId } = body;
  const { room, players } = await loadState(roomId);
  if (!room || room.status !== "playing") throw new Error("Game not active");
  const me = players.find(p => p.user_id === userId);
  if (!me || me.seat !== room.current_seat) throw new Error("Not your turn");

  let deck = room.deck as Card[];
  let top = room.discard_top as Card;
  let hand = [...(me.hand as Card[])];
  let drawStack = room.draw_stack;

  if (drawStack > 0) {
    // forced draw from stack
    for (let i = 0; i < drawStack; i++) {
      if (deck.length === 0) deck = reshuffleIfNeeded(deck, top);
      hand.push(deck.shift()!);
    }
    drawStack = 0;
  } else {
    // Draw until playable (No Mercy: must draw until you can play, max safety 30)
    let safety = 0;
    while (safety++ < 30) {
      if (deck.length === 0) deck = reshuffleIfNeeded(deck, top);
      const c = deck.shift()!;
      hand.push(c);
      if (isPlayable(c, top, 0)) break;
    }
  }

  // Elimination check
  let eliminated = me.eliminated;
  if (hand.length >= ELIMINATION_THRESHOLD) eliminated = true;

  await supabase.from("uno_players").update({ hand, eliminated }).eq("id", me.id);

  // Advance turn
  const alive = players.map(p => p.id === me.id ? { ...p, hand, eliminated } : p);
  const nextIdx = nextSeat(room.current_seat, room.direction, alive);
  await supabase.from("uno_rooms").update({
    deck, draw_stack: drawStack, current_seat: nextIdx,
  }).eq("id", roomId);
  await logMove(roomId, me.seat, "draw", { count: hand.length - (me.hand as Card[]).length });
  await endGameIfNeeded(roomId);
  return { ok: true };
}

async function handleCallUno(userId: string, body: any) {
  const { roomId } = body;
  const { players } = await loadState(roomId);
  const me = players.find(p => p.user_id === userId);
  if (!me) throw new Error("Not in room");
  await supabase.from("uno_players").update({ said_uno: true }).eq("id", me.id);
  await logMove(roomId, me.seat, "uno", null);
  return { ok: true };
}

async function handleLeave(userId: string, body: any) {
  const { roomId } = body;
  await supabase.from("uno_players").delete().eq("room_id", roomId).eq("user_id", userId);
  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const user = await getUser(req);
    if (!user) throw new Error("Not authenticated");
    const body = await req.json();
    const action = body.action;
    let result;
    switch (action) {
      case "create": result = await handleCreate(user.id, body); break;
      case "join": result = await handleJoin(user.id, body); break;
      case "start": result = await handleStart(user.id, body); break;
      case "play": result = await handlePlay(user.id, body); break;
      case "draw": result = await handleDraw(user.id, body); break;
      case "uno": result = await handleCallUno(user.id, body); break;
      case "leave": result = await handleLeave(user.id, body); break;
      default: throw new Error("Unknown action");
    }
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
