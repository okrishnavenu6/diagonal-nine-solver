import { useState, useEffect, useCallback } from "react";
import { SudokuGrid } from "@/components/SudokuGrid";
import { NumberPad } from "@/components/NumberPad";
import { GameStatus } from "@/components/GameStatus";
import { DifficultySelector } from "@/components/DifficultySelector";
import { CompletionDialog } from "@/components/CompletionDialog";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import {
  generatePuzzle,
  deepCopyBoard,
  SudokuBoard,
  Difficulty,
} from "@/utils/sudokuGenerator";
import {
  isValidMove,
  isPuzzleComplete,
  getCandidates,
} from "@/utils/sudokuValidator";
import { useToast } from "@/hooks/use-toast";

interface Move {
  row: number;
  col: number;
  prevValue: number;
  newValue: number;
  prevPencilMarks: Set<number>;
  newPencilMarks: Set<number>;
}

const Index = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [board, setBoard] = useState<SudokuBoard>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isPencilMode, setIsPencilMode] = useState(false);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error" | "warning">("info");
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);
  const [isGameWon, setIsGameWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [lives, setLives] = useState(3);
  const [maxLives, setMaxLives] = useState(3);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const getMaxLivesForDifficulty = (diff: Difficulty): number => {
    switch (diff) {
      case "easy": return 3;
      case "medium": return 4;
      case "hard": return 5;
      case "expert": return 6;
      default: return 3;
    }
  };

  const initializeGame = useCallback((diff: Difficulty) => {
    const { puzzle, solution: sol } = generatePuzzle(diff);
    const maxLivesForDiff = getMaxLivesForDifficulty(diff);
    setBoard(puzzle);
    setSolution(sol);
    setSelectedCell(null);
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
    setTime(0);
    setScore(0);
    setLives(maxLivesForDiff);
    setMaxLives(maxLivesForDiff);
    setMessage("Game started! Fill the grid following Sudoku rules including diagonal constraints.");
    setMessageType("info");
    setIsGameWon(false);
    setShowConfetti(false);
    setShowCompletionDialog(false);
    setIsTimerRunning(true);
  }, []);

  useEffect(() => {
    initializeGame(difficulty);
  }, [difficulty, initializeGame]);

  useEffect(() => {
    if (!isTimerRunning) return;
    
    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning]);

  const handleCellSelect = (row: number, col: number) => {
    if (board[row][col].given) {
      setMessage("Cannot modify given cells!");
      setMessageType("warning");
      return;
    }
    setSelectedCell([row, col]);
    setMessage("");
  };

  const addMove = (move: Move) => {
    const newHistory = moveHistory.slice(0, currentMoveIndex + 1);
    newHistory.push(move);
    setMoveHistory(newHistory);
    setCurrentMoveIndex(newHistory.length - 1);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) {
      setMessage("Please select a cell first!");
      setMessageType("info");
      return;
    }

    const [row, col] = selectedCell;
    if (board[row][col].given) {
      setMessage("Cannot modify given cells!");
      setMessageType("warning");
      return;
    }

    const newBoard = deepCopyBoard(board);
    const cell = newBoard[row][col];

    if (isPencilMode) {
      // Toggle pencil mark
      const newPencilMarks = new Set(cell.pencilMarks);
      if (newPencilMarks.has(num)) {
        newPencilMarks.delete(num);
      } else {
        newPencilMarks.add(num);
      }

      addMove({
        row,
        col,
        prevValue: cell.value,
        newValue: cell.value,
        prevPencilMarks: cell.pencilMarks,
        newPencilMarks,
      });

      cell.pencilMarks = newPencilMarks;
      setBoard(newBoard);
      setMessage("");
    } else {
      // Place number
      if (!isValidMove(newBoard, row, col, num)) {
        const newLives = lives - 1;
        setLives(newLives);
        setMessage(`Invalid move! Lives remaining: ${newLives}`);
        setMessageType("error");
        toast({
          title: "Invalid Move",
          description: `This number conflicts with existing numbers. Lives: ${newLives}/${maxLives}`,
          variant: "destructive",
        });
        
        if (newLives <= 0) {
          setMessage("Game Over! No lives remaining.");
          setMessageType("error");
          setIsTimerRunning(false);
          toast({
            title: "Game Over",
            description: "You ran out of lives!",
            variant: "destructive",
          });
        }
        return;
      }

      addMove({
        row,
        col,
        prevValue: cell.value,
        newValue: num,
        prevPencilMarks: cell.pencilMarks,
        newPencilMarks: new Set(),
      });

      cell.value = num;
      cell.pencilMarks.clear();

      // Remove this number from pencil marks in related cells (row, column, box, diagonals)
      const boxStartRow = Math.floor(row / 3) * 3;
      const boxStartCol = Math.floor(col / 3) * 3;
      
      for (let i = 0; i < 9; i++) {
        // Clear from same row
        if (newBoard[row][i].pencilMarks.has(num)) {
          newBoard[row][i].pencilMarks.delete(num);
        }
        // Clear from same column
        if (newBoard[i][col].pencilMarks.has(num)) {
          newBoard[i][col].pencilMarks.delete(num);
        }
      }
      
      // Clear from same 3x3 box
      for (let r = boxStartRow; r < boxStartRow + 3; r++) {
        for (let c = boxStartCol; c < boxStartCol + 3; c++) {
          if (newBoard[r][c].pencilMarks.has(num)) {
            newBoard[r][c].pencilMarks.delete(num);
          }
        }
      }
      
      // Clear from diagonals if applicable
      if (row === col) {
        for (let i = 0; i < 9; i++) {
          if (newBoard[i][i].pencilMarks.has(num)) {
            newBoard[i][i].pencilMarks.delete(num);
          }
        }
      }
      if (row + col === 8) {
        for (let i = 0; i < 9; i++) {
          if (newBoard[i][8 - i].pencilMarks.has(num)) {
            newBoard[i][8 - i].pencilMarks.delete(num);
          }
        }
      }

      setBoard(newBoard);
      setScore(score + 10);
      setMessage("Good move!");
      setMessageType("success");

      // Check if puzzle is complete
      if (isPuzzleComplete(newBoard)) {
        setMessage("🎉 Congratulations! You solved the puzzle!");
        setMessageType("success");
        setIsGameWon(true);
        setShowConfetti(true);
        setIsTimerRunning(false);
        setShowCompletionDialog(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  };

  const handleClear = () => {
    if (!selectedCell) {
      setMessage("Please select a cell first!");
      setMessageType("info");
      return;
    }

    const [row, col] = selectedCell;
    if (board[row][col].given) {
      setMessage("Cannot modify given cells!");
      setMessageType("warning");
      return;
    }

    const newBoard = deepCopyBoard(board);
    const cell = newBoard[row][col];

    if (cell.value === 0 && cell.pencilMarks.size === 0) {
      setMessage("Cell is already empty!");
      setMessageType("info");
      return;
    }

    addMove({
      row,
      col,
      prevValue: cell.value,
      newValue: 0,
      prevPencilMarks: cell.pencilMarks,
      newPencilMarks: new Set(),
    });

    cell.value = 0;
    cell.pencilMarks.clear();
    setBoard(newBoard);
    setScore(Math.max(0, score - 5));
    setMessage("Cell cleared.");
    setMessageType("info");
  };

  const handleUndo = () => {
    if (currentMoveIndex < 0) return;

    const move = moveHistory[currentMoveIndex];
    const newBoard = deepCopyBoard(board);
    newBoard[move.row][move.col].value = move.prevValue;
    newBoard[move.row][move.col].pencilMarks = move.prevPencilMarks;

    setBoard(newBoard);
    setCurrentMoveIndex(currentMoveIndex - 1);
    setMessage("Move undone.");
    setMessageType("info");
  };

  const handleRedo = () => {
    if (currentMoveIndex >= moveHistory.length - 1) return;

    const move = moveHistory[currentMoveIndex + 1];
    const newBoard = deepCopyBoard(board);
    newBoard[move.row][move.col].value = move.newValue;
    newBoard[move.row][move.col].pencilMarks = move.newPencilMarks;

    setBoard(newBoard);
    setCurrentMoveIndex(currentMoveIndex + 1);
    setMessage("Move redone.");
    setMessageType("info");
  };

  const handleHint = () => {
    // Find a cell with only one candidate
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col].value === 0) {
          const candidates = getCandidates(board, row, col);
          if (candidates.size === 1) {
            setSelectedCell([row, col]);
            setMessage(`Hint: Cell (${row + 1}, ${col + 1}) can only be ${Array.from(candidates)[0]}`);
            setMessageType("info");
            toast({
              title: "Hint",
              description: `Cell at row ${row + 1}, column ${col + 1} can only be ${Array.from(candidates)[0]}`,
            });
            return;
          }
        }
      }
    }

    setMessage("No obvious hints available. Keep analyzing!");
    setMessageType("info");
  };

  const handleValidate = () => {
    if (isPuzzleComplete(board)) {
      setMessage("✅ Perfect! All cells are correctly filled!");
      setMessageType("success");
      setIsGameWon(true);
      setShowConfetti(true);
      setIsTimerRunning(false);
      setShowCompletionDialog(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      let emptyCount = 0;
      let errorCount = 0;

      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col].value === 0) {
            emptyCount++;
          } else if (board[row][col].value !== solution[row][col]) {
            errorCount++;
          }
        }
      }

      if (errorCount > 0) {
        setMessage(`❌ ${errorCount} incorrect cell(s) found!`);
        setMessageType("error");
        toast({
          title: "Errors Found",
          description: `${errorCount} incorrect cell(s) detected.`,
          variant: "destructive",
        });
      } else {
        setMessage(`${emptyCount} empty cell(s) remaining.`);
        setMessageType("info");
        toast({
          title: "Keep Going",
          description: `${emptyCount} cells left to fill.`,
        });
      }
    }
  };

  const getRemainingNumbers = (): Record<number, number> => {
    const counts: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) {
      counts[i] = 9;
    }

    // Guard: Check if board is initialized
    if (!board || board.length === 0) {
      return counts;
    }

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = board[row][col]?.value;
        if (value !== 0) {
          counts[value]--;
        }
      }
    }

    return counts;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedCell) return;

      if (e.key >= "1" && e.key <= "9") {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        handleClear();
      } else if (e.key === "p" || e.key === "P") {
        setIsPencilMode(!isPencilMode);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedCell, isPencilMode, board, score]);

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Confetti animation on win */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <Sparkles 
                className="text-primary" 
                size={20 + Math.random() * 20}
                style={{
                  color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Completion Dialog */}
        <CompletionDialog
          isOpen={showCompletionDialog}
          onClose={() => setShowCompletionDialog(false)}
          time={time}
          score={score}
          difficulty={difficulty}
          lives={lives}
          maxLives={maxLives}
        />

      {/* Enhanced futuristic background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-primary/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-0 right-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-primary/5 rounded-full blur-[100px] md:blur-[150px] pointer-events-none animate-pulse-slow" />
      
      {/* Dark mode toggle */}
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full w-10 h-10 sm:w-12 sm:h-12 glass-card dark:glass-card border-primary/30 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] transition-all duration-300"
        >
          <Sun className="h-5 w-5 sm:h-6 sm:w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 sm:h-6 sm:w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
      
      <div className="max-w-[1800px] mx-auto space-y-4 md:space-y-6 lg:space-y-8 relative z-10">
        <header className="text-center space-y-2 md:space-y-4 animate-fade-in">
          <div className="relative inline-block">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-2xl ${isGameWon ? 'animate-victory' : 'animate-glow'}`}>
              SUDOKU X
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl -z-10 animate-pulse" />
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start justify-center">
          {/* Left side - Game Status and Difficulty */}
          <div className="w-full lg:w-80 space-y-4 order-1">
            <GameStatus time={time} score={score} message={message} messageType={messageType} lives={lives} maxLives={maxLives} />
            <DifficultySelector 
              currentDifficulty={difficulty} 
              onSelect={(diff) => {
                setDifficulty(diff);
                initializeGame(diff);
              }} 
              onNewGame={() => initializeGame(difficulty)} 
            />
          </div>

          {/* Center - Grid */}
          <div className="w-full lg:flex-1 space-y-4 order-2">
            <SudokuGrid
              board={board}
              selectedCell={selectedCell}
              hoveredCell={hoveredCell}
              onCellSelect={handleCellSelect}
              onCellHover={setHoveredCell}
            />

            {/* Game Rules - Below grid */}
            <div className="liquid-glass rounded-2xl shadow-2xl p-4 md:p-6 space-y-3 text-xs md:text-sm border border-primary/30 hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <span className="text-lg md:text-2xl">🎯</span>
                </div>
                <h3 className="font-black text-foreground text-sm md:text-lg uppercase tracking-wider">Game Rules</h3>
              </div>
              <ul className="space-y-2 md:space-y-2.5 text-muted-foreground">
                <li className="flex items-start gap-2 md:gap-3 group/item hover:text-foreground transition-colors">
                  <span className="text-primary mt-0.5 md:mt-1 text-base md:text-lg group-hover/item:scale-125 transition-transform">▸</span>
                  <span className="flex-1">Fill each <strong className="text-foreground">row, column, and 3×3 box</strong> with digits 1-9</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3 group/item hover:text-foreground transition-colors">
                  <span className="text-accent mt-0.5 md:mt-1 text-base md:text-lg group-hover/item:scale-125 transition-transform">▸</span>
                  <span className="flex-1"><strong className="text-foreground">Both main diagonals</strong> must contain unique 1-9</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3 group/item hover:text-foreground transition-colors">
                  <span className="text-primary mt-0.5 md:mt-1 text-base md:text-lg group-hover/item:scale-125 transition-transform">▸</span>
                  <span className="flex-1">Click a cell and press <strong className="text-foreground">1-9</strong> or use the number pad</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3 group/item hover:text-foreground transition-colors">
                  <span className="text-accent mt-0.5 md:mt-1 text-base md:text-lg group-hover/item:scale-125 transition-transform">▸</span>
                  <span className="flex-1">Use <strong className="text-foreground">Pencil Mode</strong> to make notes in cells</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side - Number Pad */}
          <div className="w-full lg:w-80 space-y-4 order-3">
            <NumberPad
              onNumberSelect={handleNumberInput}
              onClear={handleClear}
              remainingNumbers={getRemainingNumbers()}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onHint={handleHint}
              onValidate={handleValidate}
              onTogglePencil={() => setIsPencilMode(!isPencilMode)}
              canUndo={currentMoveIndex >= 0}
              canRedo={currentMoveIndex < moveHistory.length - 1}
              isPencilMode={isPencilMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
