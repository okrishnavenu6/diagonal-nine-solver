import { Clock, Trophy, AlertCircle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameStatusProps {
  time: number;
  score: number;
  message: string;
  messageType: "info" | "success" | "error" | "warning";
}

export const GameStatus = ({ time, score, message, messageType }: GameStatusProps) => {
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
    <div className="group relative bg-gradient-to-br from-card via-card to-card/50 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-5 md:p-7 space-y-5 border-2 border-primary/40 backdrop-blur-2xl hover:border-primary/60 transition-all duration-500 hover:shadow-[0_0_60px_rgba(var(--primary-rgb),0.4)]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl pointer-events-none" />
      
      <div className="relative flex justify-between items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Clock className="w-7 h-7 text-primary-foreground animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Time Elapsed</p>
            <p className="text-3xl md:text-4xl font-black text-foreground drop-shadow-lg">{formatTime(time)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest text-right">Score</p>
            <p className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-accent to-primary bg-clip-text drop-shadow-lg text-right">{score}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Trophy className="w-7 h-7 text-accent-foreground animate-bounce-subtle" />
          </div>
        </div>
      </div>

      {message && (
        <div
          className={cn(
            "relative p-4 rounded-2xl text-sm font-bold backdrop-blur-sm animate-fade-in border-2 shadow-lg overflow-hidden",
            {
              "bg-primary/20 text-primary border-primary/40 shadow-[0_0_20px_rgba(99,102,241,0.3)]": messageType === "info",
              "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.3)]": messageType === "success",
              "bg-destructive/20 text-destructive border-destructive/40 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse-subtle": messageType === "error",
              "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.3)]": messageType === "warning",
            }
          )}
        >
          <div className="relative z-10">{message}</div>
          <div className={cn("absolute inset-0 opacity-20", {
            "bg-gradient-to-r from-transparent via-primary to-transparent": messageType === "info",
            "bg-gradient-to-r from-transparent via-green-500 to-transparent": messageType === "success",
            "bg-gradient-to-r from-transparent via-destructive to-transparent": messageType === "error",
            "bg-gradient-to-r from-transparent via-yellow-500 to-transparent": messageType === "warning",
          })} />
        </div>
      )}
    </div>
  );
};
