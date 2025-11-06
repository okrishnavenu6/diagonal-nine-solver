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
    <div className="w-full liquid-glass rounded-3xl shadow-2xl p-4 md:p-6 space-y-4 border-2 border-primary/40 hover:border-primary/60 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.4),0_20px_60px_rgba(99,102,241,0.3)] relative overflow-hidden group/pad transform-3d perspective-3d">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[80px] animate-float pointer-events-none" />
      <h3 className="relative z-10 font-gaming font-black text-center text-foreground text-base md:text-lg uppercase tracking-[0.3em] drop-shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-glow-text">
        NUMBER PAD
      </h3>
      
      <div className="relative grid grid-cols-3 gap-2 md:gap-3 z-10">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => {
          const remaining = remainingNumbers[num] || 0;
          const isDisabled = remaining === 0;
          
          return (
            <button
              key={num}
              onClick={() => onNumberSelect(num)}
              disabled={isDisabled}
              className={cn(
                "relative aspect-square rounded-2xl font-gaming font-black text-2xl md:text-3xl transition-all duration-150 border-2 overflow-hidden group/number",
                "shadow-lg active:shadow-2xl transform",
                isDisabled
                  ? "bg-muted/30 border-muted/30 text-muted-foreground/30 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground border-primary/80 hover:from-primary/90 hover:to-primary shadow-[0_0_35px_rgba(99,102,241,0.7),0_0_70px_rgba(99,102,241,0.3),0_15px_40px_rgba(99,102,241,0.25)] hover:shadow-[0_0_45px_rgba(99,102,241,0.9),0_0_90px_rgba(99,102,241,0.4),0_20px_50px_rgba(99,102,241,0.35)] hover:scale-[1.15] hover:translateY-[-4px] active:scale-[1.08] active:translateY-[-2px]"
              )}
            >
              {!isDisabled && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover/number:translate-x-[200%] transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover/number:opacity-100 transition-opacity duration-300" />
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary via-accent to-primary opacity-0 group-hover/number:opacity-50 blur-lg transition-all duration-300" />
                </>
              )}
              <span className="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">{num}</span>
              {!isDisabled && remaining > 0 && remaining < 9 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-accent rounded-full text-[10px] font-black flex items-center justify-center shadow-[0_0_15px_rgba(239,65,60,0.8)] animate-pulse-subtle z-20 font-display">
                  {remaining}
                </span>
              )}
            </button>
          );
        })}
        
        <button
          onClick={onClear}
          className="relative col-span-3 aspect-auto h-14 md:h-16 bg-gradient-to-br from-destructive via-destructive/90 to-destructive/70 hover:from-destructive/90 hover:via-destructive/80 hover:to-destructive/60 rounded-2xl font-gaming font-black text-destructive-foreground text-sm md:text-base uppercase tracking-[0.2em] transition-all duration-150 transform hover:scale-[1.08] hover:translateY-[-2px] active:scale-[1.02] active:translateY-[0px] border-2 border-destructive/80 hover:border-destructive hover:shadow-[0_0_40px_rgba(239,68,68,0.7),0_0_80px_rgba(239,68,68,0.3),0_15px_40px_rgba(239,68,68,0.25)] flex items-center justify-center gap-2 shadow-lg group/clear overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/clear:translate-x-[200%] transition-transform duration-700" />
          <div className="absolute -inset-1 bg-gradient-to-br from-destructive via-red-600 to-destructive opacity-0 group-hover/clear:opacity-50 blur-lg transition-all duration-300" />
          <Eraser className="w-4 h-4 md:w-5 md:h-5 relative z-10 group-hover/clear:rotate-12 transition-transform" />
          <span className="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">CLEAR</span>
        </button>
      </div>

      {/* Control Buttons */}
      <div className="space-y-2 pt-2 border-t-2 border-primary/30">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onUndo}
            disabled={!canUndo}
            size="sm"
            variant="outline"
            className="font-bold border-2 border-primary/50 hover:bg-primary/30 hover:border-primary disabled:opacity-30 h-10 hover:shadow-lg transition-all duration-200 hover:scale-[1.05] active:scale-100"
          >
            <Undo className="w-4 h-4 mr-1" />
            Undo
          </Button>
          <Button
            onClick={onRedo}
            disabled={!canRedo}
            size="sm"
            variant="outline"
            className="font-bold border-2 border-primary/50 hover:bg-primary/30 hover:border-primary disabled:opacity-30 h-10 hover:shadow-lg transition-all duration-200 hover:scale-[1.05] active:scale-100"
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
            className="font-bold border-2 border-warning/50 hover:bg-warning/30 hover:border-warning text-warning h-10 hover:shadow-lg hover:shadow-warning/30 transition-all duration-200 hover:scale-[1.05] active:scale-100"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            Hint
          </Button>
          <Button
            onClick={onValidate}
            size="sm"
            variant="outline"
            className="font-bold border-2 border-success/50 hover:bg-success/30 hover:border-success text-success h-10 hover:shadow-lg hover:shadow-success/30 transition-all duration-200 hover:scale-[1.05] active:scale-100"
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
            "w-full font-bold h-10 transition-all duration-200 hover:scale-[1.05] active:scale-100 relative overflow-hidden group/pencil",
            isPencilMode
              ? "bg-gradient-to-r from-accent via-accent/90 to-accent/80 text-accent-foreground hover:opacity-90 shadow-lg hover:shadow-[0_0_30px_rgba(239,65,60,0.5)]"
              : "border-2 border-accent/50 hover:bg-accent/30 hover:border-accent text-accent hover:shadow-lg"
          )}
        >
          {isPencilMode && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/pencil:translate-x-[200%] transition-transform duration-700" />
          )}
          <Pencil className={cn("w-4 h-4 mr-2 relative z-10", isPencilMode && "animate-bounce-subtle")} />
          <span className="relative z-10">{isPencilMode ? "PENCIL ON" : "PENCIL OFF"}</span>
          {isPencilMode && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)] z-20" />
          )}
        </Button>
      </div>
    </div>
  );
};
