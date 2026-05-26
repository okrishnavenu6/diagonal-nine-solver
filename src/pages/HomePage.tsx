import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3x3, X } from "lucide-react";
import { Moon, Sun, LogIn, LogOut, Trophy, Award } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";
import { Leaderboard } from "@/components/Leaderboard";
import { Achievements } from "@/components/Achievements";

const HomePage = () => {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const games = [
    {
      id: "sudoku",
      title: "Sudoku",
      description: "Classic number puzzle with diagonal constraints",
      icon: Grid3x3,
      color: "from-primary/20 to-primary/5",
      path: "/sudoku"
    },
    {
      id: "tic-tac-toe",
      title: "Tic-Tac-Toe",
      description: "Get three in a row to win",
      icon: X,
      color: "from-destructive/20 to-destructive/5",
      path: "/tic-tac-toe"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            GameHub
          </h1>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {user && (
              <>
                <Button variant="outline" size="icon" onClick={() => setShowLeaderboard(true)}>
                  <Trophy className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setShowAchievements(true)}>
                  <Award className="h-5 w-5" />
                </Button>
              </>
            )}
            
            {user ? (
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button onClick={() => setShowAuth(true)}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">Choose Your Game</h2>
          <p className="text-muted-foreground text-lg">
            Five classic games, one platform. Challenge yourself and compete with others!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Link key={game.id} to={game.path}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group border-2 border-border hover:border-primary/50">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-foreground" />
                    </div>
                    <CardTitle className="text-2xl">{game.title}</CardTitle>
                    <CardDescription className="text-base">{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      Play Now
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Dialogs */}
      <Auth open={showAuth} onClose={() => setShowAuth(false)} />
      <Leaderboard
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
      <Achievements 
        open={showAchievements} 
        onClose={() => setShowAchievements(false)}
        currentScore={0}
        gamesCompleted={0}
      />
    </div>
  );
};

export default HomePage;
