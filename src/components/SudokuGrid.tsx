import { SudokuBoard } from "@/utils/sudokuGenerator";
import { SudokuCell } from "./SudokuCell";
import { getConflicts, isOnAnyDiagonal } from "@/utils/sudokuValidator";
import { cn } from "@/lib/utils";

interface SudokuGridProps {
  board: SudokuBoard;
  selectedCell: [number, number] | null;
  hoveredCell: [number, number] | null;
  onCellSelect: (row: number, col: number) => void;
  onCellHover: (cell: [number, number] | null) => void;
}

export const SudokuGrid = ({ board, selectedCell, hoveredCell, onCellSelect, onCellHover }: SudokuGridProps) => {
  const getHighlightedCells = (): Set<string> => {
    if (!selectedCell || !board || board.length === 0) return new Set();

    const [selRow, selCol] = selectedCell;
    const highlighted = new Set<string>();
    const selectedValue = board[selRow]?.[selCol]?.value;

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
    if (selectedValue !== 0 && selectedValue !== undefined) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r]?.[c]?.value === selectedValue) {
            highlighted.add(`${r},${c}`);
          }
        }
      }
    }

    return highlighted;
  };

  const getHoverHighlightedCells = (): Set<string> => {
    if (!hoveredCell || !board || board.length === 0) return new Set();

    const [hoverRow, hoverCol] = hoveredCell;
    const hoverHighlighted = new Set<string>();

    // Highlight row and column of hovered cell
    for (let i = 0; i < 9; i++) {
      hoverHighlighted.add(`${hoverRow},${i}`);
      hoverHighlighted.add(`${i},${hoverCol}`);
    }

    // Highlight 3x3 box of hovered cell
    const boxStartRow = Math.floor(hoverRow / 3) * 3;
    const boxStartCol = Math.floor(hoverCol / 3) * 3;
    for (let r = boxStartRow; r < boxStartRow + 3; r++) {
      for (let c = boxStartCol; c < boxStartCol + 3; c++) {
        hoverHighlighted.add(`${r},${c}`);
      }
    }

    return hoverHighlighted;
  };

  const getConflictCells = (): Set<string> => {
    const conflicts = new Set<string>();

    if (!board || board.length === 0) return conflicts;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row]?.[col]?.value !== 0) {
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
  const hoverHighlightedCells = getHoverHighlightedCells();
  const conflictCells = getConflictCells();

  // Guard check for board initialization
  if (!board || board.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-lg p-2 md:p-4">
        <div className="aspect-square w-full max-w-[600px] mx-auto flex items-center justify-center">
          <div className="text-muted-foreground">Loading puzzle...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-gradient-to-br from-card/90 via-card to-card/80 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-3 md:p-6 border-2 border-primary/40 backdrop-blur-2xl hover:border-primary/60 transition-all duration-500 hover:shadow-[0_0_60px_rgba(var(--primary-rgb),0.4)]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl pointer-events-none" />
      <div 
        className={cn(
          "relative grid grid-cols-9 gap-0 bg-gradient-to-br from-primary/20 via-background/50 to-accent/20 p-1",
          "aspect-square w-full max-w-[600px] mx-auto rounded-2xl overflow-hidden",
          "shadow-[inset_0_0_40px_rgba(var(--primary-rgb),0.2),0_0_40px_rgba(var(--primary-rgb),0.3)]",
          "border border-primary/30"
        )}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex},${colIndex}`;
            const isSelected = selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex;
            const isHovered = hoveredCell?.[0] === rowIndex && hoveredCell?.[1] === colIndex;
            const isHoverHighlighted = hoverHighlightedCells.has(key) && !isHovered && !isSelected;
            const isHighlighted = highlightedCells.has(key) && !isSelected && !isHovered;
            const isConflict = conflictCells.has(key);
            const isOnDiagonal = isOnAnyDiagonal(rowIndex, colIndex);

            return (
              <SudokuCell
                key={key}
                cell={cell}
                row={rowIndex}
                col={colIndex}
                isSelected={isSelected}
                isHovered={isHovered}
                isHoverHighlighted={isHoverHighlighted}
                isHighlighted={isHighlighted}
                isConflict={isConflict}
                isOnDiagonal={isOnDiagonal}
                onSelect={onCellSelect}
                onHover={onCellHover}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
