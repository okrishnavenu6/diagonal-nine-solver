import { cn } from "@/lib/utils";
import { SudokuCell as CellType } from "@/utils/sudokuGenerator";

interface SudokuCellProps {
  cell: CellType;
  row: number;
  col: number;
  isSelected: boolean;
  isHovered: boolean;
  isHoverHighlighted: boolean;
  isHighlighted: boolean;
  isConflict: boolean;
  isOnDiagonal: boolean;
  onSelect: (row: number, col: number) => void;
  onHover: (cell: [number, number] | null) => void;
}

export const SudokuCell = ({
  cell,
  row,
  col,
  isSelected,
  isHovered,
  isHoverHighlighted,
  isHighlighted,
  isConflict,
  isOnDiagonal,
  onSelect,
  onHover,
}: SudokuCellProps) => {
  const isRightBorder = col === 2 || col === 5;
  const isBottomBorder = row === 2 || row === 5;

  const handleClick = () => {
    onSelect(row, col);
  };

  const handleMouseEnter = () => {
    onHover([row, col]);
  };

  const handleMouseLeave = () => {
    onHover(null);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative w-full aspect-square flex items-center justify-center",
        "font-semibold text-lg md:text-xl transition-all duration-200",
        "border border-border/50",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:z-20",
        "transform",
        {
          "bg-cell-given font-bold": cell.given,
          "bg-cell-bg backdrop-blur-sm": !cell.given && !isSelected && !isHovered && !isHoverHighlighted && !isHighlighted && !isConflict,
          "bg-cell-selected ring-2 ring-primary glow scale-110 z-30": isSelected && !isConflict,
          "bg-primary/20 ring-1 ring-primary/50 scale-105 z-20": isHovered && !isSelected && !isConflict,
          "bg-primary/10": isHoverHighlighted && !isHovered && !isSelected && !isConflict,
          "bg-cell-highlight": isHighlighted && !isHovered && !isSelected && !isConflict,
          "bg-cell-error glow-error animate-pulse z-10": isConflict,
          "bg-gradient-to-br from-cell-diagonal/40 to-cell-diagonal/20": isOnDiagonal && !cell.given && !isSelected && !isHovered && !isHoverHighlighted && !isHighlighted && !isConflict,
          "border-r-[3px] border-r-primary/30": isRightBorder,
          "border-b-[3px] border-b-primary/30": isBottomBorder,
          "text-foreground": cell.given,
          "text-primary font-bold glow-success": !cell.given && cell.value !== 0,
          "cursor-not-allowed opacity-60": cell.given,
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
