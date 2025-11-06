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
        "font-black text-xl md:text-2xl transition-all duration-150 ease-out",
        "border border-border/40",
        "focus:outline-none focus:ring-4 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-background focus:z-20",
        "transform hover:z-10",
        "transform-style: preserve-3d",
        {
          "bg-gradient-to-br from-cell-given to-cell-given/80 font-black text-foreground shadow-inner": cell.given,
          "bg-cell-bg/90 backdrop-blur-sm hover:bg-cell-bg hover:shadow-[0_8px_24px_rgba(99,102,241,0.12)] dark:text-white": !cell.given && !isSelected && !isHovered && !isSameNumber && !isHoverHighlighted && !isHighlighted && !isConflict,
          "bg-gradient-to-br from-cell-selected via-cell-selected to-primary/60 ring-4 ring-primary/80 shadow-[0_0_40px_rgba(99,102,241,0.8),0_0_80px_rgba(99,102,241,0.4),0_20px_40px_rgba(99,102,241,0.3)] scale-[1.16] z-30 animate-pulse-subtle dark:text-white translate-z-[20px]": isSelected && !isConflict,
          "bg-gradient-to-br from-primary/40 to-primary/25 ring-3 ring-primary/80 scale-[1.12] z-20 shadow-[0_0_30px_rgba(99,102,241,0.6),0_0_60px_rgba(99,102,241,0.3),0_15px_30px_rgba(99,102,241,0.25)] dark:text-white translate-z-[15px]": isHovered && !isSelected && !isConflict,
          "bg-gradient-to-br from-accent/55 via-accent/45 to-accent/35 ring-[3px] ring-accent/90 scale-[1.10] z-25 shadow-[0_0_35px_rgba(239,65,60,0.7),0_0_70px_rgba(239,65,60,0.3)] dark:text-white font-black animate-glow-text": isSameNumber && !isSelected && !isHovered && !isConflict,
          "bg-primary/25 scale-[1.04] shadow-md dark:text-white": isHoverHighlighted && !isHovered && !isSelected && !isSameNumber && !isConflict,
          "bg-cell-highlight scale-[1.04] shadow-md dark:text-white": isHighlighted && !isHovered && !isSelected && !isSameNumber && !isConflict,
          "bg-gradient-to-br from-cell-error via-destructive/70 to-cell-error shadow-[0_0_40px_rgba(239,68,68,0.8),0_0_80px_rgba(239,68,68,0.4)] animate-pulse-error z-30 ring-4 ring-destructive/90 dark:text-white": isConflict,
          "bg-gradient-to-br from-cell-diagonal/60 via-cell-diagonal/40 to-cell-diagonal/30 shadow-inner": isOnDiagonal && !cell.given && !isSelected && !isHovered && !isSameNumber && !isHoverHighlighted && !isHighlighted && !isConflict,
          "border-r-[5px] border-r-primary/60": isRightBorder,
          "border-b-[5px] border-b-primary/60": isBottomBorder,
          "text-primary dark:text-white font-black drop-shadow-[0_0_12px_rgba(99,102,241,0.9)] animate-glow-text": !cell.given && cell.value !== 0 && !isSameNumber && !isSelected && !isHovered,
          "cursor-not-allowed opacity-60": cell.given,
          "cursor-pointer hover:scale-[1.10] hover:translate-y-[-2px] active:scale-[1.05] active:translate-y-[0px]": !cell.given,
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
