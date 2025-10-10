import { useState, useEffect, useCallback } from "react";
import { SudokuGrid } from "@/components/SudokuGrid";
import { GameControls } from "@/components/GameControls";
import { NumberPad } from "@/components/NumberPad";
import { GameStatus } from "@/components/GameStatus";
import { DifficultySelector } from "@/components/DifficultySelector";
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
  const { toast } = useToast();

  const initializeGame = useCallback((diff: Difficulty) => {
    const { puzzle, solution: sol } = generatePuzzle(diff);
    setBoard(puzzle);
    setSolution(sol);
    setSelectedCell(null);
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
    setTime(0);
    setScore(0);
    setMessage("Game started! Fill the grid following Sudoku rules including diagonal constraints.");
    setMessageType("info");
  }, []);

  useEffect(() => {
    initializeGame(difficulty);
  }, [difficulty, initializeGame]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
        setMessage("Invalid move! This number conflicts with Sudoku rules.");
        setMessageType("error");
        toast({
          title: "Invalid Move",
          description: "This number conflicts with existing numbers in the same row, column, box, or diagonal.",
          variant: "destructive",
        });
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

      // Update pencil marks in related cells
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (newBoard[r][c].value === 0) {
            newBoard[r][c].pencilMarks = getCandidates(newBoard, r, c);
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
        toast({
          title: "Puzzle Solved!",
          description: `You completed the puzzle in ${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, "0")} with a score of ${score + 10}!`,
        });
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
      toast({
        title: "Validation Successful",
        description: "Your solution is correct!",
      });
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
      } else {
        setMessage(`${emptyCount} empty cell(s) remaining.`);
        setMessageType("info");
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
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Futuristic background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        <header className="text-center space-y-3 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-glow">
            Advanced Sudoku
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-medium">
            Classic rules + Diagonal uniqueness constraint 🎯
          </p>
        </header>

        <div className="grid lg:grid-cols-[1fr,auto] gap-6 items-start">
          <div className="space-y-4">
        <SudokuGrid
          board={board}
          selectedCell={selectedCell}
          hoveredCell={hoveredCell}
          onCellSelect={handleCellSelect}
          onCellHover={setHoveredCell}
        />

            <NumberPad
              onNumberSelect={handleNumberInput}
              onClear={handleClear}
              remainingNumbers={getRemainingNumbers()}
            />
          </div>

          <div className="space-y-4 lg:w-80">
            <GameStatus
              time={time}
              score={score}
              message={message}
              messageType={messageType}
            />

            <DifficultySelector
              currentDifficulty={difficulty}
              onSelect={(diff) => {
                setDifficulty(diff);
                initializeGame(diff);
              }}
            />

            <GameControls
              onNewGame={() => initializeGame(difficulty)}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onHint={handleHint}
              onValidate={handleValidate}
              onTogglePencil={() => setIsPencilMode(!isPencilMode)}
              canUndo={currentMoveIndex >= 0}
              canRedo={currentMoveIndex < moveHistory.length - 1}
              isPencilMode={isPencilMode}
            />

            <div className="bg-card rounded-xl shadow-2xl p-4 space-y-2 text-sm text-muted-foreground border border-primary/20 backdrop-blur-sm">
              <h3 className="font-bold text-foreground text-base uppercase tracking-wider">How to Play:</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">◆</span>
                  <span>Fill each row, column, and 3×3 box with 1-9</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">◆</span>
                  <span>Both diagonals must also contain 1-9</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">◆</span>
                  <span>Use Pencil mode for candidate numbers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">◆</span>
                  <span>Press 1-9 keys or tap numbers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">◆</span>
                  <span>Delete/Backspace to clear cells</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
