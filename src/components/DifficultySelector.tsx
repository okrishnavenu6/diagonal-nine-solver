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
    <div className="liquid-glass rounded-3xl shadow-2xl p-4 md:p-6 space-y-4 border-2 border-primary/40 hover:border-primary/60 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center shadow-lg hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-110 hover:rotate-12 cursor-pointer group">
          <Flame className="w-6 h-6 text-primary-foreground group-hover:animate-pulse" />
        </div>
        <h3 className="font-black text-foreground text-lg uppercase tracking-wider">Difficulty</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {difficulties.map(({ value, label, icon: Icon }) => {
          const isActive = currentDifficulty === value;
          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className={cn(
                "relative p-4 rounded-xl font-bold text-sm transition-all duration-200 border-2 overflow-hidden group/btn",
                "transform active:scale-95",
                isActive
                  ? "bg-gradient-to-br from-primary/50 via-primary/35 to-primary/25 border-primary shadow-[0_0_40px_rgba(99,102,241,0.7),0_0_80px_rgba(99,102,241,0.3)] text-primary-foreground scale-[1.08]"
                  : "bg-card/30 border-primary/30 hover:border-primary/50 hover:bg-primary/15 text-foreground hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:scale-105"
              )}
            >
              <div className="relative z-10 flex flex-col items-center gap-2">
                <Icon className={cn("w-6 h-6 transition-all", isActive && "animate-bounce-subtle drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]")} />
                <span className="uppercase tracking-wider">{label}</span>
                {isActive && (
                  <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-accent rounded-full text-[10px] font-black animate-pulse shadow-lg">
                    ACTIVE
                  </span>
                )}
              </div>
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 blur-xl animate-pulse" />
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
        className="relative w-full bg-gradient-to-r from-primary via-accent to-primary hover:opacity-90 text-primary-foreground font-black py-6 rounded-xl shadow-lg hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all group overflow-hidden hover:scale-[1.05] active:scale-100"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500 relative z-10" />
        <span className="relative z-10">NEW GAME</span>
      </Button>
    </div>
  );
};
