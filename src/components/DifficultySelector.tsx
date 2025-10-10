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
    <div className="bg-card rounded-lg shadow-md p-4">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 text-center">
        Difficulty
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {difficulties.map(({ value, label, color }) => (
          <Button
            key={value}
            onClick={() => onSelect(value)}
            variant={currentDifficulty === value ? "default" : "outline"}
            size="sm"
            className={cn("font-semibold", {
              [color]: currentDifficulty === value,
            })}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};
