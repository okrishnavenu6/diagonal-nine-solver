import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Clock, Target, TrendingUp, Trophy, Flame, Star } from "lucide-react";
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
  current_streak?: number;
  longest_streak?: number;
}

interface StreakReward {
  id: string;
  streak_days: number;
  reward_value: number;
  description: string;
}

export const Statistics = ({ open, onOpenChange, user }: StatisticsProps) => {
  const [stats, setStats] = useState<Stats[]>([]);
  const [streakRewards, setStreakRewards] = useState<StreakReward[]>([]);
  const [earnedRewardIds, setEarnedRewardIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      loadStatistics();
      loadStreakRewards();
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

  const loadStreakRewards = async () => {
    try {
      const { data: rewards } = await supabase
        .from('streak_rewards')
        .select('*')
        .order('streak_days', { ascending: true });

      setStreakRewards(rewards || []);

      const { data: earned } = await supabase
        .from('user_streak_rewards')
        .select('streak_reward_id')
        .eq('user_id', user.id);

      setEarnedRewardIds(earned?.map(r => r.streak_reward_id) || []);
    } catch (error) {
      console.error('Error loading streak rewards:', error);
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="streaks">🔥 Streaks</TabsTrigger>
              <TabsTrigger value="easy">Easy</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="hard">Hard</TabsTrigger>
              <TabsTrigger value="expert">Expert</TabsTrigger>
            </TabsList>
            
            <TabsContent value="streaks" className="mt-4">
              <div className="space-y-4">
                <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h3 className="font-bold text-lg">Streak Milestones</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete daily challenges consecutively to earn bonus rewards!
                  </p>
                  <div className="space-y-2">
                    {streakRewards.map((reward, index) => {
                      const isEarned = earnedRewardIds.includes(reward.id);
                      const currentStreak = stats[0]?.current_streak || 0;
                      const isNextReward = !isEarned && currentStreak < reward.streak_days && 
                        (index === 0 || earnedRewardIds.includes(streakRewards[index - 1]?.id));
                      
                      return (
                        <div
                          key={reward.id}
                          className={`p-3 rounded-lg border transition-all ${
                            isEarned
                              ? 'bg-success/10 border-success/30'
                              : isNextReward
                              ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20'
                              : 'bg-muted/30 border-border/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isEarned ? 'bg-success/20' : isNextReward ? 'bg-primary/20' : 'bg-muted/50'
                              }`}>
                                {isEarned ? (
                                  <Trophy className="w-5 h-5 text-success" />
                                ) : (
                                  <Star className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{reward.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {reward.streak_days} day streak
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {isEarned ? (
                                <Badge variant="outline" className="bg-success/10 border-success/30">
                                  ✓ Earned
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">
                                  +{reward.reward_value} pts
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isNextReward && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{currentStreak} / {reward.streak_days} days</span>
                                <span>{reward.streak_days - currentStreak} to go!</span>
                              </div>
                              <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${(currentStreak / reward.streak_days) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </TabsContent>
            
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
