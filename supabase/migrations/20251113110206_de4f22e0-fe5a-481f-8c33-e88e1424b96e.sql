-- Add streak tracking to game_statistics table
ALTER TABLE public.game_statistics 
ADD COLUMN current_streak integer DEFAULT 0,
ADD COLUMN longest_streak integer DEFAULT 0,
ADD COLUMN last_challenge_date date;

-- Create streak_rewards table for bonus rewards
CREATE TABLE public.streak_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  streak_days integer NOT NULL UNIQUE,
  reward_type text NOT NULL,
  reward_value integer NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create user_streak_rewards table to track earned rewards
CREATE TABLE public.user_streak_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_reward_id uuid NOT NULL REFERENCES public.streak_rewards(id) ON DELETE CASCADE,
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, streak_reward_id)
);

-- Enable RLS
ALTER TABLE public.streak_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streak_rewards ENABLE ROW LEVEL SECURITY;

-- Streak rewards are viewable by everyone
CREATE POLICY "Streak rewards are viewable by everyone"
ON public.streak_rewards
FOR SELECT
USING (true);

-- User streak rewards are viewable by everyone
CREATE POLICY "User streak rewards are viewable by everyone"
ON public.user_streak_rewards
FOR SELECT
USING (true);

-- Users can insert their own streak rewards
CREATE POLICY "Users can insert own streak rewards"
ON public.user_streak_rewards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert default streak rewards
INSERT INTO public.streak_rewards (streak_days, reward_type, reward_value, description) VALUES
(3, 'bonus_points', 100, 'Complete 3 days in a row'),
(7, 'bonus_points', 300, 'Complete 7 days in a row'),
(14, 'bonus_points', 750, 'Complete 14 days in a row'),
(30, 'bonus_points', 2000, 'Complete 30 days in a row'),
(50, 'bonus_points', 5000, 'Complete 50 days in a row'),
(100, 'bonus_points', 15000, 'Complete 100 days in a row');