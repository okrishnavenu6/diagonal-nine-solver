import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

interface AchievementsProps {
  open: boolean;
  onClose: () => void;
  currentScore: number;
  gamesCompleted: number;
}

export const Achievements = ({ open, onClose, currentScore, gamesCompleted }: AchievementsProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;

    const fetchAchievements = async () => {
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement', { ascending: true });

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userAchievementsData } = await supabase
          .from('user_achievements')
          .select('achievement_id, unlocked_at')
          .eq('user_id', user.id);

        setUserAchievements(userAchievementsData || []);
      }

      setAchievements(achievementsData || []);
      setLoading(false);
    };

    fetchAchievements();
  }, [open]);

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getProgress = (achievement: Achievement) => {
    if (achievement.category === 'completion') {
      return Math.min((gamesCompleted / achievement.requirement) * 100, 100);
    }
    if (achievement.category === 'score') {
      return Math.min((currentScore / achievement.requirement) * 100, 100);
    }
    return 0;
  };

  const unlockAchievement = async (achievement: Achievement) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || isUnlocked(achievement.id)) return;

    const shouldUnlock = 
      (achievement.category === 'completion' && gamesCompleted >= achievement.requirement) ||
      (achievement.category === 'score' && currentScore >= achievement.requirement);

    if (shouldUnlock) {
      const { error } = await supabase
        .from('user_achievements')
        .insert({ user_id: user.id, achievement_id: achievement.id });

      if (!error) {
        toast({
          title: '🎉 Achievement Unlocked!',
          description: `${achievement.icon} ${achievement.name}`,
        });
        setUserAchievements(prev => [...prev, { achievement_id: achievement.id, unlocked_at: new Date().toISOString() }]);
      }
    }
  };

  useEffect(() => {
    achievements.forEach(achievement => {
      unlockAchievement(achievement);
    });
  }, [currentScore, gamesCompleted, achievements]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="liquid-glass border-primary/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-gaming text-center bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            🏅 Achievements
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="text-center py-8 font-gaming">Loading achievements...</div>
          ) : (
            <div className="grid gap-4">
              {achievements.map((achievement) => {
                const unlocked = isUnlocked(achievement.id);
                const progress = getProgress(achievement);

                return (
                  <div
                    key={achievement.id}
                    className={`p-4 liquid-glass border rounded-lg transition-all transform-3d-hover ${
                      unlocked ? 'border-primary/40 shadow-glow' : 'border-primary/20 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-4xl ${unlocked ? 'animate-bounce' : 'grayscale'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-gaming">{achievement.name}</h3>
                          {unlocked && <span className="text-xs text-primary font-gaming">✓ UNLOCKED</span>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                        {!unlocked && progress > 0 && (
                          <div className="space-y-1">
                            <Progress value={progress} className="h-2" />
                            <div className="text-xs text-muted-foreground text-right">
                              {Math.round(progress)}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};