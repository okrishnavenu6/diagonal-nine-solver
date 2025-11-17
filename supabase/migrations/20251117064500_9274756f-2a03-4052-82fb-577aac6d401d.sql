-- Drop existing public SELECT policies for profiles and game_statistics
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Game statistics are viewable by everyone" ON public.game_statistics;

-- Create restricted SELECT policies for profiles (users can only view their own profile)
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create restricted SELECT policies for game_statistics (users can only view their own statistics)
CREATE POLICY "Users can view own statistics"
ON public.game_statistics
FOR SELECT
USING (auth.uid() = user_id);