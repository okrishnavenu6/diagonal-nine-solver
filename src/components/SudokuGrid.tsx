import { SudokuBoard } from "@/utils/sudokuGenerator";
import { SudokuCell } from "./SudokuCell";
import { getConflicts, isOnAnyDiagonal } from "@/utils/sudokuValidator";
import { cn } from "@/lib/utils";

interface SudokuGridProps {
  board: SudokuBoard;
  selectedCell: [number, number] | null;
  onCellSelect: (row: number, col: number) => void;
}

export const SudokuGrid = ({ board, selectedCell, onCellSelect }: SudokuGridProps) => {
  const getHighlightedCells = (): Set<string> => {
    if (!selectedCell) return new Set();

    const [selRow, selCol] = selectedCell;
    const highlighted = new Set<string>();
    const selectedValue = board[selRow][selCol].value;

    // Highlight row and column
    for (let i = 0; i < 9; i++) {
      highlighted.add(`${selRow},${i}`);
      highlighted.add(`${i},${selCol}`);
    }

    // Highlight 3x3 box
    const boxStartRow = Math.floor(selRow / 3) * 3;
    const boxStartCol = Math.floor(selCol / 3) * 3;
    for (let r = boxStartRow; r < boxStartRow + 3; r++) {
      for (let c = boxStartCol; c < boxStartCol + 3; c++) {
        highlighted.add(`${r},${c}`);
      }
    }

    // Highlight diagonals if cell is on a diagonal
    if (selRow === selCol) {
      for (let i = 0; i < 9; i++) {
        highlighted.add(`${i},${i}`);
      }
    }
    if (selRow + selCol === 8) {
      for (let i = 0; i < 9; i++) {
        highlighted.add(`${i},${8 - i}`);
      }
    }

    // Highlight cells with the same value
    if (selectedValue !== 0) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c].value === selectedValue) {
            highlighted.add(`${r},${c}`);
          }
        }
      }
    }

    return highlighted;
  };

  const getConflictCells = (): Set<string> => {
    const conflicts = new Set<string>();

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col].value !== 0) {
          const cellConflicts = getConflicts(board, row, col);
          if (cellConflicts.length > 0) {
            conflicts.add(`${row},${col}`);
            cellConflicts.forEach((c) => conflicts.add(`${c.row},${c.col}`));
          }
        }
      }
    }

    return conflicts;
  };

  const highlightedCells = getHighlightedCells();
  const conflictCells = getConflictCells();

  return (
    <div className="bg-card rounded-lg shadow-lg p-2 md:p-4">
      <div 
        className={cn(
          "grid grid-cols-9 gap-0 bg-border p-[2px]",
          "aspect-square w-full max-w-[600px] mx-auto"
        )}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex},${colIndex}`;
            const isSelected = selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex;
            const isHighlighted = highlightedCells.has(key) && !isSelected;
            const isConflict = conflictCells.has(key);
            const isOnDiagonal = isOnAnyDiagonal(rowIndex, colIndex);

            return (
              <SudokuCell
                key={key}
                cell={cell}
                row={rowIndex}
                col={colIndex}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                isConflict={isConflict}
                isOnDiagonal={isOnDiagonal}
                onSelect={onCellSelect}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
