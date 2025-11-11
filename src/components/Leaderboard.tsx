import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface LeaderboardEntry {
  id: string;
  score: number;
  games_completed: number;
  best_time: number | null;
  difficulty: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface LeaderboardProps {
  open: boolean;
  onClose: () => void;
}

export const Leaderboard = ({ open, onClose }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('leaderboard')
        .select(`
          id,
          score,
          games_completed,
          best_time,
          difficulty,
          profiles (username, avatar_url)
        `)
        .order('score', { ascending: false })
        .limit(50);

      if (!error && data) {
        setEntries(data as any);
      }
      setLoading(false);
    };

    fetchLeaderboard();

    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leaderboard' },
        () => fetchLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-700" />;
    return <span className="text-lg font-gaming text-muted-foreground">#{index + 1}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="liquid-glass border-primary/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-gaming text-center bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            🏆 Global Leaderboard
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="text-center py-8 font-gaming">Loading rankings...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 font-gaming text-muted-foreground">
              No entries yet. Be the first to compete!
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 p-4 liquid-glass border border-primary/20 rounded-lg hover:border-primary/40 transition-all transform-3d-hover"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex-1">
                    <div className="font-gaming text-lg">{entry.profiles.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.games_completed} games • {entry.difficulty}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-gaming text-primary">{entry.score}</div>
                    {entry.best_time && (
                      <div className="text-xs text-muted-foreground">
                        Best: {Math.floor(entry.best_time / 60)}:{(entry.best_time % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};