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
    <div className="bg-card rounded-xl shadow-2xl p-4 border border-primary/20 backdrop-blur-sm">
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
                "h-12 md:h-14 text-lg md:text-xl font-bold relative",
                "hover:bg-gradient-to-br hover:from-primary hover:to-primary/80",
                "hover:text-primary-foreground hover:scale-110 hover:glow",
                "transition-all duration-300 transform border-primary/30",
                "active:scale-95",
                {
                  "opacity-40 cursor-not-allowed hover:scale-100": isComplete,
                  "bg-gradient-to-br from-success/10 to-success/5": !isComplete && remaining <= 3,
                }
              )}
            >
              {num}
              {remaining > 0 && (
                <span className="absolute top-0.5 right-1 text-[10px] font-normal text-muted-foreground bg-background/80 rounded-full px-1">
                  {remaining}
                </span>
              )}
            </Button>
          );
        })}

        <Button
          onClick={onClear}
          variant="destructive"
          className="h-12 md:h-14 text-lg md:text-xl font-semibold flex items-center justify-center gap-2 hover:scale-110 transition-all duration-300 hover:glow-error active:scale-95"
        >
          <Eraser className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
