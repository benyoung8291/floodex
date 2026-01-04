import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import {
  MousePointer,
  Pencil,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Ruler,
  Type,
  Eraser,
  Undo,
  Redo,
  Trash2,
} from 'lucide-react';
import {
  AnnotationTool,
  AnnotationColor,
  ANNOTATION_COLORS,
  StrokeWidth,
  STROKE_WIDTHS,
} from '@/lib/annotationTools';

interface AnnotationToolbarProps {
  activeTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  activeColor: AnnotationColor;
  onColorChange: (color: AnnotationColor) => void;
  strokeWidth: StrokeWidth;
  onStrokeWidthChange: (width: StrokeWidth) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const tools: { id: AnnotationTool; icon: React.ReactNode; label: string }[] = [
  { id: 'select', icon: <MousePointer className="h-4 w-4" />, label: 'Select' },
  { id: 'pen', icon: <Pencil className="h-4 w-4" />, label: 'Pen' },
  { id: 'rectangle', icon: <Square className="h-4 w-4" />, label: 'Rectangle' },
  { id: 'circle', icon: <Circle className="h-4 w-4" />, label: 'Circle' },
  { id: 'arrow', icon: <ArrowRight className="h-4 w-4" />, label: 'Arrow' },
  { id: 'line', icon: <Minus className="h-4 w-4" />, label: 'Line' },
  { id: 'measurement', icon: <Ruler className="h-4 w-4" />, label: 'Measurement' },
  { id: 'text', icon: <Type className="h-4 w-4" />, label: 'Text' },
  { id: 'eraser', icon: <Eraser className="h-4 w-4" />, label: 'Eraser' },
];

const colors: AnnotationColor[] = ['red', 'yellow', 'blue', 'green', 'black', 'white'];

export const AnnotationToolbar = ({
  activeTool,
  onToolChange,
  activeColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
}: AnnotationToolbarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-background border rounded-lg">
      {/* Tools */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => (
          <Toggle
            key={tool.id}
            pressed={activeTool === tool.id}
            onPressedChange={() => onToolChange(tool.id)}
            size="sm"
            title={tool.label}
          >
            {tool.icon}
          </Toggle>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Colors */}
      <div className="flex items-center gap-1">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded-full border-2 transition-transform ${
              activeColor === color
                ? 'scale-110 border-primary'
                : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: ANNOTATION_COLORS[color] }}
            onClick={() => onColorChange(color)}
            title={color.charAt(0).toUpperCase() + color.slice(1)}
          />
        ))}
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Stroke width */}
      <div className="flex items-center gap-1">
        {STROKE_WIDTHS.map((width) => (
          <Toggle
            key={width}
            pressed={strokeWidth === width}
            onPressedChange={() => onStrokeWidthChange(width)}
            size="sm"
            title={`${width}px`}
          >
            <div
              className="rounded-full bg-foreground"
              style={{ width: width + 4, height: width + 4 }}
            />
          </Toggle>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Clear */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        title="Clear all annotations"
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
