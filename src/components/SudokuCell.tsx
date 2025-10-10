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
        "font-semibold text-lg md:text-xl transition-all duration-200",
        "border border-border hover:ring-2 hover:ring-primary/50 hover:z-10",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:z-10",
        {
          "bg-cell-given": cell.given,
          "bg-cell-bg": !cell.given && !isSelected && !isHighlighted && !isConflict,
          "bg-cell-selected": isSelected && !isConflict,
          "bg-cell-highlight": isHighlighted && !isSelected && !isConflict,
          "bg-cell-error": isConflict,
          "bg-cell-diagonal/50": isOnDiagonal && !cell.given && !isSelected && !isHighlighted && !isConflict,
          "border-r-[3px] border-r-border": isRightBorder,
          "border-b-[3px] border-b-border": isBottomBorder,
          "text-foreground": cell.given,
          "text-primary": !cell.given && cell.value !== 0,
          "cursor-not-allowed opacity-70": cell.given,
          "cursor-pointer": !cell.given,
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
