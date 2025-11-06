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
    <div className="liquid-glass rounded-3xl shadow-2xl p-4 md:p-6 space-y-4 border-2 border-primary/40 hover:border-primary/60 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.4),0_20px_60px_rgba(99,102,241,0.3)] relative overflow-hidden group/status transform-3d perspective-3d">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute top-0 left-0 w-40 h-40 bg-accent/20 rounded-full blur-[80px] animate-float-delayed pointer-events-none" />
      <div className="relative z-10 flex justify-between items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-[0_8px_32px_rgba(99,102,241,0.4),0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.6),0_0_40px_rgba(99,102,241,0.5)] transition-all duration-300 hover:scale-110 hover:rotate-6 cursor-pointer group/clock">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl" />
            <div className="absolute -inset-1 bg-gradient-to-br from-primary via-blue-500 to-primary opacity-0 group-hover/clock:opacity-50 blur-lg transition-all duration-300" />
            <Clock className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground group-hover/clock:animate-spin relative z-10" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-display font-black uppercase tracking-[0.2em]">Time</p>
            <p className="text-2xl md:text-3xl font-gaming font-black text-foreground drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]">{formatTime(time)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div>
            <p className="text-xs text-muted-foreground font-display font-black uppercase tracking-[0.2em] text-right">Score</p>
            <p className="text-2xl md:text-3xl font-gaming font-black text-transparent bg-gradient-to-r from-accent via-primary to-accent bg-clip-text drop-shadow-[0_0_20px_rgba(99,102,241,0.6)] text-right animate-glow-text">{score}</p>
          </div>
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-accent via-accent/90 to-accent/70 flex items-center justify-center shadow-[0_8px_32px_rgba(239,65,60,0.4),0_0_30px_rgba(239,65,60,0.3)] hover:shadow-[0_12px_40px_rgba(239,65,60,0.6),0_0_40px_rgba(239,65,60,0.5)] transition-all duration-300 hover:scale-110 hover:rotate-[-6deg] cursor-pointer group/trophy">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl" />
            <div className="absolute -inset-1 bg-gradient-to-br from-accent via-red-500 to-accent opacity-0 group-hover/trophy:opacity-50 blur-lg transition-all duration-300" />
            <Trophy className="w-6 h-6 md:w-7 md:h-7 text-accent-foreground group-hover/trophy:animate-bounce relative z-10" />
          </div>
        </div>
      </div>

      {/* Lives Display */}
      <div className="relative z-10 flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br from-destructive/30 via-destructive/20 to-destructive/10 border-2 border-destructive/40 hover:border-destructive/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.4),0_8px_20px_rgba(239,68,68,0.3)] group/lives overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-destructive/10 to-transparent translate-x-[-200%] group-hover/lives:translate-x-[200%] transition-transform duration-1000" />
        <p className="text-xs text-muted-foreground font-display font-black uppercase tracking-[0.2em] relative z-10">Lives</p>
        <div className="flex gap-1 relative z-10">
          {Array.from({ length: maxLives }).map((_, i) => (
            <Heart
              key={i}
              className={cn(
                "w-5 h-5 transition-all duration-300 hover:scale-125 cursor-pointer",
                i < lives 
                  ? "text-destructive fill-destructive drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse-subtle" 
                  : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>

      {message && (
        <div
          className={cn(
            "relative z-10 p-3 md:p-4 rounded-xl text-xs md:text-sm font-display font-bold backdrop-blur-sm animate-fade-in border-2 shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300 group/message",
            {
              "bg-primary/30 text-primary border-primary/50 shadow-[0_0_25px_rgba(99,102,241,0.4),0_8px_20px_rgba(99,102,241,0.3)]": messageType === "info",
              "bg-green-500/30 text-green-600 dark:text-green-400 border-green-500/50 shadow-[0_0_25px_rgba(34,197,94,0.4),0_8px_20px_rgba(34,197,94,0.3)]": messageType === "success",
              "bg-destructive/30 text-destructive border-destructive/50 shadow-[0_0_25px_rgba(239,68,68,0.4),0_8px_20px_rgba(239,68,68,0.3)] animate-pulse-subtle": messageType === "error",
              "bg-yellow-500/30 text-yellow-600 dark:text-yellow-400 border-yellow-500/50 shadow-[0_0_25px_rgba(234,179,8,0.4),0_8px_20px_rgba(234,179,8,0.3)]": messageType === "warning",
            }
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover/message:translate-x-[200%] transition-transform duration-1000" />
          <div className="flex items-center gap-2 relative z-10">
            {getMessageIcon()}
            <span>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
