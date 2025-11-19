-- Add game_type column to existing tables to support multiple games
ALTER TABLE public.game_statistics 
ADD COLUMN IF NOT EXISTS game_type text NOT NULL DEFAULT 'sudoku';

ALTER TABLE public.leaderboard 
ADD COLUMN IF NOT EXISTS game_type text NOT NULL DEFAULT 'sudoku';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_statistics_game_type ON public.game_statistics(game_type);
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_type ON public.leaderboard(game_type);

-- Create a table to store individual game sessions
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  game_type text NOT NULL,
  game_state jsonb,
  score integer DEFAULT 0,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  duration integer,
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_sessions
CREATE POLICY "Users can view own game sessions"
ON public.game_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game sessions"
ON public.game_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game sessions"
ON public.game_sessions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own game sessions"
ON public.game_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Add comment to describe supported game types
COMMENT ON COLUMN public.game_sessions.game_type IS 'Supported game types: sudoku, ludo, chess, tictactoe, 2048';