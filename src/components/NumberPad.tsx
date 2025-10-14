import { Eraser, Undo, Redo, Lightbulb, CheckCircle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NumberPadProps {
  onNumberSelect: (num: number) => void;
  onClear: () => void;
  remainingNumbers: Record<number, number>;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onValidate: () => void;
  onTogglePencil: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isPencilMode: boolean;
}

export const NumberPad = ({ 
  onNumberSelect, 
  onClear, 
  remainingNumbers,
  onUndo,
  onRedo,
  onHint,
  onValidate,
  onTogglePencil,
  canUndo,
  canRedo,
  isPencilMode,
}: NumberPadProps) => {
  return (
    <div className="w-full liquid-glass rounded-2xl shadow-2xl p-4 md:p-6 space-y-4 border border-primary/30 hover:border-primary/50 transition-all duration-300">
      <h3 className="font-black text-center text-foreground text-base md:text-lg uppercase tracking-widest">
        NUMBER PAD
      </h3>
      
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => {
          const remaining = remainingNumbers[num] || 0;
          const isDisabled = remaining === 0;
          
          return (
            <button
              key={num}
              onClick={() => onNumberSelect(num)}
              disabled={isDisabled}
              className={cn(
                "w-full aspect-square text-2xl font-black transition-all duration-300",
                "bg-gradient-to-br from-primary/25 to-primary/10 hover:from-primary/50 hover:to-primary/25",
                "border-2 border-primary/40 hover:border-primary/70",
                "shadow-xl hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.6),inset_0_0_20px_rgba(var(--primary-rgb),0.1)]",
                "active:scale-95 hover:scale-110",
                "disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:scale-100",
                "rounded-xl backdrop-blur-md",
                "relative overflow-hidden",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
              )}
            >
              <span className="relative z-10 text-foreground dark:text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">{num}</span>
              {!isDisabled && remaining > 0 && remaining < 9 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-accent rounded-full text-[10px] font-black flex items-center justify-center shadow-lg animate-pulse-subtle text-accent-foreground">
                  {remaining}
                </span>
              )}
            </button>
          );
        })}
        
        <button
          onClick={onClear}
          className="col-span-3 aspect-auto h-14 md:h-16 bg-gradient-to-br from-destructive/30 via-destructive/20 to-destructive/10 hover:from-destructive/50 hover:via-destructive/40 hover:to-destructive/30 rounded-xl font-black text-destructive-foreground text-sm md:text-base uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-destructive/50 hover:border-destructive hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] flex items-center justify-center gap-2 shadow-lg group/btn overflow-hidden"
        >
          <Eraser className="w-4 h-4 md:w-5 md:h-5" />
          CLEAR
          <div className="absolute inset-0 bg-gradient-to-r from-destructive/0 via-destructive/40 to-destructive/0 opacity-0 group-hover/btn:opacity-100 transition-opacity blur-sm" />
        </button>
      </div>

      {/* Control Buttons */}
      <div className="space-y-2 pt-2 border-t border-primary/20">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onUndo}
            disabled={!canUndo}
            size="sm"
            variant="outline"
            className="font-bold border-primary/40 hover:bg-primary/20 hover:border-primary disabled:opacity-30 h-10"
          >
            <Undo className="w-4 h-4 mr-1" />
            Undo
          </Button>
          <Button
            onClick={onRedo}
            disabled={!canRedo}
            size="sm"
            variant="outline"
            className="font-bold border-primary/40 hover:bg-primary/20 hover:border-primary disabled:opacity-30 h-10"
          >
            <Redo className="w-4 h-4 mr-1" />
            Redo
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onHint}
            size="sm"
            variant="outline"
            className="font-bold border-warning/40 hover:bg-warning/20 hover:border-warning text-warning h-10"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            Hint
          </Button>
          <Button
            onClick={onValidate}
            size="sm"
            variant="outline"
            className="font-bold border-success/40 hover:bg-success/20 hover:border-success text-success h-10"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Check
          </Button>
        </div>

        <Button
          onClick={onTogglePencil}
          size="sm"
          variant={isPencilMode ? "default" : "outline"}
          className={cn(
            "w-full font-bold h-10",
            isPencilMode
              ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
              : "border-accent/40 hover:bg-accent/20 hover:border-accent text-accent"
          )}
        >
          <Pencil className="w-4 h-4 mr-2" />
          {isPencilMode ? "PENCIL ON" : "PENCIL OFF"}
        </Button>
      </div>
    </div>
  );
};
