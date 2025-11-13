-- Create daily_challenges table
CREATE TABLE public.daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  puzzle jsonb NOT NULL,
  solution jsonb NOT NULL,
  difficulty text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create daily_challenge_completions table
CREATE TABLE public.daily_challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  completion_time integer NOT NULL,
  score integer NOT NULL,
  completed_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Create game_statistics table
CREATE TABLE public.game_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty text NOT NULL,
  games_played integer DEFAULT 0,
  games_completed integer DEFAULT 0,
  total_time integer DEFAULT 0,
  best_time integer,
  total_score integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, difficulty)
);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_statistics ENABLE ROW LEVEL SECURITY;

-- Daily challenges are viewable by everyone
CREATE POLICY "Daily challenges are viewable by everyone"
ON public.daily_challenges
FOR SELECT
USING (true);

-- Users can insert daily challenges (for admin/system)
CREATE POLICY "System can insert daily challenges"
ON public.daily_challenges
FOR INSERT
WITH CHECK (true);

-- Daily challenge completions are viewable by everyone
CREATE POLICY "Daily challenge completions are viewable by everyone"
ON public.daily_challenge_completions
FOR SELECT
USING (true);

-- Users can insert their own completions
CREATE POLICY "Users can insert own completions"
ON public.daily_challenge_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Game statistics are viewable by everyone
CREATE POLICY "Game statistics are viewable by everyone"
ON public.game_statistics
FOR SELECT
USING (true);

-- Users can insert their own statistics
CREATE POLICY "Users can insert own statistics"
ON public.game_statistics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own statistics
CREATE POLICY "Users can update own statistics"
ON public.game_statistics
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_game_statistics_updated_at
BEFORE UPDATE ON public.game_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();