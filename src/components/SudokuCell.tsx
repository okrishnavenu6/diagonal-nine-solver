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
        "relative w-full aspect-square flex items-center justify-center group/cell",
        "font-bold text-xl md:text-2xl transition-all duration-300",
        "border border-border/30",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:z-20",
        "transform hover:z-10",
        {
          "bg-gradient-to-br from-cell-given to-cell-given/80 font-black text-foreground/90 shadow-inner": cell.given,
          "bg-cell-bg/80 backdrop-blur-sm hover:bg-cell-bg": !cell.given && !isSelected && !isHovered && !isHoverHighlighted && !isHighlighted && !isConflict,
          "bg-gradient-to-br from-cell-selected via-cell-selected to-primary/60 ring-4 ring-primary/70 shadow-[0_0_25px_rgba(var(--primary-rgb),0.6)] scale-[1.12] z-30 animate-pulse-subtle": isSelected && !isConflict,
          "bg-gradient-to-br from-primary/30 to-primary/20 ring-2 ring-primary/60 scale-[1.08] z-20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]": isHovered && !isSelected && !isConflict,
          "bg-primary/15 scale-[1.02]": isHoverHighlighted && !isHovered && !isSelected && !isConflict,
          "bg-cell-highlight scale-[1.02]": isHighlighted && !isHovered && !isSelected && !isConflict,
          "bg-gradient-to-br from-cell-error via-destructive/60 to-cell-error shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse-error z-25": isConflict,
          "bg-gradient-to-br from-cell-diagonal/50 via-cell-diagonal/30 to-cell-diagonal/20 shadow-inner": isOnDiagonal && !cell.given && !isSelected && !isHovered && !isHoverHighlighted && !isHighlighted && !isConflict,
          "border-r-[4px] border-r-primary/50": isRightBorder,
          "border-b-[4px] border-b-primary/50": isBottomBorder,
          "text-primary font-black drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)] animate-glow-text": !cell.given && cell.value !== 0,
          "cursor-not-allowed opacity-50": cell.given,
          "cursor-pointer hover:scale-105": !cell.given,
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
