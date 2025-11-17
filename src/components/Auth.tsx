import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { z } from 'zod';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72, { message: "Password must be less than 72 characters" }),
  username: z.string().trim().min(3, { message: "Username must be at least 3 characters" }).max(30, { message: "Username must be less than 30 characters" }).regex(/^[a-zA-Z0-9_-]+$/, { message: "Username can only contain letters, numbers, underscores, and hyphens" }).optional()
});

interface AuthProps {
  open: boolean;
  onClose: () => void;
}

export const Auth = ({ open, onClose }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkRateLimit = async (identifier: string): Promise<boolean> => {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('auth_attempts')
        .select('*')
        .eq('identifier', identifier)
        .gte('attempted_at', fifteenMinutesAgo);

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow attempt if check fails
      }

      // Allow max 5 attempts per 15 minutes
      return (data?.length || 0) < 5;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow attempt if check fails
    }
  };

  const recordAuthAttempt = async (identifier: string, attemptType: string, success: boolean) => {
    try {
      await supabase.from('auth_attempts').insert({
        identifier,
        attempt_type: attemptType,
        success
      });
    } catch (error) {
      console.error('Failed to record auth attempt:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validationData = isLogin 
        ? { email, password }
        : { email, password, username };
      
      const result = authSchema.safeParse(validationData);
      
      if (!result.success) {
        const firstError = result.error.errors[0];
        throw new Error(firstError.message);
      }

      // Check rate limit
      const canProceed = await checkRateLimit(result.data.email);
      if (!canProceed) {
        throw new Error('Too many attempts. Please try again in 15 minutes.');
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: result.data.email, 
          password: result.data.password 
        });
        
        await recordAuthAttempt(result.data.email, 'login', !error);
        
        if (error) throw error;
        toast({ title: 'Welcome back!', description: 'Successfully logged in' });
        onClose();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: result.data.email,
          password: result.data.password,
          options: {
            data: { username: result.data.username }
          }
        });
        
        await recordAuthAttempt(result.data.email, 'signup', !error);
        
        if (error) throw error;
        
        if (data.user && result.data.username) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            username: result.data.username
          });
        }
        
        toast({ title: 'Account created!', description: 'Welcome to Sudoku Nexus' });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="liquid-glass border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-gaming text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {isLogin ? 'Login' : 'Sign Up'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="username" className="font-gaming">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="liquid-glass border-primary/20"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-gaming">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="liquid-glass border-primary/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-gaming">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="liquid-glass border-primary/20"
              required
              minLength={6}
            />
            {!isLogin && <PasswordStrengthIndicator password={password} />}
          </div>
          <Button
            type="submit"
            className="w-full font-gaming"
            disabled={loading}
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full font-gaming"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};