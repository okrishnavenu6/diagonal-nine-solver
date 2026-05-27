import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft, RotateCcw, X as XIcon, Circle, Info, Bot, Users, Trophy, Undo2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import {
  getWinnerWithLine, isBoardFull, getAIMove,
  TicTacToeBoard, AIDifficulty,
} from "@/utils/ticTacToeGame";
import { useGameSession } from "@/hooks/useGameSession";
import { cn } from "@/lib/utils";

type Mode = "pvp" | "ai";

const EMPTY: TicTacToeBoard = Array(9).fill(null);

const TicTacToeGame = () => {
  const { theme, setTheme } = useTheme();
  const [board, setBoard] = useState<TicTacToeBoard>(EMPTY);
  const [isXNext, setIsXNext] = useState(true);
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });
  const [mode, setMode] = useState<Mode>("ai");
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>("medium");
  const [history, setHistory] = useState<TicTacToeBoard[]>([EMPTY]);
  const [aiThinking, setAiThinking] = useState(false);
  const { startSession, updateSession, completeSession } = useGameSession("tictactoe");

  // Human plays X, AI plays O (in ai mode)
  const aiMark = "O" as const;
  const humanMark = "X" as const;

  const { winner, line: winningLine } = useMemo(() => getWinnerWithLine(board), [board]);
  const isDraw = !winner && isBoardFull(board);
  const gameOver = !!winner || isDraw;

  const applyMove = useCallback(
    (index: number, board: TicTacToeBoard, isXNext: boolean): TicTacToeBoard => {
      if (board[index] || getWinnerWithLine(board).winner) return board;
      const next = [...board];
      next[index] = isXNext ? "X" : "O";
      return next;
    },
    [],
  );

  const recordScore = useCallback(
    (w: "X" | "O" | null) => {
      setScore((prev) => {
        if (w) {
          const next = { ...prev, [w]: prev[w] + 1 };
          completeSession(next[w] * 100, 0);
          return next;
        }
        return { ...prev, draws: prev.draws + 1 };
      });
    },
    [completeSession],
  );

  const handleClick = (index: number) => {
    if (gameOver || board[index] || aiThinking) return;
    if (mode === "ai" && !isXNext) return; // wait for AI

    const next = applyMove(index, board, isXNext);
    if (next === board) return;
    setBoard(next);
    setIsXNext(!isXNext);
    setHistory((h) => [...h, next]);
    updateSession({ board: next, isXNext: !isXNext });

    const res = getWinnerWithLine(next);
    if (res.winner || isBoardFull(next)) {
      setTimeout(() => recordScore(res.winner), 400);
    }
  };

  // AI turn
  useEffect(() => {
    if (mode !== "ai" || gameOver) return;
    const aiTurn = (isXNext && aiMark === "X") || (!isXNext && aiMark === "O");
    if (!aiTurn) return;

    setAiThinking(true);
    const t = setTimeout(() => {
      const idx = getAIMove(board, aiMark, aiDifficulty);
      if (idx >= 0) {
        const next = applyMove(idx, board, isXNext);
        setBoard(next);
        setIsXNext((v) => !v);
        setHistory((h) => [...h, next]);
        updateSession({ board: next, isXNext: !isXNext });
        const res = getWinnerWithLine(next);
        if (res.winner || isBoardFull(next)) {
          setTimeout(() => recordScore(res.winner), 400);
        }
      }
      setAiThinking(false);
    }, 380);
    return () => clearTimeout(t);
  }, [board, isXNext, mode, gameOver, aiDifficulty, applyMove, updateSession, recordScore]);

  const resetGame = useCallback(() => {
    setBoard(EMPTY);
    setIsXNext(true);
    setHistory([EMPTY]);
    setAiThinking(false);
    startSession({ board: EMPTY, isXNext: true });
  }, [startSession]);

  const resetScore = () => {
    setScore({ X: 0, O: 0, draws: 0 });
    resetGame();
  };

  const undo = () => {
    if (gameOver) return;
    // In PvP undo 1 move; vs AI undo 2 (human + AI)
    const steps = mode === "ai" ? 2 : 1;
    if (history.length <= 1) return;
    const targetIdx = Math.max(0, history.length - 1 - steps);
    const target = history[targetIdx];
    setBoard(target);
    setHistory(history.slice(0, targetIdx + 1));
    // Recompute turn: X starts, so next player parity = moves played % 2
    const movesPlayed = target.filter((c) => c !== null).length;
    setIsXNext(movesPlayed % 2 === 0);
  };

  // Reset when mode/difficulty changes
  useEffect(() => { resetGame(); /* eslint-disable-next-line */ }, [mode, aiDifficulty]);

  const turnLabel = mode === "ai"
    ? (isXNext ? "Your turn (X)" : aiThinking ? "AI thinking…" : "AI turn (O)")
    : `Player ${isXNext ? "X" : "O"}'s turn`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background p-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
          </Link>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={undo} disabled={history.length <= 1 || gameOver} title="Undo">
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={resetGame} title="New round">
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
          <Card className="lg:col-span-2 p-6 md:p-8">
            {/* Mode + difficulty */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <div className="inline-flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setMode("ai")}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-colors",
                    mode === "ai" ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                  )}
                >
                  <Bot className="w-4 h-4" /> Vs AI
                </button>
                <button
                  onClick={() => setMode("pvp")}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-colors",
                    mode === "pvp" ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                  )}
                >
                  <Users className="w-4 h-4" /> 2 Players
                </button>
              </div>

              {mode === "ai" && (
                <div className="inline-flex rounded-lg border border-border overflow-hidden ml-auto">
                  {(["easy", "medium", "hard"] as AIDifficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setAiDifficulty(d)}
                      className={cn(
                        "px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                        aiDifficulty === d ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {board.map((cell, index) => {
                  const isWinningCell = winningLine?.includes(index);
                  return (
                    <button
                      key={index}
                      className={cn(
                        "aspect-square bg-card border-4 border-border rounded-xl flex items-center justify-center text-6xl font-bold transition-all duration-300",
                        gameOver ? "cursor-not-allowed" : "cursor-pointer hover:bg-accent hover:scale-105",
                        isWinningCell && "border-primary bg-primary/10 animate-pulse scale-105 shadow-[0_0_30px_hsl(var(--primary)/0.5)]",
                        isDraw && "opacity-70",
                      )}
                      onClick={() => handleClick(index)}
                      disabled={gameOver || !!cell || aiThinking || (mode === "ai" && !isXNext)}
                    >
                      {cell === "X" && (
                        <XIcon
                          className={cn("w-20 h-20 text-primary animate-scale-in", isWinningCell && "drop-shadow-[0_0_12px_hsl(var(--primary))]")}
                          strokeWidth={3}
                        />
                      )}
                      {cell === "O" && (
                        <Circle
                          className={cn("w-20 h-20 text-success animate-scale-in", isWinningCell && "drop-shadow-[0_0_12px_hsl(var(--success))]")}
                          strokeWidth={3}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {gameOver ? (
                <Card className={cn(
                  "p-6 text-center border-2 animate-fade-in",
                  winner ? "bg-primary/10 border-primary shadow-[0_0_40px_hsl(var(--primary)/0.3)]" : "bg-muted border-muted-foreground/30",
                )}>
                  <Trophy className={cn("w-10 h-10 mx-auto mb-2", winner ? "text-primary animate-bounce" : "text-muted-foreground")} />
                  <h3 className="text-2xl font-bold mb-2">
                    {winner
                      ? mode === "ai"
                        ? winner === humanMark ? "You Win!" : "AI Wins!"
                        : `${winner} Wins!`
                      : "It's a Draw!"}
                  </h3>
                  <Button onClick={resetGame} className="mt-2">
                    Play Again
                  </Button>
                </Card>
              ) : (
                <div className="text-center animate-fade-in">
                  <p className="text-xl text-muted-foreground">{turnLabel}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {isXNext ? (
                      <XIcon className="w-12 h-12 text-primary" strokeWidth={3} />
                    ) : (
                      <Circle className={cn("w-12 h-12 text-success", aiThinking && "animate-spin")} strokeWidth={3} />
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
                    <span className="font-semibold">{mode === "ai" ? "You (X)" : "Player X"}</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{score.X}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Circle className="w-6 h-6 text-success" strokeWidth={3} />
                    <span className="font-semibold">{mode === "ai" ? "AI (O)" : "Player O"}</span>
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
              <h3 className="text-lg font-bold mb-3">Move History</h3>
              {history.length <= 1 ? (
                <p className="text-sm text-muted-foreground">No moves yet.</p>
              ) : (
                <ol className="space-y-1 text-sm max-h-48 overflow-y-auto">
                  {history.slice(1).map((b, i) => {
                    const prev = history[i];
                    const moveIdx = b.findIndex((c, k) => c !== prev[k]);
                    const mark = b[moveIdx];
                    const r = Math.floor(moveIdx / 3) + 1;
                    const c = (moveIdx % 3) + 1;
                    return (
                      <li
                        key={i}
                        className="flex justify-between items-center px-2 py-1 rounded bg-muted/50"
                      >
                        <span className="font-mono text-muted-foreground">#{i + 1}</span>
                        <span className="font-semibold">
                          {mark} → row {r}, col {c}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                How to Play
              </h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Get 3 marks in a row (horizontal, vertical, or diagonal) to win.</p>
                <p><span className="font-semibold text-foreground">Easy:</span> AI plays random moves.</p>
                <p><span className="font-semibold text-foreground">Medium:</span> AI blocks &amp; takes wins.</p>
                <p><span className="font-semibold text-foreground">Hard:</span> AI plays optimally (minimax).</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToeGame;
