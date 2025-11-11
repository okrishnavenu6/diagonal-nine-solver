import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (value: number) => void;
  onToggleMute: () => void;
}

export const VolumeControl = ({ volume, isMuted, onVolumeChange, onToggleMute }: VolumeControlProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="liquid-glass transform-3d transform-3d-hover"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 liquid-glass border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-gaming">Volume</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMute}
              className="h-8 w-8 p-0"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            onValueChange={(values) => onVolumeChange(values[0] / 100)}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground text-center">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};