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
    <div className="bg-card rounded-xl shadow-2xl p-4 space-y-3 border border-primary/20 backdrop-blur-sm animate-slide-up">
      <div className="flex items-center justify-around gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <Clock className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-lg font-semibold tabular-nums">{formatTime(time)}</span>
        </div>

        <div className="h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 border border-warning/20">
          <Trophy className="h-5 w-5 text-warning animate-pulse-scale" />
          <span className="text-lg font-semibold tabular-nums">{score}</span>
        </div>
      </div>

      {message && (
        <div
          className={cn(
            "flex items-center gap-2 p-3 rounded-lg bg-secondary/50 text-sm border backdrop-blur-sm",
            "animate-slide-up transition-all duration-300",
            getMessageColor(),
            {
              "border-success/30 bg-success/10": messageType === "success",
              "border-destructive/30 bg-destructive/10": messageType === "error",
              "border-warning/30 bg-warning/10": messageType === "warning",
              "border-primary/20 bg-primary/5": messageType === "info",
            }
          )}
        >
          {getMessageIcon()}
          <span className="flex-1 font-medium">{message}</span>
        </div>
      )}
    </div>
  );
};
