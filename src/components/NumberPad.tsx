import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberPadProps {
  onNumberSelect: (num: number) => void;
  onClear: () => void;
  remainingNumbers: Record<number, number>;
}

export const NumberPad = ({ onNumberSelect, onClear, remainingNumbers }: NumberPadProps) => {
  return (
    <div className="bg-card rounded-lg shadow-md p-4">
      <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => {
          const remaining = remainingNumbers[num] || 0;
          const isComplete = remaining === 0;

          return (
            <Button
              key={num}
              onClick={() => onNumberSelect(num)}
              disabled={isComplete}
              variant="outline"
              className={cn(
                "h-12 md:h-14 text-lg md:text-xl font-semibold relative",
                "hover:bg-primary hover:text-primary-foreground",
                "transition-all duration-200",
                {
                  "opacity-50 cursor-not-allowed": isComplete,
                }
              )}
            >
              {num}
              {remaining > 0 && (
                <span className="absolute top-0 right-1 text-[10px] text-muted-foreground">
                  {remaining}
                </span>
              )}
            </Button>
          );
        })}

        <Button
          onClick={onClear}
          variant="destructive"
          className="h-12 md:h-14 text-lg md:text-xl font-semibold flex items-center justify-center gap-2"
        >
          <Eraser className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
