// Shared UNO engine (No Mercy rules)
export type Color = "red" | "yellow" | "green" | "blue" | "wild";
export type Value =
  | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
  | "skip" | "reverse" | "draw2" | "wild" | "wild_draw4";

export interface Card {
  id: string;
  color: Color;
  value: Value;
}

export const ELIMINATION_THRESHOLD = 25;

export function buildDeck(): Card[] {
  const colors: Color[] = ["red", "yellow", "green", "blue"];
  const deck: Card[] = [];
  let i = 0;
  const push = (color: Color, value: Value) =>
    deck.push({ id: `c${i++}`, color, value });
  for (const c of colors) {
    push(c, "0");
    for (let n = 1; n <= 9; n++) {
      push(c, String(n) as Value);
      push(c, String(n) as Value);
    }
    push(c, "skip"); push(c, "skip");
    push(c, "reverse"); push(c, "reverse");
    push(c, "draw2"); push(c, "draw2");
  }
  for (let k = 0; k < 4; k++) {
    push("wild", "wild");
    push("wild", "wild_draw4");
  }
  return deck;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// When drawStack > 0, only stackable draw cards may be played.
export function isPlayable(card: Card, top: Card, drawStack: number): boolean {
  if (drawStack > 0) {
    return card.value === "draw2" || card.value === "wild_draw4";
  }
  if (card.color === "wild") return true;
  if (top.color === "wild") return true; // top wild after color chosen sets top.color
  return card.color === top.color || card.value === top.value;
}

export function hasPlayable(hand: Card[], top: Card, drawStack: number): boolean {
  return hand.some(c => isPlayable(c, top, drawStack));
}

export function nextSeat(
  current: number, direction: number, players: { eliminated: boolean }[]
): number {
  const n = players.length;
  let s = current;
  for (let i = 0; i < n; i++) {
    s = (s + direction + n) % n;
    if (!players[s].eliminated) return s;
  }
  return current;
}
