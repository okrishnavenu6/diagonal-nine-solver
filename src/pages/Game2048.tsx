import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { initialize2048, move2048, Game2048State } from "@/utils/game2048";

const Game2048 = () => {
  const { theme, setTheme } = useTheme();
  const [gameState, setGameState] = useState<Game2048State>(initialize2048());

  const handleMove = useCallback((direction: "up" | "down" | "left" | "right") => {
    if (gameState.gameOver) return;
    const newState = move2048(gameState, direction);
    setGameState(newState);
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          handleMove("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          handleMove("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleMove("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          handleMove("right");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove]);

  const resetGame = () => {
    setGameState(initialize2048());
  };

  const getTileColor = (value: number): string => {
    const colors: Record<number, string> = {
      2: "bg-muted",
      4: "bg-muted-foreground/20",
      8: "bg-primary/40",
      16: "bg-primary/60",
      32: "bg-primary/80",
      64: "bg-primary",
      128: "bg-warning/60",
      256: "bg-warning/80",
      512: "bg-warning",
      1024: "bg-success/80",
      2048: "bg-success",
      4096: "bg-destructive/80",
      8192: "bg-destructive"
    };
    return colors[value] || "bg-destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
          </Link>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={resetGame}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="max-w-xl mx-auto">
              <div className="bg-card-foreground/5 p-4 rounded-xl">
                <div className="grid grid-cols-4 gap-3">
                  {gameState.board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`aspect-square rounded-lg flex items-center justify-center text-3xl font-bold transition-all ${
                          cell ? getTileColor(cell) : "bg-card border-2 border-border"
                        } ${cell ? "text-white shadow-lg" : ""}`}
                      >
                        {cell || ""}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {gameState.gameOver && (
                <Card className="p-6 text-center mt-6 bg-destructive/10 border-2 border-destructive">
                  <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
                  <p className="text-muted-foreground mb-4">
                    Final Score: {gameState.score}
                  </p>
                  <Button onClick={resetGame}>
                    Try Again
                  </Button>
                </Card>
              )}

              <div className="grid grid-cols-3 gap-2 mt-6 max-w-xs mx-auto">
                <div />
                <Button
                  size="lg"
                  onClick={() => handleMove("up")}
                  disabled={gameState.gameOver}
                >
                  ↑
                </Button>
                <div />
                <Button
                  size="lg"
                  onClick={() => handleMove("left")}
                  disabled={gameState.gameOver}
                >
                  ←
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleMove("down")}
                  disabled={gameState.gameOver}
                >
                  ↓
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleMove("right")}
                  disabled={gameState.gameOver}
                >
                  →
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Score</h3>
              <p className="text-4xl font-bold text-primary">{gameState.score}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Best</h3>
              <p className="text-4xl font-bold text-success">{gameState.bestScore}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-2">How to Play</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Use arrow keys or buttons</li>
                <li>• Combine tiles with same numbers</li>
                <li>• Reach 2048 to win!</li>
                <li>• Keep playing for higher scores</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game2048;
