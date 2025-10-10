import { cn } from "@/lib/utils";
import { SudokuCell as CellType } from "@/utils/sudokuGenerator";

interface SudokuCellProps {
  cell: CellType;
  row: number;
  col: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isConflict: boolean;
  isOnDiagonal: boolean;
  onSelect: (row: number, col: number) => void;
}

export const SudokuCell = ({
  cell,
  row,
  col,
  isSelected,
  isHighlighted,
  isConflict,
  isOnDiagonal,
  onSelect,
}: SudokuCellProps) => {
  const isRightBorder = col === 2 || col === 5;
  const isBottomBorder = row === 2 || row === 5;

  const handleClick = () => {
    onSelect(row, col);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative w-full aspect-square flex items-center justify-center",
        "font-semibold text-lg md:text-xl transition-all duration-300",
        "border border-border/50 hover:ring-2 hover:ring-primary/70 hover:z-10",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:z-10",
        "hover:scale-105 transform",
        {
          "bg-cell-given font-bold": cell.given,
          "bg-cell-bg backdrop-blur-sm": !cell.given && !isSelected && !isHighlighted && !isConflict,
          "bg-cell-selected ring-2 ring-primary glow scale-110": isSelected && !isConflict,
          "bg-cell-highlight": isHighlighted && !isSelected && !isConflict,
          "bg-cell-error glow-error animate-pulse": isConflict,
          "bg-gradient-to-br from-cell-diagonal/40 to-cell-diagonal/20": isOnDiagonal && !cell.given && !isSelected && !isHighlighted && !isConflict,
          "border-r-[3px] border-r-primary/30": isRightBorder,
          "border-b-[3px] border-b-primary/30": isBottomBorder,
          "text-foreground": cell.given,
          "text-primary font-bold glow-success": !cell.given && cell.value !== 0,
          "cursor-not-allowed opacity-60": cell.given,
          "cursor-pointer hover:bg-cell-highlight": !cell.given,
        }
      )}
    >
      {cell.value !== 0 ? (
        cell.value
      ) : cell.pencilMarks.size > 0 ? (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[1px] p-1 text-[8px] md:text-[10px] text-muted-foreground">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
            <div key={num} className="flex items-center justify-center">
              {cell.pencilMarks.has(num) ? num : ""}
            </div>
          ))}
        </div>
      ) : null}
    </button>
  );
};
