import { RefreshCw, Undo, Redo, Lightbulb, CheckCircle, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onValidate: () => void;
  onTogglePencil: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isPencilMode: boolean;
}

export const GameControls = ({
  onNewGame,
  onUndo,
  onRedo,
  onHint,
  onValidate,
  onTogglePencil,
  canUndo,
  canRedo,
  isPencilMode,
}: GameControlsProps) => {
  return (
    <div className="group relative bg-gradient-to-br from-card via-card to-card/50 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.4),0_20px_60px_rgba(99,102,241,0.2)] p-5 md:p-7 space-y-4 border-2 border-primary/40 backdrop-blur-2xl hover:border-primary/60 transition-all duration-500 hover:shadow-[0_0_60px_rgba(99,102,241,0.4),0_30px_80px_rgba(99,102,241,0.3)] transform-3d perspective-3d">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl pointer-events-none" />
      
      <button
        onClick={onNewGame}
        className="relative w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground py-4 px-6 rounded-2xl font-black text-lg hover:from-accent hover:to-primary transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.5),0_10px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.7),0_15px_40px_rgba(99,102,241,0.4)] transform hover:scale-[1.05] hover:translateY-[-2px] active:scale-95 border-2 border-primary/50 overflow-hidden group/btn"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
        <RefreshCw className="w-6 h-6 group-hover/btn:rotate-180 transition-transform duration-500" />
        <span className="relative z-10 drop-shadow-lg">NEW GAME</span>
      </button>

      <div className="relative grid grid-cols-2 gap-3">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center justify-center gap-2 bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground py-3 px-4 rounded-xl font-bold hover:from-secondary/90 hover:to-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.08] hover:translateY-[-1px] active:scale-95 shadow-lg hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] border border-secondary/50"
        >
          <Undo className="w-5 h-5" />
          <span className="drop-shadow">Undo</span>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="flex items-center justify-center gap-2 bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground py-3 px-4 rounded-xl font-bold hover:from-secondary/90 hover:to-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.08] hover:translateY-[-1px] active:scale-95 shadow-lg hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] border border-secondary/50"
        >
          <Redo className="w-5 h-5" />
          <span className="drop-shadow">Redo</span>
        </button>
      </div>

      <div className="relative grid grid-cols-2 gap-3">
        <button
          onClick={onHint}
          className="flex items-center justify-center gap-2 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground py-3 px-4 rounded-xl font-bold hover:from-accent/90 hover:to-accent transition-all duration-300 transform hover:scale-[1.08] hover:translateY-[-1px] active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(239,65,60,0.5),0_8px_20px_rgba(0,0,0,0.2)] border border-accent/50"
        >
          <Lightbulb className="w-5 h-5" />
          <span className="drop-shadow">Hint</span>
        </button>
        <button
          onClick={onValidate}
          className="flex items-center justify-center gap-2 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground py-3 px-4 rounded-xl font-bold hover:from-accent/90 hover:to-accent transition-all duration-300 transform hover:scale-[1.08] hover:translateY-[-1px] active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(239,65,60,0.5),0_8px_20px_rgba(0,0,0,0.2)] border border-accent/50"
        >
          <CheckCircle className="w-5 h-5" />
          <span className="drop-shadow">Check</span>
        </button>
      </div>

      <button
        onClick={onTogglePencil}
        className={cn(
          "relative w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-black text-lg transition-all duration-300 shadow-lg transform hover:scale-[1.05] hover:translateY-[-2px] active:scale-95 border-2 overflow-hidden group/pencil",
          {
            "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_25px_rgba(99,102,241,0.6),0_10px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.8),0_15px_40px_rgba(99,102,241,0.4)] border-primary/50": isPencilMode,
            "bg-gradient-to-br from-muted to-muted/80 text-muted-foreground hover:from-muted/90 hover:to-muted border-muted": !isPencilMode,
          }
        )}
      >
        <div className={cn("absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/pencil:translate-x-[200%] transition-transform duration-1000", {
          "opacity-100": isPencilMode,
          "opacity-0": !isPencilMode,
        })} />
        <PenTool className={cn("w-6 h-6 transition-transform", {
          "animate-bounce-subtle": isPencilMode,
        })} />
        <span className="relative z-10 drop-shadow-lg">
          PENCIL MODE {isPencilMode ? "ON" : "OFF"}
        </span>
        {isPencilMode && (
          <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
        )}
      </button>
    </div>
  );
};
