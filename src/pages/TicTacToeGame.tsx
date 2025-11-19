import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, X as XIcon, Circle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { checkWinner, TicTacToeBoard } from "@/utils/ticTacToeGame";
import { useGameSession } from "@/hooks/useGameSession";

const TicTacToeGame = () => {
  const { theme, setTheme } = useTheme();
  const [board, setBoard] = useState<TicTacToeBoard>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });
  const { startSession, updateSession, completeSession } = useGameSession("tictactoe");

  const winner = checkWinner(board);
  const isDraw = !winner && board.every(cell => cell !== null);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
    updateSession({ board: newBoard, isXNext: !isXNext });

    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      setTimeout(() => {
        setScore(prev => {
          const newScore = { ...prev, [newWinner]: prev[newWinner] + 1 };
          completeSession(newScore[newWinner] * 100, 0);
          return newScore;
        });
      }, 500);
    } else if (newBoard.every(cell => cell !== null)) {
      setTimeout(() => {
        setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
      }, 500);
    }
  };

  const resetGame = () => {
    const newBoard = Array(9).fill(null);
    setBoard(newBoard);
    setIsXNext(true);
    startSession({ board: newBoard, isXNext: true });
  };

  const resetScore = () => {
    setScore({ X: 0, O: 0, draws: 0 });
    resetGame();
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
          <Card className="lg:col-span-2 p-8">
            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {board.map((cell, index) => (
                  <button
                    key={index}
                    className={`aspect-square bg-card border-4 border-border rounded-xl flex items-center justify-center text-6xl font-bold transition-all hover:bg-accent ${
                      winner ? "cursor-not-allowed" : "cursor-pointer hover:scale-105"
                    }`}
                    onClick={() => handleClick(index)}
                    disabled={!!winner || !!cell}
                  >
                    {cell === "X" && <XIcon className="w-20 h-20 text-primary" strokeWidth={3} />}
                    {cell === "O" && <Circle className="w-20 h-20 text-success" strokeWidth={3} />}
                  </button>
                ))}
              </div>

              {(winner || isDraw) && (
                <Card className="p-6 text-center bg-primary/10 border-2 border-primary">
                  <h3 className="text-2xl font-bold mb-2">
                    {winner ? `${winner} Wins!` : "It's a Draw!"}
                  </h3>
                  <Button onClick={resetGame} className="mt-2">
                    Play Again
                  </Button>
                </Card>
              )}

              {!winner && !isDraw && (
                <div className="text-center">
                  <p className="text-xl text-muted-foreground">
                    Current Turn:
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {isXNext ? (
                      <XIcon className="w-12 h-12 text-primary" strokeWidth={3} />
                    ) : (
                      <Circle className="w-12 h-12 text-success" strokeWidth={3} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Score</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <XIcon className="w-6 h-6 text-primary" strokeWidth={3} />
                    <span className="font-semibold">Player X</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{score.X}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Circle className="w-6 h-6 text-success" strokeWidth={3} />
                    <span className="font-semibold">Player O</span>
                  </div>
                  <span className="text-2xl font-bold text-success">{score.O}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="font-semibold text-muted-foreground">Draws</span>
                  <span className="text-2xl font-bold text-muted-foreground">{score.draws}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={resetScore}>
                Reset Score
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Tic-Tac-Toe Rules
              </h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">Objective:</p>
                <p className="ml-2">Get 3 marks in a row to win</p>
                
                <p className="font-semibold text-foreground mt-3">How to Play:</p>
                <ul className="space-y-1 ml-2">
                  <li>1. Players take turns (X goes first)</li>
                  <li>2. Click any empty square to place your mark</li>
                  <li>3. Get 3 in a row horizontally, vertically, or diagonally</li>
                  <li>4. If all 9 squares fill with no winner, it's a draw</li>
                </ul>
                
                <p className="font-semibold text-foreground mt-3">Strategy:</p>
                <ul className="space-y-1 ml-2">
                  <li>• Control the center square</li>
                  <li>• Watch for opponent's threats</li>
                  <li>• Create multiple winning paths</li>
                  <li>• Block opponent's winning moves</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToeGame;
