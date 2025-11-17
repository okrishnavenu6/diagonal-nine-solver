import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { z } from 'zod';

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

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: result.data.email, 
          password: result.data.password 
        });
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