import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Clock, Star, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SudokuBoard } from "@/utils/sudokuGenerator";
import { StreakDisplay } from "./StreakDisplay";

interface DailyChallengeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartChallenge: (puzzle: SudokuBoard, solution: number[][], challengeId: string) => void;
  user: any;
}

export const DailyChallenge = ({ open, onOpenChange, onStartChallenge, user }: DailyChallengeProps) => {
  const [challenge, setChallenge] = useState<any>(null);
  const [completion, setCompletion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadTodaysChallenge();
    }
  }, [open]);

  const loadTodaysChallenge = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's challenge
      const { data: challengeData, error: challengeError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('date', today)
        .single();

      if (challengeError && challengeError.code !== 'PGRST116') {
        throw challengeError;
      }

      setChallenge(challengeData);

      // Check if user has completed it
      if (user && challengeData) {
        const { data: completionData } = await supabase
          .from('daily_challenge_completions')
          .select('*')
          .eq('user_id', user.id)
          .eq('challenge_id', challengeData.id)
          .maybeSingle();

        setCompletion(completionData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load daily challenge",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to play the daily challenge",
        variant: "destructive",
      });
      return;
    }

    if (challenge) {
      onStartChallenge(challenge.puzzle as SudokuBoard, challenge.solution as number[][], challenge.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-2 border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            Daily Challenge
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : challenge ? (
          <div className="space-y-4">
            {user && <StreakDisplay user={user} />}
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Difficulty</span>
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary font-bold uppercase text-sm">
                  {challenge.difficulty}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Date</span>
                <span className="text-sm font-semibold">{new Date(challenge.date).toLocaleDateString()}</span>
              </div>
            </Card>

            {completion ? (
              <Card className="p-4 bg-success/10 border-success/30">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-success" />
                  <span className="font-bold text-success">Completed!</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Time
                    </span>
                    <span className="font-semibold">{Math.floor(completion.completion_time / 60)}:{(completion.completion_time % 60).toString().padStart(2, '0')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Score
                    </span>
                    <span className="font-semibold">{completion.score}</span>
                  </div>
                </div>
              </Card>
            ) : (
              <Button
                onClick={handleStartChallenge}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold py-6 text-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Today's Challenge
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No challenge available today</p>
            <p className="text-sm text-muted-foreground">Check back tomorrow!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
