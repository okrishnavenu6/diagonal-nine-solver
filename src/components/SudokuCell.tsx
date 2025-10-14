import { cn } from "@/lib/utils";
import { SudokuCell as CellType } from "@/utils/sudokuGenerator";

interface SudokuCellProps {
  cell: CellType;
  row: number;
  col: number;
  isSelected: boolean;
  isHovered: boolean;
  isSameNumber: boolean;
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
  isSameNumber,
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
        "font-black text-xl md:text-2xl transition-all duration-300",
        "border border-border/50",
        "focus:outline-none focus:ring-3 focus:ring-primary/80 focus:ring-offset-2 focus:ring-offset-background focus:z-20",
        "transform hover:z-10",
        {
          "bg-gradient-to-br from-cell-given to-cell-given/80 font-black text-foreground shadow-[inset_0_2px_8px_rgba(0,0,0,0.15)]": cell.given,
          "bg-cell-bg/95 backdrop-blur-md hover:bg-cell-bg hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] dark:text-white": !cell.given && !isSelected && !isHovered && !isSameNumber && !isHoverHighlighted && !isHighlighted && !isConflict,
          "bg-gradient-to-br from-cell-selected via-cell-selected to-primary/60 ring-[5px] ring-primary/80 shadow-[0_0_40px_rgba(var(--primary-rgb),0.8),inset_0_0_20px_rgba(var(--primary-rgb),0.3)] scale-[1.15] z-30 animate-pulse-subtle dark:text-white": isSelected && !isConflict,
          "bg-gradient-to-br from-primary/40 to-primary/25 ring-3 ring-primary/80 scale-[1.12] z-20 shadow-[0_0_25px_rgba(var(--primary-rgb),0.6)] dark:text-white": isHovered && !isSelected && !isConflict,
          "bg-gradient-to-br from-accent/55 via-accent/45 to-accent/30 ring-[4px] ring-accent/90 scale-[1.10] z-25 shadow-[0_0_30px_rgba(var(--accent-rgb),0.7),inset_0_0_15px_rgba(var(--accent-rgb),0.2)] dark:text-white font-black animate-glow-text": isSameNumber && !isSelected && !isHovered && !isConflict,
          "bg-primary/20 scale-[1.03] dark:text-white": isHoverHighlighted && !isHovered && !isSelected && !isSameNumber && !isConflict,
          "bg-cell-highlight scale-[1.03] dark:text-white": isHighlighted && !isHovered && !isSelected && !isSameNumber && !isConflict,
          "bg-gradient-to-br from-cell-error via-destructive/70 to-cell-error shadow-[0_0_30px_rgba(239,68,68,0.7)] animate-pulse-error z-30 ring-4 ring-destructive/80 dark:text-white": isConflict,
          "bg-gradient-to-br from-cell-diagonal/60 via-cell-diagonal/40 to-cell-diagonal/30 shadow-inner": isOnDiagonal && !cell.given && !isSelected && !isHovered && !isSameNumber && !isHoverHighlighted && !isHighlighted && !isConflict,
          "border-r-[5px] border-r-primary/60": isRightBorder,
          "border-b-[5px] border-b-primary/60": isBottomBorder,
          "text-primary dark:text-white font-black drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.9)] animate-glow-text": !cell.given && cell.value !== 0 && !isSameNumber && !isSelected && !isHovered,
          "cursor-not-allowed opacity-60": cell.given,
          "cursor-pointer hover:scale-[1.08]": !cell.given,
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
