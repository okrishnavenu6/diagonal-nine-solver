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
    <div className="group relative bg-gradient-to-br from-card via-card to-card/50 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-5 md:p-7 space-y-5 border-2 border-primary/40 backdrop-blur-2xl hover:border-primary/60 transition-all duration-500 hover:shadow-[0_0_60px_rgba(var(--primary-rgb),0.4)]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl pointer-events-none" />
      <div className="relative flex items-center justify-center gap-3">
        <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-primary/50 to-primary rounded-full" />
        <h2 className="text-2xl md:text-3xl font-black text-center bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-lg">
          NUMBER PAD
        </h2>
        <div className="h-1 flex-1 bg-gradient-to-l from-transparent via-primary/50 to-primary rounded-full" />
      </div>
      <div className="relative grid grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const remaining = remainingNumbers[num];
          return (
            <button
              key={num}
              onClick={() => onNumberSelect(num)}
              disabled={remaining === 0}
              className={cn(
                "relative h-16 md:h-20 rounded-2xl font-black text-2xl md:text-3xl",
                "transition-all duration-300",
                "disabled:cursor-not-allowed",
                "focus:outline-none focus:ring-4 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
                "transform hover:scale-[1.15] active:scale-95 hover:rotate-3 active:rotate-0",
                "shadow-lg hover:shadow-2xl",
                "border-2",
                {
                  "bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground border-primary/50 hover:from-primary hover:to-accent shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_30px_rgba(99,102,241,0.7)]": remaining > 0,
                  "bg-gradient-to-br from-muted to-muted/50 text-muted-foreground/30 opacity-30 border-border/20": remaining === 0,
                }
              )}
            >
              <span className="relative z-10 drop-shadow-lg">{num}</span>
              {remaining < 9 && remaining > 0 && (
                <span className="absolute -top-2 -right-2 text-xs bg-gradient-to-br from-accent to-accent/80 text-accent-foreground rounded-full w-7 h-7 flex items-center justify-center font-black shadow-lg border-2 border-background">
                  {remaining}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={onClear}
          className="col-span-1 h-16 md:h-20 bg-gradient-to-br from-destructive via-destructive to-destructive/80 text-destructive-foreground rounded-2xl font-black text-base md:text-lg border-2 border-destructive/50 hover:from-destructive hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-destructive/50 focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 transform hover:scale-[1.15] active:scale-95 hover:-rotate-3 shadow-lg hover:shadow-2xl shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.7)]"
        >
          <span className="drop-shadow-lg">CLEAR</span>
        </button>
      </div>
    </div>
  );
};
