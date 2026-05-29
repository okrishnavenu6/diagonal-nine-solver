export type UnoColor = "red" | "yellow" | "green" | "blue" | "wild";
export type UnoValue =
  | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
  | "skip" | "reverse" | "draw2" | "wild" | "wild_draw4";

export interface UnoCard {
  id: string;
  color: UnoColor;
  value: UnoValue;
}

export interface UnoRoom {
  id: string;
  code: string;
  host_id: string;
  status: "waiting" | "playing" | "finished";
  max_players: number;
  has_passcode: boolean;
  current_seat: number;
  direction: number;
  draw_stack: number;
  discard_top: UnoCard | null;
  winner_seat: number | null;
}

export interface UnoPlayer {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  seat: number;
  hand: UnoCard[];
  said_uno: boolean;
  eliminated: boolean;
}

export function isPlayableClient(card: UnoCard, top: UnoCard | null, drawStack: number): boolean {
  if (!top) return false;
  if (drawStack > 0) return card.value === "draw2" || card.value === "wild_draw4";
  if (card.color === "wild") return true;
  return card.color === top.color || card.value === top.value;
}
