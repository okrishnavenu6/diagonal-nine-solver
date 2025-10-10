import { Button } from "@/components/ui/button";
import {
  Undo,
  Redo,
  Lightbulb,
  CheckCircle,
  RotateCcw,
  Edit3,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onValidate: () => void;
  onTogglePencil: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isPencilMode: boolean;
}

export const GameControls = ({
  onNewGame,
  onUndo,
  onRedo,
  onHint,
  onValidate,
  onTogglePencil,
  canUndo,
  canRedo,
  isPencilMode,
}: GameControlsProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button
        onClick={onNewGame}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 hover:scale-105 transition-all duration-300 border-primary/30 hover:glow"
      >
        <RotateCcw className="h-4 w-4" />
        New Game
      </Button>

      <Button
        onClick={onUndo}
        variant="outline"
        size="sm"
        disabled={!canUndo}
        className="flex items-center gap-2 hover:scale-105 transition-all duration-300 border-primary/30"
      >
        <Undo className="h-4 w-4" />
        Undo
      </Button>

      <Button
        onClick={onRedo}
        variant="outline"
        size="sm"
        disabled={!canRedo}
        className="flex items-center gap-2 hover:scale-105 transition-all duration-300 border-primary/30"
      >
        <Redo className="h-4 w-4" />
        Redo
      </Button>

      <Button
        onClick={onTogglePencil}
        variant={isPencilMode ? "default" : "outline"}
        size="sm"
        className={cn("flex items-center gap-2 transition-all duration-300 hover:scale-105", {
          "glow animate-glow": isPencilMode,
          "border-primary/30": !isPencilMode,
        })}
      >
        <Edit3 className="h-4 w-4" />
        Pencil
      </Button>

      <Button
        onClick={onHint}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 hover:scale-105 transition-all duration-300 border-warning/30 hover:bg-warning/10"
      >
        <Lightbulb className="h-4 w-4 text-warning" />
        Hint
      </Button>

      <Button
        onClick={onValidate}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 hover:scale-105 transition-all duration-300 border-success/30 hover:bg-success/10"
      >
        <CheckCircle className="h-4 w-4 text-success" />
        Validate
      </Button>

      <Button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 hover:scale-105 transition-all duration-300 border-primary/30"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-warning" />
        ) : (
          <Moon className="h-4 w-4 text-primary" />
        )}
      </Button>
    </div>
  );
};
