import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Dices, Trophy, Info, Home, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import {
  initializeLudoGame,
  rollDice,
  movePiece,
  getAvailableMoves,
  pieceStatusLabel,
  LudoGameState,
} from "@/utils/ludoGame";
import { useGameSession } from "@/hooks/useGameSession";
import { useToast } from "@/hooks/use-toast";

const PLAYER_BG = ["bg-destructive", "bg-success", "bg-warning", "bg-primary"];
const PLAYER_RING = [
  "ring-destructive",
  "ring-success",
  "ring-warning",
  "ring-primary",
];

const LudoGame = () => {
  const { theme, setTheme } = useTheme();
  const [gameState, setGameState] = useState<LudoGameState>(initializeLudoGame());
  const [diceValue, setDiceValue] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [availableMoves, setAvailableMoves] = useState<number[]>([]);
  const { startSession, updateSession, completeSession } = useGameSession("ludo");
  const { toast } = useToast();

  useEffect(() => {
    startSession(gameState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRollDice = () => {
    if (isRolling || diceValue > 0 || gameState.winner !== null) return;
    setIsRolling(true);

    const result = rollDice();
    setTimeout(() => {
      setIsRolling(false);
      setDiceValue(result);
      const newState = { ...gameState, lastDiceRoll: result };
      setGameState(newState);

      const moves = getAvailableMoves(newState, newState.currentPlayer);
      setAvailableMoves(moves);

      if (moves.length === 0) {
        toast({
          title: "No valid moves",
          description: `${newState.players[newState.currentPlayer].name} has no moves. Turn passes.`,
        });
        setTimeout(() => {
          setGameState({
            ...newState,
            currentPlayer: (newState.currentPlayer + 1) % 4,
            lastDiceRoll: 0,
          });
          setDiceValue(0);
        }, 1200);
      }
    }, 500);
  };

  const handlePieceClick = (pieceIndex: number) => {
    if (diceValue === 0 || !availableMoves.includes(pieceIndex)) return;
    const newState = movePiece(
      gameState,
      gameState.currentPlayer,
      pieceIndex,
      diceValue
    );
    setGameState(newState);
    updateSession(newState, newState.moveCount);

    if (newState.winner !== null) {
      completeSession(newState.moveCount * 100, newState.moveCount * 5);
      toast({
        title: "🎉 Winner!",
        description: `${newState.players[newState.winner].name} wins!`,
      });
    }
    setDiceValue(0);
    setAvailableMoves([]);
  };

  const resetGame = () => {
    const s = initializeLudoGame();
    setGameState(s);
    setDiceValue(0);
    setAvailableMoves([]);
    startSession(s);
  };

  const current = gameState.currentPlayer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background p-4">
      <div className="container mx-auto max-w-6xl">
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
          {/* Players + pieces */}
          <div className="lg:col-span-2 space-y-4">
            {gameState.players.map((player, pi) => {
              const isCurrent = pi === current;
              return (
                <Card
                  key={pi}
                  className={`p-4 transition-all ${
                    isCurrent ? `ring-2 ${PLAYER_RING[pi]}` : "opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${PLAYER_BG[pi]}`} />
                      <h3 className="text-lg font-bold">{player.name}</h3>
                      {isCurrent && (
                        <span className="text-xs text-muted-foreground">
                          ← your turn
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {player.pieces.filter((p) => p.isFinished).length}/4 home
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {player.pieces.map((piece, idx) => {
                      const clickable =
                        isCurrent && availableMoves.includes(idx) && diceValue > 0;
                      return (
                        <button
                          key={idx}
                          disabled={!clickable}
                          onClick={() => handlePieceClick(idx)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            clickable
                              ? "border-foreground bg-accent/40 hover:scale-105 cursor-pointer"
                              : "border-border bg-card cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-6 h-6 rounded-full ${PLAYER_BG[pi]} text-white text-xs font-bold flex items-center justify-center`}
                            >
                              {idx + 1}
                            </div>
                            {piece.isFinished && <Flag className="w-4 h-4" />}
                            {piece.isHome && <Home className="w-4 h-4" />}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {pieceStatusLabel(piece)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <Card className="p-6 text-center">
              <h3 className="text-xl font-bold mb-3">Current Player</h3>
              <div
                className={`w-16 h-16 rounded-full ${PLAYER_BG[current]} mx-auto mb-2 shadow-lg`}
              />
              <p className="text-muted-foreground">
                {gameState.players[current].name}
              </p>
            </Card>

            <Card className="p-6 text-center">
              <h3 className="text-xl font-bold mb-3">Dice</h3>
              <div
                className={`w-24 h-24 mx-auto bg-card border-2 border-primary rounded-xl flex items-center justify-center text-4xl font-bold ${
                  isRolling ? "animate-bounce" : ""
                }`}
              >
                {diceValue || <Dices className="w-12 h-12" />}
              </div>
              <Button
                className="w-full mt-4"
                onClick={handleRollDice}
                disabled={isRolling || diceValue > 0 || gameState.winner !== null}
              >
                {isRolling ? "Rolling..." : diceValue > 0 ? "Choose a piece" : "Roll Dice"}
              </Button>
              {diceValue > 0 && availableMoves.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Click a highlighted piece to move {diceValue} step
                  {diceValue > 1 ? "s" : ""}
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Rules
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Roll 6 to release a piece from home</li>
                <li>• Move clockwise around the 52-square track</li>
                <li>• Land on opponent → send them home</li>
                <li>• Enter home stretch (6 squares) → finish</li>
                <li>• Rolling 6, capturing, or finishing = bonus turn</li>
                <li>• First to get all 4 pieces home wins</li>
              </ul>
            </Card>

            {gameState.winner !== null && (
              <Card className="p-6 bg-primary/10 border-primary text-center">
                <Trophy className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h3 className="text-xl font-bold">Winner!</h3>
                <p className="text-lg mt-1">{gameState.players[gameState.winner].name}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LudoGame;
