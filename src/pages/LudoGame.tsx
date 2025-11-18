import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Dices } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { initializeLudoGame, rollDice, movePiece, LudoGameState } from "@/utils/ludoGame";

const LudoGame = () => {
  const { theme, setTheme } = useTheme();
  const [gameState, setGameState] = useState<LudoGameState>(initializeLudoGame());
  const [diceValue, setDiceValue] = useState<number>(0);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);

  const handleRollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setSelectedPiece(null);
    
    const result = rollDice();
    setDiceValue(result);
    
    setTimeout(() => {
      setIsRolling(false);
      const newState = { ...gameState, lastDiceRoll: result };
      setGameState(newState);
    }, 600);
  };

  const handlePieceClick = (pieceIndex: number) => {
    if (diceValue === 0 || selectedPiece === pieceIndex) {
      setSelectedPiece(null);
      return;
    }
    
    setSelectedPiece(pieceIndex);
  };

  const handleMove = () => {
    if (selectedPiece === null || diceValue === 0) return;
    
    const newState = movePiece(gameState, gameState.currentPlayer, selectedPiece, diceValue);
    setGameState(newState);
    setDiceValue(0);
    setSelectedPiece(null);
  };

  const resetGame = () => {
    setGameState(initializeLudoGame());
    setDiceValue(0);
    setSelectedPiece(null);
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
              <h3 className="text-lg font-bold mb-2">How to Play</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Roll the dice to move</li>
                <li>• Select a piece to move</li>
                <li>• Get all pieces home to win</li>
                <li>• Roll 6 to start a piece</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LudoGame;
