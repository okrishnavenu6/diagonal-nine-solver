-- Fix the update_updated_at_column function to set search_path = public
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

-- Create table to track authentication attempts for rate limiting
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- email or IP address
  attempt_type TEXT NOT NULL, -- 'login' or 'signup'
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS on auth_attempts
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage auth attempts (users shouldn't access this directly)
CREATE POLICY "Service role can manage auth attempts"
ON public.auth_attempts
FOR ALL
USING (auth.role() = 'service_role');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_auth_attempts_identifier_time 
ON public.auth_attempts(identifier, attempted_at DESC);

-- Function to clean up old attempts (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_auth_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.auth_attempts 
  WHERE attempted_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;