import { Trophy, Clock, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface CompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  time: number;
  score: number;
  difficulty: string;
}

interface LeaderboardEntry {
  time: number;
  score: number;
  difficulty: string;
  date: string;
}

export const CompletionDialog = ({ isOpen, onClose, time, score, difficulty }: CompletionDialogProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Load leaderboard from localStorage
      const saved = localStorage.getItem("sudoku-leaderboard");
      let entries: LeaderboardEntry[] = saved ? JSON.parse(saved) : [];
      
      // Add current game
      const newEntry: LeaderboardEntry = {
        time,
        score,
        difficulty,
        date: new Date().toISOString(),
      };
      entries.push(newEntry);
      
      // Sort by time (fastest first), then by score (highest first)
      entries.sort((a, b) => {
        if (a.time === b.time) return b.score - a.score;
        return a.time - b.time;
      });
      
      // Keep top 10
      entries = entries.slice(0, 10);
      
      localStorage.setItem("sudoku-leaderboard", JSON.stringify(entries));
      setLeaderboard(entries);
    }
  }, [isOpen, time, score, difficulty]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculatePoints = (entry: LeaderboardEntry) => {
    let points = entry.score;
    // Bonus points for speed (less time = more bonus)
    const timeBonus = Math.max(0, 1800 - entry.time); // 30 min max
    points += timeBonus;
    // Difficulty multiplier
    const diffMultiplier = entry.difficulty === "easy" ? 1 : entry.difficulty === "medium" ? 1.5 : entry.difficulty === "hard" ? 2 : 2.5;
    return Math.round(points * diffMultiplier);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-card dark:glass-card rounded-3xl p-8 animate-scale-in shadow-2xl border-2 border-primary/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center space-y-6">
          {/* Trophy Animation */}
          <div className="flex justify-center">
            <div className="relative">
              <Trophy className="w-24 h-24 text-primary animate-bounce-subtle" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-glow-text">
              CONGRATULATIONS!
            </h2>
            <p className="text-lg text-foreground/90">You successfully completed the puzzle!</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="glass-card dark:glass-card rounded-xl p-4 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-primary" />
              <div className="text-2xl font-black text-foreground">{formatTime(time)}</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
            <div className="glass-card dark:glass-card rounded-xl p-4 space-y-2">
              <Star className="w-8 h-8 mx-auto text-primary" />
              <div className="text-2xl font-black text-foreground">{calculatePoints({ time, score, difficulty, date: "" })}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="space-y-3">
            <h3 className="text-xl font-black text-foreground uppercase tracking-wider flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Top 10 Leaderboard
            </h3>
            <div className="glass-card dark:glass-card rounded-xl p-4 max-h-64 overflow-y-auto space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    index === 0
                      ? "bg-primary/20 border border-primary/40"
                      : index < 3
                      ? "bg-accent/10 border border-accent/20"
                      : "bg-muted/10 border border-border/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : index < 3
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-foreground capitalize">{entry.difficulty}</div>
                      <div className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-foreground">{formatTime(entry.time)}</div>
                    <div className="text-xs text-primary">{calculatePoints(entry)} pts</div>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-center text-muted-foreground py-4">No games completed yet</div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-black text-lg py-6 rounded-xl shadow-lg hover:shadow-2xl transition-all"
          >
            Continue Playing
          </Button>
        </div>
      </div>
    </div>
  );
};

