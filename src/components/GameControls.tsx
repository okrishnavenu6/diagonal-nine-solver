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
        className="flex items-center gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        New Game
      </Button>

      <Button
        onClick={onUndo}
        variant="outline"
        size="sm"
        disabled={!canUndo}
        className="flex items-center gap-2"
      >
        <Undo className="h-4 w-4" />
        Undo
      </Button>

      <Button
        onClick={onRedo}
        variant="outline"
        size="sm"
        disabled={!canRedo}
        className="flex items-center gap-2"
      >
        <Redo className="h-4 w-4" />
        Redo
      </Button>

      <Button
        onClick={onTogglePencil}
        variant={isPencilMode ? "default" : "outline"}
        size="sm"
        className={cn("flex items-center gap-2", {
          "bg-primary text-primary-foreground": isPencilMode,
        })}
      >
        <Edit3 className="h-4 w-4" />
        Pencil
      </Button>

      <Button
        onClick={onHint}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Lightbulb className="h-4 w-4" />
        Hint
      </Button>

      <Button
        onClick={onValidate}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <CheckCircle className="h-4 w-4" />
        Validate
      </Button>

      <Button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
