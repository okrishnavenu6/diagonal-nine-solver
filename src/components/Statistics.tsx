import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Clock, Target, TrendingUp, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StatisticsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

interface Stats {
  difficulty: string;
  games_played: number;
  games_completed: number;
  total_time: number;
  best_time: number | null;
  total_score: number;
}

export const Statistics = ({ open, onOpenChange, user }: StatisticsProps) => {
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      loadStatistics();
    }
  }, [open, user]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_statistics')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setStats(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletionRate = (completed: number, played: number) => {
    if (played === 0) return 0;
    return Math.round((completed / played) * 100);
  };

  const getAverageTime = (totalTime: number, completed: number) => {
    if (completed === 0) return null;
    return Math.round(totalTime / completed);
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {value}
          </p>
        </div>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </Card>
  );

  const DifficultyStats = ({ difficulty }: { difficulty: string }) => {
    const stat = stats.find(s => s.difficulty === difficulty) || {
      difficulty,
      games_played: 0,
      games_completed: 0,
      total_time: 0,
      best_time: null,
      total_score: 0,
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={BarChart}
            label="Games Played"
            value={stat.games_played}
            color="text-primary"
          />
          <StatCard
            icon={Trophy}
            label="Completed"
            value={stat.games_completed}
            color="text-success"
          />
          <StatCard
            icon={Target}
            label="Completion Rate"
            value={`${getCompletionRate(stat.games_completed, stat.games_played)}%`}
            color="text-accent"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Score"
            value={stat.total_score.toLocaleString()}
            color="text-warning"
          />
        </div>

        <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Time Records
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Best Time</span>
              <span className="font-bold text-primary">{formatTime(stat.best_time)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Time</span>
              <span className="font-semibold">{formatTime(getAverageTime(stat.total_time, stat.games_completed))}</span>
            </div>
          </div>
        </Card>

        {stat.games_completed > 0 && (
          <Card className="p-4 bg-gradient-to-r from-card to-card/50 border-border/50">
            <div className="space-y-3">
              <h4 className="font-bold">Progress Overview</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-semibold">{getCompletionRate(stat.games_completed, stat.games_played)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                      style={{ width: `${getCompletionRate(stat.games_completed, stat.games_played)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-2 border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
            <BarChart className="w-6 h-6 text-primary" />
            Your Statistics
          </DialogTitle>
        </DialogHeader>

        {!user ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please login to view your statistics</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="easy" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="easy">Easy</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="hard">Hard</TabsTrigger>
              <TabsTrigger value="expert">Expert</TabsTrigger>
            </TabsList>
            <TabsContent value="easy" className="mt-4">
              <DifficultyStats difficulty="easy" />
            </TabsContent>
            <TabsContent value="medium" className="mt-4">
              <DifficultyStats difficulty="medium" />
            </TabsContent>
            <TabsContent value="hard" className="mt-4">
              <DifficultyStats difficulty="hard" />
            </TabsContent>
            <TabsContent value="expert" className="mt-4">
              <DifficultyStats difficulty="expert" />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
