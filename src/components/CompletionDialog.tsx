import { Trophy, Clock, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface CompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  time: number;
  score: number;
  difficulty: string;
  lives: number;
  maxLives: number;
}

interface LeaderboardEntry {
  time: number;
  score: number;
  difficulty: string;
  date: string;
}

export const CompletionDialog = ({ isOpen, onClose, time, score, difficulty, lives, maxLives }: CompletionDialogProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; duration: number; color: string }>>([]);

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

      // Generate confetti particles
      const colors = ['hsl(239, 65%, 60%)', 'hsl(142, 76%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(280, 100%, 65%)'];
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setConfetti(particles);
    }
  }, [isOpen, time, score, difficulty]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateFinalScore = () => {
    const timeBonus = Math.max(0, 1000 - time);
    const difficultyMultiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 1.5 : difficulty === "hard" ? 2 : 2.5;
    const livesBonus = lives * 50;
    return Math.round((score + timeBonus + livesBonus) * difficultyMultiplier);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-md animate-fade-in overflow-hidden">
      {/* Confetti Particles */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-sm animate-confetti pointer-events-none"
          style={{
            left: `${particle.left}%`,
            top: '-5%',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            backgroundColor: particle.color,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}

      {/* Radial Pulse Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }} />
      </div>

      <div className="relative w-full max-w-2xl liquid-glass rounded-3xl p-8 animate-victory-entrance shadow-2xl border-2 animate-rainbow-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="text-center space-y-6 relative z-10">
          {/* Trophy Animation */}
          <div className="flex justify-center relative">
            <div className="relative">
              {/* Rotating glow rings */}
              <div className="absolute inset-0 animate-spin-slow">
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary rounded-full -translate-x-1/2 blur-sm" />
                <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-accent rounded-full -translate-x-1/2 blur-sm" />
                <div className="absolute left-0 top-1/2 w-2 h-2 bg-success rounded-full -translate-y-1/2 blur-sm" />
                <div className="absolute right-0 top-1/2 w-2 h-2 bg-warning rounded-full -translate-y-1/2 blur-sm" />
              </div>
              <Trophy className="w-24 h-24 text-primary animate-trophy-bounce relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-3xl animate-pulse opacity-50" />
              {/* Star burst effect */}
              <div className="absolute inset-0 animate-starburst">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-1 h-8 bg-gradient-to-t from-primary to-transparent"
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-40px)`,
                      transformOrigin: 'center',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2 animate-slide-down" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-glow-text">
              CONGRATULATIONS!
            </h2>
            <p className="text-lg text-foreground/90 animate-fade-in" style={{ animationDelay: '0.4s' }}>You successfully completed the puzzle!</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="liquid-glass rounded-xl p-4 space-y-2 animate-slide-up hover:scale-105 transition-transform" style={{ animationDelay: '0.3s' }}>
              <Clock className="w-8 h-8 mx-auto text-primary animate-bounce-subtle" />
              <div className="text-2xl font-black text-foreground">{formatTime(time)}</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
            <div className="liquid-glass rounded-xl p-4 space-y-2 animate-slide-up hover:scale-105 transition-transform" style={{ animationDelay: '0.4s' }}>
              <Star className="w-8 h-8 mx-auto text-primary animate-spin-slow" />
              <div className="text-2xl font-black text-foreground">{calculateFinalScore()}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="liquid-glass rounded-xl p-4 space-y-2 col-span-2 animate-slide-up hover:scale-105 transition-transform" style={{ animationDelay: '0.5s' }}>
              <Trophy className="w-8 h-8 mx-auto text-destructive animate-pulse-subtle" />
              <div className="text-2xl font-black text-foreground">{lives}/{maxLives}</div>
              <div className="text-sm text-muted-foreground">Lives Remaining</div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-xl font-black text-foreground uppercase tracking-wider flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-primary animate-bounce-subtle" />
              Top 10 Leaderboard
            </h3>
            <div className="liquid-glass rounded-xl p-4 max-h-64 overflow-y-auto space-y-2">
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
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-black text-lg py-6 rounded-xl shadow-lg hover:shadow-2xl transition-all animate-slide-up hover:scale-105"
            style={{ animationDelay: '0.7s' }}
          >
            Continue Playing
          </Button>
        </div>
      </div>
    </div>
  );
};

