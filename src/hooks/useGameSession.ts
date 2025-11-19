import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type GameType = "sudoku" | "ludo" | "chess" | "tictactoe" | "2048";

export interface GameSession {
  id: string;
  user_id: string;
  game_type: GameType;
  game_state: any;
  score: number;
  started_at: string;
  completed_at?: string;
  duration?: number;
  is_completed: boolean;
}

export const useGameSession = (gameType: GameType) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startSession = async (initialState: any) => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Not logged in",
          description: "Please log in to save your game progress",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from("game_sessions")
        .insert({
          user_id: userData.user.id,
          game_type: gameType,
          game_state: initialState,
          score: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setSession(data as GameSession);
      return data;
    } catch (error) {
      console.error("Error starting game session:", error);
      toast({
        title: "Error",
        description: "Failed to start game session",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSession = async (gameState: any, score?: number) => {
    if (!session) return;

    try {
      const updateData: any = {
        game_state: gameState,
      };

      if (score !== undefined) {
        updateData.score = score;
      }

      const { error } = await supabase
        .from("game_sessions")
        .update(updateData)
        .eq("id", session.id);

      if (error) throw error;

      setSession(prev => prev ? { ...prev, game_state: gameState, score: score ?? prev.score } : null);
    } catch (error) {
      console.error("Error updating game session:", error);
    }
  };

  const completeSession = async (finalScore: number, duration: number) => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({
          score: finalScore,
          duration,
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", session.id);

      if (error) throw error;

      // Update statistics
      await updateStatistics(finalScore, duration);

      toast({
        title: "Game completed!",
        description: `Score: ${finalScore}`,
      });
    } catch (error) {
      console.error("Error completing game session:", error);
      toast({
        title: "Error",
        description: "Failed to save game results",
        variant: "destructive",
      });
    }
  };

  const updateStatistics = async (score: number, duration: number) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: existing } = await supabase
        .from("game_statistics")
        .select()
        .eq("user_id", userData.user.id)
        .eq("game_type", gameType)
        .eq("difficulty", "normal")
        .single();

      if (existing) {
        await supabase
          .from("game_statistics")
          .update({
            games_played: existing.games_played + 1,
            games_completed: existing.games_completed + 1,
            total_score: existing.total_score + score,
            total_time: existing.total_time + duration,
            best_time: existing.best_time ? Math.min(existing.best_time, duration) : duration,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("game_statistics").insert({
          user_id: userData.user.id,
          game_type: gameType,
          difficulty: "normal",
          games_played: 1,
          games_completed: 1,
          total_score: score,
          total_time: duration,
          best_time: duration,
        });
      }

      // Update leaderboard
      const { data: leaderboardEntry } = await supabase
        .from("leaderboard")
        .select()
        .eq("user_id", userData.user.id)
        .eq("game_type", gameType)
        .eq("difficulty", "normal")
        .single();

      if (leaderboardEntry) {
        await supabase
          .from("leaderboard")
          .update({
            score: leaderboardEntry.score + score,
            games_completed: leaderboardEntry.games_completed + 1,
            best_time: leaderboardEntry.best_time ? Math.min(leaderboardEntry.best_time, duration) : duration,
          })
          .eq("id", leaderboardEntry.id);
      } else {
        await supabase.from("leaderboard").insert({
          user_id: userData.user.id,
          game_type: gameType,
          difficulty: "normal",
          score,
          games_completed: 1,
          best_time: duration,
        });
      }
    } catch (error) {
      console.error("Error updating statistics:", error);
    }
  };

  return {
    session,
    isLoading,
    startSession,
    updateSession,
    completeSession,
  };
};
