import { Difficulty } from "@/utils/sudokuGenerator";
import { cn } from "@/lib/utils";

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

const difficulties: { value: Difficulty; label: string; icon: string }[] = [
  { value: "easy", label: "Easy", icon: "⚡" },
  { value: "medium", label: "Medium", icon: "🔥" },
  { value: "hard", label: "Hard", icon: "💀" },
  { value: "expert", label: "Expert", icon: "👑" },
];

export const DifficultySelector = ({ currentDifficulty, onSelect }: DifficultySelectorProps) => {
  return (
    <div className="group relative bg-gradient-to-br from-card via-card to-card/50 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-5 md:p-7 space-y-5 border-2 border-primary/40 backdrop-blur-2xl hover:border-primary/60 transition-all duration-500 hover:shadow-[0_0_60px_rgba(var(--primary-rgb),0.4)]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl pointer-events-none" />
      
      <div className="relative flex items-center justify-center gap-3">
        <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-accent/50 to-accent rounded-full" />
        <h2 className="text-2xl md:text-3xl font-black text-center bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent drop-shadow-lg">
          DIFFICULTY
        </h2>
        <div className="h-1 flex-1 bg-gradient-to-l from-transparent via-accent/50 to-accent rounded-full" />
      </div>
      
      <div className="relative space-y-3">
        {difficulties.map((diff) => (
          <button
            key={diff.value}
            onClick={() => onSelect(diff.value)}
            className={cn(
              "w-full py-4 px-5 rounded-2xl font-bold text-left transition-all duration-300 transform hover:scale-[1.05]",
              "flex items-center justify-between border-2 shadow-lg relative overflow-hidden group/btn",
              {
                "bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:shadow-[0_0_35px_rgba(99,102,241,0.8)] border-primary/50 scale-[1.03]": currentDifficulty === diff.value,
                "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary border-secondary/50": currentDifficulty !== diff.value,
              }
            )}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000", {
              "opacity-100": currentDifficulty === diff.value,
              "opacity-0": currentDifficulty !== diff.value,
            })} />
            <span className="flex items-center gap-3 relative z-10">
              <span className={cn("text-2xl transition-transform duration-300 group-hover/btn:scale-125", {
                "animate-pulse": currentDifficulty === diff.value,
              })}>
                {diff.icon}
              </span>
              <span className="text-lg drop-shadow-lg">{diff.label}</span>
            </span>
            {currentDifficulty === diff.value && (
              <span className="relative z-10 text-xs bg-accent text-accent-foreground rounded-full px-3 py-1.5 font-black shadow-lg animate-bounce-subtle">
                ACTIVE
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
