import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Zap, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StreakDisplayProps {
  user: any;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_challenge_date: string | null;
}

interface StreakReward {
  id: string;
  streak_days: number;
  reward_value: number;
  description: string;
}

export const StreakDisplay = ({ user }: StreakDisplayProps) => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [nextReward, setNextReward] = useState<StreakReward | null>(null);
  const [earnedRewards, setEarnedRewards] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStreakData();
    }
  }, [user]);

  const loadStreakData = async () => {
    try {
      // Load streak data from game_statistics
      const { data: stats } = await supabase
        .from('game_statistics')
        .select('current_streak, longest_streak, last_challenge_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (stats) {
        setStreakData(stats);
      }

      // Load all streak rewards
      const { data: rewards } = await supabase
        .from('streak_rewards')
        .select('*')
        .order('streak_days', { ascending: true });

      // Load earned rewards
      const { data: userRewards } = await supabase
        .from('user_streak_rewards')
        .select('streak_reward_id')
        .eq('user_id', user.id);

      const earnedIds = userRewards?.map(r => r.streak_reward_id) || [];
      setEarnedRewards(earnedIds);

      // Find next reward
      if (rewards && stats) {
        const nextRewardData = rewards.find(
          r => r.streak_days > stats.current_streak && !earnedIds.includes(r.id)
        );
        setNextReward(nextRewardData || null);
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return null;
  }

  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;

  return (
    <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30 hover:border-orange-500/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            {currentStreak > 0 && (
              <Zap className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
            )}
          </div>
          <h3 className="font-bold text-lg">Daily Streak</h3>
        </div>
        {longestStreak > 0 && (
          <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <Trophy className="w-3 h-3 mr-1" />
            Best: {longestStreak}
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Streak</span>
          <div className="flex items-center gap-1">
            <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {currentStreak}
            </span>
            <span className="text-lg text-muted-foreground">days</span>
          </div>
        </div>

        {nextReward && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Next Reward</p>
                <p className="text-sm font-semibold">{nextReward.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {nextReward.streak_days - currentStreak} days to go
                  </span>
                  <Badge variant="outline" className="text-xs bg-yellow-500/10 border-yellow-500/30">
                    +{nextReward.reward_value} pts
                  </Badge>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((currentStreak / nextReward.streak_days) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        )}

        {currentStreak === 0 && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              Complete a daily challenge to start your streak! 🔥
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
