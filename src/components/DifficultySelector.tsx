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
    <div className="liquid-glass rounded-2xl shadow-2xl p-4 md:p-6 space-y-4 border border-primary/30 hover:border-primary/50 transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
          <Flame className="w-6 h-6 text-primary-foreground" />
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
                "relative p-4 rounded-xl font-bold text-sm transition-all duration-300 border-2",
                "hover:scale-105 active:scale-95 group/btn overflow-hidden",
                isActive
                  ? "bg-gradient-to-br from-primary/40 via-primary/30 to-primary/20 border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.6)] text-primary-foreground scale-105"
                  : "bg-card/30 border-primary/20 hover:border-primary/40 hover:bg-primary/10 text-foreground hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
              )}
            >
              <div className="relative z-10 flex flex-col items-center gap-2">
                <Icon className={cn("w-6 h-6", isActive ? "animate-bounce-subtle" : "")} />
                <span className="uppercase tracking-wider">{label}</span>
                {isActive && (
                  <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-accent rounded-full text-[10px] font-black animate-pulse-subtle">
                    ACTIVE
                  </span>
                )}
              </div>
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      <Button
        onClick={onNewGame}
        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-black py-6 rounded-xl shadow-lg hover:shadow-2xl transition-all group"
      >
        <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
        NEW GAME
      </Button>
    </div>
  );
};
