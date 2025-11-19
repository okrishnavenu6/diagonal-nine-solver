import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { initializeChessBoard, makeMove, getValidMoves, ChessPiece, ChessGameState } from "@/utils/chessGame";
import { useGameSession } from "@/hooks/useGameSession";

const ChessGame = () => {
  const { theme, setTheme } = useTheme();
  const [gameState, setGameState] = useState<ChessGameState>(initializeChessBoard());
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const { startSession, updateSession } = useGameSession("chess");

  const handleSquareClick = (row: number, col: number) => {
    const piece = gameState.board[row][col];
    
    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      const isValidMove = validMoves.some(([r, c]) => r === row && c === col);
      
      if (isValidMove) {
        const newState = makeMove(gameState, fromRow, fromCol, row, col);
        setGameState(newState);
        updateSession(newState);
        setSelectedSquare(null);
        setValidMoves([]);
      } else if (piece && piece.color === gameState.currentPlayer) {
        setSelectedSquare([row, col]);
        const moves = getValidMoves(gameState.board, row, col);
        setValidMoves(moves);
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else if (piece && piece.color === gameState.currentPlayer) {
      setSelectedSquare([row, col]);
      const moves = getValidMoves(gameState.board, row, col);
      setValidMoves(moves);
    }
  };

  const resetGame = () => {
    const newState = initializeChessBoard();
    setGameState(newState);
    setSelectedSquare(null);
    setValidMoves([]);
    startSession(newState);
  };

  const getPieceSymbol = (piece: ChessPiece | null): string => {
    if (!piece) return "";
    const symbols: Record<string, Record<string, string>> = {
      white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
      black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" }
    };
    return symbols[piece.color][piece.type];
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3 p-6">
            <div className="aspect-square max-w-3xl mx-auto">
              <div className="grid grid-cols-8 gap-0 border-4 border-border">
                {gameState.board.map((row, rowIndex) =>
                  row.map((piece, colIndex) => {
                    const isLight = (rowIndex + colIndex) % 2 === 0;
                    const isSelected = selectedSquare?.[0] === rowIndex && selectedSquare?.[1] === colIndex;
                    const isValidMove = validMoves.some(([r, c]) => r === rowIndex && c === colIndex);
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`aspect-square flex items-center justify-center text-5xl cursor-pointer transition-all ${
                          isLight ? "bg-muted" : "bg-muted-foreground/20"
                        } ${isSelected ? "ring-4 ring-primary" : ""} ${
                          isValidMove ? "bg-success/30" : ""
                        } hover:opacity-80`}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                      >
                        {getPieceSymbol(piece)}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Current Turn</h3>
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 ${
                gameState.currentPlayer === "white" ? "bg-card border-4 border-foreground" : "bg-foreground"
              }`} />
              <p className="text-center text-muted-foreground capitalize">
                {gameState.currentPlayer}'s Turn
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Captured Pieces</h3>
              <div className="space-y-2">
                <div className="text-2xl">
                  {gameState.capturedPieces.white.map((p, i) => (
                    <span key={i}>{getPieceSymbol({ type: p, color: "white" })}</span>
                  ))}
                </div>
                <div className="text-2xl">
                  {gameState.capturedPieces.black.map((p, i) => (
                    <span key={i}>{getPieceSymbol({ type: p, color: "black" })}</span>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Chess Rules
              </h3>
              <div className="text-sm text-muted-foreground space-y-3">
                <div>
                  <p className="font-semibold text-foreground mb-1">Piece Movement:</p>
                  <ul className="space-y-1 ml-2">
                    <li>♔/♚ King: One square any direction</li>
                    <li>♕/♛ Queen: Any direction, any distance</li>
                    <li>♖/♜ Rook: Horizontal/vertical only</li>
                    <li>♗/♝ Bishop: Diagonal only</li>
                    <li>♘/♞ Knight: L-shape (2+1 squares)</li>
                    <li>♙/♟ Pawn: Forward 1 (or 2 from start)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Objective:</p>
                  <p>Checkmate opponent's king</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">How to Play:</p>
                  <ul className="space-y-1 ml-2">
                    <li>1. Click a piece to select it</li>
                    <li>2. Valid moves highlight in green</li>
                    <li>3. Click a highlighted square to move</li>
                    <li>4. Capture by moving to enemy square</li>
                  </ul>
                </div>
              </div>
            </Card>
            
            {gameState.moveHistory.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-2">Move History</h3>
                <div className="text-sm text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                  {gameState.moveHistory.slice(-10).map((move, i) => (
                    <div key={i}>
                      {gameState.moveHistory.length - 10 + i + 1}. {move}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;
