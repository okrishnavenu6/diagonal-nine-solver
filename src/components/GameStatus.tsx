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
    <div className="bg-card rounded-lg shadow-md p-4 space-y-3">
      <div className="flex items-center justify-around gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold">{formatTime(time)}</span>
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          <span className="text-lg font-semibold">{score}</span>
        </div>
      </div>

      {message && (
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded-md bg-secondary/50 text-sm",
            getMessageColor()
          )}
        >
          {getMessageIcon()}
          <span className="flex-1">{message}</span>
        </div>
      )}
    </div>
  );
};
