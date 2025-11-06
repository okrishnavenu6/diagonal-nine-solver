import { Zap, Flame, Skull, Crown, RefreshCw } from "lucide-react";
import { Difficulty } from "@/utils/sudokuGenerator";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
  onNewGame: () => void;
}

const difficulties = [
  { value: "easy" as Difficulty, label: "Easy", icon: Zap },
  { value: "medium" as Difficulty, label: "Medium", icon: Flame },
  { value: "hard" as Difficulty, label: "Hard", icon: Skull },
  { value: "expert" as Difficulty, label: "Expert", icon: Crown },
];

export const DifficultySelector = ({ currentDifficulty, onSelect, onNewGame }: DifficultySelectorProps) => {
  return (
    <div className="liquid-glass rounded-3xl shadow-2xl p-4 md:p-6 space-y-4 border-2 border-primary/40 hover:border-primary/60 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.4),0_20px_60px_rgba(99,102,241,0.3)] relative overflow-hidden group/diff transform-3d perspective-3d">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-[80px] animate-float pointer-events-none" />
      <div className="relative z-10 flex items-center gap-3 mb-4">
        <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center shadow-[0_8px_32px_rgba(99,102,241,0.4),0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.6),0_0_40px_rgba(99,102,241,0.5)] transition-all duration-300 hover:scale-110 hover:rotate-12 cursor-pointer group/icon">
          <div className="absolute -inset-1 bg-gradient-to-br from-primary via-accent to-primary opacity-0 group-hover/icon:opacity-50 blur-lg transition-all duration-300" />
          <Flame className="w-6 h-6 text-primary-foreground group-hover/icon:animate-pulse relative z-10" />
        </div>
        <h3 className="font-gaming font-black text-foreground text-lg uppercase tracking-[0.2em] drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">Difficulty</h3>
      </div>
      
      <div className="relative z-10 grid grid-cols-2 gap-3">
        {difficulties.map(({ value, label, icon: Icon }) => {
          const isActive = currentDifficulty === value;
          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className={cn(
                "relative p-4 rounded-xl font-display font-bold text-sm transition-all duration-150 border-2 overflow-hidden group/btn",
                "transform active:scale-95",
                isActive
                  ? "bg-gradient-to-br from-primary/50 via-primary/35 to-primary/25 border-primary shadow-[0_0_40px_rgba(99,102,241,0.7),0_0_80px_rgba(99,102,241,0.3),0_15px_40px_rgba(99,102,241,0.25)] text-primary-foreground scale-[1.08] translateY-[-2px]"
                  : "bg-card/30 border-primary/30 hover:border-primary/50 hover:bg-primary/15 text-foreground hover:shadow-[0_0_25px_rgba(99,102,241,0.4),0_10px_30px_rgba(99,102,241,0.2)] hover:scale-105 hover:translateY-[-2px]"
              )}
            >
              <div className="relative z-10 flex flex-col items-center gap-2">
                <Icon className={cn("w-6 h-6 transition-all", isActive && "animate-bounce-subtle drop-shadow-[0_0_15px_rgba(99,102,241,0.9)]")} />
                <span className="uppercase tracking-[0.15em]">{label}</span>
                {isActive && (
                  <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-accent rounded-full text-[10px] font-black animate-pulse shadow-[0_0_15px_rgba(239,65,60,0.8)] font-gaming">
                    ACTIVE
                  </span>
                )}
              </div>
              {isActive && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 blur-xl animate-pulse" />
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary via-accent to-primary opacity-30 blur-lg" />
                </>
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-700" />
              )}
            </button>
          );
        })}
      </div>

      <Button
        onClick={onNewGame}
        className="relative z-10 w-full bg-gradient-to-r from-primary via-accent to-primary hover:opacity-90 text-primary-foreground font-gaming font-black py-6 rounded-xl shadow-[0_0_35px_rgba(99,102,241,0.6),0_15px_40px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.8),0_20px_50px_rgba(99,102,241,0.4)] transition-all group overflow-hidden hover:scale-[1.05] hover:translateY-[-2px] active:scale-100 active:translateY-[0px]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        <div className="absolute -inset-1 bg-gradient-to-br from-primary via-accent to-primary opacity-0 group-hover:opacity-50 blur-lg transition-all duration-300" />
        <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500 relative z-10" />
        <span className="relative z-10 tracking-[0.15em]">NEW GAME</span>
      </Button>
    </div>
  );
};
