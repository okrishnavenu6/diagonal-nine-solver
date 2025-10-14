import { Clock, Trophy, AlertCircle, CheckCircle, Info, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameStatusProps {
  time: number;
  score: number;
  message: string;
  messageType: "info" | "success" | "error" | "warning";
  lives: number;
  maxLives: number;
}

export const GameStatus = ({ time, score, message, messageType, lives, maxLives }: GameStatusProps) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getMessageIcon = () => {
    switch (messageType) {
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      case "warning":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getMessageColor = () => {
    switch (messageType) {
      case "success":
        return "text-success";
      case "error":
        return "text-destructive";
      case "warning":
        return "text-warning";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="liquid-glass rounded-2xl shadow-2xl p-4 md:p-6 space-y-4 border border-primary/40 hover:border-primary/60 transition-all duration-300">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]">
            <Clock className="w-6 h-6 md:w-7 md:h-7 text-white drop-shadow-lg animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Time</p>
            <p className="text-2xl md:text-3xl font-black text-foreground drop-shadow-lg">{formatTime(time)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest text-right">Score</p>
            <p className="text-2xl md:text-3xl font-black text-transparent bg-gradient-to-r from-accent to-primary bg-clip-text drop-shadow-lg text-right">{score}</p>
          </div>
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-accent via-accent to-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)]">
            <Trophy className="w-6 h-6 md:w-7 md:h-7 text-white drop-shadow-lg animate-bounce-subtle" />
          </div>
        </div>
      </div>

      {/* Lives Display */}
      <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10 border border-destructive/30">
        <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Lives</p>
        <div className="flex gap-1">
          {Array.from({ length: maxLives }).map((_, i) => (
            <Heart
              key={i}
              className={cn(
                "w-5 h-5 transition-all duration-300",
                i < lives 
                  ? "text-destructive fill-destructive animate-pulse-subtle" 
                  : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>

      {message && (
        <div
          className={cn(
            "p-3 md:p-4 rounded-xl text-xs md:text-sm font-bold backdrop-blur-sm animate-fade-in border-2 shadow-lg overflow-hidden",
            {
              "bg-primary/20 text-primary border-primary/40 shadow-[0_0_20px_rgba(99,102,241,0.3)]": messageType === "info",
              "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.3)]": messageType === "success",
              "bg-destructive/20 text-destructive border-destructive/40 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse-subtle": messageType === "error",
              "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.3)]": messageType === "warning",
            }
          )}
        >
          <div className="flex items-center gap-2">
            {getMessageIcon()}
            <span>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
