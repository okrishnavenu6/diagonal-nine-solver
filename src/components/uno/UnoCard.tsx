import { cn } from "@/lib/utils";
import type { UnoCard as TCard } from "@/utils/unoTypes";

const colorClass: Record<string, string> = {
  red: "bg-red-600 text-white",
  yellow: "bg-yellow-400 text-black",
  green: "bg-green-600 text-white",
  blue: "bg-blue-600 text-white",
  wild: "bg-gradient-to-br from-red-500 via-yellow-400 to-blue-600 text-white",
};

const symbolFor = (v: string) => {
  switch (v) {
    case "skip": return "⊘";
    case "reverse": return "⇄";
    case "draw2": return "+2";
    case "wild": return "★";
    case "wild_draw4": return "+4";
    default: return v;
  }
};

interface Props {
  card?: TCard | null;
  faceDown?: boolean;
  playable?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const UnoCard = ({ card, faceDown, playable, onClick, size = "md", className }: Props) => {
  const sizes = {
    sm: "w-10 h-14 text-base",
    md: "w-14 h-20 text-xl",
    lg: "w-20 h-28 text-3xl",
  };

  if (faceDown || !card) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "rounded-lg border-2 border-white/20 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center font-bold text-white shadow-lg",
          sizes[size],
          onClick && "cursor-pointer hover:scale-105 transition-transform",
          className,
        )}
      >
        UNO
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "rounded-lg border-2 border-white/30 flex items-center justify-center font-extrabold shadow-lg select-none",
        colorClass[card.color],
        sizes[size],
        playable && "ring-2 ring-offset-2 ring-primary animate-pulse cursor-pointer hover:-translate-y-2 transition-transform",
        !playable && onClick && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      {symbolFor(card.value)}
    </button>
  );
};
