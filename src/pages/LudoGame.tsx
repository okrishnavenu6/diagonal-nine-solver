import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Dices, Trophy, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { initializeLudoGame, rollDice, movePiece, getAvailableMoves, LudoGameState } from "@/utils/ludoGame";
import { useGameSession } from "@/hooks/useGameSession";
import { useToast } from "@/hooks/use-toast";

const LudoGame = () => {
  const { theme, setTheme } = useTheme();
  const [gameState, setGameState] = useState<LudoGameState>(initializeLudoGame());
  const [diceValue, setDiceValue] = useState<number>(0);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [availableMoves, setAvailableMoves] = useState<number[]>([]);
  const { startSession, updateSession, completeSession } = useGameSession("ludo");
  const { toast } = useToast();

  const handleRollDice = () => {
    if (isRolling || diceValue > 0) return;
    setIsRolling(true);
    setSelectedPiece(null);
    
    const result = rollDice();
    setDiceValue(result);
    
    setTimeout(() => {
      setIsRolling(false);
      const newState = { ...gameState, lastDiceRoll: result };
      setGameState(newState);
      
      // Check available moves
      const moves = getAvailableMoves(newState, newState.currentPlayer);
      setAvailableMoves(moves);
      
      if (moves.length === 0) {
        toast({
          title: "No valid moves",
          description: `Player ${newState.currentPlayer + 1} has no valid moves. Turn passes.`,
        });
        setTimeout(() => {
          const nextState = { ...newState, currentPlayer: (newState.currentPlayer + 1) % 4, lastDiceRoll: 0 };
          setGameState(nextState);
          setDiceValue(0);
        }, 1500);
      }
    }, 600);
  };

  const handlePieceClick = (pieceIndex: number) => {
    if (diceValue === 0 || selectedPiece === pieceIndex || !availableMoves.includes(pieceIndex)) {
      setSelectedPiece(null);
      return;
    }
    
    setSelectedPiece(pieceIndex);
  };

  const handleMove = () => {
    if (selectedPiece === null || diceValue === 0) return;
    
    const newState = movePiece(gameState, gameState.currentPlayer, selectedPiece, diceValue);
    setGameState(newState);
    updateSession(newState, newState.moveCount);
    
    if (newState.winner !== null) {
      completeSession(newState.moveCount * 100, Math.floor(newState.moveCount * 30));
      toast({
        title: "🎉 Winner!",
        description: `Player ${newState.winner + 1} (${newState.players[newState.winner].name}) wins!`,
      });
    }
    
    if (!newState.canRollAgain) {
      setDiceValue(0);
    }
    setSelectedPiece(null);
    setAvailableMoves([]);
  };

  const resetGame = () => {
    const newState = initializeLudoGame();
    setGameState(newState);
    setDiceValue(0);
    setSelectedPiece(null);
    setAvailableMoves([]);
    startSession(newState);
  };

  const playerColors = ["bg-destructive", "bg-success", "bg-warning", "bg-primary"];
  const currentPlayerColor = playerColors[gameState.currentPlayer];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
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
          {/* Game Board */}
          <Card className="lg:col-span-2 p-6">
            <div className="aspect-square max-w-2xl mx-auto bg-card-foreground/5 rounded-lg relative">
              {/* Ludo Board Layout */}
              <div className="absolute inset-0 grid grid-cols-15 grid-rows-15 gap-0.5">
                {/* Draw the Ludo board */}
                {Array.from({ length: 15 }).map((_, row) =>
                  Array.from({ length: 15 }).map((_, col) => {
                    const isHome = 
                      (row < 6 && col < 6) || // Red home
                      (row < 6 && col > 8) || // Green home
                      (row > 8 && col < 6) || // Yellow home
                      (row > 8 && col > 8);   // Blue home
                    
                    const isPath = 
                      (col === 6 && row !== 6 && row !== 7 && row !== 8) ||
                      (col === 8 && row !== 6 && row !== 7 && row !== 8) ||
                      (row === 6 && col !== 6 && col !== 7 && col !== 8) ||
                      (row === 8 && col !== 6 && col !== 7 && col !== 8);
                    
                    const isCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;
                    
                    let bgColor = "bg-card";
                    if (isHome) {
                      if (row < 6 && col < 6) bgColor = "bg-destructive/20";
                      else if (row < 6 && col > 8) bgColor = "bg-success/20";
                      else if (row > 8 && col < 6) bgColor = "bg-warning/20";
                      else if (row > 8 && col > 8) bgColor = "bg-primary/20";
                    } else if (isCenter) {
                      bgColor = "bg-accent/30";
                    } else if (isPath) {
                      bgColor = "bg-muted";
                    }
                    
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`${bgColor} border border-border/30 aspect-square`}
                      />
                    );
                  })
                )}
              </div>

              {/* Player Pieces */}
              {gameState.players.map((player, playerIndex) =>
                player.pieces.map((piece, pieceIndex) => (
                  <div
                    key={`${playerIndex}-${pieceIndex}`}
                    className={`absolute w-8 h-8 rounded-full ${playerColors[playerIndex]} ${
                      selectedPiece === pieceIndex && playerIndex === gameState.currentPlayer
                        ? "ring-4 ring-foreground"
                        : ""
                    } cursor-pointer transition-all hover:scale-110 flex items-center justify-center text-xs font-bold text-white shadow-lg`}
                    style={{
                      left: `${(piece.position % 15) * (100 / 15)}%`,
                      top: `${Math.floor(piece.position / 15) * (100 / 15)}%`,
                    }}
                    onClick={() => handlePieceClick(pieceIndex)}
                  >
                    {pieceIndex + 1}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Game Controls */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Current Player</h3>
              <div className={`w-16 h-16 rounded-full ${currentPlayerColor} mx-auto mb-4 shadow-lg`} />
              <p className="text-center text-muted-foreground">
                Player {gameState.currentPlayer + 1}'s Turn
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Dice</h3>
              <div
                className={`w-24 h-24 mx-auto bg-card border-2 border-primary rounded-xl flex items-center justify-center text-4xl font-bold cursor-pointer transition-transform ${
                  isRolling ? "animate-bounce" : "hover:scale-110"
                }`}
                onClick={handleRollDice}
              >
                {diceValue || <Dices className="w-12 h-12" />}
              </div>
              <Button
                className="w-full mt-4"
                onClick={handleRollDice}
                disabled={isRolling}
              >
                {isRolling ? "Rolling..." : "Roll Dice"}
              </Button>
            </Card>

            {diceValue > 0 && selectedPiece !== null && (
              <Card className="p-6">
                <Button className="w-full" onClick={handleMove}>
                  Move Piece {selectedPiece + 1}
                </Button>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Ludo Rules
              </h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">Objective:</p>
                <p className="ml-2">Move all 4 pieces from home to finish</p>
                
                <p className="font-semibold text-foreground mt-3">How to Play:</p>
                <ul className="space-y-1 ml-2">
                  <li>1. Roll dice to get a number</li>
                  <li>2. Roll 6 to start a piece from home</li>
                  <li>3. Select a piece to move it</li>
                  <li>4. Land on opponent to send them home</li>
                  <li>5. Roll again after rolling 6 or capturing</li>
                  <li>6. First to get all pieces home wins!</li>
                </ul>
                
                <p className="font-semibold text-foreground mt-3">Tips:</p>
                <ul className="space-y-1 ml-2">
                  <li>• Keep pieces spread out</li>
                  <li>• Try to capture opponents</li>
                  <li>• Safe zones protect your pieces</li>
                </ul>
              </div>
            </Card>
            
            {gameState.winner !== null && (
              <Card className="p-6 bg-primary/10 border-primary">
                <div className="text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-2 text-primary" />
                  <h3 className="text-xl font-bold">Winner!</h3>
                  <p className="text-lg mt-2">
                    Player {gameState.winner + 1}
                  </p>
                  <p className="text-muted-foreground">
                    {gameState.players[gameState.winner].name}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LudoGame;
