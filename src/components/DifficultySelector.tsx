import { Button } from "@/components/ui/button";
import { Difficulty } from "@/utils/sudokuGenerator";
import { cn } from "@/lib/utils";

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

const difficulties: { value: Difficulty; label: string; color: string }[] = [
  { value: "easy", label: "Easy", color: "text-success" },
  { value: "medium", label: "Medium", color: "text-warning" },
  { value: "hard", label: "Hard", color: "text-destructive" },
  { value: "expert", label: "Expert", color: "text-primary" },
];

export const DifficultySelector = ({ currentDifficulty, onSelect }: DifficultySelectorProps) => {
  return (
    <div className="bg-card rounded-xl shadow-2xl p-4 border border-primary/20 backdrop-blur-sm">
      <h3 className="text-sm font-bold text-foreground mb-3 text-center uppercase tracking-wider">
        Difficulty Level
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {difficulties.map(({ value, label, color }) => (
          <Button
            key={value}
            onClick={() => onSelect(value)}
            variant={currentDifficulty === value ? "default" : "outline"}
            size="sm"
            className={cn(
              "font-semibold transition-all duration-300 hover:scale-110 border-2",
              {
                "glow animate-glow": currentDifficulty === value,
                "hover:border-primary/50": currentDifficulty !== value,
              }
            )}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};
